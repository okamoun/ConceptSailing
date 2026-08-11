export interface Marina {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

// Marinas, ports and recognised charter embarkation harbours, grouped by
// region. The array order controls the optgroup order in the region-grouped
// <select> pickers (see marinasByRegion), so regions are kept geographically
// contiguous. Coordinates are shared with app/greek-locations.ts.
export const marinas: Marina[] = [
  // Attica / Athens area
  { id: 'nea-peramos',   name: 'Nea Peramos Marina',          region: 'Attica',       lat: 38.009, lng: 23.335 },
  { id: 'piraeus',       name: 'Piraeus – Zea Marina',         region: 'Attica',       lat: 37.939, lng: 23.657 },
  { id: 'flisvos',       name: 'Flisvos Marina',               region: 'Attica',       lat: 37.928, lng: 23.696 },
  { id: 'alimos',        name: 'Alimos Marina',                 region: 'Attica',       lat: 37.908, lng: 23.717 },
  { id: 'glyfada',       name: 'Glyfada Marina',                region: 'Attica',       lat: 37.865, lng: 23.748 },
  { id: 'vouliagmeni',   name: 'Vouliagmeni Marina',            region: 'Attica',       lat: 37.809, lng: 23.782 },
  { id: 'lavrio',        name: 'Lavrio Port',                   region: 'Attica',       lat: 37.715, lng: 24.057 },
  // Saronic & Argolic
  { id: 'aegina',        name: 'Aegina',                        region: 'Saronic',      lat: 37.745, lng: 23.427 },
  { id: 'poros',         name: 'Poros',                         region: 'Saronic',      lat: 37.500, lng: 23.458 },
  { id: 'hydra',         name: 'Hydra',                         region: 'Saronic',      lat: 37.349, lng: 23.467 },
  { id: 'spetses',       name: 'Spetses',                       region: 'Saronic',      lat: 37.263, lng: 23.158 },
  { id: 'ermioni',       name: 'Ermioni',                       region: 'Saronic',      lat: 37.386, lng: 23.249 },
  { id: 'porto-cheli',   name: 'Porto Cheli',                   region: 'Saronic',      lat: 37.320, lng: 23.150 },
  // Peloponnese
  { id: 'corinth',       name: 'Corinth Marina',                region: 'Peloponnese',  lat: 37.934, lng: 22.930 },
  { id: 'patras',        name: 'Patras Marina',                 region: 'Peloponnese',  lat: 38.247, lng: 21.735 },
  { id: 'nafplio',       name: 'Nafplio Marina',                region: 'Peloponnese',  lat: 37.567, lng: 22.797 },
  { id: 'kalamata',      name: 'Kalamata Marina',               region: 'Peloponnese',  lat: 37.036, lng: 22.115 },
  { id: 'pylos',         name: 'Pylos (Navarino)',              region: 'Peloponnese',  lat: 36.914, lng: 21.697 },
  { id: 'gythio',        name: 'Gythio',                        region: 'Peloponnese',  lat: 36.760, lng: 22.567 },
  { id: 'monemvasia',    name: 'Monemvasia',                    region: 'Peloponnese',  lat: 36.688, lng: 23.053 },
  // Ionian
  { id: 'corfu-gouvia',  name: 'Corfu – Gouvia Marina',         region: 'Ionian',       lat: 39.644, lng: 19.870 },
  { id: 'corfu',         name: 'Corfu (Old Port)',              region: 'Ionian',       lat: 39.624, lng: 19.921 },
  { id: 'paxos',         name: 'Paxos (Gaios)',                 region: 'Ionian',       lat: 39.204, lng: 20.184 },
  { id: 'parga',         name: 'Parga',                         region: 'Ionian',       lat: 39.283, lng: 20.400 },
  { id: 'preveza',       name: 'Preveza Marina (Aktio)',         region: 'Ionian',       lat: 38.950, lng: 20.758 },
  { id: 'lefkada',       name: 'Lefkada Marina',                region: 'Ionian',       lat: 38.830, lng: 20.710 },
  { id: 'sivota-lefkada', name: 'Sivota (Lefkada)',             region: 'Ionian',       lat: 38.622, lng: 20.685 },
  { id: 'meganisi',      name: 'Meganisi',                      region: 'Ionian',       lat: 38.657, lng: 20.775 },
  { id: 'ithaca',        name: 'Ithaca (Vathi)',                region: 'Ionian',       lat: 38.365, lng: 20.718 },
  { id: 'fiskardo',      name: 'Fiskardo (Kefalonia)',          region: 'Ionian',       lat: 38.457, lng: 20.575 },
  { id: 'kefalonia',     name: 'Kefalonia – Argostoli',         region: 'Ionian',       lat: 38.172, lng: 20.487 },
  { id: 'zakynthos',     name: 'Zakynthos Port',                region: 'Ionian',       lat: 37.789, lng: 20.897 },
  // Sporades & Evia
  { id: 'volos',         name: 'Volos',                         region: 'Sporades',     lat: 39.362, lng: 22.945 },
  { id: 'skiathos',      name: 'Skiathos',                      region: 'Sporades',     lat: 39.163, lng: 23.490 },
  { id: 'skopelos',      name: 'Skopelos',                      region: 'Sporades',     lat: 39.122, lng: 23.727 },
  { id: 'alonissos',     name: 'Alonissos',                     region: 'Sporades',     lat: 39.146, lng: 23.865 },
  // Cyclades
  { id: 'kea',           name: 'Kea (Tzia)',                    region: 'Cyclades',     lat: 37.658, lng: 24.339 },
  { id: 'kythnos',       name: 'Kythnos',                       region: 'Cyclades',     lat: 37.393, lng: 24.425 },
  { id: 'syros',         name: 'Syros – Ermoupolis',            region: 'Cyclades',     lat: 37.441, lng: 24.944 },
  { id: 'tinos',         name: 'Tinos',                         region: 'Cyclades',     lat: 37.539, lng: 25.163 },
  { id: 'mykonos',       name: 'Mykonos Marina',                region: 'Cyclades',     lat: 37.447, lng: 25.329 },
  { id: 'paros',         name: 'Paros – Naoussa Marina',        region: 'Cyclades',     lat: 37.120, lng: 25.228 },
  { id: 'naxos',         name: 'Naxos Marina',                  region: 'Cyclades',     lat: 37.106, lng: 25.376 },
  { id: 'ios',           name: 'Ios',                           region: 'Cyclades',     lat: 36.727, lng: 25.283 },
  { id: 'milos',         name: 'Milos',                         region: 'Cyclades',     lat: 36.746, lng: 24.427 },
  { id: 'santorini',     name: 'Santorini – Vlychada Marina',   region: 'Cyclades',     lat: 36.362, lng: 25.396 },
  // Dodecanese
  { id: 'patmos',        name: 'Patmos',                        region: 'Dodecanese',   lat: 37.309, lng: 26.548 },
  { id: 'leros-lakki',   name: 'Leros – Lakki Marina',          region: 'Dodecanese',   lat: 37.128, lng: 26.846 },
  { id: 'kalymnos',      name: 'Kalymnos Port',                 region: 'Dodecanese',   lat: 36.950, lng: 26.983 },
  { id: 'kos',           name: 'Kos Marina',                    region: 'Dodecanese',   lat: 36.892, lng: 27.288 },
  { id: 'symi',          name: 'Symi',                          region: 'Dodecanese',   lat: 36.618, lng: 27.838 },
  { id: 'rhodes',        name: 'Rhodes Marina',                  region: 'Dodecanese',   lat: 36.450, lng: 28.223 },
  // North & East Aegean
  { id: 'lesvos',        name: 'Lesvos (Mytilene)',             region: 'North Aegean', lat: 39.106, lng: 26.554 },
  { id: 'chios',         name: 'Chios',                         region: 'North Aegean', lat: 38.368, lng: 26.135 },
  { id: 'samos',         name: 'Samos – Pythagorio Marina',     region: 'North Aegean', lat: 37.690, lng: 26.945 },
  // Crete
  { id: 'chania',        name: 'Chania Marina',                  region: 'Crete',        lat: 35.514, lng: 24.018 },
  { id: 'rethymno',      name: 'Rethymno Marina',               region: 'Crete',        lat: 35.371, lng: 24.475 },
  { id: 'heraklion',     name: 'Heraklion Marina',              region: 'Crete',        lat: 35.339, lng: 25.144 },
  { id: 'agios-nikolaos', name: 'Agios Nikolaos',               region: 'Crete',        lat: 35.191, lng: 25.717 },
];

export const DEFAULT_MARINA_ID = 'nea-peramos';

export function getMarinaById(id: string): Marina | undefined {
  return marinas.find(m => m.id === id);
}

// Group marinas by region for grouped <select>
export function marinasByRegion(): Record<string, Marina[]> {
  return marinas.reduce<Record<string, Marina[]>>((acc, m) => {
    if (!acc[m.region]) acc[m.region] = [];
    acc[m.region].push(m);
    return acc;
  }, {});
}

// Haversine great-circle distance in nautical miles
function haversineNm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return haversineNm(lat1, lng1, lat2, lng2) * 1.852;
}

const NEA_PERAMOS = marinas.find(m => m.id === 'nea-peramos')!;

export function distanceFromNeaPeramos(marina: Marina): number {
  return haversineNm(NEA_PERAMOS.lat, NEA_PERAMOS.lng, marina.lat, marina.lng);
}

export function formatNavTime(distanceNm: number, speedKn = 6): string {
  const totalHours = distanceNm / speedKn;
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// ---------------------------------------------------------------------------
// Airport data (IATA + coordinates) — used to estimate transfer distance
// ---------------------------------------------------------------------------

export interface Airport {
  iata: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

export const airports: Airport[] = [
  // Greece
  { iata: 'ATH', name: 'Athens International', city: 'Athens', lat: 37.9364, lng: 23.9445 },
  { iata: 'SKG', name: 'Thessaloniki Makedonia', city: 'Thessaloniki', lat: 40.5197, lng: 22.9709 },
  { iata: 'JMK', name: 'Mykonos Island National', city: 'Mykonos', lat: 37.4356, lng: 25.3481 },
  { iata: 'JTR', name: 'Santorini Thira', city: 'Santorini', lat: 36.3992, lng: 25.4793 },
  { iata: 'CFU', name: 'Corfu Ioannis Kapodistrias', city: 'Corfu', lat: 39.6019, lng: 19.9117 },
  { iata: 'RHO', name: 'Rhodes Diagoras', city: 'Rhodes', lat: 36.4054, lng: 28.0862 },
  { iata: 'HER', name: 'Heraklion Nikos Kazantzakis', city: 'Heraklion', lat: 35.3397, lng: 25.1803 },
  { iata: 'CHQ', name: 'Chania Ioannis Daskalogiannis', city: 'Chania', lat: 35.5317, lng: 24.1497 },
  { iata: 'ZTH', name: 'Zakynthos Dionysios Solomos', city: 'Zakynthos', lat: 37.7509, lng: 20.8843 },
  { iata: 'KGS', name: 'Kos Hippocrates', city: 'Kos', lat: 36.7933, lng: 27.0917 },
  { iata: 'PVK', name: 'Preveza / Aktio', city: 'Preveza', lat: 38.9255, lng: 20.7653 },
  { iata: 'EFL', name: 'Cephalonia', city: 'Kefalonia', lat: 38.1206, lng: 20.5005 },
  { iata: 'JSI', name: 'Skiathos Alexandros Papadiamantis', city: 'Skiathos', lat: 39.1772, lng: 23.5036 },
  { iata: 'SMI', name: 'Samos', city: 'Samos', lat: 37.6900, lng: 26.9117 },
  { iata: 'KVA', name: 'Kavala Alexander the Great', city: 'Kavala', lat: 40.9133, lng: 24.6192 },
  { iata: 'JKH', name: 'Chios', city: 'Chios', lat: 38.3433, lng: 26.1406 },
  { iata: 'MJT', name: 'Mytilene', city: 'Mytilene', lat: 39.0567, lng: 26.5983 },
  { iata: 'PAS', name: 'Paros National', city: 'Paros', lat: 37.0100, lng: 25.1133 },
  // Common European hubs for charter guests
  { iata: 'LHR', name: 'London Heathrow', city: 'London', lat: 51.4700, lng: -0.4543 },
  { iata: 'LGW', name: 'London Gatwick', city: 'London', lat: 51.1537, lng: -0.1821 },
  { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', lat: 49.0097, lng: 2.5478 },
  { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', lat: 52.3086, lng: 4.7639 },
  { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', lat: 50.0379, lng: 8.5622 },
  { iata: 'MXP', name: 'Milan Malpensa', city: 'Milan', lat: 45.6306, lng: 8.7281 },
  { iata: 'FCO', name: 'Rome Fiumicino', city: 'Rome', lat: 41.8003, lng: 12.2389 },
  { iata: 'MAD', name: 'Madrid Barajas', city: 'Madrid', lat: 40.4936, lng: -3.5668 },
  { iata: 'BRU', name: 'Brussels', city: 'Brussels', lat: 50.9010, lng: 4.4844 },
  { iata: 'ZUR', name: 'Zurich', city: 'Zurich', lat: 47.4647, lng: 8.5492 },
  { iata: 'TLV', name: 'Tel Aviv Ben Gurion', city: 'Tel Aviv', lat: 32.0055, lng: 34.8854 },
  { iata: 'DXB', name: 'Dubai International', city: 'Dubai', lat: 25.2532, lng: 55.3657 },
];

const airportByIata = new Map(airports.map(a => [a.iata, a]));

export function getAirportByIata(iata: string): Airport | undefined {
  return airportByIata.get(iata.toUpperCase());
}

export function nearestAirportToMarina(marina: Marina): { airport: Airport; km: number } {
  let best: Airport = airports[0];
  let bestKm = Infinity;
  for (const a of airports) {
    const km = haversineKm(marina.lat, marina.lng, a.lat, a.lng);
    if (km < bestKm) { bestKm = km; best = a; }
  }
  return { airport: best, km: bestKm };
}

export function getMarinaByName(name: string): Marina | undefined {
  return marinas.find(m => m.name === name);
}
