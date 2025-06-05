export default interface Monoid<A> {
  combine(x: A, y: A): A;
  pure: A;
}

export const StringConcatMonoid: Monoid<string> = {
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
