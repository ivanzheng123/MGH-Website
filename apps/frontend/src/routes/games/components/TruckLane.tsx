import type { Row } from "@/routes/games/types.ts";
import { Road } from "./Road";
import { Truck } from "./Truck";

type Props = {
  rowIndex: number;
  rowData: Extract<Row, { type: "truck" }>;
};

export function TruckLane({ rowIndex, rowData }: Props) {
  return (
    <Road rowIndex={rowIndex}>
      {rowData.vehicles.map((vehicle, index) => (
        <Truck
          key={index}
          rowIndex={rowIndex}
          initialTileIndex={vehicle.initialTileIndex}
          direction={rowData.direction}
          speed={rowData.speed}
          color={vehicle.color}
        />
      ))}
    </Road>
  );
}
