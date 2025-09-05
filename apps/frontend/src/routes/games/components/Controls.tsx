import { queueMove } from "@/routes/games/stores/player.ts";
import useEventListeners from "../hooks/useEventListener.ts";
import styles from "./Controls.module.css";

export function Controls() {
  useEventListeners();
  return (
    <div className={styles.controls}>
      <div className={styles.grid}>
        <button onClick={() => queueMove("forward")}>^</button>
        <button onClick={() => queueMove("left")}>«</button>
        <button onClick={() => queueMove("backward")}>v</button>
        <button onClick={() => queueMove("right")}>»</button>
      </div>
    </div>
  );
}
