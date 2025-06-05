import { expect, test } from "@jest/globals";
import Writer from "../Writer";
import Monoid, { StringConcatMonoid } from "../Monoid";

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
  const alternative = -1;
  const msg = "Incremented the value by 1";

  const writer = Writer.of(rn, StringConcatMonoid).bind((value, make) =>
    make(value + 1, msg),
  );
  expect(writer.log).toEqual(msg);
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
