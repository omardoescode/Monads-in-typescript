import Monad from "./Monad";
import util from "util";

/**
 * Represents an optional value: every `Option` is either `Some` and contains a value,
 * or `None`, and does not. Inspired by functional programming idioms.
 */
export default abstract class Option<A> implements Monad<A, Option<any>> {
  /**
   * Applies a function to the wrapped value and flattens the result.
   * @param func Function to apply to the wrapped value.
   */
  abstract bind<B>(func: (value: A) => Option<B>): Option<B>;

  /**
   * Pattern matches on the `Option`, executing the appropriate branch.
   * @param cond Object with `ifSome` and `ifNone` handlers.
   * @returns The result of executing the appropriate function.
   */
  abstract match<D>(cond: { ifSome: (value: A) => D; ifNone: () => D }): D;

  /**
   * Customizes the string representation of this instance when inspected by
   * Node.js `util.inspect` (used by `console.log` and debugging tools).
   *
   * This method is called automatically when the object is logged or inspected,
   * allowing you to provide a more readable and meaningful output instead of the
   * default object representation.
   *
   * @returns {string} A human-readable string describing the instance.
   *
   * @see https://nodejs.org/api/util.html#custom-inspection-functions-on-objects
   */
  abstract [util.inspect.custom](): string;

  /**
   * Maps a function over the `Option`, preserving the structure.
   * @param func Function to apply to the value if `Some`.
   * @returns A new `Option` containing the result, or `None`.
   */
  map<B>(func: (value: A) => B): Option<B> {
    return this.bind((value: A) => Option.pure(func(value)));
  }

  /**
   * Wraps a value in a `Some`.
   * @param value Value to wrap.
   * @returns A `Some` co
   * ntaining the given value.
   */
  static pure<A>(value: A): Option<A> {
    return new Some(value);
  }

  /**
   * Extracts the value from the `Option`, or returns the provided default.
   * @param defaultValue Value to return if this is `None`.
   * @returns The contained value or the default.
   */
  getOrElse(defaultValue: A): A {
    return this.match({ ifSome: (value) => value, ifNone: () => defaultValue });
  }

  /**
   * Returns this `Option` if it is `Some`, otherwise evaluates and returns a fallback `Option`.
   * @param fallback Function to produce a fallback `Option`.
   * @returns This `Option` or the fallback.
   */
  orElse(fallback: () => Option<A>): Option<A> {
    return this.match({ ifSome: (_value) => this, ifNone: fallback });
  }

  static fromNullable<A>(value: A | null | undefined): Option<A> {
    return value == null ? None.get<A>() : Option.pure(value);
  }
}

/**
 * A variant of `Option` representing a present value.
 */
export class Some<A> extends Option<A> {
  constructor(private value: A) {
    super();
  }

  /**
   * Applies a function to the contained value.
   * @param func Function to apply.
   * @returns The result of the function.
   */
  bind<B>(func: (value: A) => Option<B>): Option<B> {
    return func(this.value);
  }

  /**
   * Executes the `ifSome` branch with the contained value.
   * @param param Destructured handlers.
   * @returns Result of `ifSome`.
   */
  match<D>({ ifSome }: { ifSome: (value: A) => D }): D {
    return ifSome(this.value);
  }

  /** @inheritdoc */
  [util.inspect.custom]() {
    return `Some(${this.value})`;
  }
}

/**
 * A variant of `Option` representing the absence of a value.
 */
export class None<A> extends Option<A> {
  static instance = new None<any>();

  private constructor() {
    super();
  }

  /**
   * Returns the singleton instance of `None`.
   */
  static get<A>(): None<A> {
    return None.instance;
  }

  /**
   * Returns `None` since there's no value to bind.
   * @param _func Unused function, as there is no value.
   */
  bind<B>(_func: (value: never) => Option<B>): Option<B> {
    return None.get<B>();
  }

  /**
   * Executes the `ifNone` branch.
   * @param param Destructured handlers.
   * @returns Result of `ifNone`.
   */
  match<D>({ ifNone }: { ifNone: () => D }): D {
    return ifNone();
  }

  /** @inheritdoc */
  [util.inspect.custom]() {
    return `None`;
  }
}

/**
 * Type guard to check if an `Option` is a `Some`.
 * @param opt The `Option` to check.
 * @returns True if `opt` is a `Some`.
 */
export function isSome<A>(opt: Option<A>): opt is Some<A> {
  return opt instanceof Some;
}

/**
 * Type guard to check if an `Option` is a `None`.
 * @param opt The `Option` to check.
 * @returns True if `opt` is a `None`.
 */
export function isNone<A>(opt: Option<A>): opt is None<A> {
  return opt instanceof None;
}
