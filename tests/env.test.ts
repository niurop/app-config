import { assertEquals, assertThrows } from "./deps.ts";
import { loadEnv, parseEnv } from "../src/env.ts";

Deno.test("parse rawEnv", () => {
  const env = {
    SECRET: "",
    UNCHANGED: "unchanged",
  };

  const rawEnv = [
    "SECRET=value",
    "",
    "unrecognized=value",
    "invalid",
    "=invalid",
  ];

  parseEnv(env, rawEnv);

  assertEquals(env, {
    SECRET: "value",
    UNCHANGED: "unchanged",
  });
});

Deno.test("loadEnv", () => {
  const env = {
    SECRET: "",
    DENO_SECRET: "",
    UNCHANGED: "unchanged",
  };

  Deno.env.set("DENO_SECRET", "DENO_SECRET");

  loadEnv(env, ["./tests/.env", "", "Deno.env"]);

  assertEquals(env, {
    SECRET: "value_from_.env",
    DENO_SECRET: "DENO_SECRET",
    UNCHANGED: "unchanged",
  });
});

Deno.test("should throw if file doesn't exits when calling loadEnv", () => {
  assertThrows(() => loadEnv({}, ["non-existing-file"]));
});
