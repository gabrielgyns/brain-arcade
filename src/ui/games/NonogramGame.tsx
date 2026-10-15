import { useEffect, useMemo, useRef, useState } from "react";
import {
  CROSSED,
  FILLED,
  UNKNOWN,
  colMarks,
  generateNonogram,
  isNonogramSolved,
  lineMatchesClue,
  type Mark,
} from "../../domain/nonogram/nonogram";
import { formatDuration } from "../../domain/shared/day";
import type { GameProps } from "../../app/session";
import { useSavedGame } from "../../app/useSavedGame";
import { useStopwatch } from "../../app/useStopwatch";
import { useApp } from "../../app/store";

interface NonogramState {
  marks: Mark[][];
  mistakes: number;
  hints: number;
  done: boolean;
}

export function NonogramGame({ spec, onFinish }: GameProps) {
  const { settings } = useApp();
  const puzzle = useMemo(() => generateNonogram(spec.difficulty, spec.seed), [spec.difficulty, spec.seed]);
  const { state, setState, initialElapsed, clear, bindClock } = useSavedGame<NonogramState>(spec, () => ({
    marks: Array.from({ length: puzzle.size }, () => new Array<Mark>(puzzle.size).fill(UNKNOWN)),
    mistakes: 0,
    hints: 0,
    done: false,
  }));
  const clock = useStopwatch(initialElapsed, !state.done);
  bindClock(clock.read);
  const [tool, setTool] = useState<"fill" | "cross">("fill");
  /** While dragging, every touched cell is set to the same mark as the first one. */
  const paint = useRef<Mark | null>(null);

  const apply = (r: number, c: number, mark: Mark) =>
    setState((s) => {
      if (s.done || s.marks[r]![c] === mark) return s;
      const marks = s.marks.map((row) => [...row]);
      marks[r]![c] = mark;
      // Filling a cell that should be empty counts as a mistake (when error checking is on).
      const mistake = settings.highlightErrors && mark === FILLED && !puzzle.solution[r]![c];
      const next = { ...s, marks, mistakes: s.mistakes + (mistake ? 1 : 0) };
      return isNonogramSolved(marks, puzzle.solution) ? { ...next, done: true } : next;
    });

  const reported = useRef(false);
  useEffect(() => {
    if (!state.done || reported.current) return;
    reported.current = true;
    clear();
    onFinish({ solved: true, timeMs: clock.read(), mistakes: state.mistakes, hintsUsed: state.hints });
  }, [state, clear, onFinish, clock]);

  useEffect(() => {
    const stop = () => (paint.current = null);
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, []);

  const onDown = (e: React.PointerEvent, r: number, c: number) => {
    e.preventDefault();
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const useCross = tool === "cross" || e.button === 2;
    const target: Mark = useCross ? CROSSED : FILLED;
    const mark = state.marks[r]![c] === target ? UNKNOWN : target;
    paint.current = mark;
    apply(r, c, mark);
  };

  const onEnter = (r: number, c: number) => {
    if (paint.current !== null) apply(r, c, paint.current);
  };

  const hint = () =>
    setState((s) => {
      const wrong: [number, number][] = [];
      puzzle.solution.forEach((row, r) =>
        row.forEach((filled, c) => {
          if ((s.marks[r]![c] === FILLED) !== filled) wrong.push([r, c]);
        }),
      );
      const pick = wrong[(spec.seed + s.hints) % wrong.length];
      if (!pick) return s;
      const marks = s.marks.map((row) => [...row]);
      marks[pick[0]]![pick[1]] = puzzle.solution[pick[0]]![pick[1]] ? FILLED : CROSSED;
      const next = { ...s, marks, hints: s.hints + 1 };
      return isNonogramSolved(marks, puzzle.solution) ? { ...next, done: true } : next;
    });

  const reset = () =>
    setState((s) => (s.done ? s : { ...s, marks: s.marks.map((row) => row.map(() => UNKNOWN)) }));

  const maxRowClue = Math.max(...puzzle.rowClues.map((c) => Math.max(c.length, 1)));
  const maxColClue = Math.max(...puzzle.colClues.map((c) => Math.max(c.length, 1)));

  return (
    <div className="nonogram">
      <div className="game-status">
        {settings.showTimer && <span className="timer">⏱ {formatDuration(clock.elapsed)}</span>}
        <span>{puzzle.size}×{puzzle.size}</span>
        {settings.highlightErrors && <span>Erros: {state.mistakes}</span>}
      </div>
      <div
        className={`nono-board size-${puzzle.size}`}
        style={{
          gridTemplateColumns: `minmax(${maxRowClue * 1.1}em, auto) repeat(${puzzle.size}, var(--nono-cell))`,
          gridTemplateRows: `minmax(${maxColClue * 1.25}em, auto) repeat(${puzzle.size}, var(--nono-cell))`,
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div />
        {puzzle.colClues.map((clue, c) => (
          <div key={`c${c}`} className={`clue col-clue ${lineMatchesClue(colMarks(state.marks, c), clue) ? "ok" : ""}`}>
            {(clue.length ? clue : [0]).map((n, i) => <span key={i}>{n}</span>)}
          </div>
        ))}
        {puzzle.rowClues.map((clue, r) => [
          <div key={`r${r}`} className={`clue row-clue ${lineMatchesClue(state.marks[r]!, clue) ? "ok" : ""}`}>
            {(clue.length ? clue : [0]).map((n, i) => <span key={i}>{n}</span>)}
          </div>,
          ...state.marks[r]!.map((m, c) => (
            <button
              key={`${r},${c}`}
              className={[
                "nono-cell",
                m === FILLED ? "filled" : m === CROSSED ? "crossed" : "",
                settings.highlightErrors && m === FILLED && !puzzle.solution[r]![c] ? "wrong" : "",
                c % 5 === 4 && c !== puzzle.size - 1 ? "sep-right" : "",
                r % 5 === 4 && r !== puzzle.size - 1 ? "sep-bottom" : "",
              ].join(" ")}
              aria-label={`Linha ${r + 1}, coluna ${c + 1}`}
              onPointerDown={(e) => onDown(e, r, c)}
              onPointerEnter={() => onEnter(r, c)}
            />
          )),
        ])}
      </div>
      <div className="sudoku-tools">
        <div className="segmented" role="radiogroup" aria-label="Ferramenta">
          <button role="radio" aria-checked={tool === "fill"} className={tool === "fill" ? "active" : ""} onClick={() => setTool("fill")}>
            ■ Pintar
          </button>
          <button role="radio" aria-checked={tool === "cross"} className={tool === "cross" ? "active" : ""} onClick={() => setTool("cross")}>
            ✕ Marcar vazio
          </button>
        </div>
        <button className="btn" onClick={hint} disabled={state.done}>💡 Dica</button>
        <button className="btn" onClick={reset} disabled={state.done}>Recomeçar</button>
      </div>
      {state.done && puzzle.title && <p className="reveal">Imagem revelada: <strong>{puzzle.title}</strong></p>}
    </div>
  );
}
