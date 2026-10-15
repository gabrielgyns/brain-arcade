import { readJson, writeJson } from "./storage";
import type { GameId } from "../domain/shared/types";

/**
 * Product metrics (section 9 of the vision): sessions, plays started and
 * finished, shares. Events go to a pluggable sink; by default they are kept
 * locally so the funnel can be inspected before a real provider is chosen.
 */
export type AnalyticsEvent =
  | { name: "page_view"; path: string }
  | { name: "game_start"; game: GameId; daily: boolean; challenge: boolean }
  | { name: "game_complete"; game: GameId; daily: boolean; challenge: boolean; timeMs: number }
  | { name: "share"; game: GameId; method: "native" | "clipboard" | "whatsapp" }
  | { name: "challenge_created"; game: GameId };

export interface AnalyticsSink {
  send(event: AnalyticsEvent & { at: string; visitorId: string }): void;
}

const MAX_LOCAL_EVENTS = 300;

const localSink: AnalyticsSink = {
  send(event) {
    const events = readJson<unknown[]>("events", []);
    events.push(event);
    writeJson("events", events.slice(-MAX_LOCAL_EVENTS));
    if (import.meta.env.DEV) console.debug("[analytics]", event);
  },
};

let sinks: AnalyticsSink[] = [localSink];

export function registerSink(sink: AnalyticsSink): void {
  sinks = [...sinks, sink];
}

/** Anonymous, random, device-local id — used for retention (D1/D7/D30), never tied to identity. */
function visitorId(): string {
  let id = readJson<string | null>("visitor", null);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    writeJson("visitor", id);
  }
  return id;
}

export function track(event: AnalyticsEvent): void {
  const enriched = { ...event, at: new Date().toISOString(), visitorId: visitorId() };
  for (const sink of sinks) {
    try {
      sink.send(enriched);
    } catch {
      // Analytics must never break gameplay.
    }
  }
}
