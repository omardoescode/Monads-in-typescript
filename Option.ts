import Monad from "./Monad";

export abstract class Option<A> implements Monad<A, Option<any>> {
  abstract bind<B>(func: (value: A) => Option<B>): Option<B>;
  abstract match<D>(cond: { ifSome: (value: A) => D; ifNone: () => D }): D;

  map<B>(func: (value: A) => B): Option<B> {
    return this.bind((value: A) => Option.pure(func(value)));
  }

  static pure<A>(value: A): Option<A> {
    return new Some(value);
  }

  getOrElse(defaultValue: A): A {
    return this.match({ ifSome: (value) => value, ifNone: () => defaultValue });
  }

  orElse(fallback: () => Option<A>): Option<A> {
    return this.match({ ifSome: (_value) => this, ifNone: fallback });
  }
}

export class Some<A> extends Option<A> {
  constructor(private value: A) {
    super();
  }

  bind<B>(func: (value: A) => Option<B>): Option<B> {
    return func(this.value);
  }

  match<D>({ ifSome }: { ifSome: (value: A) => D }): D {
    return ifSome(this.value);
  }
}

export class None<A> extends Option<A> {
  static instance = new None<any>();

  private constructor() {
    super();
  }

  static get<A>(): None<A> {
    return None.instance;
  }

  bind<B>(_func: (value: never) => Option<B>): Option<B> {
    return None.get<B>();
  }

  match<D>({ ifNone }: { ifNone: () => D }): D {
    return ifNone();
  }
}

export function isSome<A>(opt: Option<A>): opt is Some<A> {
  return opt instanceof Some;
}

export function isNone<A>(opt: Option<A>): opt is None<A> {
  return opt instanceof None;
}
