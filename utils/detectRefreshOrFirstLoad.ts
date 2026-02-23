/**
 * Detects whether the current page load is a refresh or first visit
 *
 * This utility helps distinguish between different types of page loads:
 * - **First visit:** No previous timestamp exists → returns `true`
 * - **Manual refresh:** User pressed F5, Cmd+R, or clicked reload → returns `true`
 * - **Internal navigation:** User clicked a link or used browser back/forward → returns `false`
 *
 * **Use Case:**
 * Used to control whether homepage animations should play:
 * - Animations play on first visit or manual refresh
 * - Animations do NOT replay when navigating away and returning
 *
 * **Detection Method:**
 * Compares timestamps stored in sessionStorage to determine if enough time
 * has passed between component mounts. Internal navigation causes fast remounts
 * (~20ms), while real page reloads take longer (>100ms).
 *
 * @param {string} key - The sessionStorage key to use for timestamp storage
 * @returns {boolean} `true` if page was refreshed or first loaded, `false` if navigated back
 *
 * @example
 * // In a component that should animate only on refresh/first load:
 * const shouldAnimate = detectRefreshOrFirstLoad('homepage-animation')
 * if (shouldAnimate && !sessionStorage.getItem('hasAnimated')) {
 *   // Play animation
 *   sessionStorage.setItem('hasAnimated', 'true')
 * }
 *
 * @example
 * // Testing different scenarios:
 * // First visit: returns true (no previous timestamp)
 * // F5/reload: returns true (>100ms since last mount)
 * // Click link away and back: returns false (<20ms between mounts)
 */
export function detectRefreshOrFirstLoad(key: string): boolean {
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
