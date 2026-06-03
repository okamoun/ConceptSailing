import adventures from '@/app/adventures-data';
import type { Adventure } from '@/app/adventures-data';
import { getAllCustomExperiences } from './experiences';

export async function getAllExperiences(): Promise<Adventure[]> {
  const customList = await getAllCustomExperiences();

  const customMapped: Adventure[] = customList.map(c => ({
    id: `custom-${c.id}`,
    name: c.name,
    description: c.description,
    image: c.image ?? '/adventures/beach.jpg',
    experience: c.experience,
    itinerary: c.itinerary,
    features: c.features,
    partnerName: c.partnerName,
    partnerUrl: c.partnerUrl,
  }));

  return [...adventures, ...customMapped];
}
