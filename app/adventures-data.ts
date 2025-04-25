import { getAdventureImageUrl } from './getAdventureImageUrl';

export type AdventureItineraryDay = {
  title: string;
  description: string;
  features?: string[];
  lat?: number;
  lng?: number;
};

export type Adventure = {
  id: string;
  name: string;
  description: string;
  image: string;
  experience: string;
  itinerary: AdventureItineraryDay[];
  features?: string[];
};

const adventures: Adventure[] = await Promise.all([
  {
    id: "1",
    name: "Wind Sports Adventure",
    description: "Master the winds with windsurfing, kitesurfing, and sailing in the best sports of Greece.",
    image: await getAdventureImageUrl("1", "Windsurfing, kitesurfing, sailing adventure in Greece, blue sea, sporty, dynamic, sunny", "Wind Sports Adventure"),
    experience: "Embark on a 7-day journey designed for thrill-seekers and water sports lovers. Each day brings a new windsurfing or kitesurfing spot, with expert instructors guiding you through lessons and free rides. Enjoy island hopping, beach barbecues, and sunset sails.",
    itinerary: [
      {
        title: "Arrival in Athens",
        description: "Arrive in Athens, meet your guides and fellow adventurers. Enjoy a welcome dinner, safety briefing, and get to know your crew and equipment.",
        features: ["Welcome dinner", "Safety briefing"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Kea Island",
        description: "Set sail for Kea Island. Afternoon windsurfing session at a scenic bay. Evening at leisure exploring the island.",
        features: ["Windsurfing", "Island exploration"],
        lat: 37.6136, // Kea
        lng: 24.3346
      },
      {
        title: "Kythnos Winds",
        description: "Morning kitesurfing in Kythnos, renowned for its thermal winds. Optional beach yoga and group lunch.",
        features: ["Kitesurfing", "Beach yoga"],
        lat: 37.3933, // Kythnos
        lng: 24.3966
      },
      {
        title: "Serifos Adventure",
        description: "Full day sailing to Serifos. Try stand-up paddleboarding and enjoy a beach barbecue under the stars.",
        features: ["Sailing", "Paddleboarding", "Beach BBQ"],
        lat: 37.1426, // Serifos
        lng: 24.5027
      },
      {
        title: "Sifnos Challenge",
        description: "Advanced windsurfing session and friendly beach games. Explore Sifnos village in the evening.",
        features: ["Windsurfing", "Beach games"],
        lat: 36.9800, // Sifnos
        lng: 24.7136
      },
      {
        title: "Paros Hotspots",
        description: "Kitesurfing at Paros’ top spots. Evening at a local taverna with live music and dancing.",
        features: ["Kitesurfing", "Local culture"],
        lat: 37.0850, // Paros
        lng: 25.1500
      },
      {
        title: "Return to Athens",
        description: "Cruise back to Athens. Farewell breakfast, group photos, and departure.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Windsurfing", "Kitesurfing", "Sailing lessons", "Beach yoga", "Paddleboarding", "Beach BBQ", "Local culture"]
  },
  {
    id: "2",
    name: "Family Sailing School",
    description: "Learn sailing together as a family with certified instructors in safe, beautiful waters.",
    image: await getAdventureImageUrl("2", "Family sailing, children, parents, learning together, calm sea, sunny, Greece", "Family Sailing School"),
    experience: "A week-long adventure for families eager to learn the ropes of sailing. Each day features hands-on lessons, fun challenges, and safe swimming spots for all ages. Evenings are spent anchored in quiet bays, enjoying family meals and stargazing.",
    itinerary: [
      {
        title: "Meet in Lavrio",
        description: "Meet in Lavrio, introductory sailing lesson and safety briefing.",
        features: ["Sailing lesson", "Safety briefing"],
        lat: 37.7147, // Lavrio
        lng: 24.0567
      },
      {
        title: "Sail to Cape Sounion",
        description: "Sail to Cape Sounion, visit the Temple of Poseidon, and swim.",
        features: ["Sailing", "Temple visit", "Swimming"],
        lat: 37.6500, // Cape Sounion
        lng: 24.0267
      },
      {
        title: "Kea Island",
        description: "Family navigation games and beach picnic.",
        features: ["Navigation games", "Beach picnic"],
        lat: 37.6136, // Kea
        lng: 24.3346
      },
      {
        title: "Kythnos",
        description: "Docking practice and local village exploration.",
        features: ["Docking practice", "Village exploration"],
        lat: 37.3933, // Kythnos
        lng: 24.3966
      },
      {
        title: "Syros",
        description: "Sail handling drills and snorkeling adventure.",
        features: ["Sail handling", "Snorkeling"],
        lat: 37.4500, // Syros
        lng: 24.9333
      },
      {
        title: "Kithnos",
        description: "Family regatta and farewell party.",
        features: ["Regatta", "Farewell party"],
        lat: 37.3933, // Kythnos (again)
        lng: 24.3966
      },
      {
        title: "Return to Lavrio",
        description: "Return to Lavrio, certificates and group photos.",
        lat: 37.7147, // Lavrio
        lng: 24.0567
      }
    ],
    features: ["Family sailing", "Navigation games", "Safe swimming", "Sailing lessons", "Snorkeling", "Regatta"]
  },
  {
    id: "3",
    name: "Yoga & Wellness Retreat",
    description: "Combine sailing with daily yoga, meditation, and wellness activities for mind and body.",
    image: await getAdventureImageUrl("3", "Yoga on a boat, wellness, meditation, sunrise, peaceful, Greek islands, blue water", "Yoga & Wellness Retreat"),
    experience: "Relax and rejuvenate on a 7-day retreat blending sailing with holistic wellness. Start each morning with yoga on deck, followed by healthy meals and meditation sessions. Discover secluded coves and enjoy spa treatments at select ports.",
    itinerary: [
      {
        title: "Welcome Aboard",
        description: "Welcome aboard in Athens, gentle yoga and group meditation.",
        features: ["Yoga", "Meditation"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Poros",
        description: "Sail to Poros, sunrise yoga, and healthy brunch.",
        features: ["Sailing", "Yoga", "Healthy brunch"],
        lat: 37.5000, // Poros
        lng: 23.4500
      },
      {
        title: "Hydra",
        description: "Guided meditation and spa visit.",
        features: ["Meditation", "Spa visit"],
        lat: 37.3500, // Hydra
        lng: 23.4667
      },
      {
        title: "Spetses",
        description: "Beach yoga and mindful hiking.",
        features: ["Yoga", "Hiking"],
        lat: 37.2500, // Spetses
        lng: 23.1500
      },
      {
        title: "Aegina",
        description: "Nutrition workshop and sunset meditation.",
        features: ["Nutrition workshop", "Meditation"],
        lat: 37.7450, // Aegina
        lng: 23.4275
      },
      {
        title: "Agistri",
        description: "Forest bathing and wellness circle.",
        features: ["Forest bathing", "Wellness circle"],
        lat: 37.6981, // Agistri
        lng: 23.3432
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, closing ceremony and reflection.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Yoga", "Meditation", "Wellness activities", "Spa treatments", "Healthy meals", "Forest bathing"]
  },
  {
    id: "4",
    name: "Cleansing & Renewal",
    description: "A transformative journey combining sailing, detox programs, and holistic wellness.",
    image: await getAdventureImageUrl("4", "Detox, wellness, sailing, Greek islands, healthy food, yoga, meditation", "Cleansing & Renewal"),
    experience: "A week focused on cleansing body and mind. Enjoy daily detox meals, guided mindfulness, and spa therapies. Sail to tranquil islands, participate in wellness workshops, and experience the healing power of the Aegean.",
    itinerary: [
      {
        title: "Athens Embarkation",
        description: "Athens embarkation, detox welcome dinner.",
        features: ["Detox dinner"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Kea",
        description: "Sail to Kea, yoga and juice cleanse workshop.",
        features: ["Sailing", "Yoga", "Juice cleanse"],
        lat: 37.6136, // Kea
        lng: 24.3346
      },
      {
        title: "Kythnos",
        description: "Herbal spa and guided journaling.",
        features: ["Spa visit", "Journaling"],
        lat: 37.3933, // Kythnos
        lng: 24.3966
      },
      {
        title: "Serifos",
        description: "Mindful hiking and beach meditation.",
        features: ["Hiking", "Meditation"],
        lat: 37.1426, // Serifos
        lng: 24.5027
      },
      {
        title: "Sifnos",
        description: "Group coaching and healthy cooking class.",
        features: ["Coaching", "Cooking class"],
        lat: 36.9800, // Sifnos
        lng: 24.7136
      },
      {
        title: "Paros",
        description: "Thalassotherapy and farewell wellness circle.",
        features: ["Thalassotherapy", "Wellness circle"],
        lat: 37.0850, // Paros
        lng: 25.1500
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, integration session and goodbyes.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Detox programs", "Holistic wellness", "Spa therapies", "Yoga", "Meditation", "Healthy meals", "Thalassotherapy"]
  },
  {
    id: "5",
    name: "Greek Heritage Explorer",
    description: "Journey through time visiting ancient sites and historical landmarks by sea.",
    image: await getAdventureImageUrl("5", "Ancient Greek ruins, sailing, history, culture, Greek islands, blue sea", "Greek Heritage Explorer"),
    experience: "Explore the cradle of Western civilization over 7 days. Sail to islands rich in history, guided by expert archaeologists. Visit temples, amphitheaters, and museums, with storytelling evenings under the stars.",
    itinerary: [
      {
        title: "Meet in Athens",
        description: "Meet in Athens, Acropolis tour and welcome dinner.",
        features: ["Acropolis tour", "Welcome dinner"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Aegina",
        description: "Sail to Aegina, ancient temple visit.",
        features: ["Sailing", "Temple visit"],
        lat: 37.7450, // Aegina
        lng: 23.4275
      },
      {
        title: "Poros",
        description: "Archaeological museum and local myths.",
        features: ["Museum visit", "Local myths"],
        lat: 37.5000, // Poros
        lng: 23.4500
      },
      {
        title: "Hydra",
        description: "Maritime history walk and castle ruins.",
        features: ["History walk", "Castle ruins"],
        lat: 37.3500, // Hydra
        lng: 23.4667
      },
      {
        title: "Spetses",
        description: "Traditional shipyard and folk museum.",
        features: ["Shipyard visit", "Museum visit"],
        lat: 37.2500, // Spetses
        lng: 23.1500
      },
      {
        title: "Epidaurus",
        description: "Ancient theater and healing sanctuary.",
        features: ["Theater visit", "Sanctuary visit"],
        lat: 37.6370, // Epidaurus
        lng: 23.1597
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, closing lecture and brunch.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Ancient sites", "Historical landmarks", "Archaeological museums", "History walks", "Traditional shipyards"]
  },
  {
    id: "6",
    name: "Culinary Traditions",
    description: "Master Greek cooking while sailing through different regions and their unique flavors.",
    image: await getAdventureImageUrl("6", "Greek cuisine, cooking, sailing, traditional recipes, local ingredients, Greek islands", "Culinary Traditions"),
    experience: "A 7-day gastronomic voyage for food lovers. Each day features hands-on cooking classes, market visits, and wine tastings. Discover the secrets of Greek cuisine while anchoring in picturesque harbors.",
    itinerary: [
      {
        title: "Athens Welcome",
        description: "Athens welcome dinner and Greek meze workshop.",
        features: ["Welcome dinner", "Meze workshop"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Syros",
        description: "Sail to Syros, market tour and seafood cooking class.",
        features: ["Sailing", "Market tour", "Cooking class"],
        lat: 37.4500, // Syros
        lng: 24.9333
      },
      {
        title: "Tinos",
        description: "Cheese tasting and traditional bakery visit.",
        features: ["Cheese tasting", "Bakery visit"],
        lat: 37.5400, // Tinos
        lng: 25.1667
      },
      {
        title: "Mykonos",
        description: "Wine tasting and sunset dinner.",
        features: ["Wine tasting", "Sunset dinner"],
        lat: 37.4500, // Mykonos
        lng: 25.3333
      },
      {
        title: "Paros",
        description: "Olive oil workshop and village feast.",
        features: ["Olive oil workshop", "Village feast"],
        lat: 37.0850, // Paros
        lng: 25.1500
      },
      {
        title: "Naxos",
        description: "Farm-to-table experience and cooking contest.",
        features: ["Farm visit", "Cooking contest"],
        lat: 37.1000, // Naxos
        lng: 25.3833
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, recipe exchange and farewell brunch.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Greek cooking", "Market visits", "Wine tastings", "Cheese tastings", "Olive oil workshops", "Farm-to-table experiences"]
  },
  {
    id: "7",
    name: "Family Bonding Adventure",
    description: "Create lasting memories with activities designed for the whole family.",
    image: await getAdventureImageUrl("7", "Family adventure, sailing, Greek islands, fun, games, bonding, quality time", "Family Bonding Adventure"),
    experience: "A week of fun and connection for families. Each day brings new adventures: treasure hunts, beach games, and island explorations. Evenings feature storytelling, music, and shared meals under the stars.",
    itinerary: [
      {
        title: "Meet in Athens",
        description: "Meet in Athens, family welcome party.",
        features: ["Welcome party"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Aegina",
        description: "Sail to Aegina, beach games and treasure hunt.",
        features: ["Sailing", "Beach games", "Treasure hunt"],
        lat: 37.7450, // Aegina
        lng: 23.4275
      },
      {
        title: "Poros",
        description: "Kayaking and local sweets tasting.",
        features: ["Kayaking", "Sweets tasting"],
        lat: 37.5000, // Poros
        lng: 23.4500
      },
      {
        title: "Hydra",
        description: "Donkey ride and art workshop.",
        features: ["Donkey ride", "Art workshop"],
        lat: 37.3500, // Hydra
        lng: 23.4667
      },
      {
        title: "Spetses",
        description: "Family bike tour and picnic.",
        features: ["Bike tour", "Picnic"],
        lat: 37.2500, // Spetses
        lng: 23.1500
      },
      {
        title: "Agistri",
        description: "Snorkeling and sunset music night.",
        features: ["Snorkeling", "Music night"],
        lat: 37.6981, // Agistri
        lng: 23.3432
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, group slideshow and goodbyes.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Treasure hunts", "Beach games", "Island explorations", "Kayaking", "Donkey rides", "Art workshops", "Bike tours", "Snorkeling"]
  },
  {
    id: "8",
    name: "Island Nightlife",
    description: "Experience the vibrant nightlife of Greek islands with friends.",
    image: await getAdventureImageUrl("8", "Greek island nightlife, bars, clubs, dancing, fun, friends, party", "Island Nightlife"),
    experience: "Set sail for a week of excitement and celebration. Visit the most lively islands, enjoy beach parties, and discover hidden bars. Each night brings a new adventure, from sunset cocktails to dancing under the stars.",
    itinerary: [
      {
        title: "Athens Welcome",
        description: "Athens welcome party and night tour.",
        features: ["Welcome party", "Night tour"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Mykonos",
        description: "Sail to Mykonos, beach club night.",
        features: ["Sailing", "Beach club"],
        lat: 37.4500, // Mykonos
        lng: 25.3333
      },
      {
        title: "Paros",
        description: "Sunset bar and live music.",
        features: ["Sunset bar", "Live music"],
        lat: 37.0850, // Paros
        lng: 25.1500
      },
      {
        title: "Ios",
        description: "Pool party and island hopping.",
        features: ["Pool party", "Island hopping"],
        lat: 36.7333, // Ios
        lng: 25.2833
      },
      {
        title: "Santorini",
        description: "Wine bar and night views.",
        features: ["Wine bar", "Night views"],
        lat: 36.4000, // Santorini
        lng: 25.4333
      },
      {
        title: "Naxos",
        description: "Beach bonfire and DJ set.",
        features: ["Beach bonfire", "DJ set"],
        lat: 37.1000, // Naxos
        lng: 25.3833
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, farewell brunch and group photos.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Beach parties", "Hidden bars", "Sunset cocktails", "Live music", "Pool parties", "Island hopping", "Wine bars", "Beach bonfires"]
  },
  {
    id: "9",
    name: "Sephardic Heritage Sailing: Thessaloniki & Beyond",
    description: "Discover the rich Jewish and Sephardic history of Thessaloniki and Northern Greece, sailing to sites of memory and culture. This adventure can be arranged as a fully Kosher experience, including Kosher meals and guidance.",
    image: await getAdventureImageUrl("9", "Sailing, Thessaloniki, Jewish heritage, Sephardic history, synagogue, Greece, blue sea, historic sites", "Sephardic Heritage Sailing"),
    experience: "Embark on a 7-day cultural and historical journey starting from Thessaloniki, the Jerusalem of the Balkans. Visit the city's main Jewish landmarks, then sail to historic Sephardic communities along the Aegean coast. Guided tours, storytelling, and authentic cuisine bring the Sephardic legacy to life.",
    itinerary: [
      {
        title: "Arrival in Thessaloniki",
        description: "Arrive in Thessaloniki, welcome dinner with Sephardic cuisine. Evening walking tour of the old Jewish quarter.",
        features: ["Welcome dinner", "Jewish quarter tour"],
        lat: 40.6401, // Thessaloniki
        lng: 22.9444
      },
      {
        title: "Monastirioton Synagogue & Jewish Museum",
        description: "Morning visit to the Monastirioton Synagogue, then the Jewish Museum of Thessaloniki. Afternoon free to explore Ladadika district.",
        features: ["Synagogue visit", "Jewish Museum", "Ladadika district"],
        lat: 40.6389,
        lng: 22.9408
      },
      {
        title: "Holocaust Memorial & Sailing to Kavala",
        description: "Visit the Holocaust Memorial, then set sail east to the port city of Kavala. Evening stroll along the old port.",
        features: ["Holocaust Memorial", "Sailing", "Old port walk"],
        lat: 40.9369, // Kavala
        lng: 24.4129
      },
      {
        title: "Kavala Jewish Heritage",
        description: "Discover Kavala's Jewish history with a guided tour, including the old Jewish quarter and synagogue site. Afternoon sail to Volos.",
        features: ["Jewish quarter tour", "Synagogue site", "Sailing"],
        lat: 39.3610, // Volos
        lng: 22.9425
      },
      {
        title: "Volos Synagogue & Community",
        description: "Visit the Volos Synagogue and meet with local community members. Enjoy a Sephardic-style lunch. Evening at leisure in Volos.",
        features: ["Synagogue visit", "Community meeting", "Sephardic lunch"],
        lat: 39.3610, // Volos
        lng: 22.9425
      },
      {
        title: "Sail to Skiathos: Island Sephardic Stories",
        description: "Sail to Skiathos. Guided walk through the old town, sharing stories of Sephardic traders and refugees. Beach afternoon.",
        features: ["Sailing", "Storytelling", "Beach"],
        lat: 39.1621, // Skiathos
        lng: 23.4900
      },
      {
        title: "Return to Thessaloniki & Farewell",
        description: "Return sail to Thessaloniki. Closing reflections and group brunch at a local Jewish café. Departure in the afternoon.",
        features: ["Return sail", "Farewell brunch"],
        lat: 40.6401, // Thessaloniki
        lng: 22.9444
      }
    ],
    features: ["Jewish heritage", "Sephardic history", "Synagogue visits", "Museums", "Storytelling", "Sailing", "Cultural cuisine", "Kosher available"]
  },
  {
    id: "10",
    name: "Mediterranean Flavors",
    description: "A gastronomic journey through Greece's finest cuisines and wine regions.",
    image: await getAdventureImageUrl("10", "Greek cuisine, wine, sailing, Mediterranean flavors, local ingredients, traditional recipes", "Mediterranean Flavors"),
    experience: "Indulge in a 7-day culinary escape. Taste the best of Greek cuisine, from fresh seafood to local cheeses and wines. Visit vineyards, meet local chefs, and enjoy gourmet meals with a view.",
    itinerary: [
      {
        title: "Athens Gourmet",
        description: "Athens gourmet welcome dinner.",
        features: ["Welcome dinner"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Syros",
        description: "Sail to Syros, wine tasting and cheese workshop.",
        features: ["Sailing", "Wine tasting", "Cheese workshop"],
        lat: 37.4500, // Syros
        lng: 24.9333
      },
      {
        title: "Tinos",
        description: "Olive oil and honey tour.",
        features: ["Olive oil tour", "Honey tour"],
        lat: 37.5400, // Tinos
        lng: 25.1667
      },
      {
        title: "Mykonos",
        description: "Seafood feast and cooking demo.",
        features: ["Seafood feast", "Cooking demo"],
        lat: 37.4500, // Mykonos
        lng: 25.3333
      },
      {
        title: "Paros",
        description: "Vineyard picnic and local delicacies.",
        features: ["Vineyard picnic", "Local delicacies"],
        lat: 37.0850, // Paros
        lng: 25.1500
      },
      {
        title: "Naxos",
        description: "Farm visit and chef's table experience.",
        features: ["Farm visit", "Chef's table"],
        lat: 37.1000, // Naxos
        lng: 25.3833
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, farewell tasting and gift bag.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Greek cuisine", "Wine regions", "Gourmet meals", "Vineyard visits", "Cheese workshops", "Olive oil tours", "Farm visits", "Chef's table experiences"]
  },
  {
    id: "11",
    name: "Greek Cooking Masters",
    description: "Learn authentic Greek recipes from local chefs while sailing the islands.",
    image: await getAdventureImageUrl("11", "Greek cooking, sailing, local chefs, traditional recipes, cooking classes, Greek islands", "Greek Cooking Masters"),
    experience: "A week for aspiring chefs and foodies. Daily workshops with renowned chefs, market visits, and hands-on cooking. End each day with a shared meal and stories from Greek culinary traditions.",
    itinerary: [
      {
        title: "Athens Chef's Welcome",
        description: "Athens chef's welcome dinner and orientation.",
        features: ["Welcome dinner", "Orientation"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Syros",
        description: "Sail to Syros, hands-on cooking lesson.",
        features: ["Sailing", "Cooking lesson"],
        lat: 37.4500, // Syros
        lng: 24.9333
      },
      {
        title: "Tinos",
        description: "Market tour and pastry class.",
        features: ["Market tour", "Pastry class"],
        lat: 37.5400, // Tinos
        lng: 25.1667
      },
      {
        title: "Mykonos",
        description: "Seafood workshop and wine pairing.",
        features: ["Seafood workshop", "Wine pairing"],
        lat: 37.4500, // Mykonos
        lng: 25.3333
      },
      {
        title: "Paros",
        description: "Cheese making and mezze night.",
        features: ["Cheese making", "Mezze night"],
        lat: 37.0850, // Paros
        lng: 25.1500
      },
      {
        title: "Naxos",
        description: "Farm visit and chef's challenge.",
        features: ["Farm visit", "Chef's challenge"],
        lat: 37.1000, // Naxos
        lng: 25.3833
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, graduation lunch and certificates.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Greek recipes", "Local chefs", "Hands-on cooking", "Market visits", "Pastry classes", "Seafood workshops", "Wine pairings", "Cheese making"]
  },
  {
    id: "12",
    name: "Greek Islands Family Bike Adventure",
    description: "Cycle with your family through the beautiful Greek islands, combining sailing and biking for all ages.",
    image: await getAdventureImageUrl("12", "Family biking, Greek islands, cycling, sailing, children, parents, scenic, adventure", "Greek Islands Family Bike Adventure"),
    experience: "A unique 7-day adventure where you and your family explore the Greek islands by both sailboat and bicycle. Each day features gentle rides along scenic coastal paths, stops at picturesque villages, and plenty of time for swimming and local treats. All routes are family-friendly and supported by guides, with flexible options for all ages and abilities.",
    itinerary: [
      {
        title: "Arrive in Athens",
        description: "Arrive in Athens, welcome dinner and bike fitting.",
        features: ["Welcome dinner", "Bike fitting"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Sail to Poros",
        description: "Sail to Poros, morning family bike ride along the pine coast, beach picnic.",
        features: ["Sailing", "Bike ride", "Beach picnic"],
        lat: 37.5000, // Poros
        lng: 23.4500
      },
      {
        title: "Hydra",
        description: "Guided cycling tour through car-free streets, donkey meet-and-greet, swimming.",
        features: ["Cycling tour", "Donkey meet-and-greet", "Swimming"],
        lat: 37.3500, // Hydra
        lng: 23.4667
      },
      {
        title: "Spetses",
        description: "Island loop ride, visit to a local bakery, sunset games on the beach.",
        features: ["Island loop ride", "Bakery visit", "Sunset games"],
        lat: 37.2500, // Spetses
        lng: 23.1500
      },
      {
        title: "Aegina",
        description: "Ride to ancient temple, pistachio tasting, family cooking class.",
        features: ["Ride to temple", "Pistachio tasting", "Cooking class"],
        lat: 37.7450, // Aegina
        lng: 23.4275
      },
      {
        title: "Agistri",
        description: "Forest cycling, snorkeling stop, and ice cream in the village square.",
        features: ["Forest cycling", "Snorkeling", "Ice cream"],
        lat: 37.6981, // Agistri
        lng: 23.3432
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, farewell group ride and family photo session.",
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Family cycling", "Gentle routes", "Island exploration", "Local culture", "Bike rides", "Beach picnics", "Cycling tours", "Donkey meet-and-greets", "Swimming", "Island loop rides", "Bakery visits", "Sunset games", "Rides to temples", "Pistachio tastings", "Cooking classes", "Forest cycling", "Snorkeling", "Ice cream"]
  },
  {
    id: "13",
    name: "Ionian Fishing & Island Discovery",
    description: "Experience the thrill of fishing in the crystal-clear waters of the Ionian Sea, including the beautiful island of Zakynthos. Perfect for anglers and sea lovers alike.",
    image: await getAdventureImageUrl("13", "Fishing, Zakynthos, Ionian Sea, Greek islands, sailing, blue water, fresh catch, boat, adventure", "Ionian Fishing & Island Discovery"),
    experience: "Set sail for a week of fishing and exploration in the Ionian islands. Learn traditional and modern fishing techniques from local experts, enjoy daily catches prepared onboard, and discover the vibrant marine life of Zakynthos, Kefalonia, and surrounding isles. Relax in secluded bays, swim in turquoise waters, and savor the freshest seafood dinners under the stars.",
    itinerary: [
      {
        title: "Arrival in Zakynthos",
        description: "Arrive in Zakynthos, meet your crew and fellow anglers. Welcome dinner featuring local seafood specialties.",
        features: ["Welcome dinner", "Seafood specialties"],
        lat: 37.7870, // Zakynthos
        lng: 20.8990
      },
      {
        title: "Zakynthos Fishing Day",
        description: "Morning fishing expedition off Zakynthos coast. Afternoon swim at Navagio Beach (Shipwreck Bay). Evening grilling your catch onboard.",
        features: ["Fishing", "Navagio Beach", "Grilled catch"],
        lat: 37.8590, // Navagio Beach
        lng: 20.6240
      },
      {
        title: "Kefalonia Adventure",
        description: "Sail to Kefalonia, trolling and bottom fishing en route. Explore Argostoli port and enjoy a seafood taverna dinner.",
        features: ["Trolling", "Bottom fishing", "Seafood taverna"],
        lat: 38.1754, // Argostoli
        lng: 20.4890
      },
      {
        title: "Ithaca Island",
        description: "Early morning fishing and snorkeling near Ithaca. Afternoon village walk and local meze tasting.",
        features: ["Fishing", "Snorkeling", "Meze tasting"],
        lat: 38.3670, // Ithaca
        lng: 20.7200
      },
      {
        title: "Lefkada Lagoons",
        description: "Sail to Lefkada, fish in the lagoons and salt flats. Birdwatching and picnic lunch by the water.",
        features: ["Lagoon fishing", "Birdwatching", "Picnic"],
        lat: 38.8333, // Lefkada
        lng: 20.7000
      },
      {
        title: "Meganisi Hidden Coves",
        description: "Anchor at Meganisi, try hand-line fishing in secluded coves. Evening beach BBQ with your fresh catch.",
        features: ["Hand-line fishing", "Beach BBQ", "Secluded coves"],
        lat: 38.6500, // Meganisi
        lng: 20.7833
      },
      {
        title: "Return to Zakynthos & Farewell",
        description: "Return to Zakynthos. Farewell brunch and sharing of fishing stories and photos. Departure in the afternoon.",
        features: ["Return sail", "Farewell brunch", "Fishing stories"],
        lat: 37.7870, // Zakynthos
        lng: 20.8990
      }
    ],
    features: ["Fishing", "Seafood cuisine", "Local guides", "Beach BBQ", "Swimming", "Snorkeling", "Island exploration"]
  },
  {
    id: "14",
    name: "Romantic Aegean Cruise: Proposal & Honeymoon",
    description: "A dreamy sailing adventure for couples, perfect for proposals, honeymoons, or anniversaries. Private, luxurious, and unforgettable.",
    image: await getAdventureImageUrl("14", "Romantic sailing, couple, sunset, proposal, honeymoon, Greek islands, luxury yacht, candlelight dinner, rose petals, blue sea", "Romantic Aegean Cruise"),
    experience: "Set sail on a private yacht with your loved one for a week of romance in the Greek islands. Enjoy secluded beaches, sunset dinners, and personalized touches for proposals or honeymoons. Each day is crafted to celebrate your love with privacy, luxury, and breathtaking scenery.",
    itinerary: [
      {
        title: "Welcome to Athens",
        description: "Arrive in Athens, champagne welcome and private transfer to your yacht. Romantic dinner onboard with city views.",
        features: ["Champagne welcome", "Private transfer", "Romantic dinner"],
        lat: 37.9838, // Athens
        lng: 23.7275
      },
      {
        title: "Saronic Gulf Escape",
        description: "Sail to a secluded bay in the Saronic Gulf. Swim, relax, and enjoy a candlelit dinner on deck under the stars.",
        features: ["Secluded bay", "Swimming", "Candlelit dinner"],
        lat: 37.6500, // Saronic Gulf
        lng: 23.4000
      },
      {
        title: "Hydra Island Magic",
        description: "Explore the romantic island of Hydra. Horse-drawn carriage ride and sunset drinks at a cliffside bar.",
        features: ["Hydra island", "Carriage ride", "Sunset drinks"],
        lat: 37.3500, // Hydra
        lng: 23.4667
      },
      {
        title: "Poros: Private Beach Day",
        description: "Anchor at a hidden cove near Poros. Picnic lunch, snorkeling, and time for a surprise proposal or vow renewal.",
        features: ["Private beach", "Picnic", "Snorkeling", "Proposal spot"],
        lat: 37.5000, // Poros
        lng: 23.4500
      },
      {
        title: "Spetses: Island Romance",
        description: "Visit Spetses for a couple's spa treatment and stroll through charming streets. Gourmet dinner at a seaside taverna.",
        features: ["Couple's spa", "Island stroll", "Gourmet dinner"],
        lat: 37.2500, // Spetses
        lng: 23.1500
      },
      {
        title: "Aegina: Sunset & Celebration",
        description: "Sail to Aegina, sunset swim and celebration dinner with live music. Optional photographer for memories.",
        features: ["Sunset swim", "Celebration dinner", "Live music", "Photography"],
        lat: 37.7450, // Aegina
        lng: 23.4275
      },
      {
        title: "Return to Athens & Farewell",
        description: "Return to Athens. Farewell brunch and private transfer to your hotel or airport. Option for a surprise gift or message.",
        features: ["Farewell brunch", "Private transfer", "Surprise gift"],
        lat: 37.9838, // Athens
        lng: 23.7275
      }
    ],
    features: ["Romantic", "Private yacht", "Proposal planning", "Honeymoon", "Luxury", "Secluded beaches", "Candlelit dinners", "Spa treatment", "Personalized experiences", "Photography"]
  }
]);

export default adventures;
