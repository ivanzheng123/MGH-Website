import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { state as player } from "../stores/player";
import useGameStore from "../stores/game";

export default function useHitDetection(
    vehicle: React.RefObject<THREE.Group | null>,
    rowIndex: number
) {
    const endGame = useGameStore((state) => state.endGame);

    useFrame(() => {
        if (!vehicle.current) return;
        if (useGameStore.getState().status == "over"){
            return;
        }
        if (!player.ref) return;

        if (
            rowIndex === player.currentRow ||
            rowIndex === player.currentRow + 1 ||
            rowIndex === player.currentRow - 1
        ) {
            const vehicleBoundingBox = new THREE.Box3();
            vehicleBoundingBox.setFromObject(vehicle.current);

            const playerBoundingBox = new THREE.Box3();
            playerBoundingBox.setFromObject(player.ref);

            if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
                console.log("Ending Game");
                console.log("Score:",useGameStore.getState().score)
                if(useGameStore.getState().score === 0){
                    console.log("Can't End Game Score = 0");
                    return;
                }
                endGame();
            }
        }
    });
}
