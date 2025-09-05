import { Bounds, useGLTF, useTexture } from "@react-three/drei";
import * as Three from "three";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import usePlayerAnimation from "@/routes/games/hooks/usePlayerAnimations.ts";
import { DirectionalLight } from "../components/DirectionalLight";
import { setRef } from "../stores/player";

export function Player() {
  const player = useRef<Three.Group>(null);
  const lightRef = useRef<Three.DirectionalLight>(null);
  const camera = useThree((state) => state.camera);
  usePlayerAnimation(player);

  const { scene } = useGLTF("/gltf/WongMinecraft.glb");

  useEffect(() => {
    if (!player.current) {
      return;
    }
    if (!lightRef.current) {
      return;
    }
    if (scene) {
      scene.rotation.x = Math.PI / 2;
      scene.rotation.y = Math.PI;
    }
    player.current.add(camera);
    lightRef.current.target = player.current;
    setRef(player.current);
  });
  const teamImages = [
    "/images/team/cole-softeng.png",
    "/images/team/daniel-softeng.jpg",
    "/images/team/jackson-softeng.jpg",
    "/images/team/josh-softeng.jpg",
    "/images/team/mike-softeng.jpeg",
    "/images/team/nick-softeng.png",
    "/images/team/thomas-softeng.jpg",
    "/images/team/zheren-softeng.jpg",
  ];

  const randomImage = teamImages[Math.floor(Math.random() * teamImages.length)];

  const texture = useTexture(randomImage);
  return (
    <Bounds fit clip observe margin={10}>
      <group ref={player}>
        <group>
          {/*
          <mesh position={[0, 0, 10]} castShadow receiveShadow>
            <boxGeometry args={[15, 15, 20]} />
            <meshStandardMaterial map={texture} />
          </mesh>
          {/*<mesh position={[0, 0, 25]} castShadow receiveShadow>
              <boxGeometry args={[8, 8, 10]} />
              <meshStandardMaterial map={texture} />
            </mesh>*/}
          <primitive object={scene} position={[0, 0, 18]} castShadow receiveShadow />
        </group>
        <DirectionalLight ref={lightRef} />
      </group>
    </Bounds>
  );
}
