import { Canvas } from "@react-three/fiber";

export const Scene = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas
      orthographic={true}
      shadows={true}
      camera={{
        up: [0, 0, 1],
        position: [100, -100, 100],
        scale: [0.5, 0.5, 0.5],
      }}
    >
      <ambientLight />
      <directionalLight position={[-100, -100, 200]} />
      {children}
    </Canvas>
  );
};
