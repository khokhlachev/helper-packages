import { useRef, useCallback, MutableRefObject, useEffect } from "react";
import { equalKeys } from "./index";

export function useMeasure(
  ref: MutableRefObject<HTMLElement | null>,
  parameters: {
    onChange: (rect: DOMRect) => void;
    pickProps?: (keyof DOMRect)[];
  }
) {
  const { onChange, pickProps } = parameters;

  const rectRef = useRef<DOMRect>({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => null,
  });

  const handleScroll = useCallback(() => {
    if (ref.current) {
      const _rect = ref.current.getBoundingClientRect();

      if (pickProps) {
        const isEqual = equalKeys(rectRef.current, _rect, pickProps);

        if (!isEqual) {
          rectRef.current = _rect;
          onChange(rectRef.current);
        }
      } else {
        rectRef.current = _rect;
        onChange(rectRef.current);
      }
    }
  }, [rectRef.current]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);
}
