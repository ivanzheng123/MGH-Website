import type { Row } from "../types";
import { Forest } from "./Forest";
import { CarLane } from "./CarLane";
import { TruckLane } from "@/routes/games/components/TruckLane.tsx";

type Props = {
  rowIndex: number;
  rowData: Row;
};

export function Row({ rowIndex, rowData }: Props) {
  switch (rowData.type) {
    case "forest": {
      return <Forest rowIndex={rowIndex} rowData={rowData} />;
    }
    case "car": {
      return <CarLane rowIndex={rowIndex} rowData={rowData} />;
    }
    case "truck": {
      return <TruckLane rowIndex={rowIndex} rowData={rowData} />;
    }
  }
}
