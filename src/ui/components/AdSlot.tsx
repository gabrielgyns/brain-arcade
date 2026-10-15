/**
 * Placeholder for discreet ad placements (selection pages, between games,
 * articles). Never rendered inside a board. Disabled until an ad network is
 * configured via VITE_ADS_ENABLED.
 */
export function AdSlot({ placement }: { placement: "list" | "article" | "between-games" }) {
  if (import.meta.env.VITE_ADS_ENABLED !== "true") return null;
  return (
    <aside className="ad-slot" data-placement={placement} aria-label="Publicidade">
      Publicidade
    </aside>
  );
}
