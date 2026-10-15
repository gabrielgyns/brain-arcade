import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Elapsed play time that pauses when the tab is hidden — a fair clock for
 * comparing results with friends.
 */
export function useStopwatch(initialMs = 0, running = true) {
  const [elapsed, setElapsed] = useState(initialMs);
  const base = useRef(initialMs);
  const startedAt = useRef<number | null>(null);
  const [visible, setVisible] = useState(() => document.visibilityState !== "hidden");

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const active = running && visible;

  useEffect(() => {
    if (!active) return;
    startedAt.current = performance.now();
    const id = window.setInterval(() => {
      setElapsed(base.current + performance.now() - startedAt.current!);
    }, 250);
    return () => {
      window.clearInterval(id);
      base.current += performance.now() - startedAt.current!;
      startedAt.current = null;
      setElapsed(base.current);
    };
  }, [active]);

  const read = useCallback(
    () => base.current + (startedAt.current === null ? 0 : performance.now() - startedAt.current),
    [],
  );

  const reset = useCallback((ms = 0) => {
    base.current = ms;
    if (startedAt.current !== null) startedAt.current = performance.now();
    setElapsed(ms);
  }, []);

  return { elapsed, read, reset };
}
