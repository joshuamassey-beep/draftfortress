"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/TeamRoom";
import { getPlayer, positionColor } from "@/lib/players";
import { availablePlayers } from "@/lib/roster";
import { waiverSuggestions } from "@/lib/waivers";
import { POSITIONS, type Position } from "@/lib/types";
import { useDraft } from "@/lib/store";

export function WaiverRoom() {
  const { state, takenIds, userRosterIds, claimWaiver, hydrated } = useDraft();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | Position>("ALL");
  const [dropId, setDropId] = useState<string>("");

  const settings = state.settings;
  const available = useMemo(() => availablePlayers(takenIds), [takenIds]);
  const suggestions = useMemo(
    () =>
      settings
        ? waiverSuggestions({
            rosterIds: userRosterIds,
            takenIds,
            rounds: settings.rounds,
            week: state.week,
            limit: 5,
          })
        : [],
    [settings, userRosterIds, takenIds, state.week],
  );

  const listed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return available.filter((player) => {
      if (filter !== "ALL" && player.position !== filter) return false;
      if (!q) return true;
      return player.name.toLowerCase().includes(q) || player.team.toLowerCase().includes(q);
    });
  }, [available, filter, query]);

  if (!hydrated) return <p className="text-fortress-muted">Scanning the wire…</p>;
  if (!settings || state.status === "idle") {
    return (
      <EmptyState
        title="Waiver wire sealed"
        body="Run a draft first. Undrafted players become the wire."
        href="/draft"
        cta="Enter draft room"
      />
    );
  }

  const rosterFull = userRosterIds.length >= settings.rounds;
  const dropOptions = userRosterIds
    .map((id) => getPlayer(id))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  function addPlayer(playerId: string) {
    if (rosterFull && !dropId) return;
    claimWaiver(playerId, rosterFull ? dropId : null);
    setDropId("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-gold">Wire</p>
        <h1 className="font-display text-4xl uppercase tracking-wide">Waivers</h1>
        <p className="mt-2 max-w-2xl text-fortress-steel">
          Available players and pickup suggestions. Claim talent, drop dead weight, keep the
          roster watertight.
        </p>
      </div>

      <section className="border border-fortress-border bg-fortress-surface p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">Suggested claims</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((item) => {
            const player = getPlayer(item.playerId);
            if (!player) return null;
            return (
              <article key={player.id} className="border border-fortress-border bg-fortress-bg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="mt-1 text-xs text-fortress-muted">
                      <span className={`mr-2 border px-1.5 py-0.5 font-bold ${positionColor(player.position)}`}>
                        {player.position}
                      </span>
                      {player.team} · Rank {player.rank}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addPlayer(player.id)}
                    disabled={rosterFull && !dropId}
                    className="bg-fortress-gold px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-fortress-bg disabled:opacity-30"
                  >
                    Claim
                  </button>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-fortress-steel">
                  {item.reasons.map((reason) => (
                    <li key={reason}>— {reason}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {rosterFull ? (
        <label className="block border border-fortress-border bg-fortress-surface px-4 py-3 text-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-fortress-muted">
            Drop to claim (roster full)
          </span>
          <select
            value={dropId}
            onChange={(event) => setDropId(event.target.value)}
            className="mt-2 w-full border border-fortress-border bg-fortress-bg px-3 py-2 text-fortress-ink"
          >
            <option value="">Select a player to drop</option>
            {dropOptions.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.position})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <section className="border border-fortress-border bg-fortress-surface">
        <div className="border-b border-fortress-border px-4 py-3">
          <h2 className="font-display text-xl uppercase tracking-wide">Available players</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the wire"
            className="mt-3 w-full border border-fortress-border bg-fortress-bg px-3 py-2 text-sm"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(["ALL", ...POSITIONS] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                  filter === item
                    ? "bg-fortress-gold text-fortress-bg"
                    : "border border-fortress-border text-fortress-steel"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <ul className="max-h-[640px] overflow-auto">
          {listed.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-3 border-b border-fortress-border/70 px-4 py-2.5"
            >
              <span className="w-8 font-mono text-xs text-fortress-muted">{player.rank}</span>
              <span className={`w-10 border px-1.5 py-0.5 text-center text-[10px] font-bold ${positionColor(player.position)}`}>
                {player.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{player.name}</p>
                <p className="text-xs text-fortress-muted">
                  {player.team} · ADP {player.adp} · {player.projectedPoints.toFixed(1)} proj
                </p>
              </div>
              <button
                type="button"
                onClick={() => addPlayer(player.id)}
                disabled={rosterFull && !dropId}
                className="border border-fortress-gold/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-fortress-gold disabled:opacity-30"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
