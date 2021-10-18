export function empty<T>(value: T | null | undefined): value is never {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return !!value;
}

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export const equalKeys = <A = any>(
  objectA: A,
  objectB: A,
  keys: (keyof A)[]
) => {
  if (!objectA || !objectB) {
    return false;
  }

  for (const prop of keys) {
    if (objectA[prop] !== objectB[prop]) {
      return false;
    }
  }

  return true;
};

/**
 * Разделяет строку на слова
 *
 * @param text Текст или массив букв
 * @returns Массив слов
 */
export function splitText(text: string | string[]): string[][] {
  if (typeof text === "string" || Array.isArray(text)) {
    const textArray = typeof text === "string" ? text.trim().split("") : text;

    return textArray.reduce<string[][]>(
      (acc, curr) => {
        if ([" ", "\n", "\r\n"].includes(curr)) {
          /**
           * пробел или перенос считаем
           * отдельным словом
           */
          acc.push([curr === "\r\n" ? "\n" : curr]);
          acc.push([]);
          return acc;
        }

        acc[acc.length - 1].push(curr);

        return acc;
      },
      [[]]
    );
  }

  return [];
}

export function leftPad(string: string, length: number, chars: string) {
  while (string.length < length) {
    string = `${chars}${string}`;
  }

  return string;
}

export function formatISOString(string: string, mask = "dd.MM") {
  return string.replace(
    /^(\d{2,4})-(\d{2})-(\d{2})T?(\d{2})?:?(\d{2})?.*/,
    function (_, yyyy, MM, dd, hh = "00", mm = "00") {
      const parts: Record<string, string> = { yyyy, dd, MM, hh, mm }
      const separator = mask.replace(/\w/g, "")[0]
      return mask
        .split(separator)
        .map((part) => parts[part])
        .join(separator)
    }
  )
}

export function range(start: number): number[];
export function range(start: number, end: number): number[];
export function range(...args: number[]): number[] {
  const [start, end] = args.length === 1 ? [0, args[0]] : args;
  const len = Math.abs(start - end);
  const direction = end > start ? 1 : -1;

  if (len < 1) {
    return [];
  }

  return new Array(len).fill(0).map((_, i) => start + i * direction);
}

export { createError, createLogger } from "./logger";
export * as math from "./math";
