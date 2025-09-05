import CrossyGame from "@/routes/games/WongCrossyRoads.tsx";
import { useNavigate } from "react-router";

export const Route = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className={"w-dvw h-dvh overflow-auto bg-[#6d8f32]"}>
        <CrossyGame />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-6 text-black bg-white px-4 py-2 rounded shadow hover:bg-gray-200"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Back
        </button>{" "}
      </div>
    </>
  );
};
