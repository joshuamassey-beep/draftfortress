import { getPlayer, PLAYERS } from "@/lib/players";
import { STARTER_NEEDS, type Player, type Position } from "@/lib/types";
import { FLEX_ELIGIBLE } from "@/lib/types";

export type SlotKey =
  | "QB"
  | "RB1"
  | "RB2"
  | "WR1"
  | "WR2"
  | "TE"
  | "FLEX"
  | "K"
  | "DST"
  | `BN${number}`;

export interface FilledSlot {
  key: SlotKey;
  label: string;
  player: Player | null;
  starter: boolean;
}

export function benchCount(rounds: number): number {
  return Math.max(0, rounds - 9);
}

export function slotKeys(rounds: number): SlotKey[] {
  const keys: SlotKey[] = ["QB", "RB1", "RB2", "WR1", "WR2", "TE", "FLEX", "K", "DST"];
  const benches = benchCount(rounds);
  for (let i = 1; i <= benches; i += 1) keys.push(`BN${i}`);
  return keys;
}

export function countPositions(players: Player[]): Record<Position, number> {
  const counts: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
  for (const player of players) counts[player.position] += 1;
  return counts;
}

export function starterHoles(players: Player[]): Position[] {
  const counts = countPositions(players);
  const holes: Position[] = [];
  (Object.keys(STARTER_NEEDS) as Position[]).forEach((pos) => {
    if (counts[pos] < STARTER_NEEDS[pos]) holes.push(pos);
  });
  const flexFilled =
    Math.max(0, counts.RB - 2) + Math.max(0, counts.WR - 2) + Math.max(0, counts.TE - 1);
  if (flexFilled < 1 && FLEX_ELIGIBLE.some((pos) => holes.includes(pos) === false)) {
    const hasFlexBody = counts.RB + counts.WR + counts.TE > 5;
    if (!hasFlexBody && !holes.some((h) => FLEX_ELIGIBLE.includes(h))) {
      holes.push("WR");
    }
  }
  return holes;
}

function canStartIn(slot: SlotKey, player: Player): boolean {
  if (slot === "QB" || slot === "K" || slot === "DST" || slot === "TE") {
    return player.position === slot;
  }
  if (slot === "RB1" || slot === "RB2") return player.position === "RB";
  if (slot === "WR1" || slot === "WR2") return player.position === "WR";
  if (slot === "FLEX") return FLEX_ELIGIBLE.includes(player.position);
  return true;
}

export function assignRoster(playerIds: string[], rounds: number): FilledSlot[] {
  const players = playerIds
    .map((id) => getPlayer(id))
    .filter((player): player is Player => Boolean(player));
  const remaining = [...players];
  const keys = slotKeys(rounds);
  const filled: FilledSlot[] = [];

  for (const key of keys) {
    const starter = !key.startsWith("BN");
    if (key.startsWith("BN")) {
      const player = remaining.shift() ?? null;
      filled.push({ key, label: key.replace("BN", "BN "), player, starter: false });
      continue;
    }
    const idx = remaining.findIndex((player) => canStartIn(key, player));
    const player = idx >= 0 ? remaining.splice(idx, 1)[0] : null;
    const label = key === "FLEX" ? "FLEX" : key;
    filled.push({ key, label, player, starter });
  }

  return filled;
}

export function emptySlotCount(playerIds: string[], rounds: number): number {
  return Math.max(0, rounds - playerIds.length);
}

export function availablePlayers(takenIds: Set<string>): Player[] {
  return PLAYERS.filter((player) => !takenIds.has(player.id));
}
