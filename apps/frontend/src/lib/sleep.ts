/**
 * Asynchronously sleeps for ms milliseconds. Must be awaited.
 * @param ms
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
