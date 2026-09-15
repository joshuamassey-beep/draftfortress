"use client";

import { getPlayer, positionColor } from "@/lib/players";
import type { Suggestion } from "@/lib/types";

export function Recommender({
  suggestions,
  onPick,
  disabled,
}: {
  suggestions: Suggestion[];
  onPick: (playerId: string) => void;
  disabled: boolean;
}) {
  return (
    <section className="border border-fortress-border bg-fortress-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-gold">
        Need-based recon
      </p>
      <h2 className="mt-1 font-display text-xl uppercase tracking-wide">Top 3 targets</h2>
      <p className="mt-1 text-sm text-fortress-muted">
        Ranked by roster holes, scarcity, and board value.
      </p>
      <ol className="mt-4 space-y-3">
        {suggestions.map((item, index) => {
          const player = getPlayer(item.playerId);
          if (!player) return null;
          return (
            <li key={player.id} className="border border-fortress-border bg-fortress-bg p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg uppercase leading-tight">
                    {index + 1}. {player.name}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-fortress-muted">
                    <span className={`border px-1.5 py-0.5 font-bold ${positionColor(player.position)}`}>
                      {player.position}
                    </span>
                    {player.team} · Rank {player.rank} · ADP {player.adp}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(player.id)}
                  className="bg-fortress-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-fortress-bg disabled:opacity-30"
                >
                  Draft
                </button>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-fortress-steel">
                {item.reasons.map((reason) => (
                  <li key={reason}>— {reason}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      {suggestions.length === 0 ? (
        <p className="mt-4 text-sm text-fortress-muted">No remaining targets.</p>
      ) : null}
    </section>
  );
}
