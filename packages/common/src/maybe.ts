/**
 * A Maybe represents an object that provides `val` and `err` properties. When `err` is false, the data in `val` should be what was expected V. However, if `err` is true, the data in `val` should be a description of the error E. This can be used to implement value errors to represent errors, instead of exceptions.
 */
export type Maybe<V, E> =
    | {
          val: V;
          err: false;
      }
    | {
          val: E;
          err: true;
      };
