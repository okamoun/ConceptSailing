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
      "Safety Equipment & First Aid",
      "Navigation & Communication Systems"
    ]
  }
];
