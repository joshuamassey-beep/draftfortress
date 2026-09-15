import playersJson from "@/data/players.json";
import type { Player, Position } from "@/lib/types";

export const PLAYERS: Player[] = playersJson as Player[];

export const PLAYERS_BY_ID: Record<string, Player> = Object.fromEntries(
  PLAYERS.map((player) => [player.id, player]),
);

export function getPlayer(id: string): Player | undefined {
  return PLAYERS_BY_ID[id];
}

export function playersByIds(ids: string[]): Player[] {
  return ids.map((id) => PLAYERS_BY_ID[id]).filter(Boolean);
}

export function positionColor(position: Position): string {
  switch (position) {
    case "QB":
      return "text-sky-300 bg-sky-400/10 border-sky-400/30";
    case "RB":
      return "text-emerald-300 bg-emerald-400/10 border-emerald-400/30";
    case "WR":
      return "text-amber-200 bg-amber-400/10 border-amber-400/30";
    case "TE":
      return "text-orange-300 bg-orange-400/10 border-orange-400/30";
    case "K":
      return "text-slate-300 bg-slate-400/10 border-slate-400/30";
    case "DST":
      return "text-rose-300 bg-rose-400/10 border-rose-400/30";
  }
}
