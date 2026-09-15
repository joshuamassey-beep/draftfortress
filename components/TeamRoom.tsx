"use client";

import Link from "next/link";
import { startSit } from "@/lib/startSit";
import { RosterGrid } from "@/components/RosterGrid";
import { assignRoster } from "@/lib/roster";
import { useDraft } from "@/lib/store";

export function TeamRoom() {
  const { state, userRosterIds, setWeek, hydrated } = useDraft();
  const settings = state.settings;

  if (!hydrated) {
    return <p className="text-fortress-muted">Loading garrison…</p>;
  }

  if (!settings || state.status === "idle") {
    return (
      <EmptyState
        title="No roster yet"
        body="Commission a snake draft first. Your team will assemble pick by pick."
        href="/draft"
        cta="Enter draft room"
      />
    );
  }

  const drafted = assignRoster(userRosterIds, settings.rounds);
  const advice = startSit(userRosterIds, settings.rounds, state.week);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-gold">
            {settings.userTeamName}
          </p>
          <h1 className="font-display text-4xl uppercase tracking-wide">My Team</h1>
          <p className="mt-2 max-w-2xl text-fortress-steel">
            Roster by slot, then a start/sit call for the week. Heuristic: projected points, bye
            weeks, and starter eligibility — no guessing from the cheap seats.
          </p>
        </div>
        <label className="text-xs font-semibold uppercase tracking-widest text-fortress-muted">
          Week
          <select
            value={state.week}
            onChange={(event) => setWeek(Number(event.target.value))}
            className="mt-2 block border border-fortress-border bg-fortress-bg px-3 py-2 font-mono text-sm text-fortress-ink"
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RosterGrid slots={drafted} title="Roster by slot" caption="How the garrison was built." />
        <div className="space-y-5">
          <RosterGrid
            slots={advice.slots.filter((slot) => slot.starter)}
            title="Start this week"
            caption={`Optimal eligible lineup for week ${state.week}.`}
          />
          <section className="border border-fortress-border bg-fortress-surface p-4">
            <h2 className="font-display text-xl uppercase tracking-wide">Sit / reserve</h2>
            <ul className="mt-3 space-y-2">
              {advice.sits.length === 0 ? (
                <li className="text-sm text-fortress-muted">No reserves — every body is working.</li>
              ) : (
                advice.sits.map((item) => (
                  <li key={item.player.id} className="text-sm">
                    <span className="font-semibold text-fortress-ink">{item.player.name}</span>
                    <span className="text-fortress-muted"> · {item.reason}</span>
                  </li>
                ))
              )}
            </ul>
            <ul className="mt-4 space-y-1 border-t border-fortress-border pt-3 text-sm text-fortress-steel">
              {advice.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mx-auto max-w-lg border border-fortress-border bg-fortress-surface p-8 text-center">
      <h1 className="font-display text-3xl uppercase tracking-wide">{title}</h1>
      <p className="mt-3 text-fortress-steel">{body}</p>
      <Link
        href={href}
        className="mt-6 inline-block bg-fortress-gold px-5 py-2.5 font-display uppercase tracking-[0.16em] text-fortress-bg"
      >
        {cta}
      </Link>
    </div>
  );
}
