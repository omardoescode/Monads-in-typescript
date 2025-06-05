import assert from "assert";
import Monad from "./Monad";
import Monoid from "./Monoid";

/**
 * Writer monad allows values to be paired with a log (or accumulated context).
 *
 * It is useful for computations that produce a result along with some additional
 * output, like debug logs, accumulated metadata, or audit trails.
 *
 * @template W - Type of the log, which must form a Monoid.
 * @template A - Type of the wrapped value.
 */
export default class Writer<W, A> implements Monad<A, Writer<W, A>> {
  /**
   * Constructs a new Writer instance. Typically you should use `Writer.of()` instead.
   *
   * @param {A} value - The computed value.
   * @param {W} log - The log context associated with the computation.
   * @param {Monoid<W>} monoid - Monoid instance to handle log combination.
   * @private
   */
  private constructor(
    public readonly value: A,
    public readonly log: W,
    public readonly monoid: Monoid<W>,
  ) {}

  /**
   * Chains the current computation with another `Writer`, combining logs using the monoid.
   *
   * This method allows you to sequence computations that produce both a value and a log,
   * while automatically managing log accumulation using the provided monoid instance.
   *
   * The provided `make` helper function ensures that new `Writer` instances are created
   * with the correct monoid, so you don't have to pass the monoid manually.
   *
   * @template B - The type of the resulting value after applying `func`.
   * @param {(value: A, make: <T>(value: T, log: W) => Writer<W, T>) => Writer<W, B>} func
   * A function that takes the current value and a helper `make` function to produce the next Writer.
   *
   * @returns {Writer<W, B>} A new Writer with the result value and accumulated log.
   *
   * @example
   * const writer = Writer.of(2, StringConcatMonoid)
   *   .bind((value, make) => make(value + 3, "Added 3\n"))
   *   .bind((value, make) => make(value * 2, "Doubled\n"));
   *
   * console.log(writer.value); // 10
   * console.log(writer.log);   // "Added 3\nDoubled\n"
   */
  bind<B>(
    func: (
      value: A,
      make: <T>(value: T, log: W) => Writer<W, T>,
    ) => Writer<W, B>,
  ): Writer<W, B> {
    const make = <T>(value: T, log: W) => new Writer(value, log, this.monoid);
    const result = func(this.value, make);

    assert(result.monoid === this.monoid, "Must have the same monoid");

    const combinedLog = this.monoid.combine(this.log, result.log);
    return new Writer(result.value, combinedLog, this.monoid);
  }

  /**
   * Transforms the wrapped value while preserving the log.
   *
   * @template B
   * @param {(value: A) => B} func - Function to apply to the value.
   * @returns {Writer<W, B>}
   */
  map<B>(func: (value: A) => B): Writer<W, B> {
    return new Writer<W, B>(func(this.value), this.log, this.monoid);
  }

  /**
   * Constructs a Writer from a value, using the identity (empty) value of the monoid for the log.
   *
   * @template W, A
   * @param {A} value - Value to wrap.
   * @param {Monoid<W>} monoid - Monoid instance for the log type.
   * @returns {Writer<W, A>}
   */
  static of<W, A>(value: A, monoid: Monoid<W>): Writer<W, A> {
    return new Writer<W, A>(value, monoid.pure, monoid);
  }

  /**
   * Appends a log entry to the current Writer.
   *
   * @param {W} log - Log to append.
   * @returns {Writer<W, A>}
   */
  tell(log: W): Writer<W, A> {
    const newLog = this.monoid.combine(this.log, log);
    return new Writer<W, A>(this.value, newLog, this.monoid);
  }

  /**
   * Returns both the value encapsulated in the writer, and the log
   *
   * returns {[A, W]}
   */
  run(): [A, W] {
    return [this.value, this.log];
  }
}
