import { DIFFICULTIES, type Difficulty } from "../../domain/shared/types";
import { messages } from "../../i18n/messages";

export function DifficultyPicker({ value, onChange }: { value: Difficulty; onChange(d: Difficulty): void }) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Dificuldade">
      {DIFFICULTIES.map((d) => (
        <button
          key={d}
          role="radio"
          aria-checked={d === value}
          className={d === value ? "active" : ""}
          onClick={() => onChange(d)}
        >
          {messages.difficulty[d]}
        </button>
      ))}
    </div>
  );
}
