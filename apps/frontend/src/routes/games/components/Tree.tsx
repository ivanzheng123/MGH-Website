import { tileSize } from "@/routes/games/constants.ts";
import Image from "../../../../public/images/buffwong.png";
import { useTexture } from "@react-three/drei";

type Props = {
  tileIndex: number;
  height: number;
};

export function Tree({ tileIndex, height }: Props) {
  const texture = useTexture(Image);
  return (
    <group position-x={tileIndex * tileSize}>
      <mesh position-z={height / 2 + 20} castShadow receiveShadow>
        <boxGeometry args={[30, 30, height]} />
        <meshLambertMaterial map={texture} />
      </mesh>
      <mesh position-z={10} castShadow receiveShadow>
        <boxGeometry args={[15, 15, 20]} />
        <meshLambertMaterial color={0x4d2926} flatShading />
      </mesh>
    </group>
  );
}
