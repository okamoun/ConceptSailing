import React from 'react';
import { render, screen } from '@testing-library/react';
import AvailabilityCalendar from '../app/components/AvailabilityCalendar';
import type { Charter } from '../lib/availability';

const entries = [
  { id: 'aug-1', status: 'confirmed', startDate: '2026-08-01', endDate: '2026-08-08', name: 'Jane Skipper', createdAt: null },
  { id: 'oct-1', status: 'web_request', startDate: '2026-10-01', endDate: '2026-10-08', name: 'Other Month', createdAt: null },
] as Charter[];

test('admin month list links each booking to its detail page', () => {
  render(
    <AvailabilityCalendar entries={entries} mode="admin" month={new Date(2026, 7, 1)} onMonthChange={() => {}} />,
  );
  const link = screen.getByRole('link', { name: /Jane Skipper/ });
  expect(link).toHaveAttribute('href', '/admin/bookings/aug-1');
  expect(screen.queryByText('Other Month')).not.toBeInTheDocument();
});

test('user mode shows no booking links', () => {
  render(
    <AvailabilityCalendar entries={entries} mode="user" month={new Date(2026, 7, 1)} onMonthChange={() => {}} />,
  );
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
