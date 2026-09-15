import { chooseCpuPlayer, recommendPicks } from "../lib/recommend";
import { clampRounds, pickLocation, rosterPlayerIds } from "../lib/draft";
import { PLAYERS } from "../lib/players";
import { defaultTeamNames, type DraftPick, type DraftSettings } from "../lib/types";

function run(teamCount: number, requestedRounds: number) {
  const rounds = clampRounds(requestedRounds, teamCount, PLAYERS.length);
  const settings: DraftSettings = {
    teamCount,
    rounds,
    userSlot: 1,
    userTeamName: "Your Fortress",
    teamNames: defaultTeamNames(teamCount, 1, "Your Fortress"),
  };
  const uniqueNames = new Set(settings.teamNames);
  if (uniqueNames.size !== teamCount) {
    throw new Error(`Duplicate team names at ${teamCount} teams (${uniqueNames.size} unique)`);
  }

  const picks: DraftPick[] = [];
  const taken = new Set<string>();
  const total = teamCount * rounds;

  for (let overall = 1; overall <= total; overall += 1) {
    const loc = pickLocation(overall, teamCount);
    const rosterIds = rosterPlayerIds(picks, loc.teamIndex);
    const playerId =
      loc.teamIndex === 0
        ? recommendPicks({
            takenIds: taken,
            rosterIds,
            overall,
            round: loc.round,
            rounds,
            limit: 1,
          })[0]?.playerId
        : chooseCpuPlayer({ takenIds: taken, rosterIds, overall, round: loc.round, rounds });
    if (!playerId) throw new Error(`Empty pool at pick ${overall}/${total} (${teamCount}x${rounds})`);
    if (taken.has(playerId)) throw new Error(`Duplicate player at pick ${overall}`);
    taken.add(playerId);
    picks.push({ overall, ...loc, playerId });
  }

  const snakeOk = picks.every((pick, index) => {
    const loc = pickLocation(index + 1, teamCount);
    return pick.teamIndex === loc.teamIndex && pick.round === loc.round;
  });
  if (!snakeOk) throw new Error("Snake order mismatch");

  const userPicks = picks.filter((pick) => pick.teamIndex === 0).length;
  if (userPicks !== rounds) throw new Error(`User has ${userPicks} picks, expected ${rounds}`);

  return { teamCount, rounds, total, remaining: PLAYERS.length - taken.size };
}

const sixteen = run(16, 15);
const thirtyTwo = run(32, 16);
console.log(JSON.stringify({ sixteen, thirtyTwo, pool: PLAYERS.length }, null, 2));
