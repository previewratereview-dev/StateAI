"use client";

import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mql.matches);

    function onChange(e: MediaQueryListEvent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobile(e.matches);
    }

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}
