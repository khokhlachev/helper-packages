import {
  FC,
  createElement,
  useState,
  useEffect,
  ReactNode,
  Fragment,
} from "react";

export function useClientOnly() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

export const ClientOnly: FC<{
  placeholder?: ReactNode;
}> = ({ children, placeholder }) => {
  const mounted = useClientOnly();

  if (!mounted) {
    return createElement(Fragment, { children: placeholder }) || null;
  }

  return createElement(Fragment, { children });
};
