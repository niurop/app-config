import { assertEquals, assertThrows } from "./deps.ts";
import { loadConfig, parseConfig } from "../src/config.ts";

Deno.test("parse rawConfig", () => {
  const config = {
    auth: {
      enable: false,
      expiration: 0,
      issuer: "",
    },
  };

  const rawConfig = `
    auth:
        enable: true
        expiration: 3600 # 1 hour in seconds
        issuer: niurop
  `;

  parseConfig(config, rawConfig);

  assertEquals(config, {
    auth: {
      enable: true,
      expiration: 3600,
      issuer: "niurop",
    },
  });
});

Deno.test("loadConfig", () => {
  const config = {
    auth: {
      enable: false,
      expiration: 0,
      issuer: "",
    },
  };

  loadConfig(config, ["./tests/config.yaml"]);

  assertEquals(config, {
    auth: {
      enable: true,
      expiration: 3600,
      issuer: "niurop",
    },
  });
});

Deno.test("should throw if file doesn't exits when calling loadConfig", () => {
  assertThrows(() => loadConfig({}, ["non-existing-file"]));
});
