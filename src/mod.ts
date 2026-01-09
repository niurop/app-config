import { validate } from "./validate.ts";
import { parseArgs } from "./args.ts";
import { loadEnv, parseEnv } from "./env.ts";
import { loadConfig, parseConfig } from "./config.ts";

export type Options<
  Args extends object,
  Env extends object,
  Config extends object,
> = {
  /**
   * Paths to files with env variables.
   *
   * The variables not defined by `Options.env` will be skipped
   *
   * @default ["./.env", "Deno.env"]
   *
   * Will skip `""`
   *
   * @example
   * ```ts
   * [
   *    "./.env",  // read ./.env
   *    "Deno.env" // read variables using Deno.env
   * ]
   * ```
   */
  envPaths?: string[] | ((args: Args) => string[]);
  /**
   * Paths to files with configurations in yaml.
   *
   * The config model defined as `Config` in `AppConfig<Args, Env, Config>`
   *
   * @default ["./config.yaml"]
   *
   * Will skip `""`
   *
   * @example
   * ```ts
   * [
   *    "./config.yaml",      // read ./config.yaml
   *    "./config-local.yaml" // read ./config-local.yaml
   * ]
   * ```
   */
  configPaths?: string[] | ((args: Args, env: Env) => string[]);
  /**
   * @param `config` final version of config after loading
   * @returns `true` if appConfig is valid
   */
  validate?: (config: AppConfig<Args, Env, Config>) => boolean;
};

export type AppConfig<
  Args extends object,
  Env extends object,
  Config extends object,
> = {
  /**
   * Valid structure can only be of type:
   * ```ts
   * {
   *   key: string,
   *   flag: boolean,
   *   ...
   * }
   * ```
   * it must be flat object with members of type
   * - `string` for arguments like `key=value`
   * - `boolean` for flags like `flag`
   */
  args: Args;
  /**
   * Valid structure can only be of type:
   * ```ts
   * {
   *   key: string,
   *   secret: string,
   *   ...
   * }
   * ```
   * it must be flat object with members of type
   * - `string` for arguments like `key=value`
   */
  env: Env;
  /**
   * Valid structure is any object but can only include types
   * - `string`
   * - `number`
   * - `boolean`
   * - `object` with the same restrictions
   */
  config: Config;
};

/**
 * Load config from Deno.args, Deno.env, and config files
 *
 * @param initial appConfig that will be modified
 * @param options will ignore `options.envPaths` and `options.configPath`
 * @returns `initial` appConfig with assigned new values
 * @throws when:
 * - `initial` has invalid structure,
 * - any problems when parsing `Deno.args`, `Deno.env`, and config files
 * - `options.validate` doesn't return true
 */
export function load<
  Args extends object,
  Env extends object,
  Config extends object,
>(
  initial: AppConfig<Args, Env, Config>,
  options?: Options<Args, Env, Config>,
): AppConfig<Args, Env, Config> {
  validate(initial);

  parseArgs(initial.args, Deno.args);

  const envPath = typeof options?.envPaths === "function"
    ? options.envPaths(initial.args)
    : options?.envPaths || ["./.env", "Deno.env"];

  loadEnv(initial.env, envPath);

  const configPath = typeof options?.configPaths === "function"
    ? options.configPaths(initial.args, initial.env)
    : options?.configPaths || ["./config.yaml"];

  loadConfig(initial.config, configPath);

  if (options?.validate && options.validate(initial) !== true) {
    throw "Invalid AppConfig";
  }

  return initial;
}

/**
 * Load config from variables as it would be from config files, Deno.args, and Deno.env
 *
 * @param initial appConfig that will be modified
 * @param options will ignore `options.envPaths` and `options.configPath`
 * @param rawArgs of form `["key=value", "flag"]`
 * @param rawEnv of form `["key=value"]`
 * @param rawConfig as YAML
 * @returns `initial` appConfig with assigned new values
 * @throws when:
 * - `initial` has invalid structure,
 * - any problems when parsing `Deno.args`, `Deno.env`, and config files
 * - `options.validate` doesn't return true
 */
export function loadStatic<
  Args extends object,
  Env extends object,
  Config extends object,
>(
  initial: AppConfig<Args, Env, Config>,
  options: Options<Args, Env, Config>,
  rawArgs: string[],
  rawEnv: string[],
  rawConfig: string,
): AppConfig<Args, Env, Config> {
  validate(initial);

  parseArgs(initial.args, rawArgs);
  parseEnv(initial.env, rawEnv);
  parseConfig(initial.config, rawConfig);

  if (options.validate && options.validate(initial) !== true) {
    throw "Invalid AppConfig";
  }

  return initial;
}
