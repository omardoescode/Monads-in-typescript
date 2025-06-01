import { Monad } from "./Monad";

export class IO<A> implements Monad<A, IO<A>> {
  constructor(private effect: () => A) {}

  runUnsafe(): A {
    return this.effect();
  }

  bind<B>(func: (value: A) => IO<B>): IO<B> {
    return new IO<B>(() => func(this.effect()).runUnsafe());
  }
  map<B>(func: (value: A) => B): IO<B> {
    return new IO<B>(() => func(this.effect()));
  }

  static of<A>(value: A): IO<A> {
    return new IO<A>(() => value);
  }
  static from<A>(thunk: () => A): IO<A> {
    return new IO<A>(thunk);
  }
}
