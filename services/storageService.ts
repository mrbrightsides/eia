import { JournalEntry } from '../types';

const isQuotaError = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: number };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014
  );
};

const trimUserJournal = (maxEntries: number = 8): boolean => {
  try {
    const raw = localStorage.getItem('userJournal');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return false;

    // Prioritize keeping lightweight entries or newest items, drop heavy video/photo blobs first
    let trimmed: JournalEntry[] = parsed.slice(0, maxEntries);
    if (trimmed.length === parsed.length && parsed.length > 1) {
      trimmed = parsed.slice(0, Math.max(1, Math.floor(parsed.length / 2)));
    }
    localStorage.setItem('userJournal', JSON.stringify(trimmed));
    return true;
  } catch {
    try {
      localStorage.removeItem('userJournal');
      return true;
    } catch {
      return false;
    }
  }
};

export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (isQuotaError(err)) {
      console.warn(`localStorage quota exceeded while saving "${key}". Reclaiming space...`);
      // If saving userJournal itself, progressively trim oldest entries until it fits
      if (key === 'userJournal') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            for (let limit = Math.min(parsed.length - 1, 10); limit >= 1; limit--) {
              try {
                localStorage.setItem('userJournal', JSON.stringify(parsed.slice(0, limit)));
                return true;
              } catch {
                // continue trimming
              }
            }
          }
        } catch {
          // ignore parse failure
        }
        return false;
      }

      // For any other key (quiz answers, points, mastery), free space from userJournal and retry
      if (trimUserJournal(5)) {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          // Still full — remove userJournal completely so core learning state can save
          try {
            localStorage.removeItem('userJournal');
            localStorage.setItem(key, value);
            return true;
          } catch {
            return false;
          }
        }
      }
    }
    console.warn(`Failed to persist "${key}" in localStorage:`, err);
    return false;
  }
};

export const safeSaveJournal = (entries: JournalEntry[]): JournalEntry[] => {
  // Keep at most 12 latest entries so base64 media never exhausts the 5MB localStorage budget
  const capped = entries.slice(0, 12);
  if (safeSetItem('userJournal', JSON.stringify(capped))) {
    return capped;
  }
  // If even 1 entry is too big (e.g. large video/photo), keep in memory only without crashing
  return entries.slice(0, 5);
};
