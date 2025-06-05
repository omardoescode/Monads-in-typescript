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
   * Chains the current computation with another `Writer`, combining logs via the monoid.
   *
   * @template B
   * @param {(value: A) => Writer<W, B>} func - Function producing a new Writer from the current value.
   * @returns {Writer<W, B>}
   */
  bind<B>(func: (value: A) => Writer<W, B>): Writer<W, B> {
    const result = func(this.value);
    const log = this.monoid.combine(this.log, result.log);
    return new Writer<W, B>(result.value, log, this.monoid);
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
}
