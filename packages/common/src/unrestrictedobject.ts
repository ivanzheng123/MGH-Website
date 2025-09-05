/* eslint @typescript-eslint/no-explicit-any: 0*/
/**
 * Variant of {@link object} which accepts any members.
 */
export type unrestrictedobject = {
    [key: string | number | symbol]: any;
};
