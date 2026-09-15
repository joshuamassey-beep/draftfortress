import { PLAYERS } from "@/lib/players";
import { countPositions } from "@/lib/roster";
import { FLEX_ELIGIBLE, type Suggestion } from "@/lib/types";

export function waiverSuggestions(options: {
  rosterIds: string[];
  takenIds: Set<string>;
  rounds: number;
  week: number;
  limit?: number;
}): Suggestion[] {
  const { rosterIds, takenIds, week, limit = 6 } = options;
  const roster = PLAYERS.filter((player) => rosterIds.includes(player.id));
  const counts = countPositions(roster);
  const available = PLAYERS.filter((player) => !takenIds.has(player.id));
  const worstStarterProj = (() => {
    const skill = roster
      .filter((player) => FLEX_ELIGIBLE.includes(player.position) || player.position === "QB")
      .sort((a, b) => a.projectedPoints - b.projectedPoints);
    return skill[0]?.projectedPoints ?? 90;
  })();

  return available
    .map((player) => {
      const reasons: string[] = [];
      let score = (220 - player.rank) * 1.05;
      if (player.byeWeek === week) score -= 18;

      if (player.position === "K" && counts.K === 0) {
        score += 220;
        reasons.push("You have no kicker. Claim one before the wire dries up.");
      } else if (player.position === "DST" && counts.DST === 0) {
        score += 220;
        reasons.push("Streaming a defense keeps the fortress from leaking points.");
      } else if (counts[player.position] === 0) {
        score += 48;
        reasons.push(`Zero ${player.position}s on the roster — this is a structural hole.`);
      } else if (
        (player.position === "RB" && counts.RB < 3) ||
        (player.position === "WR" && counts.WR < 3)
      ) {
        score += 32;
        reasons.push(`Thin at ${player.position}. This add buys you injury insurance.`);
      }

      if (player.projectedPoints > worstStarterProj + 8) {
        score += 22;
        reasons.push(
          `Upside upgrade — ${player.projectedPoints.toFixed(0)} proj vs your weakest skill piece.`,
        );
      }

      if (player.posRank <= 24 && (player.position === "RB" || player.position === "WR")) {
        score += 10;
        reasons.push("Still a weekly starter in most formats if the opportunity holds.");
      }

      if (reasons.length === 0) {
        reasons.push(`Highest remaining rank at ${player.position} (ADP ${player.adp}).`);
      }

      return { playerId: player.id, score, reasons: reasons.slice(0, 2) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
