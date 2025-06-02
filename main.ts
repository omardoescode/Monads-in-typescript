import { Either } from "./Either";
import { IO } from "./IO";
import { None, Option } from "./Option";

const divide: (a: number, b: number) => Either<string, number> = (a, b) =>
  b == 0 ? Either.asLeft("Cannot divide by zero") : Either.asRight(a / b);

const divide2 = (a: number, b: number): Option<number> =>
  b == 0 ? None.get() : Option.pure(a / b);

const program = IO.from(() => {
  divide(5, 0).match({
    ifLeft: (err) => console.log(err),
    ifRight: (value) => console.log(`value is ${value}`),
  });

  divide2(5, 2).match({
    ifSome: (value) => console.log(value),
    ifNone: () => console.log("Something wrong happened"),
  });
});

program.runUnsafe();
