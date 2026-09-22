export interface ProgressStore {
  masteryPoints: number;
  activeDays: number;
  completedTopics: number;
  totalTopics: number;
}

const KEY = 'isl_progress_v1';

export function getProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { masteryPoints: 0, activeDays: 0, completedTopics: 0, totalTopics: 0 };
    return JSON.parse(raw) as ProgressStore;
  } catch (e) {
    console.error('Error reading progress from localStorage', e);
    return { masteryPoints: 0, activeDays: 0, completedTopics: 0, totalTopics: 0 };
  }
}

export function saveProgress(p: Partial<ProgressStore>) {
  const existing = getProgress();
  const merged = { ...existing, ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Error saving progress to localStorage', e);
  }
}

export function resetProgress() {
  const initial = { masteryPoints: 0, activeDays: 0, completedTopics: 0, totalTopics: 0 };
  localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}
