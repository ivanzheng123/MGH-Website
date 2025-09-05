import { tileSize, tilesPerRow } from "@/routes/games/constants.ts";

type Props = {
  rowIndex: number;
  children?: React.ReactNode;
};

export function Grass({ rowIndex, children }: Props) {
  return (
    <group position-y={rowIndex * tileSize}>
      <mesh receiveShadow>
        <boxGeometry args={[tilesPerRow * tileSize, tileSize, 3]} />
        <meshLambertMaterial color={0xbaf455} flatShading />
      </mesh>
      {children}
    </group>
  );
}
