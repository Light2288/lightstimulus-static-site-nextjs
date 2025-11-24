export function detectRefreshOrFirstLoad(key: string) {
  const prev = sessionStorage.getItem(key)
  const now = Date.now()

  // Save timestamp for next mount
  sessionStorage.setItem(key, String(now))

  // First load in this tab → animate
  if (!prev) return true

  const diff = now - Number(prev)

  // Internal navigation remounts happen within ~20ms
  // Real browser reloads are typically >100ms
  return diff > 100
}
