import { track } from "./analytics";
import type { GameId } from "../domain/shared/types";

export async function shareText(game: GameId, text: string, url: string): Promise<"native" | "clipboard" | "failed"> {
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
      track({ name: "share", game, method: "native" });
      return "native";
    } catch {
      // User cancelled or unsupported — fall back to clipboard.
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    track({ name: "share", game, method: "clipboard" });
    return "clipboard";
  } catch {
    return "failed";
  }
}

export function whatsappUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}
