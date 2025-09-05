import { createContext, Dispatch, SetStateAction } from "react";

/**
 * Creates a {@link Context} that defaults to some value and who's provider takes in a value provided by a {@link useState()} call of the same type.
 * @param defaultContext The default value who's type the state must satisfy
 */
export const createStatefulContext = <S>(defaultContext: S) => {
    return createContext<[S, Dispatch<SetStateAction<S>>]>([defaultContext, () => {}]);
};
