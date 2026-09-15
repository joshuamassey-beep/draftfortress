"use client";

import { pickLocation } from "@/lib/draft";
import { getPlayer, positionColor } from "@/lib/players";
import type { DraftPick, DraftSettings } from "@/lib/types";

export function DraftBoard({
  settings,
  picks,
}: {
  settings: DraftSettings;
  picks: DraftPick[];
}) {
  const byOverall = new Map(picks.map((pick) => [pick.overall, pick]));
  const next = picks.length + 1;

  return (
    <section className="border border-fortress-border bg-fortress-surface">
      <div className="flex items-center justify-between border-b border-fortress-border px-4 py-3">
        <h2 className="font-display text-xl uppercase tracking-wide">Draft board</h2>
        <p className="text-xs uppercase tracking-widest text-fortress-muted">Snake · full room</p>
      </div>
      <div className="overflow-auto">
        <table className="min-w-max border-collapse text-left">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-fortress-surface px-3 py-2 text-xs uppercase tracking-wider text-fortress-muted">
                Rd
              </th>
              {settings.teamNames.map((name, index) => (
                <th
                  key={name + index}
                  className={`px-2 py-2 text-xs font-semibold uppercase tracking-wide ${
                    index === settings.userSlot - 1 ? "text-fortress-gold" : "text-fortress-steel"
                  }`}
                >
                  <span className="block max-w-[6.5rem] truncate sm:max-w-[7.5rem]">{name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: settings.rounds }, (_, roundIdx) => {
              const round = roundIdx + 1;
              return (
                <tr key={round} className="border-t border-fortress-border/80">
                  <td className="sticky left-0 bg-fortress-surface px-3 py-2 font-mono text-xs text-fortress-muted">
                    {round}
                  </td>
                  {settings.teamNames.map((_, teamIndex) => {
                    const overall =
                      round % 2 === 1
                        ? (round - 1) * settings.teamCount + teamIndex + 1
                        : round * settings.teamCount - teamIndex;
                    const pick = byOverall.get(overall);
                    const player = pick ? getPlayer(pick.playerId) : undefined;
                    const onClock = overall === next;
                    const userCell = teamIndex === settings.userSlot - 1;
                    return (
                      <td
                        key={`${round}-${teamIndex}`}
                        className={`px-2 py-1.5 ${
                          settings.teamCount >= 16 ? "min-w-[6.25rem]" : "min-w-[8.5rem]"
                        } ${
                          onClock ? "bg-fortress-gold/15 ring-1 ring-inset ring-fortress-gold" : ""
                        } ${userCell && !onClock ? "bg-white/[0.02]" : ""}`}
                      >
                        {player ? (
                          <div>
                            <p className="truncate text-sm font-semibold leading-tight">{player.name}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-fortress-muted">
                              <span className={`border px-1 font-bold ${positionColor(player.position)}`}>
                                {player.position}
                              </span>
                              {player.team}
                            </p>
                          </div>
                        ) : (
                          <p className="font-mono text-[11px] text-fortress-muted/70">
                            {onClock ? "ON CLOCK" : pickLocation(overall, settings.teamCount).pickInRound}
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
