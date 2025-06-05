import { expect, test } from "@jest/globals";
import Writer from "../Writer";
import Monoid, { ListMonoid, StringConcatMonoid } from "../Monoid";

const lastLogOnlyMonoid: Monoid<string> = {
  pure: "",
  combine: (_x, y) => y,
};

test("Writer Constructor", () => {
  const rn = Math.random();
  const writer = Writer.of(rn, lastLogOnlyMonoid);

  expect(writer.value).toEqual(rn);
  expect(writer.log).toEqual(lastLogOnlyMonoid.pure);
});

test("Writer bind", () => {
  const rn = Math.random();
  const msg = "Incremented the value by 1";

  const writer = Writer.of(rn, StringConcatMonoid).bind((value, make) =>
    make(value + 1, msg),
  );
  expect(writer.log).toEqual(msg);
  expect(writer.value).toEqual(rn + 1);
});

test("Writer map", () => {
  const rn = Math.random();

  const writer = Writer.of(rn, StringConcatMonoid).map((value) => value + 1);

  expect(writer.log).toEqual(StringConcatMonoid.pure);
  expect(writer.value).toEqual(rn + 1);
});
test("Writer Add Logs", () => {
  const rn = Math.random();
  const arr = Array.from({ length: 20 }, (_, i) => `TEST${i + 1}`);
  const finalLog = arr.reduce((a, b) => a + b, "");

  let writer = Writer.of(rn, StringConcatMonoid);

  for (let msg of arr) writer = writer.tell(msg);

  expect(writer.value).toEqual(rn);
  expect(writer.log).toBe(finalLog);
});

test("Writer Complex Example: Factorial", () => {
  const temp = (n: number, value: string) => `Fac(${n})=${value}`;

  function factorial(n: number): Writer<string[], number> {
    if (n == 1) return Writer.of(1, ListMonoid<string>()).tell([temp(1, "1")]);

    return factorial(n - 1).bind((prev, make) =>
      make(prev * n, [temp(n, `${prev * n}`)]),
    );
  }

  const n = 5;
  const result = factorial(n);
  // Dynamically compute expected log

  const expectedLog: string[] = [];
  let acc = 1;
  for (let i = 1; i <= n; i++) {
    acc *= i;
    expectedLog.push(temp(i, `${acc}`));
  }

  expect(result.value).toEqual(acc);
  expect(result.log).toEqual(expectedLog);
});
