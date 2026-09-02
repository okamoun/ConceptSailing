import { marinas } from './marinas-data';

// A searchable place in Greece — a marina, island, port or well-known anchorage —
// with coordinates, used by the itinerary builder's location search.
export interface GreekLocation {
  name: string;
  lat: number;
  lng: number;
  region?: string;
}

// Popular Greek sailing destinations (islands, ports, bays). Complements the
// marina list so searching also finds anchorages and islands, not just marinas.
const CURATED: GreekLocation[] = [
  // Saronic & Argolic
  { name: 'Aegina', lat: 37.745, lng: 23.427, region: 'Saronic' },
  { name: 'Agkistri', lat: 37.703, lng: 23.343, region: 'Saronic' },
  { name: 'Poros', lat: 37.500, lng: 23.458, region: 'Saronic' },
  { name: 'Hydra', lat: 37.349, lng: 23.467, region: 'Saronic' },
  { name: 'Spetses', lat: 37.263, lng: 23.158, region: 'Saronic' },
  { name: 'Ermioni', lat: 37.386, lng: 23.249, region: 'Argolic' },
  { name: 'Porto Cheli', lat: 37.320, lng: 23.150, region: 'Argolic' },
  { name: 'Epidaurus', lat: 37.630, lng: 23.159, region: 'Argolic' },
  { name: 'Nafplio', lat: 37.567, lng: 22.797, region: 'Argolic' },
  { name: 'Cape Sounion', lat: 37.650, lng: 24.025, region: 'Attica' },
  // Cyclades
  { name: 'Kea (Tzia)', lat: 37.658, lng: 24.339, region: 'Cyclades' },
  { name: 'Kythnos', lat: 37.393, lng: 24.425, region: 'Cyclades' },
  { name: 'Serifos', lat: 37.148, lng: 24.505, region: 'Cyclades' },
  { name: 'Sifnos', lat: 36.977, lng: 24.713, region: 'Cyclades' },
  { name: 'Milos', lat: 36.746, lng: 24.427, region: 'Cyclades' },
  { name: 'Kimolos', lat: 36.802, lng: 24.579, region: 'Cyclades' },
  { name: 'Paros', lat: 37.085, lng: 25.150, region: 'Cyclades' },
  { name: 'Antiparos', lat: 37.037, lng: 25.083, region: 'Cyclades' },
  { name: 'Naxos', lat: 37.107, lng: 25.376, region: 'Cyclades' },
  { name: 'Ios', lat: 36.727, lng: 25.283, region: 'Cyclades' },
  { name: 'Santorini', lat: 36.393, lng: 25.461, region: 'Cyclades' },
  { name: 'Folegandros', lat: 36.626, lng: 24.911, region: 'Cyclades' },
  { name: 'Amorgos', lat: 36.831, lng: 25.898, region: 'Cyclades' },
  { name: 'Mykonos', lat: 37.445, lng: 25.329, region: 'Cyclades' },
  { name: 'Delos', lat: 37.393, lng: 25.271, region: 'Cyclades' },
  { name: 'Tinos', lat: 37.539, lng: 25.163, region: 'Cyclades' },
  { name: 'Andros', lat: 37.833, lng: 24.933, region: 'Cyclades' },
  { name: 'Syros', lat: 37.441, lng: 24.944, region: 'Cyclades' },
  // Ionian
  { name: 'Corfu', lat: 39.624, lng: 19.921, region: 'Ionian' },
  { name: 'Paxos', lat: 39.204, lng: 20.184, region: 'Ionian' },
  { name: 'Antipaxos', lat: 39.147, lng: 20.234, region: 'Ionian' },
  { name: 'Lefkada', lat: 38.716, lng: 20.640, region: 'Ionian' },
  { name: 'Sivota (Lefkada)', lat: 38.622, lng: 20.685, region: 'Ionian' },
  { name: 'Meganisi', lat: 38.657, lng: 20.775, region: 'Ionian' },
  { name: 'Kalamos', lat: 38.626, lng: 20.918, region: 'Ionian' },
  { name: 'Ithaca', lat: 38.365, lng: 20.718, region: 'Ionian' },
  { name: 'Kefalonia', lat: 38.250, lng: 20.520, region: 'Ionian' },
  { name: 'Fiskardo', lat: 38.457, lng: 20.575, region: 'Ionian' },
  { name: 'Zakynthos', lat: 37.788, lng: 20.899, region: 'Ionian' },
  // Dodecanese
  { name: 'Rhodes', lat: 36.434, lng: 28.217, region: 'Dodecanese' },
  { name: 'Symi', lat: 36.618, lng: 27.838, region: 'Dodecanese' },
  { name: 'Kos', lat: 36.893, lng: 27.288, region: 'Dodecanese' },
  { name: 'Kalymnos', lat: 36.951, lng: 26.983, region: 'Dodecanese' },
  { name: 'Leros', lat: 37.145, lng: 26.851, region: 'Dodecanese' },
  { name: 'Patmos', lat: 37.309, lng: 26.548, region: 'Dodecanese' },
  { name: 'Nisyros', lat: 36.586, lng: 27.169, region: 'Dodecanese' },
  { name: 'Astypalaia', lat: 36.550, lng: 26.353, region: 'Dodecanese' },
  // Sporades
  { name: 'Skiathos', lat: 39.163, lng: 23.490, region: 'Sporades' },
  { name: 'Skopelos', lat: 39.122, lng: 23.727, region: 'Sporades' },
  { name: 'Alonissos', lat: 39.146, lng: 23.865, region: 'Sporades' },
  { name: 'Skyros', lat: 38.906, lng: 24.567, region: 'Sporades' },
  // Peloponnese & Crete
  { name: 'Monemvasia', lat: 36.688, lng: 23.053, region: 'Peloponnese' },
  { name: 'Gythio', lat: 36.760, lng: 22.567, region: 'Peloponnese' },
  { name: 'Pylos (Navarino)', lat: 36.914, lng: 21.697, region: 'Peloponnese' },
  { name: 'Agios Nikolaos', lat: 35.191, lng: 25.717, region: 'Crete' },
  { name: 'Spinalonga', lat: 35.298, lng: 25.744, region: 'Crete' },
  // North & East Aegean
  { name: 'Samos', lat: 37.755, lng: 26.977, region: 'North Aegean' },
  { name: 'Ikaria', lat: 37.610, lng: 26.271, region: 'North Aegean' },
  { name: 'Chios', lat: 38.368, lng: 26.135, region: 'North Aegean' },
  { name: 'Lesvos (Mytilene)', lat: 39.106, lng: 26.554, region: 'North Aegean' },
];

// All searchable locations: marinas first (so a marina wins an exact-name tie),
// then curated islands/ports, de-duplicated by name.
const ALL_LOCATIONS: GreekLocation[] = (() => {
  const seen = new Set<string>();
  const out: GreekLocation[] = [];
  for (const m of marinas) {
    const key = m.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: m.name, lat: m.lat, lng: m.lng, region: m.region });
  }
  for (const l of CURATED) {
    const key = l.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(l);
  }
  return out;
})();

export function allGreekLocations(): GreekLocation[] {
  return ALL_LOCATIONS;
}

// Exact (case-insensitive) name lookup — used to auto-resolve coordinates when a
// user types a full known place name and leaves the field, without having to
// click a suggestion.
export function findGreekLocation(name: string): GreekLocation | undefined {
  const q = name.trim().toLowerCase();
  if (!q) return undefined;
  return ALL_LOCATIONS.find(l => l.name.toLowerCase() === q);
}

// Case-insensitive search over the location index. Names that start with the
// query rank above names that merely contain it; both are alphabetised.
export function searchGreekLocations(query: string, limit = 8): GreekLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: GreekLocation[] = [];
  const contains: GreekLocation[] = [];
  for (const loc of ALL_LOCATIONS) {
    const name = loc.name.toLowerCase();
    if (name.startsWith(q)) starts.push(loc);
    else if (name.includes(q)) contains.push(loc);
  }
  const byName = (a: GreekLocation, b: GreekLocation) => a.name.localeCompare(b.name);
  return [...starts.sort(byName), ...contains.sort(byName)].slice(0, limit);
}
