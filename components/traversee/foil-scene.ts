import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import {
  CAM_AHEAD, END,
  activeStation, progressToZ, smooth, stationDistance, stationVisibility, stationZ,
} from "./camera";

export type SceneOptions = {
  canvas: HTMLCanvasElement;
  stationEls: HTMLElement[];
  onActiveChange: (i: number) => void;
  reducedMotion: boolean;
  mobile: boolean;
  still?: boolean;
};

export type SceneHandle = { dispose: () => void };

/* ── Nappe aurora : l'environnement que le verre réfracte. Jamais affichée. ── */
function aurora(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const x = c.getContext("2d")!;
  x.fillStyle = "#000"; x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = "lighter";
  const blobs: [number, number, number, string][] = [
    [w * 0.18, h * 0.28, w * 0.40, "rgba(255,60,190,.95)"],
    [w * 0.74, h * 0.40, w * 0.38, "rgba(40,220,255,.90)"],
    [w * 0.46, h * 0.82, w * 0.34, "rgba(255,190,90,.75)"],
    [w * 0.95, h * 0.12, w * 0.26, "rgba(150,90,255,.80)"],
  ];
  for (const [cx, cy, r, col] of blobs) {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }
  return c;
}

/* ── Sprite rond pour la poussière : sans lui, les points sont des carrés durs. ── */
function dustSprite(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ── Carte arrondie extrudée : la géométrie de tous les objets foil. ── */
function cardGeometry(w: number, h: number, r: number, depth = 0.07): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.024, bevelSegments: 3, curveSegments: 18 });
}

export function createScene(o: SceneOptions): SceneHandle {
  const { canvas, stationEls, reducedMotion: RM, mobile, still = false } = o;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 6, 30);
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 32);

  const envTex = new THREE.CanvasTexture(aurora(512, 256));
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromEquirectangular(envTex);
  scene.environment = envRT.texture;

  // Le foil. Valeurs validées sur prototype, à régler à l'œil sur GPU réel.
  const foil = new THREE.MeshPhysicalMaterial({
    transmission: 0.82, thickness: 1.7, roughness: 0.07, metalness: 0, ior: 1.64,
    envMapIntensity: 3.4, clearcoat: 1, clearcoatRoughness: 0.06, specularIntensity: 1, reflectivity: 0.85,
    iridescence: 1, iridescenceIOR: 2.1, iridescenceThicknessRange: [140, 860],
    attenuationColor: new THREE.Color(0x6f8cff), attenuationDistance: 1.6,
  });

  /* ── Géométries partagées : chaque taille répétée (éclats, cartes, plaquettes)
     n'est construite qu'une fois et réutilisée sur tous ses meshes. ── */
  const shardGeo = cardGeometry(0.5, 0.34, 0.06, 0.05);
  const stepGeo = cardGeometry(1.05, 1.45, 0.1);
  const chipGeo = cardGeometry(0.42, 0.28, 0.05, 0.04);

  /* ── Les étapes : un groupe par étape, à z = stationZ(i). userData.spin tourne lentement. ── */
  const groups: THREE.Group[] = [];
  const addStation = (i: number, build: (g: THREE.Group) => void) => {
    const g = new THREE.Group();
    g.position.z = stationZ(i);
    build(g);
    scene.add(g);
    groups.push(g);
  };
  // 0 · Accueil : la carte, à droite du texte
  addStation(0, (g) => {
    const m = new THREE.Mesh(cardGeometry(1.6, 2.24, 0.13), foil);
    m.position.set(still ? 0 : 1.3, 0, 0);
    m.rotation.set(0, still ? -0.25 : -0.5, 0.05);
    g.add(m); g.userData.spin = m;
  });
  // 1 · Koopadex : un grand panneau et trois éclats qui flottent devant
  addStation(1, (g) => {
    const p = new THREE.Mesh(cardGeometry(3.2, 2.05, 0.12), foil);
    p.position.set(-1.6, 0.1, 0); p.rotation.set(0.04, 0.55, 0);
    g.add(p); g.userData.spin = p;
    ([[-2.9, -1.05, 1.1], [-0.6, 1.25, 0.8], [-0.2, -1.2, 1.6]] as const).forEach(([x, y, z], k) => {
      const c = new THREE.Mesh(shardGeo, foil);
      c.position.set(x, y, z); c.rotation.set(0.3 * k, 0.6 - 0.4 * k, 0.2);
      g.add(c);
    });
  });
  // 2 · Parcours : quatre cartes en escalier
  addStation(2, (g) => {
    for (let k = 0; k < 4; k++) {
      const c = new THREE.Mesh(stepGeo, foil);
      c.position.set(1.0 + k * 0.55, 0.55 - k * 0.45, -k * 1.3); c.rotation.set(0, -0.6, 0.04);
      g.add(c);
    }
  });
  // 3 · Compétences : une hélice de quatorze plaquettes
  addStation(3, (g) => {
    const h = new THREE.Group();
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      const c = new THREE.Mesh(chipGeo, foil);
      c.position.set(Math.cos(a) * 1.6 - 1.7, (k / 14 - 0.5) * 3.2, Math.sin(a) * 1.6); c.rotation.set(0, -a, 0);
      h.add(c);
    }
    g.add(h); g.userData.spin = h;
  });
  // 4 · Contact : un anneau, seul
  addStation(4, (g) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.11, 24, 96), foil);
    r.position.set(1.2, 0, 0); r.rotation.set(0.9, 0.3, 0);
    g.add(r); g.userData.spin = r;
  });

  /* ── Lumières : montées sur un groupe qui voyage avec la caméra. ── */
  const rig = new THREE.Group();
  const l1 = new THREE.PointLight(0xff4fd8, 46, 26); l1.position.set(-3.4, 2.6, -2); rig.add(l1);
  const l2 = new THREE.PointLight(0x39e6ff, 42, 26); l2.position.set(3.6, -1.6, -3); rig.add(l2);
  const l3 = new THREE.PointLight(0xffca7a, 22, 22); l3.position.set(0.6, -3, -6); rig.add(l3);
  scene.add(rig);
  scene.add(new THREE.AmbientLight(0x223355, 1.1));

  /* ── Poussière le long du couloir : c'est elle qui fait sentir la vitesse. ── */
  const N = RM || mobile ? 900 : 2200;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const tint = new THREE.Color();
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
    pos[i * 3 + 2] = 8 - Math.random() * (END + 22);
    tint.setHSL(Math.random() < 0.7 ? 0.09 + Math.random() * 0.05 : 0.55, 0.75, 0.55 + Math.random() * 0.3);
    col[i * 3] = tint.r; col[i * 3 + 1] = tint.g; col[i * 3 + 2] = tint.b;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const sprite = dustSprite();
  const dustMat = new THREE.PointsMaterial({ size: 0.09, map: sprite, vertexColors: true, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Points(dustGeo, dustMat));

  /* ── Post-traitement ── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const useBloom = !RM && !mobile;
  let bloom: UnrealBloomPass | undefined;
  if (useBloom) {
    bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.7, 0.82);
    composer.addPass(bloom);
  }

  /* ── Scroll = position de la caméra. Rien d'autre ne bouge la page. ── */
  let maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  let mx = 0, my = 0, tx = 0, ty = 0;
  let camZ = CAM_AHEAD;
  let t0 = 0;
  let visible = true;
  let lastActive = -1;

  const onPointer = (e: PointerEvent) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; };
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
    maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  };
  const onVisibility = () => { visible = !document.hidden; };
  if (!still) window.addEventListener("pointermove", onPointer);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);

  let disposed = false;
  const loop = (t: number) => {
    if (!visible) return;
    const dt = Math.min((t - t0) / 1000, 0.05); t0 = t;
    const p = still ? 0 : Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    const k = RM || still ? 1 : 1 - Math.exp(-dt * 5.5);
    camZ = smooth(camZ, progressToZ(p), RM || still ? 10 : dt);
    mx += (tx - mx) * k; my += (ty - my) * k;
    camera.position.set(mx * 0.5, -my * 0.3, camZ);
    camera.lookAt(mx * 0.2, -my * 0.12, camZ - 10);
    rig.position.z = camZ;

    groups.forEach((g, i) => {
      const d = stationDistance(camZ, i);
      const v = stationVisibility(camZ, i);
      const el = stationEls[i];
      if (el && !still) {
        el.style.opacity = String(v * v);
        el.style.transform = `translateY(calc(var(--st-center) + ${(d * 9).toFixed(1)}px))`;
        const on = v > 0.5;
        el.classList.toggle("on", on);
        el.toggleAttribute("inert", !on);
      }
      const spin = g.userData.spin as THREE.Object3D | undefined;
      if (spin && !RM && !still) spin.rotation.y += dt * 0.12;
      if (!RM && !still) g.position.y = Math.sin(t * 0.0006 + i) * 0.06;
    });

    const active = activeStation(camZ);
    if (active !== lastActive) { lastActive = active; o.onActiveChange(active); }

    if (!RM && !still) {
      l1.position.x = Math.cos(t * 0.00022) * 4.2; l1.position.y = 2.4 + Math.sin(t * 0.00022) * 0.8;
      l2.position.x = Math.cos(t * 0.00031 + 2.1) * 4.4;
    }
    composer.render();
  };
  // Shader compile off the main thread, with a safety net: if the driver never
  // reports completion, start anyway after 1.5 s (the first frames then compile
  // synchronously, as before).
  let started = false;
  const compiled = renderer.compileAsync(scene, camera).then(() => undefined, () => undefined);
  const start = () => {
    if (disposed || started) return;
    started = true;
    renderer.setAnimationLoop(loop);
  };
  compiled.then(start);
  const startTimer = setTimeout(start, 1500);

  return {
    dispose() {
      disposed = true;
      clearTimeout(startTimer);
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      // GPU resources are released only once the compile has settled: three's
      // internal polling would otherwise read disposed program state and throw.
      // (If the compile never settles — driver bug — this leaks rather than throws.)
      compiled.then(() => {
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) obj.geometry.dispose();
        });
        foil.dispose(); dustMat.dispose(); sprite.dispose(); envTex.dispose(); envRT.dispose(); pmrem.dispose();
        bloom?.dispose();
        composer.dispose(); renderer.dispose();
      });
    },
  };
}
