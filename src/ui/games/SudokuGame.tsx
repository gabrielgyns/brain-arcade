import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CELLS, boxOf, colOf, findConflicts, generateSudoku, isSolved, peersOf, pickHint, rowOf } from "../../domain/sudoku/sudoku";
import { formatDuration } from "../../domain/shared/day";
import type { GameProps } from "../../app/session";
import { useSavedGame } from "../../app/useSavedGame";
import { useStopwatch } from "../../app/useStopwatch";
import { useApp } from "../../app/store";

interface SudokuState {
  values: number[];
  /** Candidate notes per cell as a 9-bit mask (bit d-1 = digit d). */
  notes: number[];
  mistakes: number;
  hints: number;
  hinted: number[];
  history: { values: number[]; notes: number[] }[];
  done: boolean;
}

export function SudokuGame({ spec, onFinish }: GameProps) {
  const { settings } = useApp();
  const puzzle = useMemo(() => generateSudoku(spec.difficulty, spec.seed), [spec.difficulty, spec.seed]);
  const { state, setState, initialElapsed, clear, bindClock } = useSavedGame<SudokuState>(spec, () => ({
    values: [...puzzle.givens],
    notes: new Array(CELLS).fill(0),
    mistakes: 0,
    hints: 0,
    hinted: [],
    history: [],
    done: false,
  }));
  const clock = useStopwatch(initialElapsed, !state.done);
  bindClock(clock.read);
  const [selected, setSelected] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);

  const conflicts = useMemo(() => findConflicts(state.values), [state.values]);
  const isGiven = (i: number) => puzzle.givens[i] !== 0;

  const update = useCallback(
    (fn: (s: SudokuState) => SudokuState) => {
      setState((s) => {
        if (s.done) return s;
        const next = fn(s);
        return isSolved(next.values, puzzle.solution) ? { ...next, done: true } : next;
      });
    },
    [setState, puzzle.solution],
  );

  const reported = useRef(false);
  useEffect(() => {
    if (!state.done || reported.current) return;
    reported.current = true;
    clear();
    onFinish({ solved: true, timeMs: clock.read(), mistakes: state.mistakes, hintsUsed: state.hints });
  }, [state, clear, onFinish, clock]);

  const snapshot = (s: SudokuState) => [...s.history, { values: s.values, notes: s.notes }].slice(-100);

  const input = useCallback(
    (digit: number) => {
      if (selected === null || isGiven(selected)) return;
      update((s) => {
        const values = [...s.values];
        const notes = [...s.notes];
        if (noteMode && digit !== 0) {
          if (values[selected] !== 0) return s;
          notes[selected] = notes[selected]! ^ (1 << (digit - 1));
          return { ...s, notes, history: snapshot(s) };
        }
        if (values[selected] === digit) return s;
        values[selected] = digit;
        notes[selected] = 0;
        let mistakes = s.mistakes;
        if (digit !== 0) {
          if (digit !== puzzle.solution[selected]) mistakes++;
          // Placing a digit clears it from the notes of every peer.
          for (const p of peersOf(selected)) notes[p] = notes[p]! & ~(1 << (digit - 1));
        }
        return { ...s, values, notes, mistakes, history: snapshot(s) };
      });
    },
    [selected, noteMode, update, puzzle],
  );

  const undo = () =>
    update((s) => {
      const prev = s.history.at(-1);
      return prev ? { ...s, ...prev, history: s.history.slice(0, -1) } : s;
    });

  const hint = () =>
    update((s) => {
      const cell = pickHint(s.values, puzzle.solution, spec.seed + s.hints);
      if (cell === null) return s;
      const values = [...s.values];
      values[cell] = puzzle.solution[cell]!;
      return { ...s, values, hints: s.hints + 1, hinted: [...s.hinted, cell], history: snapshot(s) };
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (/^[1-9]$/.test(e.key)) input(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") input(0);
      else if (e.key.toLowerCase() === "n") setNoteMode((m) => !m);
      else if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) undo();
      else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        setSelected((cur) => {
          const i = cur ?? 0;
          const r = rowOf(i);
          const c = colOf(i);
          if (e.key === "ArrowUp") return ((r + 8) % 9) * 9 + c;
          if (e.key === "ArrowDown") return ((r + 1) % 9) * 9 + c;
          if (e.key === "ArrowLeft") return r * 9 + ((c + 8) % 9);
          return r * 9 + ((c + 1) % 9);
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const selectedValue = selected !== null ? state.values[selected] : 0;
  const digitCounts = useMemo(() => {
    const counts = new Array(10).fill(0);
    state.values.forEach((v, i) => v && v === puzzle.solution[i] && counts[v]++);
    return counts;
  }, [state.values, puzzle.solution]);

  return (
    <div className="sudoku">
      <div className="game-status">
        {settings.showTimer && <span className="timer" aria-label="Tempo">⏱ {formatDuration(clock.elapsed)}</span>}
        <span>Erros: {state.mistakes}</span>
      </div>
      <div className="sudoku-grid" role="grid" aria-label="Tabuleiro de Sudoku">
        {state.values.map((v, i) => {
          const related =
            selected !== null && i !== selected &&
            (rowOf(i) === rowOf(selected) || colOf(i) === colOf(selected) || boxOf(i) === boxOf(selected));
          const sameDigit = v !== 0 && v === selectedValue;
          const wrong = settings.highlightErrors && v !== 0 && !isGiven(i) && (v !== puzzle.solution[i] || conflicts.has(i));
          const cls = [
            "cell",
            isGiven(i) ? "given" : "",
            state.hinted.includes(i) ? "hinted" : "",
            i === selected ? "selected" : "",
            related ? "related" : "",
            sameDigit ? "same" : "",
            wrong ? "wrong" : "",
            colOf(i) % 3 === 2 && colOf(i) !== 8 ? "box-right" : "",
            rowOf(i) % 3 === 2 && rowOf(i) !== 8 ? "box-bottom" : "",
          ].join(" ");
          return (
            <button
              key={i}
              role="gridcell"
              className={cls}
              aria-label={`Linha ${rowOf(i) + 1}, coluna ${colOf(i) + 1}${v ? `, ${v}` : ", vazia"}`}
              onClick={() => setSelected(i)}
            >
              {v !== 0 ? (
                v
              ) : state.notes[i] ? (
                <span className="notes">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                    <span key={d}>{state.notes[i]! & (1 << (d - 1)) ? d : ""}</span>
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="sudoku-tools">
        <button className="btn" onClick={undo} disabled={!state.history.length}>↶ Desfazer</button>
        <button className="btn" onClick={() => input(0)}>⌫ Apagar</button>
        <button className={`btn ${noteMode ? "active" : ""}`} aria-pressed={noteMode} onClick={() => setNoteMode((m) => !m)}>
          ✎ Notas {noteMode ? "ON" : "OFF"}
        </button>
        <button className="btn" onClick={hint} disabled={state.done}>💡 Dica</button>
      </div>
      <div className="numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} className="btn numkey" disabled={digitCounts[d] >= 9} onClick={() => input(d)}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
