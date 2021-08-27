import { createBreakpoint } from "react-use";
import { typedKeys } from "@khokhlachev/utils/types";
import { createLogger } from "@khokhlachev/utils";

const logger = createLogger("useBreakpoint");

type Screens = {
  "4xl": string;
  "3xl": string;
  "2xl": string;
  xl: string;
  lg: string;
  md: string;
  sm: string;
};
type Breakpoints = { [k in keyof Screens]: number };
type UseBreakpoint = { [k in keyof Screens]: boolean };
type TailwindConfig = {
  theme: {
    screens: Screens;
  };
};

const NOT_SET = "NOT_SET";

function screensToBreakpoints<T extends TailwindConfig>(config: T) {
  return typedKeys(config.theme.screens).reduce((acc, k) => {
    acc[k] = parseInt(config.theme.screens[k]);
    return acc;
  }, {} as Breakpoints);
}

let useBreakpoints = () => NOT_SET;

export function useBreakpoint(): UseBreakpoint {
  const breakpoint = useBreakpoints() as keyof Breakpoints | typeof NOT_SET;

  if (breakpoint === NOT_SET) {
    logger.warn("screens config is not set");
  }

  const fourXl = breakpoint === "4xl";
  const threeXl = breakpoint === "3xl" || fourXl;
  const twoXl = breakpoint === "2xl" || threeXl;
  const xl = breakpoint === "xl" || twoXl;
  const lg = breakpoint === "lg" || xl;
  const md = breakpoint === "md" || lg;
  const sm = breakpoint === "sm" || md;

  return { sm, md, lg, xl, "2xl": twoXl, "3xl": threeXl, "4xl": fourXl };
}

useBreakpoint.__setTailwindConfig = function setTailwindConfig<
  T extends TailwindConfig
>(config: T) {
  useBreakpoints = createBreakpoint(screensToBreakpoints(config));
};
