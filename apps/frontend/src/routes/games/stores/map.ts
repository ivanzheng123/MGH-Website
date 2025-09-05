import { create } from "zustand";
import { generateRows } from "../utils/generateRows";
import type { Row } from "../types";

interface StoreState {
    rows: Row[];
    addRows: () => void;
    reset: () => void;
}

const useMapStore = create<StoreState>((set) => ({
    rows: generateRows(20),
    addRows: () => {
        const newRows = generateRows(20);
        set((state) => ({ rows: [...state.rows, ...newRows] }));
    },
    reset: () => set({rows: generateRows(20)})
}));

export default useMapStore;
