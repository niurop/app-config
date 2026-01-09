import { getTypeOf, splitOnEquals } from "./utils.ts";

export function parseArgs<Args extends object>(args: Args, input: string[]) {
  const unrecognised: string[] = [];
  const shouldBeFlag: string[] = [];
  const shouldBeArg: string[] = [];

  const keys = Object.keys(args);

  for (let arg of input) {
    arg = arg.trim();
    if (arg === "") continue;

    const [key, value] = splitOnEquals(arg);

    if (!keys.includes(key)) {
      unrecognised.push(arg);
      continue;
    }

    // @ts-ignore args[key]
    if (getTypeOf(args[key]) === "string") {
      if (value === undefined) {
        shouldBeArg.push(arg);
        continue;
      }
      // @ts-ignore we know that args[key] exist
      args[key] = value;
    } else {
      if (value !== undefined) {
        shouldBeFlag.push(arg);
        continue;
      }
      // @ts-ignore we know that args[key] exist
      args[key] = true;
    }
  }

  for (const arg of unrecognised) {
    console.warn(`Unrecognised argument: ${arg}`);
  }

  if (shouldBeArg.length > 0 || shouldBeFlag.length > 0) {
    console.warn("Invalid arguments passed to application:");
    for (const arg of shouldBeArg) {
      console.warn(`Argument without value: ${arg}`);
    }
    for (const arg of shouldBeFlag) console.warn(`Flag with value: ${arg}`);
    throw "Invalid Arguments";
  }
}
