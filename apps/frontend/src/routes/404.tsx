import { FC } from "react";
import { useNavigate } from "react-router";

export const Route: FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className={"w-full h-full flex"}>
        <div className={"panel m-5 w-full p-8 flex flex-col justify-center items-center"}>
          <button
            onClick={() => navigate(-1)}
            className="absolute top-12 left-6 text-black bg-white px-4 py-2 rounded shadow hover:bg-gray-200"
          >
            Back
          </button>
          <h1 className={"text-7xl text-[unset] text-left pb-8 font-bold"}>404 Not Found</h1>
        </div>
      </div>
    </>
  );
};
