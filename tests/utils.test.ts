import { assertEquals, assertThrows } from "./deps.ts";
import { cast, getConfigTypeOf, getTypeOf, splitOnEquals } from "../src/utils.ts";

Deno.test("splitOnEquals", () => {
  assertEquals(splitOnEquals("="), ["", ""]);
  assertEquals(splitOnEquals("key="), ["key", ""]);
  assertEquals(splitOnEquals("key=value"), ["key", "value"]);
  assertEquals(splitOnEquals("=value"), ["", "value"]);
  assertEquals(splitOnEquals("key"), ["key", undefined]);
  assertEquals(splitOnEquals(""), ["", undefined]);
});

Deno.test("getTypeOf", () => {
  const types = [
    { type: "null", arg: null },
    { type: "boolean", arg: false },
    { type: "string", arg: "" },
    { type: "number", arg: 0 },
    { type: "bigint", arg: 0n },
    { type: "symbol", arg: Symbol("key") },
    { type: "undefined", arg: undefined },
    { type: "array", arg: [] },
    { type: "object", arg: {} },
    { type: "function", arg: () => null },
  ];
  for (const { type, arg } of types) {
    assertEquals(getTypeOf(arg), type);
  }
});

Deno.test("getConfigTypeOf", () => {
  const types = [
    { type: "null", throws: true, arg: null },
    { type: "boolean", throws: false, arg: false },
    { type: "string", throws: false, arg: "" },
    { type: "number", throws: false, arg: 0 },
    { type: "bigint", throws: true, arg: 0n },
    { type: "symbol", throws: true, arg: Symbol("key") },
    { type: "undefined", throws: true, arg: undefined },
    { type: "array", throws: true, arg: [] },
    { type: "object", throws: false, arg: {} },
    { type: "function", throws: true, arg: () => null },
  ];
  for (const { type, throws, arg } of types) {
    if (throws) assertThrows(() => getConfigTypeOf(arg));
    if (!throws) assertEquals(getConfigTypeOf(arg), type);
  }
});

Deno.test("cast", () => {
  const cases = [
    {
      string: "",
      number: 0,
      boolean: false,
      object: null,
      arg: null,
    },
    {
      string: "false",
      number: 0,
      boolean: false,
      object: undefined,
      arg: false,
    },
    {
      string: "true",
      number: 1,
      boolean: true,
      object: undefined,
      arg: true,
    },
    {
      string: "",
      number: undefined,
      boolean: false,
      object: undefined,
      arg: "",
    },
    {
      string: "true",
      number: undefined,
      boolean: true,
      object: undefined,
      arg: "true",
    },
    {
      string: "false",
      number: undefined,
      boolean: false,
      object: undefined,
      arg: "false",
    },
    {
      string: "0",
      number: 0,
      boolean: false,
      object: undefined,
      arg: 0,
    },
    {
      string: "1",
      number: 1,
      boolean: true,
      object: undefined,
      arg: 1,
    },
    {
      string: "2",
      number: 2,
      boolean: undefined,
      object: undefined,
      arg: 2,
    },
    {
      string: undefined,
      number: undefined,
      boolean: undefined,
      object: undefined,
      arg: 0n,
    },
    {
      string: undefined,
      number: undefined,
      boolean: undefined,
      object: undefined,
      arg: Symbol("key"),
    },
    {
      string: undefined,
      number: undefined,
      boolean: undefined,
      object: undefined,
      arg: undefined,
    },
    {
      string: undefined,
      number: undefined,
      boolean: undefined,
      object: undefined,
      arg: [],
    },
    {
      string: undefined,
      number: undefined,
      boolean: undefined,
      object: {},
      arg: {},
    },
    {
      string: undefined,
      number: undefined,
      boolean: undefined,
      object: undefined,
      arg: () => null,
    },
  ];
  for (const { string, number, boolean, object, arg } of cases) {
    console.log(`casting: ${arg?.toString()}:${getTypeOf(arg)}`);
    assertEquals(cast(arg, "string"), string);
    assertEquals(cast(arg, "number"), number);
    assertEquals(cast(arg, "boolean"), boolean);
    assertEquals(cast(arg, "object"), object);
  }
});
