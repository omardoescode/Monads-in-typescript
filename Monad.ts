export interface Monad<A, M extends Monad<any, any>> {
  bind<B>(
    f: (a: A) => M extends Monad<infer _, infer M2> ? Monad<B, M2> : never,
  ): Monad<B, M>;
  map<B>(f: (a: A) => B): Monad<B, M>;
}
