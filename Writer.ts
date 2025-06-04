import Monad from "./Monad";

export interface Monoid<A> {
  combine(x: A, y: A): A;
  pure: A;
}

export const StringLog: Monoid<string> = {
  combine(x: string, y: string): string {
    return x + y;
  },
  pure: "",
};
export function ListMonoid<T>(): Monoid<T[]> {
  return {
    pure: [],
    combine: (x: T[], y: T[]): T[] => [...x, ...y],
  };
}

export default class Writer<W, A> implements Monad<A, Writer<W, A>> {
  private constructor(
    public readonly value: A,
    public readonly log: W,
    public readonly monoid: Monoid<W>,
  ) {}

  bind<B>(func: (value: A) => Writer<W, B>): Writer<W, B> {
    const result = func(this.value);
    const log = this.monoid.combine(this.log, result.log);
    return new Writer<W, B>(result.value, log, this.monoid);
  }
  map<B>(func: (value: A) => B): Writer<W, B> {
    return new Writer<W, B>(func(this.value), this.log, this.monoid);
  }

  static of<W, A>(value: A, monoid: Monoid<W>): Writer<W, A> {
    return new Writer<W, A>(value, monoid.pure, monoid);
  }

  tell(log: W): Writer<W, A> {
    const newLog = this.monoid.combine(this.log, log);
    return new Writer<W, A>(this.value, newLog, this.monoid);
  }
}
