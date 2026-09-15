"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useDraft } from "@/lib/store";

export function DraftSetup() {
  const { startDraft } = useDraft();
  const [teamCount, setTeamCount] = useState(12);
  const [rounds, setRounds] = useState(15);
  const [userSlot, setUserSlot] = useState(1);
  const [userTeamName, setUserTeamName] = useState("Your Fortress");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    startDraft({ teamCount, rounds, userSlot, userTeamName });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl border border-fortress-border bg-fortress-surface p-6 shadow-fortress"
    >
      <p className="font-display text-sm uppercase tracking-[0.22em] text-fortress-gold">
        Commission the room
      </p>
      <h1 className="mt-2 font-display text-4xl uppercase tracking-wide text-fortress-ink">
        Snake draft setup
      </h1>
      <p className="mt-3 text-fortress-steel">
        Configure the board, take your seat, and keep every pick inside the walls.
      </p>

      <label className="mt-8 block text-xs font-semibold uppercase tracking-widest text-fortress-muted">
        League size
        <select
          value={teamCount}
          onChange={(event) => {
            const next = Number(event.target.value);
            setTeamCount(next);
            setUserSlot((slot) => Math.min(slot, next));
          }}
          className="mt-2 w-full border border-fortress-border bg-fortress-bg px-3 py-2 text-base text-fortress-ink"
        >
          {[8, 9, 10, 11, 12, 13, 14].map((n) => (
            <option key={n} value={n}>
              {n} teams
            </option>
          ))}
        </select>
      </label>

      <label className="mt-5 block text-xs font-semibold uppercase tracking-widest text-fortress-muted">
        Rounds
        <input
          type="range"
          min={12}
          max={16}
          value={rounds}
          onChange={(event) => setRounds(Number(event.target.value))}
          className="mt-3 w-full accent-fortress-gold"
        />
        <span className="mt-1 block font-mono text-sm text-fortress-ink">{rounds} rounds</span>
      </label>

      <label className="mt-5 block text-xs font-semibold uppercase tracking-widest text-fortress-muted">
        Your draft slot
        <select
          value={userSlot}
          onChange={(event) => setUserSlot(Number(event.target.value))}
          className="mt-2 w-full border border-fortress-border bg-fortress-bg px-3 py-2 text-base text-fortress-ink"
        >
          {Array.from({ length: teamCount }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Pick {n}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-5 block text-xs font-semibold uppercase tracking-widest text-fortress-muted">
        Team name
        <input
          value={userTeamName}
          onChange={(event) => setUserTeamName(event.target.value)}
          maxLength={24}
          className="mt-2 w-full border border-fortress-border bg-fortress-bg px-3 py-2 text-base text-fortress-ink"
        />
      </label>

      <button
        type="submit"
        className="mt-8 w-full bg-fortress-gold py-3 font-display text-lg uppercase tracking-[0.18em] text-fortress-bg hover:bg-fortress-gold-bright"
      >
        Enter the draft room
      </button>
    </form>
  );
}
