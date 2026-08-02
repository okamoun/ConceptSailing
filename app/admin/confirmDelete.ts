/**
 * Shared delete-confirmation helper for the admin screens.
 *
 * Standardises the destructive-action confirmation copy so every screen that
 * offers a delete (Dashboard, Availability calendar, Booking Detail, …) asks
 * the same question in the same words. Previously each site inlined its own
 * `confirm()` string ("Delete this charter entry?", "Delete this entry?",
 * "Delete this booking? This cannot be undone.") and they had drifted.
 *
 * @param itemLabel singular, lower-case noun for the thing being deleted,
 *   e.g. `"booking"`, `"contact submission"`, `"review"`.
 * @returns `true` if the user confirmed, `false` otherwise.
 */
export function confirmDelete(itemLabel: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.confirm(`Delete this ${itemLabel}? This cannot be undone.`);
}
