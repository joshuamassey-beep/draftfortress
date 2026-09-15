"use client";

import { useMemo, useState } from "react";
import { positionColor } from "@/lib/players";
import type { Player, Position } from "@/lib/types";
import { POSITIONS } from "@/lib/types";

const FILTERS: Array<"ALL" | Position> = ["ALL", ...POSITIONS];

export function PlayerPool({
  players,
  disabled,
  onPick,
  highlightIds,
}: {
  players: Player[];
  disabled: boolean;
  onPick: (playerId: string) => void;
  highlightIds?: string[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter((player) => {
      if (filter !== "ALL" && player.position !== filter) return false;
      if (!q) return true;
      return (
        player.name.toLowerCase().includes(q) ||
        player.team.toLowerCase().includes(q) ||
        player.position.toLowerCase() === q
      );
    });
  }, [players, query, filter]);

  return (
    <section className="flex min-h-0 flex-col border border-fortress-border bg-fortress-surface">
      <div className="border-b border-fortress-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl uppercase tracking-wide">Player pool</h2>
          <span className="font-mono text-xs text-fortress-muted">{filtered.length} listed</span>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, team, position"
          className="mt-3 w-full border border-fortress-border bg-fortress-bg px-3 py-2 text-sm text-fortress-ink placeholder:text-fortress-muted"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                filter === item
                  ? "bg-fortress-gold text-fortress-bg"
                  : "border border-fortress-border text-fortress-steel hover:text-fortress-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <ul className="max-h-[520px] overflow-auto">
        {filtered.map((player) => {
          const hot = highlightIds?.includes(player.id);
          return (
            <li
              key={player.id}
              className={`flex items-center gap-3 border-b border-fortress-border/70 px-4 py-2.5 ${
                hot ? "bg-fortress-gold/10" : ""
              }`}
            >
              <span className="w-8 shrink-0 font-mono text-xs text-fortress-muted">{player.rank}</span>
              <span
                className={`w-10 shrink-0 border px-1.5 py-0.5 text-center text-[10px] font-bold ${positionColor(player.position)}`}
              >
                {player.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-fortress-ink">{player.name}</p>
                <p className="text-xs text-fortress-muted">
                  {player.team} · ADP {player.adp} · Bye {player.byeWeek}
                </p>
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(player.id)}
                className="shrink-0 border border-fortress-gold/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-fortress-gold disabled:cursor-not-allowed disabled:opacity-30"
              >
                Draft
              </button>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-fortress-muted">No players match.</li>
        ) : null}
      </ul>
    </section>
  );
}
