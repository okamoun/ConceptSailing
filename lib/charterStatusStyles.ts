import type { CharterStatus } from './availability';

/**
 * Canonical Tailwind badge classes for every {@link CharterStatus}.
 *
 * This is the single source of truth for status badge colours across the admin
 * screens (Dashboard, Availability calendar, Booking Summary, Reconcile). Before
 * this module each of those screens kept its own hand-maintained copy and they
 * had drifted — Availability used `-400/30` shades where the others used
 * `-500/30`, and `signed` was `-800/30` in some copies and `-800/40` in others.
 * The values below match the dominant Dashboard/Reconcile palette.
 */
export const STATUS_BADGE: Record<CharterStatus, string> = {
  web_request:     'bg-sky-500/30 text-sky-200',
  broker_request:  'bg-amber-500/30 text-amber-200',
  serious_request: 'bg-orange-500/30 text-orange-200',
  proposal_sent:   'bg-violet-500/30 text-violet-200',
  confirmed:       'bg-emerald-500/30 text-emerald-200',
  signed:          'bg-emerald-800/40 text-emerald-100',
  canceled:        'bg-gray-500/30 text-gray-300',
  owner_use:       'bg-purple-500/30 text-purple-200',
  maintenance:     'bg-red-500/30 text-red-200',
};

/** Fallback badge classes for an unknown / non-charter status string. */
export const STATUS_BADGE_FALLBACK = 'bg-white/20 text-white';
