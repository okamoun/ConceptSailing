// Script to update experience images with better paths and organization

const adventures = [
  {
    id: "1",
    name: "Wind Sports Adventure",
    currentImage: "/adventures/wind_sports_adventure.jpg",
    newImage: "/adventures/wind-sports-luxury.jpg",
    prompt: "Luxury catamaran windsurfing Greek islands action"
  },
  {
    id: "2", 
    name: "Family Sailing School",
    currentImage: "/adventures/OpenAI/family_sailing_school.png",
    newImage: "/adventures/family-sailing-learning.jpg",
    prompt: "Family learning sail luxury catamaran Greek waters"
  },
  {
    id: "3",
    name: "Yoga & Wellness Retreat", 
    currentImage: "/adventures/yoga___wellness_retreat.jpg",
    newImage: "/adventures/yoga-wellness-yacht.jpg",
    prompt: "Yoga meditation luxury yacht sunrise Greek islands"
  },
  {
    id: "4",
    name: "Cleansing & Renewal",
    currentImage: "/adventures/OpenAI/cleansing___renewal.png", 
    newImage: "/adventures/wellness-detox-sailing.jpg",
    prompt: "Luxury sailing wellness retreat spa Greek islands"
  },
  {
    id: "5",
    name: "Greek Heritage Explorer",
    currentImage: "/adventures/OpenAI/greek_heritage_explorer.png",
    newImage: "/adventures/greek-heritage-sailing.jpg", 
    prompt: "Luxury catamaran ancient Greek temple ruins cultural"
  },
  {
    id: "6",
    name: "Culinary Traditions",
    currentImage: "/adventures/OpenAI/culinary_traditions.png",
    newImage: "/adventures/culinary-sailing-greek.jpg",
    prompt: "Chef cooking Mediterranean cuisine luxury yacht Greek"
  },
  {
    id: "7",
    name: "Family Bonding Adventure",
    currentImage: "/adventures/OpenAI/family_bonding_adventure.png",
    newImage: "/adventures/family-bonding-sunset.jpg",
    prompt: "Family sunset luxury catamaran Greek islands bonding"
  },
  {
    id: "8",
    name: "Island Nightlife",
    currentImage: "/adventures/OpenAI/island_nightlife.png",
    newImage: "/adventures/island-nightlife-yacht.jpg",
    prompt: "Luxury yacht Greek island harbor nightlife vibrant"
  },
  {
    id: "9",
    name: "Sephardic Heritage Sailing",
    currentImage: "/adventures/OpenAI/sephardic_heritage_sailing.png",
    newImage: "/adventures/sephardic-heritage-sailing.jpg",
    prompt: "Cultural heritage sailing Greek Jewish history Thessaloniki"
  },
  {
    id: "10",
    name: "Mediterranean Flavors",
    currentImage: "/adventures/OpenAI/mediterranean_flavors.png",
    newImage: "/adventures/mediterranean-cuisine-yacht.jpg",
    prompt: "Mediterranean cuisine luxury yacht Greek food wine"
  },
  {
    id: "11",
    name: "Greek Cooking Masters",
    currentImage: "/adventures/OpenAI/greek_cooking_masters.png",
    newImage: "/adventures/greek-cooking-yacht.jpg",
    prompt: "Greek cooking class luxury yacht chef Mediterranean"
  },
  {
    id: "12",
    name: "Greek Islands Family Bike Adventure",
    currentImage: "/adventures/OpenAI/greek_islands_family_bike_adventure.png",
    newImage: "/adventures/family-bike-sailing.jpg",
    prompt: "Family cycling Greek islands luxury catamaran adventure"
  },
  {
    id: "13",
    name: "Ionian Fishing & Island Discovery",
    currentImage: "/adventures/OpenAI/ionian_fishing___island_discovery.png",
    newImage: "/adventures/ionian-fishing-yacht.jpg",
    prompt: "Fishing luxury yacht Ionian Sea Greek islands Zakynthos"
  },
  {
    id: "14",
    name: "Romantic Aegean Cruise",
    currentImage: "/adventures/OpenAI/romantic_aegean_cruise.png",
    newImage: "/adventures/romantic-sailing-cruise.jpg",
    prompt: "Romantic couple luxury yacht sunset Greek islands proposal"
  }
];

console.log("Experience Image Update Plan");
console.log("==========================");
console.log("Generate these images using AI tools like Midjourney, DALL-E, or Stable Diffusion:");
console.log("");

adventures.forEach((adventure, index) => {
  console.log(`${index + 1}. ${adventure.name}`);
  console.log(`   Prompt: ${adventure.prompt}`);
  console.log(`   Save as: ${adventure.newImage}`);
  console.log(`   Replace: ${adventure.currentImage}`);
  console.log("");
});

console.log("After generating images, update the adventures-data.ts file with the new paths.");
console.log("Recommended size: 1200x800px minimum, high quality JPEG format");
