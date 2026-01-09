export function splitOnEquals(str: string): [string, string | undefined] {
  const idx = str.indexOf("=");
  return idx === -1 ? [str, undefined] : [str.substring(0, idx), str.substring(idx + 1)];
}

export function getTypeOf(
  // deno-lint-ignore no-explicit-any
  arg: any,
):
  | "null"
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "array"
  | "object"
  | "function" {
  return arg === null ? "null" : Array.isArray(arg) ? "array" : typeof arg;
}

export function getConfigTypeOf(
  // deno-lint-ignore no-explicit-any
  arg: any,
): "string" | "number" | "boolean" | "object" {
  const type = getTypeOf(arg);
  switch (type) {
    case "string":
    case "number":
    case "boolean":
    case "object":
      return type;
    default:
      throw `Internal Error: Invalid Config type ${type}`;
  }
}

export function cast(
  // deno-lint-ignore no-explicit-any
  arg: any,
  type: "string" | "number" | "boolean" | "object",
): unknown | undefined {
  switch (type) {
    case "string":
      return castToString(arg);
    case "number":
      return castToNumber(arg);
    case "boolean":
      return castToBoolean(arg);
    case "object":
      return castToObj(arg);
  }
}

// deno-lint-ignore no-explicit-any
function castToString(arg: any): string | undefined {
  switch (getTypeOf(arg)) {
    case "null":
      return "";
    case "string":
      return arg;
    case "number":
    case "boolean":
      return `${arg}`;
    default:
      return undefined;
  }
}

// deno-lint-ignore no-explicit-any
function castToNumber(arg: any): number | undefined {
  switch (getTypeOf(arg)) {
    case "null":
      return 0;
    case "string":
      return Number(arg) || undefined;
    case "number":
      return arg;
    case "boolean":
      return arg === true ? 1 : 0;
    default:
      return undefined;
  }
}

// deno-lint-ignore no-explicit-any
function castToBoolean(arg: any): boolean | undefined {
  switch (getTypeOf(arg)) {
    case "null":
      return false;
    case "string": {
      const str = (arg as string).toLowerCase();
      return str === "true" ? true : str === "false" ? false : str === "" ? false : undefined;
    }
    case "number":
      return arg === 0 ? false : arg === 1 ? true : undefined;
    case "boolean":
      return arg;
    default:
      return undefined;
  }
}

// deno-lint-ignore no-explicit-any
function castToObj(arg: any): object | null | undefined {
  switch (getTypeOf(arg)) {
    case "null":
    case "object":
      return arg;
    default:
      return undefined;
  }
}
