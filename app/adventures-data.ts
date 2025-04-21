const adventures = [
  {
    id: "1",
    name: "Wind Sports Adventure",
    description: "Master the winds with windsurfing, kitesurfing, and sailing in the best sports of Greece.",
    image: "https://images.unsplash.com/photo-1712167959870-0bf3d9cae41a?auto=format&fit=crop&w=800&q=80",
    experience: "Embark on a 7-day journey designed for thrill-seekers and water sports lovers. Each day brings a new windsurfing or kitesurfing spot, with expert instructors guiding you through lessons and free rides. Enjoy island hopping, beach barbecues, and sunset sails.",
    itinerary: [
      "Arrival in Athens, welcome dinner, and briefing.",
      "Set sail to Kea Island, afternoon windsurfing session.",
      "Kythnos: Morning kitesurfing, explore thermal winds.",
      "Serifos: Full day sailing and stand-up paddleboarding.",
      "Sifnos: Advanced windsurfing and beach games.",
      "Paros: Kitesurfing hotspots, local taverna evening.",
      "Return to Athens, farewell breakfast, and departure."
    ]
  },
  {
    id: "2",
    name: "Family Sailing School",
    description: "Learn sailing together as a family with certified instructors in safe, beautiful waters.",
    image: "https://images.unsplash.com/photo-1542397284385-6010376c5337?auto=format&fit=crop&w=800&q=80",
    experience: "A week-long adventure for families eager to learn the ropes of sailing. Each day features hands-on lessons, fun challenges, and safe swimming spots for all ages. Evenings are spent anchored in quiet bays, enjoying family meals and stargazing.",
    itinerary: [
      "Meet in Lavrio, introductory sailing lesson and safety briefing.",
      "Sail to Cape Sounion, visit the Temple of Poseidon, and swim.",
      "Kea Island: Family navigation games and beach picnic.",
      "Kythnos: Docking practice and local village exploration.",
      "Syros: Sail handling drills and snorkeling adventure.",
      "Kithnos: Family regatta and farewell party.",
      "Return to Lavrio, certificates and group photos."
    ]
  },
  {
    id: "3",
    name: "Yoga & Wellness Retreat",
    description: "Combine sailing with daily yoga, meditation, and wellness activities for mind and body.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    experience: "Relax and rejuvenate on a 7-day retreat blending sailing with holistic wellness. Start each morning with yoga on deck, followed by healthy meals and meditation sessions. Discover secluded coves and enjoy spa treatments at select ports.",
    itinerary: [
      "Welcome aboard in Athens, gentle yoga and group meditation.",
      "Sail to Poros, sunrise yoga, and healthy brunch.",
      "Hydra: Guided meditation and spa visit.",
      "Spetses: Beach yoga and mindful hiking.",
      "Aegina: Nutrition workshop and sunset meditation.",
      "Agistri: Forest bathing and wellness circle.",
      "Return to Athens, closing ceremony and reflection."
    ]
  },
  {
    id: "4",
    name: "Cleansing & Renewal",
    description: "A transformative journey combining sailing, detox programs, and holistic wellness.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    experience: "A week focused on cleansing body and mind. Enjoy daily detox meals, guided mindfulness, and spa therapies. Sail to tranquil islands, participate in wellness workshops, and experience the healing power of the Aegean.",
    itinerary: [
      "Athens embarkation, detox welcome dinner.",
      "Sail to Kea, yoga and juice cleanse workshop.",
      "Kythnos: Herbal spa and guided journaling.",
      "Serifos: Mindful hiking and beach meditation.",
      "Sifnos: Group coaching and healthy cooking class.",
      "Paros: Thalassotherapy and farewell wellness circle.",
      "Return to Athens, integration session and goodbyes."
    ]
  },
  {
    id: "5",
    name: "Greek Heritage Explorer",
    description: "Journey through time visiting ancient sites and historical landmarks by sea.",
    image: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=800&q=80",
    experience: "Explore the cradle of Western civilization over 7 days. Sail to islands rich in history, guided by expert archaeologists. Visit temples, amphitheaters, and museums, with storytelling evenings under the stars.",
    itinerary: [
      "Meet in Athens, Acropolis tour and welcome dinner.",
      "Sail to Aegina, ancient temple visit.",
      "Poros: Archaeological museum and local myths.",
      "Hydra: Maritime history walk and castle ruins.",
      "Spetses: Traditional shipyard and folk museum.",
      "Epidaurus: Ancient theater and healing sanctuary.",
      "Return to Athens, closing lecture and brunch."
    ]
  },
  {
    id: "6",
    name: "Culinary Traditions",
    description: "Master Greek cooking while sailing through different regions and their unique flavors.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    experience: "A 7-day gastronomic voyage for food lovers. Each day features hands-on cooking classes, market visits, and wine tastings. Discover the secrets of Greek cuisine while anchoring in picturesque harbors.",
    itinerary: [
      "Athens welcome dinner and Greek meze workshop.",
      "Sail to Syros, market tour and seafood cooking class.",
      "Tinos: Cheese tasting and traditional bakery visit.",
      "Mykonos: Wine tasting and sunset dinner.",
      "Paros: Olive oil workshop and village feast.",
      "Naxos: Farm-to-table experience and cooking contest.",
      "Return to Athens, recipe exchange and farewell brunch."
    ]
  },
  {
    id: "7",
    name: "Family Bonding Adventure",
    description: "Create lasting memories with activities designed for the whole family.",
    image: "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=800&q=80",
    experience: "A week of fun and connection for families. Each day brings new adventures: treasure hunts, beach games, and island explorations. Evenings feature storytelling, music, and shared meals under the stars.",
    itinerary: [
      "Meet in Athens, family welcome party.",
      "Sail to Aegina, beach games and treasure hunt.",
      "Poros: Kayaking and local sweets tasting.",
      "Hydra: Donkey ride and art workshop.",
      "Spetses: Family bike tour and picnic.",
      "Agistri: Snorkeling and sunset music night.",
      "Return to Athens, group slideshow and goodbyes."
    ]
  },
  {
    id: "8",
    name: "Island Nightlife",
    description: "Experience the vibrant nightlife of Greek islands with friends.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
    experience: "Set sail for a week of excitement and celebration. Visit the most lively islands, enjoy beach parties, and discover hidden bars. Each night brings a new adventure, from sunset cocktails to dancing under the stars.",
    itinerary: [
      "Athens welcome party and night tour.",
      "Sail to Mykonos, beach club night.",
      "Paros: Sunset bar and live music.",
      "Ios: Pool party and island hopping.",
      "Santorini: Wine bar and night views.",
      "Naxos: Beach bonfire and DJ set.",
      "Return to Athens, farewell brunch and group photos."
    ]
  },
  {
    id: "9",
    name: "Mediterranean Flavors",
    description: "A gastronomic journey through Greece's finest cuisines and wine regions.",
    image: "https://images.unsplash.com/photo-1523294587484-bae6cc870010?auto=format&fit=crop&w=800&q=80",
    experience: "Indulge in a 7-day culinary escape. Taste the best of Greek cuisine, from fresh seafood to local cheeses and wines. Visit vineyards, meet local chefs, and enjoy gourmet meals with a view.",
    itinerary: [
      "Athens gourmet welcome dinner.",
      "Sail to Syros, wine tasting and cheese workshop.",
      "Tinos: Olive oil and honey tour.",
      "Mykonos: Seafood feast and cooking demo.",
      "Paros: Vineyard picnic and local delicacies.",
      "Naxos: Farm visit and chef's table experience.",
      "Return to Athens, farewell tasting and gift bag."
    ]
  },
  {
    id: "10",
    name: "Greek Cooking Masters",
    description: "Learn authentic Greek recipes from local chefs while sailing the islands.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    experience: "A week for aspiring chefs and foodies. Daily workshops with renowned chefs, market visits, and hands-on cooking. End each day with a shared meal and stories from Greek culinary traditions.",
    itinerary: [
      "Athens chef's welcome dinner and orientation.",
      "Sail to Syros, hands-on cooking lesson.",
      "Tinos: Market tour and pastry class.",
      "Mykonos: Seafood workshop and wine pairing.",
      "Paros: Cheese making and mezze night.",
      "Naxos: Farm visit and chef's challenge.",
      "Return to Athens, graduation lunch and certificates."
    ]
  }
];

export default adventures;
