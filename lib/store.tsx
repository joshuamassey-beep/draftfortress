"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { draftComplete, makePick, rosterPlayerIds, teamIndexOnTheClock } from "@/lib/draft";
import { PLAYERS } from "@/lib/players";
import { chooseCpuPlayer } from "@/lib/recommend";
import {
  defaultTeamNames,
  type DraftPick,
  type DraftSettings,
  type WaiverMove,
} from "@/lib/types";

const STORAGE_KEY = "draftfortress:v1";

export interface AppState {
  settings: DraftSettings | null;
  picks: DraftPick[];
  status: "idle" | "live" | "complete";
  week: number;
  waivers: WaiverMove[];
  simFast: boolean;
}

const EMPTY: AppState = {
  settings: null,
  picks: [],
  status: "idle",
  week: 1,
  waivers: [],
  simFast: false,
};

interface DraftContextValue {
  state: AppState;
  takenIds: Set<string>;
  userRosterIds: string[];
  startDraft: (settings: Omit<DraftSettings, "teamNames">) => void;
  pickPlayer: (playerId: string) => void;
  undoPick: () => void;
  resetDraft: () => void;
  setWeek: (week: number) => void;
  setSimFast: (value: boolean) => void;
  claimWaiver: (addId: string, dropId: string | null) => void;
  hydrated: boolean;
}

const DraftContext = createContext<DraftContextValue | null>(null);

function takenFrom(picks: DraftPick[], waivers: WaiverMove[]): Set<string> {
  const taken = new Set(picks.map((pick) => pick.playerId));
  for (const move of waivers) {
    taken.add(move.addId);
    if (move.dropId) taken.delete(move.dropId);
  }
  return taken;
}

function userIds(picks: DraftPick[], settings: DraftSettings | null, waivers: WaiverMove[]): string[] {
  if (!settings) return [];
  let ids = rosterPlayerIds(picks, settings.userSlot - 1);
  for (const move of waivers) {
    if (move.dropId) ids = ids.filter((id) => id !== move.dropId);
    ids = [...ids, move.addId];
  }
  return ids;
}

export function DraftProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        setState({ ...EMPTY, ...parsed, simFast: false });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, simFast: false }));
  }, [state, hydrated]);

  const startDraft = useCallback((partial: Omit<DraftSettings, "teamNames">) => {
    const settings: DraftSettings = {
      ...partial,
      teamNames: defaultTeamNames(partial.teamCount, partial.userSlot, partial.userTeamName),
    };
    setState({
      settings,
      picks: [],
      status: "live",
      week: 1,
      waivers: [],
      simFast: false,
    });
  }, []);

  const pickPlayer = useCallback((playerId: string) => {
    setState((prev) => {
      if (!prev.settings || prev.status !== "live") return prev;
      if (prev.picks.some((pick) => pick.playerId === playerId)) return prev;
      if (!PLAYERS.some((player) => player.id === playerId)) return prev;
      const pick = makePick(prev.picks, prev.settings, playerId);
      const picks = [...prev.picks, pick];
      const complete = draftComplete(picks, prev.settings);
      return {
        ...prev,
        picks,
        status: complete ? "complete" : "live",
        simFast: complete ? false : prev.simFast,
      };
    });
  }, []);

  const undoPick = useCallback(() => {
    setState((prev) => {
      if (!prev.settings || prev.picks.length === 0) return prev;
      const picks = prev.picks.slice(0, -1);
      return { ...prev, picks, status: "live", waivers: [], simFast: false };
    });
  }, []);

  const resetDraft = useCallback(() => setState(EMPTY), []);
  const setWeek = useCallback((week: number) => {
    setState((prev) => ({ ...prev, week }));
  }, []);
  const setSimFast = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, simFast: value }));
  }, []);

  const claimWaiver = useCallback((addId: string, dropId: string | null) => {
    setState((prev) => {
      const taken = takenFrom(prev.picks, prev.waivers);
      if (taken.has(addId)) return prev;
      if (dropId) {
        const roster = userIds(prev.picks, prev.settings, prev.waivers);
        if (!roster.includes(dropId)) return prev;
      }
      return { ...prev, waivers: [...prev.waivers, { addId, dropId }] };
    });
  }, []);

  useEffect(() => {
    if (!hydrated || !state.settings || state.status !== "live") return;
    const teamIndex = teamIndexOnTheClock(state.picks.length, state.settings);
    if (teamIndex === null) return;
    if (teamIndex === state.settings.userSlot - 1) {
      if (state.simFast) setSimFast(false);
      return;
    }

    const delay = state.simFast ? 28 : 420;
    const timer = window.setTimeout(() => {
      const settings = state.settings;
      if (!settings) return;
      const takenIds = takenFrom(state.picks, state.waivers);
      const rosterIds = rosterPlayerIds(state.picks, teamIndex);
      const overall = state.picks.length + 1;
      const round = Math.ceil(overall / settings.teamCount);
      const id = chooseCpuPlayer({
        takenIds,
        rosterIds,
        overall,
        round,
        rounds: settings.rounds,
        entropy: 0.42,
      });
      if (id) pickPlayer(id);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [hydrated, state, pickPlayer, setSimFast]);

  const takenIds = useMemo(
    () => takenFrom(state.picks, state.waivers),
    [state.picks, state.waivers],
  );
  const userRosterIds = useMemo(
    () => userIds(state.picks, state.settings, state.waivers),
    [state.picks, state.settings, state.waivers],
  );

  const value = useMemo(
    () => ({
      state,
      takenIds,
      userRosterIds,
      startDraft,
      pickPlayer,
      undoPick,
      resetDraft,
      setWeek,
      setSimFast,
      claimWaiver,
      hydrated,
    }),
    [
      state,
      takenIds,
      userRosterIds,
      startDraft,
      pickPlayer,
      undoPick,
      resetDraft,
      setWeek,
      setSimFast,
      claimWaiver,
      hydrated,
    ],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useDraft must be used inside DraftProvider");
  return ctx;
}
