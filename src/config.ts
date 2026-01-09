import { parse } from "yaml";
import { cast, getConfigTypeOf, getTypeOf } from "./utils.ts";

export function loadConfig<Config extends object>(
  initial: Config,
  paths: string[],
) {
  for (const path of paths) {
    if (path === "") continue;
    const rawConfig = Deno.readTextFileSync(path);
    parseConfig(initial, rawConfig, path);
  }
}

export function parseConfig<Config extends object>(
  initial: Config,
  rawConfig: string,
  path?: string,
) {
  const errors: string[] = [];

  const config = parse(rawConfig);
  recursivelyUpdateConfig(initial, config, [], errors);

  if (errors.length > 0) {
    for (const error of errors) console.warn(`${error} in ${path || "static"}`);
    throw "Invalid Config";
  }
}

function recursivelyUpdateConfig<Config extends object>(
  initial: Config,
  // deno-lint-ignore no-explicit-any
  obj: any,
  path: string[],
  errors: string[],
) {
  const type = getTypeOf(obj);

  if (type === "object") {
    for (const key of Object.keys(obj)) {
      recursivelyUpdateConfig(initial, obj[key], [...path, key], errors);
    }
    return;
  }

  const validTypes = ["string", "number", "boolean", "null"];

  if (!validTypes.includes(type)) {
    errors.push(
      `${
        path.join(
          ".",
        )
      } has invalid type ${type}, valid types are ${validTypes}`,
    );
    return;
  }

  let handle = initial;
  let prevHandle = {};
  for (const key of path) {
    if (key in handle) {
      prevHandle = handle;
      // @ts-ignore we know that handle[key] exist
      handle = handle[key];
    } else {
      errors.push(`${path.join(".")} does not exist in Config`);
      return;
    }
  }

  const expectedType = getConfigTypeOf(handle);

  const value = cast(obj, expectedType);
  if (value === undefined) {
    errors.push(
      `Cannot cast ${path.join(".")} of type ${type} to ${expectedType}`,
    );
    return;
  }

  // @ts-ignore we know that prevHandle[path[path.length - 1]] exist and value has proper type
  prevHandle[path[path.length - 1]] = value;
}
