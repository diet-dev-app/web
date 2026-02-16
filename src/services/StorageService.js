// Módulo para gestión del estado persistido en localStorage.

const KEY = "nutri_webapp_v1";

function emptyState() {
  return {
    options: null,
    log: {},
    notes: {}
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetAll() {
  localStorage.removeItem(KEY);
}

export function exportJSON() {
  const blob = new Blob([localStorage.getItem(KEY) || JSON.stringify(emptyState())], { type: "application/json" });
  return URL.createObjectURL(blob);
}

export async function importJSON(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  localStorage.setItem(KEY, JSON.stringify(data));
}
