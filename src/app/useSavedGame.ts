import { useCallback, useEffect, useRef, useState } from "react";
import type { PuzzleSpec } from "../domain/shared/types";
import { specKey } from "../domain/progress/progress";
import { readJson, removeKey, writeJson } from "../infra/storage";

interface Saved<T> {
  state: T;
  elapsedMs: number;
}

/**
 * Persists an in-progress puzzle so closing the tab never loses work.
 * Keyed by the puzzle spec, so a daily puzzle resumes where it was left.
 */
export function useSavedGame<T>(spec: PuzzleSpec, initial: () => T) {
  const key = `save:${specKey(spec)}`;
  const [saved] = useState(() => readJson<Saved<T> | null>(key, null));
  const [state, setState] = useState<T>(() => saved?.state ?? initial());
  const readElapsed = useRef<() => number>(() => saved?.elapsedMs ?? 0);
  const finished = useRef(false);

  const save = useCallback(() => {
    if (!finished.current) writeJson(key, { state, elapsedMs: readElapsed.current() });
  }, [key, state]);

  useEffect(save, [save]);

  useEffect(() => {
    const onHide = () => save();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
      onHide();
    };
  }, [save]);

  const clear = useCallback(() => {
    finished.current = true;
    removeKey(key);
  }, [key]);

  /** Lets the game expose its stopwatch so saves include the elapsed time. */
  const bindClock = useCallback((read: () => number) => {
    readElapsed.current = read;
  }, []);

  return { state, setState, initialElapsed: saved?.elapsedMs ?? 0, clear, bindClock };
}
