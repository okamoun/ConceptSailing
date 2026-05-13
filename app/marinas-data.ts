export interface Marina {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export const marinas: Marina[] = [
  // Attica / Athens area
  { id: 'nea-peramos',   name: 'Nea Peramos Marina',          region: 'Attica',       lat: 38.009, lng: 23.335 },
  { id: 'piraeus',       name: 'Piraeus – Zea Marina',         region: 'Attica',       lat: 37.939, lng: 23.657 },
  { id: 'flisvos',       name: 'Flisvos Marina',               region: 'Attica',       lat: 37.928, lng: 23.696 },
  { id: 'alimos',        name: 'Alimos Marina',                 region: 'Attica',       lat: 37.908, lng: 23.717 },
  { id: 'glyfada',       name: 'Glyfada Marina',                region: 'Attica',       lat: 37.865, lng: 23.748 },
  { id: 'vouliagmeni',   name: 'Vouliagmeni Marina',            region: 'Attica',       lat: 37.809, lng: 23.782 },
  { id: 'lavrio',        name: 'Lavrio Port',                   region: 'Attica',       lat: 37.715, lng: 24.057 },
  // Peloponnese
  { id: 'corinth',       name: 'Corinth Marina',                region: 'Peloponnese',  lat: 37.934, lng: 22.930 },
  { id: 'patras',        name: 'Patras Marina',                 region: 'Peloponnese',  lat: 38.247, lng: 21.735 },
  { id: 'kalamata',      name: 'Kalamata Marina',               region: 'Peloponnese',  lat: 37.036, lng: 22.115 },
  { id: 'nafplio',       name: 'Nafplio Marina',                region: 'Peloponnese',  lat: 37.567, lng: 22.797 },
  // Ionian
  { id: 'lefkada',       name: 'Lefkada Marina',                region: 'Ionian',       lat: 38.830, lng: 20.710 },
  { id: 'corfu-gouvia',  name: 'Corfu – Gouvia Marina',         region: 'Ionian',       lat: 39.644, lng: 19.870 },
  { id: 'zakynthos',     name: 'Zakynthos Port',                region: 'Ionian',       lat: 37.789, lng: 20.897 },
  { id: 'kefalonia',     name: 'Kefalonia – Argostoli',         region: 'Ionian',       lat: 38.172, lng: 20.487 },
  { id: 'preveza',       name: 'Preveza Marina (Aktio)',         region: 'Ionian',       lat: 38.950, lng: 20.758 },
  // Cyclades
  { id: 'mykonos',       name: 'Mykonos Marina',                region: 'Cyclades',     lat: 37.447, lng: 25.329 },
  { id: 'paros',         name: 'Paros – Naoussa Marina',        region: 'Cyclades',     lat: 37.120, lng: 25.228 },
  { id: 'santorini',     name: 'Santorini – Vlychada Marina',   region: 'Cyclades',     lat: 36.362, lng: 25.396 },
  { id: 'syros',         name: 'Syros – Ermoupolis',            region: 'Cyclades',     lat: 37.441, lng: 24.944 },
  { id: 'naxos',         name: 'Naxos Marina',                  region: 'Cyclades',     lat: 37.106, lng: 25.376 },
  // Dodecanese
  { id: 'rhodes',        name: 'Rhodes Marina',                  region: 'Dodecanese',   lat: 36.450, lng: 28.223 },
  { id: 'kos',           name: 'Kos Marina',                    region: 'Dodecanese',   lat: 36.892, lng: 27.288 },
  { id: 'kalymnos',      name: 'Kalymnos Port',                 region: 'Dodecanese',   lat: 36.950, lng: 26.983 },
  // Crete
  { id: 'heraklion',     name: 'Heraklion Marina',              region: 'Crete',        lat: 35.339, lng: 25.144 },
  { id: 'chania',        name: 'Chania Marina',                  region: 'Crete',        lat: 35.514, lng: 24.018 },
  { id: 'rethymno',      name: 'Rethymno Marina',               region: 'Crete',        lat: 35.371, lng: 24.475 },
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
