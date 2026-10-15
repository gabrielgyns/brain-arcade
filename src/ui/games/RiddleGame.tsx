import { useEffect, useMemo, useRef, useState } from "react";
import { riddleForSeed } from "../../domain/riddle/pick";
import { checkRiddleAnswer } from "../../domain/riddle/riddles";
import { generateSequence } from "../../domain/riddle/sequence";
import { formatDuration } from "../../domain/shared/day";
import type { GameProps } from "../../app/session";
import { useSavedGame } from "../../app/useSavedGame";
import { useStopwatch } from "../../app/useStopwatch";
import { useApp } from "../../app/store";

interface AnswerState {
  attempts: string[];
  hintShown: boolean;
  status: "playing" | "solved" | "gave-up";
}

interface AnswerPuzzle {
  prompt: React.ReactNode;
  check(answer: string): boolean;
  hint: string;
  solution: string;
  explanation: string;
  inputMode: "text" | "numeric";
}

/** Shared flow for "read, think, type an answer" puzzles. */
function AnswerGame({ spec, onFinish, puzzle }: GameProps & { puzzle: AnswerPuzzle }) {
  const { settings } = useApp();
  const { state, setState, initialElapsed, clear, bindClock } = useSavedGame<AnswerState>(spec, () => ({
    attempts: [],
    hintShown: false,
    status: "playing",
  }));
  const clock = useStopwatch(initialElapsed, state.status === "playing");
  bindClock(clock.read);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    const ok = puzzle.check(answer);
    setWrong(!ok);
    setState((s) => ({ ...s, attempts: [...s.attempts, answer], status: ok ? "solved" : s.status }));
    if (ok) setAnswer("");
  };

  const reported = useRef(false);
  useEffect(() => {
    if (state.status === "playing" || reported.current) return;
    reported.current = true;
    clear();
    const solved = state.status === "solved";
    onFinish({
      solved,
      timeMs: clock.read(),
      mistakes: state.attempts.length - (solved ? 1 : 0),
      hintsUsed: state.hintShown ? 1 : 0,
    });
  }, [state, clear, onFinish, clock]);

  return (
    <div className="riddle">
      <div className="game-status">
        {settings.showTimer && <span className="timer">⏱ {formatDuration(clock.elapsed)}</span>}
        <span>Tentativas: {state.attempts.length}</span>
      </div>
      <div className="riddle-card">{puzzle.prompt}</div>
      {state.status === "playing" ? (
        <>
          <form className="answer-form" onSubmit={submit}>
            <input
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setWrong(false);
              }}
              inputMode={puzzle.inputMode}
              placeholder="A sua resposta"
              aria-label="Resposta"
              aria-invalid={wrong}
              autoFocus
            />
            <button className="btn primary" type="submit">Responder</button>
          </form>
          {wrong && <p className="error-text">Ainda não… tente outra vez.</p>}
          <div className="sudoku-tools">
            <button className="btn" onClick={() => setState((s) => ({ ...s, hintShown: true }))} disabled={state.hintShown}>
              💡 Pista
            </button>
            <button className="btn" onClick={() => setState((s) => ({ ...s, status: "gave-up" }))}>Ver resposta</button>
          </div>
          {state.hintShown && <p className="hint">💡 {puzzle.hint}</p>}
        </>
      ) : (
        <div className="explanation">
          <p>
            <strong>Resposta:</strong> {puzzle.solution}
          </p>
          <p>{puzzle.explanation}</p>
        </div>
      )}
    </div>
  );
}

export function RiddleGame(props: GameProps) {
  const riddle = useMemo(() => riddleForSeed(props.spec.seed), [props.spec.seed]);
  return (
    <AnswerGame
      {...props}
      puzzle={{
        prompt: (
          <>
            <span className="tag">{riddle.category}</span>
            <p className="riddle-question">{riddle.question}</p>
          </>
        ),
        check: (a) => checkRiddleAnswer(riddle, a),
        hint: riddle.hint,
        solution: riddle.answers[0]!,
        explanation: riddle.explanation,
        inputMode: "text",
      }}
    />
  );
}

export function SequenceGame(props: GameProps) {
  const seq = useMemo(() => generateSequence(props.spec.difficulty, props.spec.seed), [props.spec.difficulty, props.spec.seed]);
  return (
    <AnswerGame
      {...props}
      puzzle={{
        prompt: (
          <>
            <p>Qual é o próximo número?</p>
            <p className="sequence">
              {seq.terms.join(", ")}, <span className="blank">?</span>
            </p>
          </>
        ),
        check: (a) => Number(a.replace(",", ".").trim()) === seq.answer,
        hint: `O próximo número fica entre ${seq.answer - (seq.answer % 10)} e ${seq.answer - (seq.answer % 10) + 9}.`,
        solution: String(seq.answer),
        explanation: seq.rule,
        inputMode: "numeric",
      }}
    />
  );
}
