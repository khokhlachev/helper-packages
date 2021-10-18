import { useEffect, useLayoutEffect } from "react";

export default function useIsomorphicLayoutEffect(
  ...args: Parameters<typeof useEffect>
) {
  return typeof window === "undefined"
    ? useEffect(...args)
    : useLayoutEffect(...args);
}
