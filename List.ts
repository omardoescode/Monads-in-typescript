import { Monad } from "./Monad";
export abstract class List<T> implements Monad<T, List<T>> {
  abstract bind<D>(func: (value: T) => List<D>): List<D>;
  abstract map<D>(func: (value: T) => D): List<D>;
  abstract filter(func: (value: T) => boolean): List<T>;
  abstract foldLeft<D>(seed: D): (func: (acc: D, head: T) => D) => D;
  abstract foldRight<D>(seed: D): (func: (acc: D, head: T) => D) => D;
  abstract isEmpty(): boolean;
  abstract match<D>(cond: {
    ifPair: (head: T, tail: List<T>) => D;
    ifEmpty: () => D;
  }): D;
}

export class Pair<T> extends List<T> {
  constructor(
    private head: T,
    private tail: List<T>,
  ) {
    super();
  }

  bind<D>(func: (value: T) => List<D>): List<D> {
    const concat = <D>(l1: List<D>, l2: List<D>): List<D> =>
      l1.match({
        ifEmpty: () => l2,
        ifPair: (head, tail) => new Pair(head, concat(tail, l2)),
      });

    return concat(func(this.head), this.tail.bind(func));
  }
  map<D>(func: (value: T) => D): List<D> {
    return new Pair(func(this.head), this.tail.map(func));
  }
  filter(func: (value: T) => boolean): List<T> {
    return func(this.head)
      ? new Pair(this.head, this.tail.filter(func))
      : this.tail.filter(func);
  }
  foldLeft<D>(seed: D): (func: (acc: D, head: T) => D) => D {
    return (func) => this.tail.foldLeft(func(seed, this.head))(func);
  }
  foldRight<D>(seed: D): (func: (acc: D, head: T) => D) => D {
    return (func) => func(this.tail.foldRight(seed)(func), this.head);
  }
  isEmpty(): boolean {
    return false;
  }
  match<D>({ ifPair }: { ifPair: (head: T, tail: List<T>) => D }): D {
    return ifPair(this.head, this.tail);
  }
}

export class Empty<T> extends List<T> {
  static instance = new Empty<any>();
  private constructor() {
    super();
  }
  static get<T>(): Empty<T> {
    return Empty.instance;
  }

  bind<D>(_func: (value: T) => List<D>): List<D> {
    return Empty.get<D>();
  }
  map<D>(_func: (value: T) => D): List<D> {
    return Empty.get<D>();
  }
  filter(_func: (value: T) => boolean): List<T> {
    return this;
  }
  foldLeft<D>(seed: D): (func: (acc: D, head: T) => D) => D {
    return (_func) => seed;
  }
  foldRight<D>(seed: D): (func: (acc: D, head: T) => D) => D {
    return (_func) => seed;
  }
  isEmpty(): boolean {
    return false;
  }

  match<D>({ ifEmpty }: { ifEmpty: () => D }): D {
    return ifEmpty();
  }
}
