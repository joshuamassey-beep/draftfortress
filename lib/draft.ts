import type { DraftPick, DraftSettings } from "@/lib/types";

export function totalPicks(settings: DraftSettings): number {
  return settings.teamCount * settings.rounds;
}

export function pickLocation(overall: number, teamCount: number) {
  const round = Math.ceil(overall / teamCount);
  const pickInRound = ((overall - 1) % teamCount) + 1;
  const teamIndex = round % 2 === 1 ? pickInRound - 1 : teamCount - pickInRound;
  return { round, pickInRound, teamIndex };
}

export function teamIndexOnTheClock(picksMade: number, settings: DraftSettings): number | null {
  const next = picksMade + 1;
  if (next > totalPicks(settings)) return null;
  return pickLocation(next, settings.teamCount).teamIndex;
}

export function isUserOnTheClock(picksMade: number, settings: DraftSettings): boolean {
  return teamIndexOnTheClock(picksMade, settings) === settings.userSlot - 1;
}

export function draftComplete(picks: DraftPick[], settings: DraftSettings): boolean {
  return picks.length >= totalPicks(settings);
}

export function rosterPlayerIds(picks: DraftPick[], teamIndex: number): string[] {
  return picks.filter((pick) => pick.teamIndex === teamIndex).map((pick) => pick.playerId);
}

export function makePick(
  picks: DraftPick[],
  settings: DraftSettings,
  playerId: string,
): DraftPick {
  const overall = picks.length + 1;
  const loc = pickLocation(overall, settings.teamCount);
  return { overall, ...loc, playerId };
}

export function formatPickLabel(overall: number, teamCount: number): string {
  const { round, pickInRound } = pickLocation(overall, teamCount);
  return `${round}.${String(pickInRound).padStart(2, "0")}`;
}
