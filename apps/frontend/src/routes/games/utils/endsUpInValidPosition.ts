import type { MoveDirection } from "../types";
import { calculateFinalPosition } from "./calculateFinalPosition";
import { maxTileIndex, minTileIndex } from "../constants.ts";
import useMapStore from "../stores/map.ts";

export function endsUpInvalidPosition(
    currentPosition: { rowIndex: number; tileIndex: number },
    moves: MoveDirection[]
) {
    // Calculate where the player would end up after the move
    const finalPosition = calculateFinalPosition(currentPosition, moves);

    // Detect if we hit the edge of the board
    if (
        finalPosition.rowIndex === -1 ||
        finalPosition.tileIndex === minTileIndex - 1 ||
        finalPosition.tileIndex === maxTileIndex + 1
    ) {
        // Invalid move, ignore move command
        return false;
    }

    // Detect if we hit a tree
    const finalRow = useMapStore.getState().rows[finalPosition.rowIndex - 1];
    if (
        finalRow &&
        finalRow.type === "forest" &&
        finalRow.trees.some((tree) => tree.tileIndex === finalPosition.tileIndex)
    ) {
        // Invalid move, ignore move command
        return false;
    }

    return true;
}
