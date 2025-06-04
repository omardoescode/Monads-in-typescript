import Monad from "./Monad";

/**
 * Represents a deferred computation that produces a value of type `A`.
 *
 * This `IO` monad encapsulates side-effectful operations as pure values,
 * deferring their execution until explicitly run via `runUnsafe()`.
 *
 * Note: This implementation does **not** store or model the state of the world
 * between IO actions. Instead, it simply wraps effectful computations
 * and runs them all at once when `runUnsafe()` is called.
 *
 * This allows you to build complex effectful workflows in a pure functional style
 * while controlling when side effects actually happen.
 *
 * @template A The type of the value produced by this IO.
 */
export default class IO<A> implements Monad<A, IO<A>> {
  /**
   * Constructs a new IO from a deferred effectful function.
   * @param effect A function representing the deferred effectful computation.
   */
  constructor(private effect: () => A) {}

  /**
   * Executes the encapsulated effectful computation.
   * This is the only point where side effects happen.
   *
   * @returns The result of the effectful computation.
   */
  runUnsafe(): A {
    return this.effect();
  }

  /**
   * Monadic bind (flatMap) to sequence IO computations.
   * Takes a function that produces a new IO from the result of this IO,
   * returning a new IO representing the composed computation.
   *
   * @template B The result type of the next IO.
   * @param func Function mapping a value to a new IO.
   * @returns A new IO representing the sequential composition.
   */
  bind<B>(func: (value: A) => IO<B>): IO<B> {
    return new IO<B>(() => func(this.effect()).runUnsafe());
  }

  /**
   * Functor map to apply a pure function to the result of this IO,
   * returning a new IO of the mapped result.
   *
   * @template B The result type after applying the function.
   * @param func Function to transform the value.
   * @returns A new IO containing the transformed value.
   */
  map<B>(func: (value: A) => B): IO<B> {
    return new IO<B>(() => func(this.effect()));
  }

  /**
   * Lifts a pure value into the IO context.
   * The returned IO produces the value without any side effects.
   *
   * @template A The type of the value.
   * @param value The value to lift.
   * @returns An IO wrapping the pure value.
   */
  static of<A>(value: A): IO<A> {
    return new IO<A>(() => value);
  }

  /**
   * Creates a new IO from a thunk (deferred computation).
   *
   * @template A The type of the result.
   * @param thunk A function returning the effectful computation.
   * @returns An IO wrapping the thunk.
   */
  static from<A>(thunk: () => A): IO<A> {
    return new IO<A>(thunk);
  }
}
