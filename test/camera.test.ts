import { describe, it, expect } from "vitest";
import {
  CAM_AHEAD, END, GAP, STATIONS,
  activeStation, progressToZ, smooth, stationDistance, stationProgress, stationVisibility, stationZ,
} from "@/components/traversee/camera";

describe("geometry", () => {
  it("places stations GAP apart along -z", () => {
    expect(stationZ(0)).toBe(0);
    expect(stationZ(1)).toBe(-GAP);
    expect(END).toBe(GAP * (STATIONS - 1));
  });

  it("maps scroll progress to camera z, clamped", () => {
    expect(progressToZ(0)).toBeCloseTo(CAM_AHEAD);
    expect(progressToZ(1)).toBeCloseTo(CAM_AHEAD - END);
    expect(progressToZ(-1)).toBeCloseTo(CAM_AHEAD);
    expect(progressToZ(2)).toBeCloseTo(CAM_AHEAD - END);
  });

  it("maps a station index to the scroll progress that faces it", () => {
    expect(stationProgress(0)).toBe(0);
    expect(stationProgress(4)).toBe(1);
    expect(progressToZ(stationProgress(2))).toBeCloseTo(stationZ(2) + CAM_AHEAD);
  });
});

describe("stationVisibility", () => {
  const facing1 = stationZ(1) + CAM_AHEAD;
  it("is 1 when the camera faces the station", () => {
    expect(stationDistance(facing1, 1)).toBeCloseTo(0);
    expect(stationVisibility(facing1, 1)).toBeCloseTo(1);
  });
  it("fades to 0 at FADE units before or after", () => {
    expect(stationVisibility(facing1 + 5.2, 1)).toBeCloseTo(0);
    expect(stationVisibility(facing1 - 5.2, 1)).toBeCloseTo(0);
    expect(stationVisibility(facing1 + 9, 1)).toBe(0);
  });
  it("is 0.5 halfway through the fade", () => {
    expect(stationVisibility(facing1 + 2.6, 1)).toBeCloseTo(0.5);
  });
});

describe("activeStation", () => {
  it("is the first station at the start and the last at the end", () => {
    expect(activeStation(progressToZ(0))).toBe(0);
    expect(activeStation(progressToZ(1))).toBe(STATIONS - 1);
  });
  it("switches at the midpoint between two stations", () => {
    const mid = stationZ(1) + CAM_AHEAD - GAP / 2;
    expect(activeStation(mid + 0.1)).toBe(1);
    expect(activeStation(mid - 0.1)).toBe(2);
  });
});

describe("smooth", () => {
  it("does not move with dt = 0", () => {
    expect(smooth(0, 10, 0)).toBe(0);
  });
  it("converges to the target with a large dt", () => {
    expect(smooth(0, 10, 10)).toBeCloseTo(10, 3);
  });
  it("moves a fixed fraction per second regardless of frame rate", () => {
    const oneStep = smooth(0, 1, 0.1);
    let tenSteps = 0;
    for (let i = 0; i < 10; i++) tenSteps = smooth(tenSteps, 1, 0.01);
    expect(oneStep).toBeCloseTo(tenSteps, 6);
  });
});
