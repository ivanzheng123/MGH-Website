import { NonUndefined } from "react-hook-form";

export type ArrayElementOf<A extends unknown[]> = NonUndefined<A[number]>;
