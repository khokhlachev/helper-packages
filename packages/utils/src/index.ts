export const empty = (value: any) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return !!value;
};

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
