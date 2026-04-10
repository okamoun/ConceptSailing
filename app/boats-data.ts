export type Boat = {
  name: string;
  brand: string;
  length: string;
  description: string;
  image: string;
  features?: string[];
};

export const boats: Boat[] = [
    {
    name: "BlueOne",
    brand: "Fountaine Pajot",
    length: "51 ft",
    description: "A new-generation catamaran with a focus on eco-responsibility, solar panels, and hybrid systems. Elegant design with full safety and entertainment options for guests.",
    image: "/images/boats/fp-aura51.jpg",
    features: [
      "Starlink High-Speed Internet",
      "Solar Panels & Hybrid Systems",
      "Air Conditioning Throughout",
      "Watermaker",
      "Ice Maker",
      "Full Kitchen Equipment",
      "BBQ Grill",
      "Outdoor Speakers",
      "Smart TV & Entertainment System",
      "Premium Sound System",
      "Professional Crew (Captain & Chef)",
      "Water Toys & Snorkeling Gear",
      "Fishing Equipment",
      "Stand-Up Paddleboards",
      "Kayaks",
      "Safety Equipment & First Aid",
      "Navigation & Communication Systems"
    ]
  },
  {
    name: "Fountaine Pajot Saba 50",
    brand: "Fountaine Pajot",
    length: "50 ft",
    description: "A luxury, eco-friendly catamaran with spacious living areas, solar panels, watermaker, and all modern safety and leisure equipment. Ideal for family and group charters.",
    image: "/images/boats/fp-saba50.jpg"
  },
  {
    name: "Lagoon 52F",
    brand: "Lagoon",
    length: "52 ft",
    description: "A premier catamaran offering comfort, stability, and green technology. Features large cabins, a flybridge, and extensive leisure gear. Perfect for sustainable luxury sailing.",
    image: "/images/boats/lagoon-55.jpg"
  },

  {
    name: "Lagoon 55",
    brand: "Lagoon",
    length: "55 ft",
    description: "Flagship of Lagoon's fleet, this catamaran combines luxury, innovation, and environmental care. Expansive decks, water toys, and the latest in security equipment.",
    image: "/images/boats/lagoon-55.jpg"
  }
];
