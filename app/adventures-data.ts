import { getAdventureImageUrl } from './getAdventureImageUrl';

export type AdventureItineraryDay = {
  title: string;
  description: string;
  features?: string[];
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
        features: ["Welcome dinner", "Safety briefing"]
      },
      {
        title: "Sail to Kea Island",
        description: "Set sail for Kea Island. Afternoon windsurfing session at a scenic bay. Evening at leisure exploring the island.",
        features: ["Windsurfing", "Island exploration"]
      },
      {
        title: "Kythnos Winds",
        description: "Morning kitesurfing in Kythnos, renowned for its thermal winds. Optional beach yoga and group lunch.",
        features: ["Kitesurfing", "Beach yoga"]
      },
      {
        title: "Serifos Adventure",
        description: "Full day sailing to Serifos. Try stand-up paddleboarding and enjoy a beach barbecue under the stars.",
        features: ["Sailing", "Paddleboarding", "Beach BBQ"]
      },
      {
        title: "Sifnos Challenge",
        description: "Advanced windsurfing session and friendly beach games. Explore Sifnos village in the evening.",
        features: ["Windsurfing", "Beach games"]
      },
      {
        title: "Paros Hotspots",
        description: "Kitesurfing at Paros’ top spots. Evening at a local taverna with live music and dancing.",
        features: ["Kitesurfing", "Local culture"]
      },
      {
        title: "Return to Athens",
        description: "Cruise back to Athens. Farewell breakfast, group photos, and departure."
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
        features: ["Sailing lesson", "Safety briefing"]
      },
      {
        title: "Sail to Cape Sounion",
        description: "Sail to Cape Sounion, visit the Temple of Poseidon, and swim.",
        features: ["Sailing", "Temple visit", "Swimming"]
      },
      {
        title: "Kea Island",
        description: "Family navigation games and beach picnic.",
        features: ["Navigation games", "Beach picnic"]
      },
      {
        title: "Kythnos",
        description: "Docking practice and local village exploration.",
        features: ["Docking practice", "Village exploration"]
      },
      {
        title: "Syros",
        description: "Sail handling drills and snorkeling adventure.",
        features: ["Sail handling", "Snorkeling"]
      },
      {
        title: "Kithnos",
        description: "Family regatta and farewell party.",
        features: ["Regatta", "Farewell party"]
      },
      {
        title: "Return to Lavrio",
        description: "Return to Lavrio, certificates and group photos."
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
        features: ["Yoga", "Meditation"]
      },
      {
        title: "Sail to Poros",
        description: "Sail to Poros, sunrise yoga, and healthy brunch.",
        features: ["Sailing", "Yoga", "Healthy brunch"]
      },
      {
        title: "Hydra",
        description: "Guided meditation and spa visit.",
        features: ["Meditation", "Spa visit"]
      },
      {
        title: "Spetses",
        description: "Beach yoga and mindful hiking.",
        features: ["Yoga", "Hiking"]
      },
      {
        title: "Aegina",
        description: "Nutrition workshop and sunset meditation.",
        features: ["Nutrition workshop", "Meditation"]
      },
      {
        title: "Agistri",
        description: "Forest bathing and wellness circle.",
        features: ["Forest bathing", "Wellness circle"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, closing ceremony and reflection."
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
        features: ["Detox dinner"]
      },
      {
        title: "Sail to Kea",
        description: "Sail to Kea, yoga and juice cleanse workshop.",
        features: ["Sailing", "Yoga", "Juice cleanse"]
      },
      {
        title: "Kythnos",
        description: "Herbal spa and guided journaling.",
        features: ["Spa visit", "Journaling"]
      },
      {
        title: "Serifos",
        description: "Mindful hiking and beach meditation.",
        features: ["Hiking", "Meditation"]
      },
      {
        title: "Sifnos",
        description: "Group coaching and healthy cooking class.",
        features: ["Coaching", "Cooking class"]
      },
      {
        title: "Paros",
        description: "Thalassotherapy and farewell wellness circle.",
        features: ["Thalassotherapy", "Wellness circle"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, integration session and goodbyes."
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
        features: ["Acropolis tour", "Welcome dinner"]
      },
      {
        title: "Sail to Aegina",
        description: "Sail to Aegina, ancient temple visit.",
        features: ["Sailing", "Temple visit"]
      },
      {
        title: "Poros",
        description: "Archaeological museum and local myths.",
        features: ["Museum visit", "Local myths"]
      },
      {
        title: "Hydra",
        description: "Maritime history walk and castle ruins.",
        features: ["History walk", "Castle ruins"]
      },
      {
        title: "Spetses",
        description: "Traditional shipyard and folk museum.",
        features: ["Shipyard visit", "Museum visit"]
      },
      {
        title: "Epidaurus",
        description: "Ancient theater and healing sanctuary.",
        features: ["Theater visit", "Sanctuary visit"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, closing lecture and brunch."
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
        features: ["Welcome dinner", "Meze workshop"]
      },
      {
        title: "Sail to Syros",
        description: "Sail to Syros, market tour and seafood cooking class.",
        features: ["Sailing", "Market tour", "Cooking class"]
      },
      {
        title: "Tinos",
        description: "Cheese tasting and traditional bakery visit.",
        features: ["Cheese tasting", "Bakery visit"]
      },
      {
        title: "Mykonos",
        description: "Wine tasting and sunset dinner.",
        features: ["Wine tasting", "Sunset dinner"]
      },
      {
        title: "Paros",
        description: "Olive oil workshop and village feast.",
        features: ["Olive oil workshop", "Village feast"]
      },
      {
        title: "Naxos",
        description: "Farm-to-table experience and cooking contest.",
        features: ["Farm visit", "Cooking contest"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, recipe exchange and farewell brunch."
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
        features: ["Welcome party"]
      },
      {
        title: "Sail to Aegina",
        description: "Sail to Aegina, beach games and treasure hunt.",
        features: ["Sailing", "Beach games", "Treasure hunt"]
      },
      {
        title: "Poros",
        description: "Kayaking and local sweets tasting.",
        features: ["Kayaking", "Sweets tasting"]
      },
      {
        title: "Hydra",
        description: "Donkey ride and art workshop.",
        features: ["Donkey ride", "Art workshop"]
      },
      {
        title: "Spetses",
        description: "Family bike tour and picnic.",
        features: ["Bike tour", "Picnic"]
      },
      {
        title: "Agistri",
        description: "Snorkeling and sunset music night.",
        features: ["Snorkeling", "Music night"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, group slideshow and goodbyes."
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
        features: ["Welcome party", "Night tour"]
      },
      {
        title: "Sail to Mykonos",
        description: "Sail to Mykonos, beach club night.",
        features: ["Sailing", "Beach club"]
      },
      {
        title: "Paros",
        description: "Sunset bar and live music.",
        features: ["Sunset bar", "Live music"]
      },
      {
        title: "Ios",
        description: "Pool party and island hopping.",
        features: ["Pool party", "Island hopping"]
      },
      {
        title: "Santorini",
        description: "Wine bar and night views.",
        features: ["Wine bar", "Night views"]
      },
      {
        title: "Naxos",
        description: "Beach bonfire and DJ set.",
        features: ["Beach bonfire", "DJ set"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, farewell brunch and group photos."
      }
    ],
    features: ["Beach parties", "Hidden bars", "Sunset cocktails", "Live music", "Pool parties", "Island hopping", "Wine bars", "Beach bonfires"]
  },
  {
    id: "9",
    name: "Mediterranean Flavors",
    description: "A gastronomic journey through Greece's finest cuisines and wine regions.",
    image: await getAdventureImageUrl("9", "Greek cuisine, wine, sailing, Mediterranean flavors, local ingredients, traditional recipes", "Mediterranean Flavors"),
    experience: "Indulge in a 7-day culinary escape. Taste the best of Greek cuisine, from fresh seafood to local cheeses and wines. Visit vineyards, meet local chefs, and enjoy gourmet meals with a view.",
    itinerary: [
      {
        title: "Athens Gourmet",
        description: "Athens gourmet welcome dinner.",
        features: ["Welcome dinner"]
      },
      {
        title: "Sail to Syros",
        description: "Sail to Syros, wine tasting and cheese workshop.",
        features: ["Sailing", "Wine tasting", "Cheese workshop"]
      },
      {
        title: "Tinos",
        description: "Olive oil and honey tour.",
        features: ["Olive oil tour", "Honey tour"]
      },
      {
        title: "Mykonos",
        description: "Seafood feast and cooking demo.",
        features: ["Seafood feast", "Cooking demo"]
      },
      {
        title: "Paros",
        description: "Vineyard picnic and local delicacies.",
        features: ["Vineyard picnic", "Local delicacies"]
      },
      {
        title: "Naxos",
        description: "Farm visit and chef's table experience.",
        features: ["Farm visit", "Chef's table"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, farewell tasting and gift bag."
      }
    ],
    features: ["Greek cuisine", "Wine regions", "Gourmet meals", "Vineyard visits", "Cheese workshops", "Olive oil tours", "Farm visits", "Chef's table experiences"]
  },
  {
    id: "10",
    name: "Greek Cooking Masters",
    description: "Learn authentic Greek recipes from local chefs while sailing the islands.",
    image: await getAdventureImageUrl("10", "Greek cooking, sailing, local chefs, traditional recipes, cooking classes, Greek islands", "Greek Cooking Masters"),
    experience: "A week for aspiring chefs and foodies. Daily workshops with renowned chefs, market visits, and hands-on cooking. End each day with a shared meal and stories from Greek culinary traditions.",
    itinerary: [
      {
        title: "Athens Chef's Welcome",
        description: "Athens chef's welcome dinner and orientation.",
        features: ["Welcome dinner", "Orientation"]
      },
      {
        title: "Sail to Syros",
        description: "Sail to Syros, hands-on cooking lesson.",
        features: ["Sailing", "Cooking lesson"]
      },
      {
        title: "Tinos",
        description: "Market tour and pastry class.",
        features: ["Market tour", "Pastry class"]
      },
      {
        title: "Mykonos",
        description: "Seafood workshop and wine pairing.",
        features: ["Seafood workshop", "Wine pairing"]
      },
      {
        title: "Paros",
        description: "Cheese making and mezze night.",
        features: ["Cheese making", "Mezze night"]
      },
      {
        title: "Naxos",
        description: "Farm visit and chef's challenge.",
        features: ["Farm visit", "Chef's challenge"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, graduation lunch and certificates."
      }
    ],
    features: ["Greek recipes", "Local chefs", "Hands-on cooking", "Market visits", "Pastry classes", "Seafood workshops", "Wine pairings", "Cheese making"]
  },
  {
    id: "11",
    name: "Greek Islands Family Bike Adventure",
    description: "Cycle with your family through the beautiful Greek islands, combining sailing and biking for all ages.",
    image: await getAdventureImageUrl("11", "Family biking, Greek islands, cycling, sailing, children, parents, scenic, adventure", "Greek Islands Family Bike Adventure"),
    experience: "A unique 7-day adventure where you and your family explore the Greek islands by both sailboat and bicycle. Each day features gentle rides along scenic coastal paths, stops at picturesque villages, and plenty of time for swimming and local treats. All routes are family-friendly and supported by guides, with flexible options for all ages and abilities.",
    itinerary: [
      {
        title: "Arrive in Athens",
        description: "Arrive in Athens, welcome dinner and bike fitting.",
        features: ["Welcome dinner", "Bike fitting"]
      },
      {
        title: "Sail to Poros",
        description: "Sail to Poros, morning family bike ride along the pine coast, beach picnic.",
        features: ["Sailing", "Bike ride", "Beach picnic"]
      },
      {
        title: "Hydra",
        description: "Guided cycling tour through car-free streets, donkey meet-and-greet, swimming.",
        features: ["Cycling tour", "Donkey meet-and-greet", "Swimming"]
      },
      {
        title: "Spetses",
        description: "Island loop ride, visit to a local bakery, sunset games on the beach.",
        features: ["Island loop ride", "Bakery visit", "Sunset games"]
      },
      {
        title: "Aegina",
        description: "Ride to ancient temple, pistachio tasting, family cooking class.",
        features: ["Ride to temple", "Pistachio tasting", "Cooking class"]
      },
      {
        title: "Agistri",
        description: "Forest cycling, snorkeling stop, and ice cream in the village square.",
        features: ["Forest cycling", "Snorkeling", "Ice cream"]
      },
      {
        title: "Return to Athens",
        description: "Return to Athens, farewell group ride and family photo session."
      }
    ],
    features: ["Family cycling", "Gentle routes", "Island exploration", "Local culture", "Bike rides", "Beach picnics", "Cycling tours", "Donkey meet-and-greets", "Swimming", "Island loop rides", "Bakery visits", "Sunset games", "Rides to temples", "Pistachio tastings", "Cooking classes", "Forest cycling", "Snorkeling", "Ice cream"]
  }
]);

export default adventures;
