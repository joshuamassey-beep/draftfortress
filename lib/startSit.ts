import { getPlayer } from "@/lib/players";
import { FLEX_ELIGIBLE, type Player } from "@/lib/types";
import { slotKeys, type FilledSlot, type SlotKey } from "@/lib/roster";

export interface StartSitAdvice {
  slots: FilledSlot[];
  sits: { player: Player; reason: string }[];
  notes: string[];
}

function eligible(slot: SlotKey, player: Player, week: number): boolean {
  if (player.byeWeek === week) return false;
  if (slot.startsWith("BN")) return true;
  if (slot === "FLEX") return FLEX_ELIGIBLE.includes(player.position);
  if (slot === "RB1" || slot === "RB2") return player.position === "RB";
  if (slot === "WR1" || slot === "WR2") return player.position === "WR";
  return player.position === slot;
}

export function startSit(playerIds: string[], rounds: number, week: number): StartSitAdvice {
  const players = playerIds
    .map((id) => getPlayer(id))
    .filter((player): player is Player => Boolean(player))
    .sort((a, b) => b.projectedPoints - a.projectedPoints || a.rank - b.rank);

  const remaining = [...players];
  const keys = slotKeys(rounds);
  const slots: FilledSlot[] = [];
  const used = new Set<string>();

  for (const key of keys) {
    if (key.startsWith("BN")) continue;
    const idx = remaining.findIndex(
      (player) => !used.has(player.id) && eligible(key, player, week),
    );
    const player = idx >= 0 ? remaining[idx] : null;
    if (player) used.add(player.id);
    slots.push({
      key,
      label: key === "FLEX" ? "FLEX" : key,
      player,
      starter: true,
    });
  }

  const sits: { player: Player; reason: string }[] = [];
  let benchIndex = 1;
  for (const player of remaining) {
    if (used.has(player.id)) continue;
    const key = `BN${benchIndex}` as SlotKey;
    benchIndex += 1;
    slots.push({ key, label: `BN ${benchIndex - 1}`, player, starter: false });
    if (player.byeWeek === week) {
      sits.push({ player, reason: `Week ${week} bye — keep him inside the walls.` });
    } else {
      sits.push({
        player,
        reason: `Behind stronger ${player.position} options this week (${player.projectedPoints.toFixed(1)} proj).`,
      });
    }
  }

  const notes: string[] = [];
  const emptyStarters = slots.filter((slot) => slot.starter && !slot.player);
  if (emptyStarters.length) {
    notes.push(
      `${emptyStarters.map((slot) => slot.label).join(", ")} still open — raid waivers before kickoff.`,
    );
  }
  const byes = players.filter((player) => player.byeWeek === week);
  if (byes.length) {
    notes.push(
      `${byes.length} player${byes.length === 1 ? "" : "s"} on bye in week ${week}.`,
    );
  }
  if (!notes.length) {
    notes.push("Lineup is fortified. Start the highest-projected eligible bodies and hold.");
  }

  return { slots, sits, notes };
}
