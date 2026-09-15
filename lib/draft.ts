import type { DraftPick, DraftSettings } from "@/lib/types";

export const MIN_TEAMS = 4;
export const MAX_TEAMS = 32;
export const MIN_ROUNDS = 8;
export const MAX_ROUNDS = 16;

export function clampTeamCount(teamCount: number): number {
  return Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, Math.round(teamCount)));
}

export function maxRoundsForLeague(teamCount: number, playerCount: number): number {
  const byPool = Math.floor(playerCount / Math.max(1, teamCount));
  return Math.max(1, Math.min(MAX_ROUNDS, byPool));
}

export function minRoundsForLeague(teamCount: number, playerCount: number): number {
  return Math.min(MIN_ROUNDS, maxRoundsForLeague(teamCount, playerCount));
}

export function clampRounds(rounds: number, teamCount: number, playerCount: number): number {
  const max = maxRoundsForLeague(teamCount, playerCount);
  const min = minRoundsForLeague(teamCount, playerCount);
  return Math.min(max, Math.max(min, Math.round(rounds)));
}

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
