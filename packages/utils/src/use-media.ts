import { useState, useEffect, createElement, FC, Fragment } from "react";

/**
 * Утилита для адаптивного выбора параметров
 * на основе matchMedia
 * Внимание: Выбирается первый совпавший media query
 *
 * Например, параметров слайдера
 * useMedia(["(min-width: 1280px)", "(min-width: 768px)"], [1.3, 2], 1.1)
 *
 * Для разрешений выше 768 вернется 1.3, выше 1280 - 2, а иначе 1.1
 *
 * @param queries массив css media query
 * @param values массив значений, из которых будет сделан выбор. Внимание: Выбирается первый совпавший media query
 * @param defaultValue дефолтное значение
 */
export function useMedia<T>(
  queries: Array<string>,
  values: Array<T>,
  defaultValue: T
): T {
  const [value, set] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler = () => {
      const match = (): T => {
        const ind = queries.findIndex((q) => matchMedia(q).matches);
        return typeof values[ind] === "undefined" ? defaultValue : values[ind];
      };

      set(match);
    };
    handler();

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return value;
}

type MediaProps = {
  query: string;
};
export const MediaElement: FC<MediaProps> = ({ query, children }) => {
  const canRender = useMedia<boolean>([query], [true], false);

  return canRender ? createElement(Fragment, { children }) : null;
};
