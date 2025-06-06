type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Sum<T> = {
  [K in keyof T]: Prettify<
    {
      readonly _type: K;
    } & Product<T[K]>
  >;
}[keyof T];

export type Product<T> = {
  readonly [K in keyof T]: T[K];
};

// General constructor factory for sum types, accepting the sum type itself
export function makeConstructors<ADT extends { _type: string }>() {
  type Variants = ADT extends { _type: infer K }
    ? K extends string
      ? K
      : never
    : never;
  const constructors = {} as {
    [K in Variants]: (
      args: Omit<Extract<ADT, { _type: K }>, "_type">
    ) => Extract<ADT, { _type: K }>;
  };
  // Proxy to create the correct object
  return new Proxy(constructors, {
    get(_, key: string) {
      return (args: any) => ({ _type: key, ...args });
    },
  }) as typeof constructors;
}

export function match<
  ADT extends { _type: string },
  Handlers extends {
    [K in ADT["_type"]]: (v: Extract<ADT, { _type: K }>) => any;
  }
>(value: ADT, handlers: Handlers): ReturnType<Handlers[ADT["_type"]]> {
  return handlers[value._type as ADT["_type"]](value as any);
}
