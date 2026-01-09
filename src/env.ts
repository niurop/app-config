import { splitOnEquals } from "./utils.ts";

export function loadEnv<Env extends object>(initial: Env, paths: string[]) {
  for (const path of paths) {
    if (path === "") continue;
    if (path === "Deno.env") {
      parseDenoEnv(initial);
      continue;
    }

    const rawEnv = Deno.readTextFileSync(path)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    parseEnv(initial, rawEnv);
  }
}

export function parseEnv<Env extends object>(initial: Env, rawEnv: string[]) {
  const keys = Object.keys(initial);

  for (const line of rawEnv) {
    const [key, value] = splitOnEquals(line);
    if (keys.includes(key)) {
      // @ts-ignore we know that initial[key] exist
      initial[key] = value || "";
    }
  }
}

function parseDenoEnv<Env extends object>(initial: Env) {
  for (const key of Object.keys(initial)) {
    const value = Deno.env.get(key);
    // @ts-ignore we know that initial[key] exist
    if (value !== undefined) initial[key] = value;
  }
}
