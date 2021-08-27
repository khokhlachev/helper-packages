import { Dispatch, MutableRefObject, useState, useEffect, useRef } from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

export function useBodyScrollLock(): [
  MutableRefObject<HTMLDivElement>,
  Dispatch<boolean>
] {
  const [lock, setLock] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const current = ref.current;

    if (lock) {
      disableBodyScroll(current!, { reserveScrollBarGap: true });
    } else {
      enableBodyScroll(current!);
    }

    return function cleanup() {
      return enableBodyScroll(current!);
    };
  }, [lock]);

  return [ref, setLock];
}
