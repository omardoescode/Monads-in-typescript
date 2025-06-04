import Monad from "./Monad";

export default abstract class Try<A, E = unknown>
  implements Monad<A, Try<any, E>>
{
  abstract bind<B>(func: (value: A) => Try<B, E>): Try<B, E>;
  abstract map<B>(func: (value: A) => B): Try<B, E>;

  abstract getOrElse(defaultValue: A): A;
  abstract recover(func: (error: E) => A): Try<A, E>;
  abstract recoverWith(func: (error: E) => Try<A, E>): Try<A, E>;
}

export class Success<A, E = unknown> extends Try<A, E> {
  constructor(private value: A) {
    super();
  }
  bind<B>(func: (value: A) => Try<B, E>): Try<B, E> {
    try {
      return func(this.value);
    } catch (err) {
      return new Failure<B, E>(err as E);
    }
  }
  map<B>(func: (value: A) => B): Try<B, E> {
    try {
      return new Success(func(this.value));
    } catch (err) {
      return new Failure<B, E>(err as E);
    }
  }

  getOrElse(_defaultValue: A): A {
    return this.value;
  }
  recover(_func: (error: E) => A): Try<A, E> {
    return this;
  }
  recoverWith(_func: (error: E) => Try<A, E>): Try<A, E> {
    return this;
  }
}

export class Failure<A, E = unknown> extends Try<A, E> {
  constructor(private error: E) {
    super();
  }
  bind<B>(_func: (value: A) => Try<B, E>): Try<B, E> {
    return new Failure<B, E>(this.error);
  }
  map<B>(_func: (value: A) => B): Try<B, E> {
    return new Failure<B, E>(this.error);
  }

  getOrElse(defaultValue: A): A {
    return defaultValue;
  }
  recover(func: (error: E) => A): Try<A, E> {
    try {
      return new Success(func(this.error));
    } catch (err) {
      return new Failure<A, E>(err as E);
    }
  }
  recoverWith(func: (error: E) => Try<A, E>): Try<A, E> {
    try {
      return func(this.error);
    } catch (err) {
      return new Failure<A, E>(err as E);
    }
  }
}
