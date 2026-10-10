// Per-browser progress only (localStorage). Not an account and not synced anywhere.
const KEY = 'operation-human:progress:v1'

export function loadProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}

export function saveProgress(id, patch) {
  try {
    const all = loadProgress()
    all[id] = { ...all[id], ...patch }
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch { /* storage blocked — progress just won't persist */ }
}
