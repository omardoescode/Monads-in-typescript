import Either, { isLeft, isRight } from "../Either";
import { expect, test } from "@jest/globals";
import Option, { None } from "../Option";

const ThrowFailedBranchError = <T>(value: T) => {
  throw new Error("Failed Branch");
};

test("Either matching", () => {
  const rn = Math.random();
  const left = Either.asLeft(rn);
  expect(isLeft(left)).toBeTruthy();
  const right = Either.asRight(rn);
  expect(isRight(right)).toBeTruthy();
});

test("Either construction from option", () => {
  const rn = Math.random();
  const alterative = -1;
  const some_value = Option.pure(rn);

  expect(isRight(Either.fromOption(some_value, alterative))).toBeTruthy();

  expect(
    isLeft(Either.fromOption(None.get<number>(), alterative)),
  ).toBeTruthy();
});

test("Either orElse", () => {
  const rn = Math.random();
  const alternative = -1;

  expect(
    isRight(Either.asLeft(alternative).orElse(() => Either.asRight(rn))),
  ).toBeTruthy();
  expect(
    isRight(Either.asRight(rn).orElse(() => Either.asRight(rn))),
  ).toBeTruthy();
});

test("Either getOrElse", () => {
  const rn = Math.random();
  const alternative = -1;

  expect(Either.asRight(rn).getOrElse(alternative)).toEqual(rn);
  expect(Either.asLeft(rn).getOrElse(alternative)).toEqual(alternative);
});

test("Either ensure", () => {
  const rn = Math.random();
  const alternative = -1;

  expect(isLeft(Either.asRight(rn).ensure(alternative)((value) => value > rn)));
  expect(
    isRight(Either.asRight(rn).ensure(alternative)((value) => value == rn)),
  );
});
