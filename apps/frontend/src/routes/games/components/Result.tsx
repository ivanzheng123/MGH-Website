import useStore from "../stores/game";
import style from "./Result.module.css";

export function Result() {
  const status = useStore((state) => state.status);
  const score = useStore((state) => state.score);
  const reset = useStore((state) => state.reset);

  if (status === "running" || score === 0) return null;

  return (
    <div className={style.resultContainer}>
      <div className={style.result}>
        <h1 className={style.header}>Game Over</h1>
        <p className={"mb-4 text-black"}>Your score: {score}</p>
        <button className={style.button} onClick={reset}>
          Retry
        </button>
      </div>
    </div>
  );
}
