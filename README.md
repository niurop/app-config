<div align="center">
<b>@niurop/app-config</b><br>
Application Args, .env Env, and YAML config for Your app.
</div>

<div align="center">

[![Master CI](https://github.com/niurop/app-config/actions/workflows/test.yml/badge.svg)](https://github.com/niurop/app-config/actions/workflows/test.yml)
[![JSR](https://jsr.io/badges/@niurop/app-config)](https://jsr.io/@niurop/app-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

This module provides a simple way for specifying and loading application configuration for [Deno](https://deno.com/).

- Validate `AppConfig` structure
- Read `Deno.args` updating `appConfig.args`
- Read `.env` and `Deno.env` updating `appConfig.env`
- Read `config.yaml` updating `appConfig.config`
- Validate `appConfig`

Optionally there is a simple way to chose and specify which files should be read or read `AppConfig` from static
context.

Import module with:

```typescript
import { load, loadStatic, AppConfig, Options } as mod from "@niurop/app-config@[VERSION]";
```

# Usage

### Simplest way to just load the `appConfig`:

Simply specify the `appConfig` structure with default values, and call `load` and this will:

- read `Deno.args` to update members of `args`
- read `.env` file and then `Deno.env` to update members of `env`
- read `config.yaml` to update members of `config`

```typescript
const appConfig = load({
  args: {
    profile: "local",
    debug: false,
  },
  env: {
    SECRET: "",
  },
  config: {
    auth: {
      enable: false,
      "token-expiration": 0,
    },
  },
});
```

### Specifying options

You can specify `envPaths` and `configPaths` as a list of paths or functions that will return a list of paths to read
from.

Additionally you can specify a final validation check.

```typescript
const appConfig = load(
  {
    args: {
      debug: false,
    },
    env: {
      SECRET: "",
      PROFILE: "local", // default profile
    },
    config: {
      auth: {
        enable: false,
        "token-expiration": 0,
      },
    },
  },
  {
    envPaths: [
      // first read .env
      ".env",
      // then read Deno.env
      "Deno.env",
    ],
    configPaths: (args, env) => [
      // first read config.yaml
      "./config.yaml",
      // if profile is specified read its config ("" will be skipped)
      env.PROFILE ? `./config-${env.PROFILE}.yaml` : "",
    ],
    // require appConfig.env.PROFILE to be specified
    validate: (appConfig) => appConfig.env.PROFILE !== "",
  }
);
```

### Usage with other components

If You use components that specify their config needs You can use like this:

```typescript
import {
  DefaultJWTAuthConfig,
  DefaultJWTAuthSecrets,
  JWTAuthConfigValidation,
} from "jsr:@niurop/JWTAuth";

const appConfig = load(
  {
    args: {},
    env: {
      ...DefaultJWTAuthSecrets,
    },
    config: {
      auth: DefaultJWTAuthConfig,
    },
  },
  {
    validate: (appConfig) =>
      JWTAuthConfigValidation(appConfig.config.auth, appConfig.env),
  }
);
```

### Loading static AppConfig

If You don't want to relay on files (for example in context of testing or not wanting to `--allow-rad` and
`--allow-env`), You can use `loadStatic`.

Additionally you can specify a final validation check.

```typescript
const rawArgs = ["argument=value", "flag"];

const rawEnv = ["SECRET=value"];

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
    },
    env: {
      SECRET: "",
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
    // require appConfig.env.SECRET to not be empty
    validate: (appConfig) => appConfig.env.SECRET !== "",
  },
  rawArgs,
  rawEnv,
  rawConfig
);
```

# Design decisions

### AppConfig type

To allow TypeScript type checking the implementation asks for `initial` object with default values. The resulting
`AppConfig` will be the same type (and actually the same object) as `initial` passed to `load` or `loadStatic`.

For `args` the structure is an object with fields of type

- `string` for arguments of type `key=value`
- `boolean` for flags `flag-name`

For `env` the structure is an object with fields of type

- `string` for arguments of type `key=value`

For `config` the structure is an object with fields of type

- `string`
- `number`
- `boolean`
- `object` with the same restrictions

Additionally for the context of `config`, when value in YAML is of different type, the implementation will try to cast
it to proper type (see `cast` function in `src/utils.ts/` for details).

### Reasons for restrictions

Types like `null` and `undefined` are not allowed due to them erasing runtime type information.

Types like `bigint`, `symbol`, and `function` are not allowed because they are not supported by YAML and don't make sens
in context of `args` and `env`.

`array`'s are also not allowed because they obfuscate type of its members making it difficult to typecheck properly and
also it is not obvious how to handle items from different sources.

In case You need any of those, consider using a `string` and then parsing it to extract specific data.

For example:

A list</br> `products: ["ball", "basket", "pump"]` </br> could be written as</br>
`products: "ball | basket | pump"`,</br> and then simply use</br> `products.split(' | ')`

# Testing

Use `deno task test` to run tests.

# Contributing

Please open an issue if you have some cool ideas to contribute.
