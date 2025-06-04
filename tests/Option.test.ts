import { Option } from "../Option";
import { expect, test } from "@jest/globals";

const ThrowFailedBranchError = () => {
  throw new Error("Failed Branch");
};

test("Test Left Identity Law", () => {
  const rn: number = Math.random() * 100;
  const func = (x: number) => x + 1;
  Option.pure(rn)
    .map(func)
    .match({
      ifSome: (value) => {
        expect(value).toBe(func(rn));
      },
      ifNone: ThrowFailedBranchError,
    });
});

test("Test Right Identity Law", () => {
  const rn: number = Math.random() * 100;
  Option.pure(rn)
    .bind(Option.pure)
    .match({
      ifNone: ThrowFailedBranchError,
      ifSome: (value) => expect(value).toBe(rn),
    });
});

test("Test Associativity Law", () => {
  const rn: number = Math.random() * 100;
  const add = (x: number) => Option.pure(x + 1);
  const double = (x: number) => Option.pure(x * 2);

  const opt1 = Option.pure(rn).bind(add).bind(double);
  const opt2 = Option.pure(rn).bind((value) => add(value).bind(double));

  opt1.match({
    ifNone: ThrowFailedBranchError,
    ifSome: (v1) => {
      opt2.match({
        ifNone: ThrowFailedBranchError,
        ifSome: (v2) => expect(v1).toEqual(v2),
      });
    },
  });
});
