/**
 * Read a value from localStorage by key with JSON parsing.
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Write a value to localStorage as JSON.
 */
export function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Export all app-related localStorage data as JSON string.
 */
export function exportLocalData(): string {
  const keys = ['jwt_token', 'user'];
  const data: Record<string, unknown> = {};
  keys.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v) data[k] = JSON.parse(v);
  });
  return JSON.stringify(data, null, 2);
}

/**
 * Import JSON data into localStorage.
 */
export function importLocalData(json: string): void {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    Object.entries(data).forEach(([k, v]) => {
      localStorage.setItem(k, JSON.stringify(v));
    });
  } catch {
    throw new Error('Invalid JSON data');
  }
}
