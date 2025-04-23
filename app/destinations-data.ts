export type Destination = {
  id: string;
  name: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
  highlights: string[];
};

export const destinations: Destination[] = [
  {
    id: "athens",
    name: "Athens (Alimos Marina)",
    description: "The most popular starting point for sailing in Greece, offering access to the Saronic Gulf and Cyclades.",
    image: "/destinations/athens.jpg",
    lat: 37.8922,
    lng: 23.7261,
    highlights: [
      "Gateway to Saronic and Cyclades islands",
      "Vibrant city life and history",
      "Easy access from Athens International Airport"
    ]
  },
  {
    id: "lavrio",
    name: "Lavrio",
    description: "A convenient embarkation port southeast of Athens, closest to the Cyclades and Cape Sounion.",
    image: "/destinations/lavrio.jpg",
    lat: 37.7147,
    lng: 24.0566,
    highlights: [
      "Closest port to Cyclades",
      "Near Temple of Poseidon",
      "Less crowded than Athens"
    ]
  },
  {
    id: "lefkada",
    name: "Lefkada",
    description: "The main base for exploring the Ionian islands, known for calm seas and lush green landscapes.",
    image: "/destinations/lefkada.jpg",
    lat: 38.8300,
    lng: 20.7100,
    highlights: [
      "Gateway to Ionian islands",
      "Sheltered waters and family-friendly",
      "Famous for turquoise beaches"
    ]
  },
  {
    id: "corfu",
    name: "Corfu",
    description: "A historic island and popular starting point for northern Ionian adventures.",
    image: "/destinations/corfu.jpg",
    lat: 39.6243,
    lng: 19.9217,
    highlights: [
      "Venetian old town",
      "Lush scenery and olive groves",
      "Access to Paxos and mainland"
    ]
  },
  {
    id: "kos",
    name: "Kos",
    description: "Ideal for exploring the Dodecanese islands, with ancient ruins and lively nightlife.",
    image: "/destinations/kos.jpg",
    lat: 36.8927,
    lng: 27.2877,
    highlights: [
      "Gateway to Dodecanese",
      "Ancient ruins and castles",
      "Lively harbor town"
    ]
  },
  {
    id: "rhodes",
    name: "Rhodes",
    description: "A UNESCO World Heritage city and a prime embarkation for the southern Dodecanese.",
    image: "/destinations/rhodes.jpg",
    lat: 36.4340,
    lng: 28.2170,
    highlights: [
      "Medieval old town",
      "Access to southern Dodecanese",
      "Rich history and culture"
    ]
  }
];
