import { useState, useMemo } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/**
 * Get offset of DOM element
 * like there were no transforms applied on it
 */
type Offset = { top: number; left: number };
export function offset<E extends HTMLElement = HTMLElement>(
  el: E | null
): Offset {
  let _x = 0;
  let _y = 0;

  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - (el.tagName != "BODY" ? el.scrollLeft : 0);
    _y += el.offsetTop - (el.tagName != "BODY" ? el.scrollTop : 0);
    el = el.offsetParent as typeof el;
  }

  return {
    top: _y,
    left: _x,
  };
}

type UseOffsetResult<E extends HTMLElement = HTMLElement> = [
  (element: E) => void,
  Offset
];
export function useOffset<
  E extends HTMLElement = HTMLElement
>(): UseOffsetResult<E> {
  const [element, ref] = useState<E | null>(null);
  const [elementOffset, setOffset] = useState<Offset>({ top: 0, left: 0 });

  const observer = useMemo(() => {
    return new (window as any).ResizeObserver(() => {
      if (element) {
        setOffset(offset(element));
      }
    });
  }, [element]);

  useIsomorphicLayoutEffect(() => {
    if (!element) return;

    observer.observe(element);

    return () => {
      observer.disconnect(element);
    };
  }, [element]);

  return [ref, elementOffset];
}
