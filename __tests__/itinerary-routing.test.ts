import {
  legNm,
  straightLegNm,
  reconcileRoutedNm,
  coordSignature,
  applyRoutedNm,
  routedSignature,
} from '@/app/client-space/[token]/itinerary/itinerary-utils';
import type { ClientItineraryStop } from '@/lib/clientSpace';

const stop = (over: Partial<ClientItineraryStop>): ClientItineraryStop => ({
  id: 'x',
  order: 0,
  title: '',
  description: '',
  features: [],
  ...over,
});

// Alimos (Athens) and Hydra — a real leg with a land-separated straight line.
const alimos = stop({ id: 'a', lat: 37.908, lng: 23.717 });
const hydra = stop({ id: 'b', lat: 37.349, lng: 23.467 });

describe('legNm', () => {
  it('returns the straight-line great-circle distance when no routed value is cached', () => {
    const straight = straightLegNm(alimos, hydra)!;
    expect(legNm(alimos, hydra)).toBeCloseTo(straight, 5);
    // sanity: Alimos→Hydra is roughly 35 nm as the crow flies
    expect(straight).toBeGreaterThan(30);
    expect(straight).toBeLessThan(40);
  });

  it('prefers the routed distance cached on the arriving stop', () => {
    const hydraRouted = { ...hydra, routedNm: 41.8 };
    expect(legNm(alimos, hydraRouted)).toBe(41.8);
  });

  it('ignores an invalid routed value and falls back to straight-line', () => {
    const straight = straightLegNm(alimos, hydra)!;
    expect(legNm(alimos, { ...hydra, routedNm: Number.NaN })).toBeCloseTo(straight, 5);
    expect(legNm(alimos, { ...hydra, routedNm: -5 })).toBeCloseTo(straight, 5);
  });

  it('returns null when either stop is missing coordinates', () => {
    expect(legNm(alimos, stop({ id: 'c' }))).toBeNull();
    expect(legNm(undefined, hydra)).toBeNull();
  });
});

describe('reconcileRoutedNm', () => {
  it('keeps a genuine detour that is longer than the straight line', () => {
    expect(reconcileRoutedNm(41.8, 35.6)).toBe(41.8);
  });

  it('clamps a snap-artefact result that is shorter than the straight line', () => {
    // Coarse-network snapping can return less than the rhumb line — never valid.
    expect(reconcileRoutedNm(13.5, 20.2)).toBe(20.2);
  });
});

describe('coordSignature', () => {
  it('changes when a coordinate changes but not on unrelated edits', () => {
    const base = [alimos, hydra];
    const sig = coordSignature(base);
    expect(coordSignature([alimos, { ...hydra, title: 'Renamed' }])).toBe(sig);
    expect(coordSignature([alimos, { ...hydra, lat: 37.4 }])).not.toBe(sig);
  });

  it('changes when the visiting order changes', () => {
    expect(coordSignature([alimos, hydra])).not.toBe(coordSignature([hydra, alimos]));
  });
});

describe('applyRoutedNm', () => {
  const leg = [{ lat: 37.9, lng: 23.7 }, { lat: 37.6, lng: 23.5 }, { lat: 37.3, lng: 23.4 }];

  it('sets routedNm and routedPath from the maps on matching stops', () => {
    const [, b] = applyRoutedNm([alimos, hydra], { b: 41.8 }, { b: leg });
    expect(b.routedNm).toBe(41.8);
    expect(b.routedPath).toBe(leg);
  });

  it('drops stale routed data (never leaves undefined) when a stop is absent from the maps', () => {
    const stale = { ...hydra, routedNm: 99, routedPath: leg };
    const [, b] = applyRoutedNm([alimos, stale], {}, {});
    expect('routedNm' in b).toBe(false);
    expect('routedPath' in b).toBe(false);
  });

  it('ignores a degenerate path of fewer than two points', () => {
    const [, b] = applyRoutedNm([alimos, hydra], { b: 41.8 }, { b: [{ lat: 37.9, lng: 23.7 }] });
    expect(b.routedNm).toBe(41.8);
    expect('routedPath' in b).toBe(false);
  });

  it('leaves the routed fields unset when there is no routing data', () => {
    const [a, b] = applyRoutedNm([alimos, hydra], {});
    expect('routedNm' in a).toBe(false);
    expect('routedPath' in b).toBe(false);
  });
});

describe('routedSignature', () => {
  it('reflects a change in cached routed distances', () => {
    const before = routedSignature([alimos, hydra]);
    const after = routedSignature([alimos, { ...hydra, routedNm: 41.8 }]);
    expect(after).not.toBe(before);
  });

  it('reflects a change in the cached routed polyline', () => {
    const before = routedSignature([alimos, { ...hydra, routedNm: 41.8 }]);
    const after = routedSignature([alimos, { ...hydra, routedNm: 41.8, routedPath: [{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }] }]);
    expect(after).not.toBe(before);
  });
});
