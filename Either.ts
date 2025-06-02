import { Monad } from "./Monad";
import { Option } from "./Option";

export abstract class Either<L, R> implements Monad<R, Either<L, R>> {
  abstract bind<T>(func: (value: R) => Either<L, T>): Either<L, T>;
  abstract match<D>(cond: {
    ifLeft: (value: L) => D;
    ifRight: (value: R) => D;
  }): D;
  abstract getOrElse(defaultValue: R): R;
  abstract orElse(fallback: () => Either<L, R>): Either<L, R>;
  abstract ensure(left: L): (func: (value: R) => boolean) => Either<L, R>;

  map<T>(func: (value: R) => T): Either<L, T> {
    return this.bind((value) => Either.asRight(func(value)));
  }

  static asRight<L, R>(value: R): Either<L, R> {
    return new Right<L, R>(value);
  }
  static asLeft<L, R>(value: L): Either<L, R> {
    return new Left<L, R>(value);
  }

  static fromOption<L, R>(opt: Option<R>, left: L): Either<L, R> {
    return opt.match({
      ifSome: Either.asRight,
      ifNone: () => Either.asLeft(left),
    });
  }
}

export class Right<L, R> extends Either<L, R> {
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

export class Left<L, R> extends Either<L, R> {
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
  ensure(left: L): (predicate: (value: R) => boolean) => Either<L, R> {
    return (_predicate) => this;
  }
}

export function isLeft<L, R>(opt: Either<L, R>): opt is Left<L, R> {
  return opt instanceof Left;
}

export function isRight<L, R>(opt: Either<L, R>): opt is Right<L, R> {
  return opt instanceof Right;
}
