"use client";

import { assignRoster } from "@/lib/roster";
import { positionColor } from "@/lib/players";
import type { FilledSlot } from "@/lib/roster";

export function RosterGrid({
  slots,
  title = "Roster",
  caption,
}: {
  slots: FilledSlot[];
  title?: string;
  caption?: string;
}) {
  return (
    <section className="border border-fortress-border bg-fortress-surface">
      <div className="border-b border-fortress-border px-4 py-3">
        <h2 className="font-display text-xl uppercase tracking-wide">{title}</h2>
        {caption ? <p className="mt-1 text-sm text-fortress-muted">{caption}</p> : null}
      </div>
      <ul>
        {slots.map((slot) => (
          <li
            key={slot.key}
            className="flex items-center gap-3 border-b border-fortress-border/70 px-4 py-2.5 last:border-b-0"
          >
            <span
              className={`w-12 shrink-0 text-xs font-bold uppercase tracking-wider ${
                slot.starter ? "text-fortress-gold" : "text-fortress-muted"
              }`}
            >
              {slot.label}
            </span>
            {slot.player ? (
              <>
                <span className={`border px-1.5 py-0.5 text-[10px] font-bold ${positionColor(slot.player.position)}`}>
                  {slot.player.position}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{slot.player.name}</p>
                  <p className="text-xs text-fortress-muted">
                    {slot.player.team} · Bye {slot.player.byeWeek} · {slot.player.projectedPoints.toFixed(1)} proj
                  </p>
                </div>
              </>
            ) : (
              <span className="text-sm text-fortress-muted">Open slot</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MiniRoster({ playerIds, rounds }: { playerIds: string[]; rounds: number }) {
  const slots = assignRoster(playerIds, rounds);
  return <RosterGrid slots={slots} title="Your garrison" caption="Filled in draft order by slot." />;
}
