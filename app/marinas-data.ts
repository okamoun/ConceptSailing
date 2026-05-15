export interface Marina {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export const DEFAULT_MARINA_ID = 'nea_peramos';

export const marinas: Marina[] = [
  { id: 'nea_peramos',    name: 'Nea Peramos',           region: 'Attica',        lat: 38.0086, lng: 23.3897 },
  { id: 'lavrio',         name: 'Lavrio',                region: 'Attica',        lat: 37.7131, lng: 24.0597 },
  { id: 'aegina',         name: 'Aegina',                region: 'Saronic Gulf',  lat: 37.7447, lng: 23.4270 },
  { id: 'poros',          name: 'Poros',                 region: 'Saronic Gulf',  lat: 37.4980, lng: 23.4620 },
  { id: 'hydra',          name: 'Hydra',                 region: 'Saronic Gulf',  lat: 37.3481, lng: 23.4738 },
  { id: 'spetses',        name: 'Spetses',               region: 'Saronic Gulf',  lat: 37.2583, lng: 23.1574 },
  { id: 'ermioni',        name: 'Ermioni',               region: 'Saronic Gulf',  lat: 37.3847, lng: 23.2522 },
  { id: 'nafplio',        name: 'Nafplio',               region: 'Saronic Gulf',  lat: 37.5672, lng: 22.8010 },
  { id: 'corinth',        name: 'Corinth',               region: 'Saronic Gulf',  lat: 37.9388, lng: 22.9268 },
  { id: 'galaxidi',       name: 'Galaxidi',              region: 'Central Greece',lat: 38.3742, lng: 22.3808 },
  { id: 'itea',           name: 'Itea',                  region: 'Central Greece',lat: 38.4286, lng: 22.4303 },
  { id: 'patras',         name: 'Patras',                region: 'Peloponnese',   lat: 38.2466, lng: 21.7346 },
  { id: 'zakynthos',      name: 'Zakynthos',             region: 'Ionian',        lat: 37.7906, lng: 20.8953 },
  { id: 'argostoli',      name: 'Argostoli (Kefalonia)', region: 'Ionian',        lat: 38.1752, lng: 20.4881 },
  { id: 'lefkada',        name: 'Lefkada',               region: 'Ionian',        lat: 38.8342, lng: 20.7043 },
  { id: 'preveza',        name: 'Preveza',               region: 'Ionian',        lat: 38.9590, lng: 20.7519 },
  { id: 'corfu',          name: 'Corfu',                 region: 'Ionian',        lat: 39.6243, lng: 19.9217 },
  { id: 'syros',          name: 'Syros (Ermoupoli)',     region: 'Cyclades',      lat: 37.4467, lng: 24.9422 },
  { id: 'paros',          name: 'Paros (Parikia)',       region: 'Cyclades',      lat: 37.0853, lng: 25.1497 },
  { id: 'naxos',          name: 'Naxos',                 region: 'Cyclades',      lat: 37.1035, lng: 25.3763 },
  { id: 'mykonos',        name: 'Mykonos',               region: 'Cyclades',      lat: 37.4467, lng: 25.3289 },
  { id: 'santorini',      name: 'Santorini (Fira)',      region: 'Cyclades',      lat: 36.4167, lng: 25.4330 },
  { id: 'rhodes',         name: 'Rhodes',                region: 'Dodecanese',    lat: 36.4341, lng: 28.2176 },
  { id: 'kos',            name: 'Kos',                   region: 'Dodecanese',    lat: 36.8934, lng: 27.2878 },
  { id: 'heraklion',      name: 'Heraklion',             region: 'Crete',         lat: 35.3387, lng: 25.1442 },
  { id: 'chania',         name: 'Chania',                region: 'Crete',         lat: 35.5138, lng: 24.0180 },
];

export function getMarinaById(id: string): Marina | undefined {
  return marinas.find((m) => m.id === id);
}

export function marinasByRegion(): Record<string, Marina[]> {
  return marinas.reduce<Record<string, Marina[]>>((acc, marina) => {
    if (!acc[marina.region]) acc[marina.region] = [];
    acc[marina.region].push(marina);
    return acc;
  }, {});
}

const NEA_PERAMOS_LAT = 38.0086;
const NEA_PERAMOS_LNG = 23.3897;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function distanceFromNeaPeramos(marina: Marina): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = toRad(marina.lat - NEA_PERAMOS_LAT);
  const dLng = toRad(marina.lng - NEA_PERAMOS_LNG);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(NEA_PERAMOS_LAT)) *
      Math.cos(toRad(marina.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatNavTime(distanceNm: number): string {
  const speedKnots = 6;
  const totalHours = distanceNm / speedKnots;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
