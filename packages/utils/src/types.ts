export type AnyObject = Record<string, unknown>;

export function typedKeys<T extends {}>(obj: T) {
  return <(keyof T)[]>Object.keys(obj);
}

export const typedIsFunction = (value: any): value is Function =>
  typeof value === "function";
