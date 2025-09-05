import useStore from "../stores/game";

export function Score({ className }: { className?: string }) {
  const score = useStore((state) => state.score);
  return (
    <div id="score" className={className}>
      Score: {score}
    </div>
  );
}
