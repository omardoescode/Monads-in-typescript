import Monad from "./Monad";
import Option from "./Option";
/**
 * Represents a disjoint union of two possible types: Left (failure) and Right (success).
 * This is a standard `Either` monad implementation.
 *
 * @template L - Type for the Left case (usually represents failure or error).
 * @template R - Type for the Right case (usually represents success).
 */
export default abstract class Either<L, R> implements Monad<R, Either<L, R>> {
  /**
   * Chains computations that return an `Either`.
   *
   * @template T
   * @param {(value: R) => Either<L, T>} func - Function to apply to the Right value.
   * @returns {Either<L, T>}
   */
  abstract bind<T>(func: (value: R) => Either<L, T>): Either<L, T>;

  /**
   * Applies one of two functions based on whether this is a Left or a Right.
   *
   * @template D
   * @param {{ ifLeft: (value: L) => D; ifRight: (value: R) => D }} cond - Match arms for both cases.
   * @returns {D}
   */
  abstract match<D>(cond: {
    ifLeft: (value: L) => D;
    ifRight: (value: R) => D;
  }): D;

  /**
   * Returns the Right value or a default.
   *
   * @param {R} defaultValue - Value to return if this is Left.
   * @returns {R}
   */
  abstract getOrElse(defaultValue: R): R;

  /**
   * Provides an alternative `Either` if this is a Left.
   *
   * @param {() => Either<L, R>} fallback - Fallback function producing another Either.
   * @returns {Either<L, R>}
   */
  abstract orElse(fallback: () => Either<L, R>): Either<L, R>;

  /**
   * Validates the Right value with a predicate, converting to Left if it fails.
   *
   * @param {L} left - Value to use if the predicate fails.
   * @returns {(func: (value: R) => boolean) => Either<L, R>}
   */
  abstract ensure(left: L): (func: (value: R) => boolean) => Either<L, R>;

  /**
   * Maps the Right value using a function.
   *
   * @template T
   * @param {(value: R) => T} func - Function to transform the Right value.
   * @returns {Either<L, T>}
   */
  map<T>(func: (value: R) => T): Either<L, T> {
    return this.bind((value) => Either.asRight(func(value)));
  }

  /**
   * Constructs a Right.
   *
   * @template L, R
   * @param {R} value - The success value.
   * @returns {Either<L, R>}
   */
  static asRight<L, R>(value: R): Either<L, R> {
    return new Right<L, R>(value);
  }

  /**
   * Constructs a Left.
   *
   * @template L, R
   * @param {L} value - The failure value.
   * @returns {Either<L, R>}
   */
  static asLeft<L, R>(value: L): Either<L, R> {
    return new Left<L, R>(value);
  }

  /**
   * Constructs an Either from an Option.
   *
   * @template L, R
   * @param {Option<R>} opt - Option to convert.
   * @param {L} left - Value to use if Option is None.
   * @returns {Either<L, R>}
   */
  static fromOption<L, R>(opt: Option<R>, left: L): Either<L, R> {
    return opt.match({
      ifSome: Either.asRight,
      ifNone: () => Either.asLeft(left),
    });
  }
}

/**
 * Represents the Right case (success).
 *
 * @template L, R
 * @extends {Either<L, R>}
 */
export class Right<L, R> extends Either<L, R> {
  /**
   * @param {R} value - The success value.
   */
  constructor(private value: R) {
    super();
  }

  bind<T>(func: (value: R) => Either<L, T>): Either<L, T> {
    return func(this.value);
  }

  match<D>({ ifRight }: { ifRight: (value: R) => D }): D {
    return ifRight(this.value);
  }

  getOrElse(_defaultValue: R): R {
    return this.value;
  }

  orElse(_fallback: () => Either<L, R>): Either<L, R> {
    return this;
  }

  ensure(left: L): (predicate: (value: R) => boolean) => Either<L, R> {
    return (predicate) => (predicate(this.value) ? this : new Left(left));
  }
}

/**
 * Represents the Left case (failure).
 *
 * @template L, R
 * @extends {Either<L, R>}
 */
export class Left<L, R> extends Either<L, R> {
  /**
   * @param {L} value - The failure value.
   */
  constructor(private value: L) {
    super();
  }

  bind<T>(_func: (value: R) => Either<L, T>): Either<L, T> {
    return new Left<L, T>(this.value);
  }

  match<D>({ ifLeft }: { ifLeft: (value: L) => D }): D {
    return ifLeft(this.value);
  }

  getOrElse(defaultValue: R): R {
    return defaultValue;
  }

  orElse(fallback: () => Either<L, R>): Either<L, R> {
    return fallback();
  }

  ensure(_left: L): (predicate: (value: R) => boolean) => Either<L, R> {
    return (_predicate) => this;
  }
}

/**
 * Type guard for Left.
 *
 * @template L, R
 * @param {Either<L, R>} opt
 * @returns {opt is Left<L, R>}
 */
export function isLeft<L, R>(opt: Either<L, R>): opt is Left<L, R> {
  return opt instanceof Left;
}

/**
 * Type guard for Right.
 *
 * @template L, R
 * @param {Either<L, R>} opt
 * @returns {opt is Right<L, R>}
 */
export function isRight<L, R>(opt: Either<L, R>): opt is Right<L, R> {
  return opt instanceof Right;
}
