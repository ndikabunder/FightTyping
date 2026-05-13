export interface LeaderboardEntry {
  id: string;
  player: string;
  levelCompleted: number;
  timeMs: number;
  score: number;
  accuracy: number;
  at: string;
}

const STORAGE_KEY = "fight-typing.leaderboard.v1";
const MAX_ENTRIES = 10;

export function readLeaderboard(): LeaderboardEntry[] {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return normalizeEntries(parsed);
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, "id" | "at">) {
  const nextEntry: LeaderboardEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: new Date().toISOString()
  };
  const entries = [...readLeaderboard(), nextEntry].sort(compareLeaderboard).slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
}

export function compareLeaderboard(a: LeaderboardEntry, b: LeaderboardEntry) {
  if (b.levelCompleted !== a.levelCompleted) {
    return b.levelCompleted - a.levelCompleted;
  }
  if (a.timeMs !== b.timeMs) {
    return a.timeMs - b.timeMs;
  }
  return b.score - a.score;
}

export function formatTime(timeMs: number) {
  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function normalizeEntries(entries: LeaderboardEntry[]) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .filter((entry) => typeof entry.player === "string" && Number.isFinite(entry.levelCompleted))
    .sort(compareLeaderboard)
    .slice(0, MAX_ENTRIES);
}
