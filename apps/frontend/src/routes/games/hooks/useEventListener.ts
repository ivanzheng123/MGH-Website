import { useEffect } from "react";
import { queueMove } from "../stores/player";

export default function useEventListeners() {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp") {
                event.preventDefault();
                queueMove("forward");
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                queueMove("backward");
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                queueMove("left");
            } else if (event.key == "ArrowRight") {
                event.preventDefault();
                queueMove("right");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window. removeEventListener("keydown", handleKeyDown) ;
        };
    },[]);
}
