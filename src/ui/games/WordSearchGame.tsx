import { useEffect, useMemo, useRef, useState } from "react";
import { cellsBetween, cellsOf, generateWordSearch, matchSelection, type Cell } from "../../domain/wordsearch/wordsearch";
import { formatDuration } from "../../domain/shared/day";
import type { GameProps } from "../../app/session";
import { useSavedGame } from "../../app/useSavedGame";
import { useStopwatch } from "../../app/useStopwatch";
import { useApp } from "../../app/store";

interface WordSearchState {
  found: string[];
  misses: number;
  done: boolean;
}

const HUES = [262, 200, 150, 30, 340, 100, 180, 290, 10, 50, 230, 120, 310, 70, 0];

export function WordSearchGame({ spec, onFinish }: GameProps) {
  const { settings } = useApp();
  const puzzle = useMemo(() => generateWordSearch(spec.difficulty, spec.seed, spec.locale), [spec.difficulty, spec.seed, spec.locale]);
  const { state, setState, initialElapsed, clear, bindClock } = useSavedGame<WordSearchState>(spec, () => ({
    found: [],
    misses: 0,
    done: false,
  }));
  const clock = useStopwatch(initialElapsed, !state.done);
  bindClock(clock.read);

  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const dragging = useRef(false);

  const foundColor = useMemo(() => {
    const map = new Map<string, number>();
    puzzle.words.forEach((w, idx) => {
      if (state.found.includes(w.letters)) for (const c of cellsOf(w)) map.set(`${c.r},${c.c}`, HUES[idx % HUES.length]!);
    });
    return map;
  }, [puzzle, state.found]);

  const preview = useMemo(() => {
    if (!anchor) return new Set<string>();
    const cells = cellsBetween(anchor, hover ?? anchor) ?? [anchor];
    return new Set(cells.map((c) => `${c.r},${c.c}`));
  }, [anchor, hover]);

  const commit = (a: Cell, b: Cell) => {
    const word = matchSelection(puzzle, a, b);
    setState((s) => {
      if (s.done) return s;
      if (!word) return a.r === b.r && a.c === b.c ? s : { ...s, misses: s.misses + 1 };
      if (s.found.includes(word.letters)) return s;
      const found = [...s.found, word.letters];
      return { ...s, found, done: found.length === puzzle.words.length };
    });
  };

  const reported = useRef(false);
  useEffect(() => {
    if (!state.done || reported.current) return;
    reported.current = true;
    clear();
    onFinish({ solved: true, timeMs: clock.read(), mistakes: state.misses, hintsUsed: 0 });
  }, [state, clear, onFinish, clock]);

  const cellFromPoint = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const r = el?.dataset.r;
    const c = el?.dataset.c;
    return r !== undefined && c !== undefined ? { r: Number(r), c: Number(c) } : null;
  };

  const onDown = (e: React.PointerEvent, cell: Cell) => {
    if (state.done) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (anchor && !dragging.current) {
      // Second tap of a tap-tap selection.
      commit(anchor, cell);
      setAnchor(null);
      setHover(null);
      return;
    }
    dragging.current = true;
    setAnchor(cell);
    setHover(cell);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (cell) setHover(cell);
  };

  const onUp = () => {
    if (!dragging.current || !anchor) return;
    dragging.current = false;
    const end = hover ?? anchor;
    if (end.r === anchor.r && end.c === anchor.c) return; // keep anchor for tap-tap
    commit(anchor, end);
    setAnchor(null);
    setHover(null);
  };

  return (
    <div className="wordsearch">
      <div className="game-status">
        {settings.showTimer && <span className="timer">⏱ {formatDuration(clock.elapsed)}</span>}
        <span>Tema: <strong>{puzzle.theme.title}</strong></span>
        <span>{state.found.length}/{puzzle.words.length}</span>
      </div>
      <div
        className="ws-grid"
        style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        role="grid"
        aria-label="Grelha de caça-palavras"
      >
        {puzzle.grid.map((row, r) =>
          row.map((ch, c) => {
            const key = `${r},${c}`;
            const hue = foundColor.get(key);
            return (
              <div
                key={key}
                data-r={r}
                data-c={c}
                role="gridcell"
                className={`ws-cell ${preview.has(key) ? "selecting" : ""} ${hue !== undefined ? "found" : ""}`}
                style={hue !== undefined ? ({ "--hue": hue } as React.CSSProperties) : undefined}
                onPointerDown={(e) => onDown(e, { r, c })}
              >
                {ch}
              </div>
            );
          }),
        )}
      </div>
      <ul className="ws-words">
        {puzzle.words.map((w) => (
          <li key={w.letters} className={state.found.includes(w.letters) ? "found" : ""}>
            {w.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
