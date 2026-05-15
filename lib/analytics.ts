/**
 * Minimal analytics helper. Logs events to the console in development
 * and can be extended to send to a real analytics service.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[analytics]', eventName, params ?? {});
  }
}
