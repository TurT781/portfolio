import { Traversee } from "@/components/traversee/Traversee";
import { Station } from "@/components/traversee/Station";
import { stations } from "@/lib/content/stations";

export default function Home() {
  return (
    <Traversee>
      {stations.map((s, i) => (
        <Station key={s.id} station={s} index={i} />
      ))}
    </Traversee>
  );
}
