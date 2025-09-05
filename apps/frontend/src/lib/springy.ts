import { spring } from "motion";

export type SpringType = "standard";

type PhysicsOptions = {
    damping: number;
    mass: number;
    stiffness: number;
    velocity: number;
    restSpeed: number;
    restDelta: number;
};

const springs: Record<SpringType, PhysicsOptions> = {
    standard: {
        damping: 20,
        mass: 0.5,
        stiffness: 300,
        velocity: 1,
        restSpeed: 0.01,
        restDelta: 0.01,
    },
};

export const springy = (type: SpringType) => {
    return spring({
        keyframes: [0, 1],
        type: "spring",
        ...springs[type],
    });
};
