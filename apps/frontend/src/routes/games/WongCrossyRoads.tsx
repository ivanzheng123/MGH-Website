import { Scene } from "./components/Scene";
import { Player } from "@/routes/games/components/Player.tsx";
import { Map } from "./components/Map.tsx";
import { Controls } from "./components/Controls.tsx";
import { Score } from "@/routes/games/components/Score.tsx";
import { Result } from "./components/Result";
import styles from "./Games.module.css";

export default function CrossyGame() {
  return (
    <div
      className={styles.game}
      style={{
        position: "relative",
      }}
    >
      <Scene>
        <Player />
        <Map />
      </Scene>
      <Score className={"absolute inset-4"} />
      <Controls />
      <Result />
    </div>
  );
}
