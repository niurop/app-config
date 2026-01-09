import { assertEquals, assertThrows } from "./deps.ts";
import { parseArgs } from "../src/args.ts";

Deno.test("parseArgs", () => {
  const config = {
    argument: "",
    flag: false,
    "argument-with-dash": "",
    profile: "local",
  };

  parseArgs(config, [
    "argument=value",
    "flag",
    "  argument-with-dash=value  ",
    "profile=",
    "unrecognized-flag",
    "unrecognized-argument=value",
    "",
  ]);

  assertEquals(config, {
    argument: "value",
    flag: true,
    "argument-with-dash": "value",
    profile: "",
  });
});

Deno.test("invalid parseArgs", () => {
  const config = { argument: "", flag: false };

  const invalid = [["argument"], ["flag=true"]];

  for (const args of invalid) {
    assertThrows(() => parseArgs(config, args));
  }
});
