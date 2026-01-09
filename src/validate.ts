import type { AppConfig } from "./mod.ts";
import { getTypeOf } from "./utils.ts";

type ValidationError = {
  path: string;
  type: string;
  validTypes: string[];
};

export const validArgsTypes = ["string", "boolean"];
export const validEnvTypes = ["string"];
export const validConfigTypes = ["string", "number", "boolean", "object"];

export function validate<
  Args extends object,
  Env extends object,
  Config extends object,
>(defaults: AppConfig<Args, Env, Config>) {
  const errors: ValidationError[] = [];

  validateObjectRecursively(defaults.args, `args`, validArgsTypes, errors);
  validateObjectRecursively(defaults.env, `env`, validEnvTypes, errors);
  validateObjectRecursively(
    defaults.config,
    "config",
    validConfigTypes,
    errors,
  );

  if (errors.length > 0) {
    console.warn("Invalid config structure:");
    for (const error of errors) {
      console.warn(
        `${error.path} has invalid type: ${error.type}. Valid types are: ${error.validTypes}`,
      );
    }
    throw "Invalid AppConfig structure";
  }
}

function validateObjectRecursively(
  obj: object,
  path: string,
  validTypes: string[],
  errors: ValidationError[],
) {
  if (Array.isArray(obj)) {
    errors.push({ path, type: "array", validTypes: ["object"] });
    return;
  }
  for (const key of Object.keys(obj)) {
    validateRecursively(
      // @ts-ignore typeof obj[key]
      obj[key],
      `${path}.${key}`,
      validTypes,
      errors,
    );
  }
}

function validateRecursively(
  // deno-lint-ignore no-explicit-any
  arg: any,
  path: string,
  validTypes: string[],
  errors: ValidationError[],
) {
  const type = getTypeOf(arg);
  if (!validTypes.includes(type)) {
    errors.push({
      path,
      type,
      validTypes,
    });
    return;
  }
  if (type !== "object") return;
  for (const key of Object.keys(arg)) {
    validateRecursively(arg[key], `${path}.${key}`, validTypes, errors);
  }
}
