import IO from "../IO";
import { expect, test } from "@jest/globals";

test("Testing IO laziness", () => {
  const original = 0;
  let a = original;
  const program = IO.of(43).bind((value) => {
    a += 1;
    return IO.of(value);
  });

  expect(a).toEqual(original);
  program.runUnsafe();
  expect(a).toEqual(original + 1);

  // Test side effects twice
  program.runUnsafe();
  expect(a).toEqual(original + 2);
});

test("Testing IO as a wrapper", () => {
  const later = "random text";
  const program = IO.of(43).bind((_value) => {
    return IO.of(later);
  });
  expect(program.runUnsafe()).toEqual(later);
});
