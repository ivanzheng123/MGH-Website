export const verbose = () => {
    return import.meta.env.VITE_APPLICATION_DEBUG_VERBOSE === "true";
};
