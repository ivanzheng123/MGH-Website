import * as process from "node:process";

export const verbose = () => {
    return process.env.VITE_APPLICATION_DEBUG_VERBOSE === "true";
};
