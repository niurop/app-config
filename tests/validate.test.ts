import { assertThrows } from "jsr:@std/assert";
import { validate } from "../src/validate.ts";

Deno.test("empty AppConfig should be valid", () => {
  validate({
    args: {},
    env: {},
    config: {},
  });
});

Deno.test("example config with examples for all valid structures", () => {
  validate({
    args: {
      profile: "local",
      flag: false,
    },
    env: {
      SECRET: "",
    },
    config: {
      auth: {
        enable: false,
        issuer: "",
        expiration: 12,
      },
      enable: true,
      author: "niurop",
      "api-version": 1,
    },
  });
});

Deno.test(`Check all valid types for AppConfig`, () => {
  // deno-lint-ignore no-explicit-any
  const types: { args: number; env: number; config: number; arg: any }[] = [
    { args: 0, env: 0, config: 0, arg: null },
    { args: 1, env: 0, config: 1, arg: false },
    { args: 1, env: 1, config: 1, arg: "" },
    { args: 0, env: 0, config: 1, arg: 0 },
    { args: 0, env: 0, config: 0, arg: 0n },
    { args: 0, env: 0, config: 0, arg: Symbol("key") },
    { args: 0, env: 0, config: 0, arg: undefined },
    { args: 0, env: 0, config: 0, arg: [] },
    { args: 0, env: 0, config: 1, arg: {} },
    { args: 0, env: 0, config: 0, arg: () => null },
  ];
  for (const { args, env, config, arg } of types) {
    const argsFn = () => validate({ args: { arg }, env: {}, config: {} });
    if (args) argsFn();
    else assertThrows(argsFn);
    const envFn = () => validate({ args: {}, env: { arg }, config: {} });
    if (env) envFn();
    else assertThrows(envFn);
    const configFn = () => validate({ args: {}, env: {}, config: { arg } });
    if (config) configFn();
    else assertThrows(configFn);
  }
});

Deno.test("AppConfig.(args|env|config) must be an object", () => {
  assertThrows(() => validate({ args: [], env: {}, config: {} }));
  assertThrows(() => validate({ args: {}, env: [], config: {} }));
  assertThrows(() => validate({ args: {}, env: {}, config: [] }));
});
