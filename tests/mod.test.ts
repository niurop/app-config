import { assertEquals, assertThrows } from "jsr:@std/assert";
import { load, loadStatic } from "../src/mod.ts";

Deno.test("should load appConfig", () => {
  const config = load(
    {
      args: {
        argument: "",
        flag: false,
      },
      env: {
        SECRET: "",
        UNCHANGED: "unchanged",
      },
      config: {
        auth: {
          enable: false,
          expiration: 0,
          issuer: "",
        },
      },
    },
    {
      envPaths: ["./tests/.env"],
      configPaths: ["./tests/config.yaml"],
    },
  );

  assertEquals(config, {
    args: {
      argument: "value",
      flag: true,
    },
    env: {
      SECRET: "value_from_.env",
      UNCHANGED: "unchanged",
    },
    config: {
      auth: {
        enable: true,
        expiration: 3600,
        issuer: "niurop",
      },
    },
  });
});

Deno.test("should load static appConfig", () => {
  const rawArgs = [
    "argument=value",
    "flag",
    "  argument-with-dash=value  ",
    "profile=",
    "unrecognized-flag",
    "unrecognized-argument=value",
    "",
  ];

  const rawEnv = [
    "SECRET=value",
    "",
    "unrecognized=value",
    "invalid",
    "=invalid",
  ];

  const rawConfig = `
        auth:
            enable: true
            expiration: 3600 # 1 hour in seconds
            issuer: niurop
      `;

  const config = loadStatic(
    {
      args: {
        argument: "",
        flag: false,
        profile: "local",
      },
      env: {
        SECRET: "",
        UNCHANGED: "unchanged",
      },
      config: {
        auth: {
          enable: false,
          expiration: 0,
          issuer: "",
        },
      },
    },
    {},
    rawArgs,
    rawEnv,
    rawConfig,
  );

  assertEquals(config, {
    args: {
      argument: "value",
      flag: true,
      profile: "",
    },
    env: {
      SECRET: "value",
      UNCHANGED: "unchanged",
    },
    config: {
      auth: {
        enable: true,
        expiration: 3600,
        issuer: "niurop",
      },
    },
  });
});

Deno.test("should throw if validation fails", () => {
  assertThrows(() =>
    load(
      { args: {}, env: {}, config: {} },
      { envPaths: [], configPaths: [], validate: (_config) => false },
    )
  );
  assertThrows(() =>
    loadStatic(
      { args: {}, env: {}, config: {} },
      { validate: (_config) => false },
      [],
      [],
      "",
    )
  );
});
