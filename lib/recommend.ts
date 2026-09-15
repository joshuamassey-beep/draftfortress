import { availablePlayers, countPositions, starterHoles } from "@/lib/roster";
import { PLAYERS } from "@/lib/players";
import { FLEX_ELIGIBLE, type Player, type Position, type Suggestion } from "@/lib/types";

const ELITE_CUTOFF: Record<Position, number> = {
  QB: 12,
  RB: 24,
  WR: 30,
  TE: 8,
  K: 8,
  DST: 8,
};

const LATE_POS: Position[] = ["K", "DST"];

function remainingAt(available: Player[], position: Position, maxPosRank: number) {
  return available.filter((player) => player.position === position && player.posRank <= maxPosRank)
    .length;
}

function needWeight(roster: Player[], player: Player, round: number, rounds: number): number {
  const counts = countPositions(roster);
  const holes = starterHoles(roster);
  const roundsLeft = rounds - round + 1;
  const missingSpecialists = (counts.K === 0 ? 1 : 0) + (counts.DST === 0 ? 1 : 0);
  const specialistWindow = missingSpecialists > 0 && roundsLeft <= Math.max(2, missingSpecialists);

  if (specialistWindow) {
    if (LATE_POS.includes(player.position) && counts[player.position] === 0) return 520;
    if (!LATE_POS.includes(player.position)) {
      return roundsLeft <= missingSpecialists ? -240 : -90;
    }
  }

  if (LATE_POS.includes(player.position)) {
    if (roundsLeft > 2) return -90;
    if (counts[player.position] === 0) return 70;
    return -40;
  }

  const veryLate = roundsLeft <= 1;

  if (holes.includes(player.position)) return 78;
  if (FLEX_ELIGIBLE.includes(player.position)) {
    const rbExtra = Math.max(0, counts.RB - 2);
    const wrExtra = Math.max(0, counts.WR - 2);
    const teExtra = Math.max(0, counts.TE - 1);
    if (rbExtra + wrExtra + teExtra < 1) return 52;
    const depth = counts[player.position];
    if ((player.position === "RB" || player.position === "WR") && depth < 4) return 24;
    if (player.position === "TE" && depth < 2) return 16;
  }
  if (player.position === "QB" && counts.QB === 1 && round >= Math.ceil(rounds * 0.7)) return 18;
  if (player.position === "QB" && counts.QB >= 2) return -35;
  if (veryLate) return 8;
  return 4;
}

function scarcityBonus(available: Player[], player: Player, roster: Player[]): number {
  if (LATE_POS.includes(player.position)) return 0;
  const eliteLeft = remainingAt(available, player.position, ELITE_CUTOFF[player.position]);
  const holes = starterHoles(roster);
  if (eliteLeft <= 2 && holes.includes(player.position)) return 36;
  if (eliteLeft <= 3 && FLEX_ELIGIBLE.includes(player.position)) return 18;
  if (eliteLeft <= 1) return 22;
  return 0;
}

function reasonsFor(
  player: Player,
  roster: Player[],
  available: Player[],
  overall: number,
  round: number,
  rounds: number,
): string[] {
  const reasons: string[] = [];
  const counts = countPositions(roster);
  const holes = starterHoles(roster);
  const eliteLeft = remainingAt(available, player.position, ELITE_CUTOFF[player.position]);
  const falling = overall - player.adp;

  if (holes.includes(player.position)) {
    const slot =
      player.position === "RB"
        ? counts.RB === 0
          ? "RB1"
          : "RB2"
        : player.position === "WR"
          ? counts.WR === 0
            ? "WR1"
            : "WR2"
          : player.position;
    reasons.push(`Locks down your empty ${slot} slot.`);
  } else if (FLEX_ELIGIBLE.includes(player.position) && counts.RB + counts.WR + counts.TE < 6) {
    reasons.push("Best flex-eligible piece to keep the lineup airtight.");
  }

  if (falling >= 8) {
    reasons.push(`Value fortification — ADP ${player.adp} still on the board at pick ${overall}.`);
  } else if (player.rank <= overall + 2) {
    reasons.push("Best remaining talent; do not let him leave the keep.");
  }

  if (eliteLeft <= 3 && !LATE_POS.includes(player.position)) {
    reasons.push(
      `Positional scarcity: only ${eliteLeft} ${player.position}${eliteLeft === 1 ? "" : "s"} left in the useful tier.`,
    );
  }

  if (LATE_POS.includes(player.position) && round >= rounds - 1 && counts[player.position] === 0) {
    reasons.push(`Last call to fill ${player.position} before the board closes.`);
  }

  if ((player.position === "RB" || player.position === "WR") && counts[player.position] >= 2) {
    reasons.push(`Builds ${player.position} depth so a bye or injury cannot breach the wall.`);
  }

  if (reasons.length === 0) {
    reasons.push(`Rank ${player.rank} overall — the strongest available brick for this pick.`);
  }

  return reasons.slice(0, 2);
}

export function scorePlayer(options: {
  player: Player;
  roster: Player[];
  available: Player[];
  overall: number;
  round: number;
  rounds: number;
}): number {
  const { player, roster, available, overall, round, rounds } = options;
  const value = (320 - player.rank) * 1.15;
  const adpValue = Math.max(-12, overall - player.adp) * 2.4;
  const need = needWeight(roster, player, round, rounds);
  const scarcity = scarcityBonus(available, player, roster);
  const reachPenalty = player.adp - overall > 18 ? -28 : 0;
  return value + adpValue + need + scarcity + reachPenalty;
}

export function recommendPicks(options: {
  takenIds: Set<string>;
  rosterIds: string[];
  overall: number;
  round: number;
  rounds: number;
  limit?: number;
}): Suggestion[] {
  const { takenIds, rosterIds, overall, round, rounds, limit = 3 } = options;
  const available = availablePlayers(takenIds);
  const roster = rosterIds
    .map((id) => PLAYERS.find((player) => player.id === id))
    .filter((player): player is Player => Boolean(player));

  const ranked = available
    .map((player) => ({
      playerId: player.id,
      score: scorePlayer({ player, roster, available, overall, round, rounds }),
      reasons: reasonsFor(player, roster, available, overall, round, rounds),
    }))
    .sort((a, b) => b.score - a.score || a.playerId.localeCompare(b.playerId));

  return ranked.slice(0, limit);
}

export function chooseCpuPlayer(options: {
  takenIds: Set<string>;
  rosterIds: string[];
  overall: number;
  round: number;
  rounds: number;
  entropy?: number;
}): string | null {
  const pool = recommendPicks({ ...options, limit: 6 });
  if (pool.length === 0) return null;
  const entropy = options.entropy ?? 0.35;
  const weights = pool.map((item, index) => Math.max(0.08, (1 - entropy) * (6 - index) + entropy));
  const total = weights.reduce((sum, n) => sum + n, 0);
  let cursor = (options.overall * 17 + options.round * 13) % total;
  for (let i = 0; i < pool.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return pool[i].playerId;
  }
  return pool[0].playerId;
}
