"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DraftBoard } from "@/components/DraftBoard";
import { PlayerPool } from "@/components/PlayerPool";
import { Recommender } from "@/components/Recommender";
import { MiniRoster } from "@/components/RosterGrid";
import {
  formatPickLabel,
  isUserOnTheClock,
  teamIndexOnTheClock,
  totalPicks,
} from "@/lib/draft";
import { availablePlayers } from "@/lib/roster";
import { recommendPicks } from "@/lib/recommend";
import { useDraft } from "@/lib/store";

export function DraftRoom() {
  const { state, takenIds, userRosterIds, pickPlayer, undoPick, resetDraft, setSimFast } = useDraft();
  const settings = state.settings;
  const overall = state.picks.length + 1;
  const round = settings
    ? Math.min(settings.rounds, Math.ceil(overall / settings.teamCount) || 1)
    : 1;
  const suggestions = useMemo(
    () =>
      settings && state.status === "live"
        ? recommendPicks({
            takenIds,
            rosterIds: userRosterIds,
            overall,
            round,
            rounds: settings.rounds,
            limit: 3,
          })
        : [],
    [settings, state.status, takenIds, userRosterIds, overall, round],
  );

  if (!settings) return null;

  const onClockIndex = teamIndexOnTheClock(state.picks.length, settings);
  const userTurn = isUserOnTheClock(state.picks.length, settings) && state.status === "live";
  const available = availablePlayers(takenIds);

  const clockName =
    onClockIndex === null ? "—" : settings.teamNames[onClockIndex] ?? `Team ${onClockIndex + 1}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-fortress-border bg-fortress-surface px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-gold">
            {state.status === "complete" ? "Draft complete" : "On the clock"}
          </p>
          <h1 className="font-display text-3xl uppercase tracking-wide">
            {state.status === "complete" ? "The board is locked" : clockName}
          </h1>
          <p className="mt-1 font-mono text-sm text-fortress-steel">
            {state.status === "live"
              ? `${formatPickLabel(overall, settings.teamCount)} · Round ${round} · ${state.picks.length}/${totalPicks(settings)}`
              : `${settings.teamCount} teams · ${settings.rounds} rounds`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.status === "live" ? (
            <>
              <button
                type="button"
                onClick={() => setSimFast(true)}
                className="border border-fortress-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-fortress-steel hover:text-fortress-ink"
              >
                Sim to my pick
              </button>
              <button
                type="button"
                disabled={!userTurn || !suggestions[0]}
                onClick={() => suggestions[0] && pickPlayer(suggestions[0].playerId)}
                className="bg-fortress-gold px-3 py-2 text-xs font-bold uppercase tracking-wider text-fortress-bg disabled:opacity-30"
              >
                Pick for me
              </button>
            </>
          ) : (
            <Link
              href="/team"
              className="bg-fortress-gold px-3 py-2 text-xs font-bold uppercase tracking-wider text-fortress-bg"
            >
              Inspect roster
            </Link>
          )}
          <button
            type="button"
            onClick={undoPick}
            disabled={state.picks.length === 0}
            className="border border-fortress-border px-3 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-30"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={resetDraft}
            className="border border-fortress-danger/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-fortress-danger"
          >
            Reset
          </button>
        </div>
      </div>

      {state.status === "complete" ? (
        <p className="border border-fortress-gold/30 bg-fortress-gold/10 px-4 py-3 text-sm text-fortress-ink">
          Mock complete. Review start/sit in My Team and raid the waiver wire for remaining talent.
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <PlayerPool
          players={available}
          disabled={!userTurn}
          onPick={pickPlayer}
          highlightIds={suggestions.map((item) => item.playerId)}
        />
        <div className="space-y-5">
          {state.status === "live" ? (
            <Recommender suggestions={suggestions} onPick={pickPlayer} disabled={!userTurn} />
          ) : null}
          <MiniRoster playerIds={userRosterIds} rounds={settings.rounds} />
        </div>
      </div>

      <DraftBoard settings={settings} picks={state.picks} />
    </div>
  );
}
