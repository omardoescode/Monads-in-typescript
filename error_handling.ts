import { Either } from "./Either";
import { None, Option } from "./Option";

enum LoginError {
  UserNotFound,
  PasswordIncorrect,
  UnexpectedError,
}

interface User {
  username: string;
  password: string;
  email: Option<string>;
}

const loginUser = (
  username: string,
  password: string,
): Either<LoginError, User> => {
  // This is a blackbox, assume we don't know what is going on
  if (password == "invalid") return Either.asLeft(LoginError.PasswordIncorrect);
  if (username == "unfound") return Either.asLeft(LoginError.UserNotFound);
  if (username == "admin") return Either.asLeft(LoginError.UnexpectedError);
  return Either.asRight({ username, password, email: None.get() });
};

let login = loginUser("Omar", "1234").bind((user) =>
  Either.asRight({
    username: user.username,
    password: user.password,
    email: user.email.getOrElse("hello@world.md"),
  }),
);

login.match({
  ifLeft: (err) => console.log(err),
  ifRight: (user) => console.log(user.email),
});
