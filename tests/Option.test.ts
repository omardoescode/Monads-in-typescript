import Option, { isNone, isSome, None } from "../Option";
import { expect, test } from "@jest/globals";

const ThrowFailedBranchError = () => {
  throw new Error("Failed Branch");
};

const add = (x: number) => Option.pure(x + 1);
const double = (x: number) => Option.pure(x * 2);

test("Test Left Identity Law", () => {
  const rn: number = Math.random() * 100;
  const func = (x: number) => x + 1;
  Option.pure(rn)
    .map(func)
    .match({
      ifSome: (value) => {
        expect(value).toEqual(func(rn));
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
      ifSome: (value) => expect(value).toEqual(rn),
    });
});

test("Test Associativity Law", () => {
  const rn: number = Math.random() * 100;

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

test("Test None", () => {
  const none_number = None.get<number>();
  let value = none_number.bind(add);

  expect(value).toBe(none_number);

  let new_value = none_number.bind((_value) => Option.pure("hello"));
  expect(new_value).toBe(None.get<string>());
});

test("orElse", () => {
  const none_number = None.get<number>();
  const pure_val = Math.random() * 50;
  const pure = Option.pure(pure_val);

  const rn = Math.random() * 1000;
  none_number
    .orElse(() => Option.pure(rn))
    .match({
      ifSome: (value) => expect(value).toEqual(rn),
      ifNone: ThrowFailedBranchError,
    });

  pure
    .orElse(() => Option.pure(rn))
    .match({
      ifSome: (value) => expect(value).toEqual(pure_val),
      ifNone: ThrowFailedBranchError,
    });
});

test("getOrElse", () => {
  const none_number = None.get<number>();
  const actual = Math.random() * 50;
  const alternative = -1; // math.random returns positive values??
  const pure = Option.pure(actual);

  expect(pure.getOrElse(alternative)).toEqual(actual);
  expect(none_number.getOrElse(alternative)).toEqual(alternative);
});

test("fromNullable", () => {
  expect(isNone(Option.fromNullable(null))).toEqual(true);
  expect(isSome(Option.fromNullable(234))).toEqual(true);
});
