export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DST";

export interface Player {
  id: string;
  name: string;
  position: Position;
  team: string;
  rank: number;
  adp: number;
  byeWeek: number;
  posRank: number;
  projectedPoints: number;
}

export interface DraftPick {
  overall: number;
  round: number;
  pickInRound: number;
  teamIndex: number;
  playerId: string;
}

export interface DraftSettings {
  teamCount: number;
  rounds: number;
  userSlot: number;
  userTeamName: string;
  teamNames: string[];
}

export interface WaiverMove {
  addId: string;
  dropId: string | null;
}

export interface Suggestion {
  playerId: string;
  score: number;
  reasons: string[];
}

export const POSITIONS: Position[] = ["QB", "RB", "WR", "TE", "K", "DST"];

export const POSITION_LABEL: Record<Position, string> = {
  QB: "QB",
  RB: "RB",
  WR: "WR",
  TE: "TE",
  K: "K",
  DST: "DST",
};

export const FLEX_ELIGIBLE: Position[] = ["RB", "WR", "TE"];

export const STARTER_NEEDS: Record<Position, number> = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  K: 1,
  DST: 1,
};

export const FORTRESS_NAMES = [
  "Ironclad",
  "Rampart",
  "Keep",
  "Citadel",
  "Bastion",
  "Palisade",
  "Redoubt",
  "Watchtower",
  "Battlement",
  "Stronghold",
  "Garrison",
  "Bulwark",
  "Portcullis",
  "Barbican",
];

export function defaultTeamNames(teamCount: number, userSlot: number, userTeamName: string) {
  const names: string[] = [];
  let fortressIndex = 0;
  for (let i = 0; i < teamCount; i += 1) {
    if (i === userSlot - 1) {
      names.push(userTeamName.trim() || "Your Fortress");
    } else {
      names.push(FORTRESS_NAMES[fortressIndex % FORTRESS_NAMES.length]);
      fortressIndex += 1;
    }
  }
  return names;
}
