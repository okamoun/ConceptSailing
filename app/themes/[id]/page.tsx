import { notFound } from 'next/navigation';
import Link from 'next/link';
import adventures from '../../adventures-data';

type PageProps = {
  params: { id: string };
};

export function generateStaticParams(): Promise<{ id: string }[]> {
  return Promise.resolve(adventures.map((adv) => ({ id: adv.id })));
}

export default function AdventureThemePage({ params }: PageProps) {
  const adventure = adventures.find((a) => a.id === params.id);
  if (!adventure) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold mb-4 text-blue-900">{adventure.name}</h1>
      <p className="text-lg mb-6 text-gray-700">{adventure.description}</p>
      <div className="mb-8">
        <img src={adventure.image} alt={adventure.name} className="rounded-lg shadow-lg w-full h-72 object-cover mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-blue-700">7-Day Experience</h2>
        <p className="mb-4 text-gray-800">{adventure.experience}</p>
        <h3 className="text-xl font-semibold mb-2 text-blue-600">Sample Itinerary</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          {adventure.itinerary.map((day, i) => (
            <li key={i}><span className="font-semibold">Day {i + 1}:</span> {day}</li>
          ))}
        </ol>
      </div>
      <Link href="/themes" className="text-blue-600 hover:underline">← Back to all adventures</Link>
    </div>
  );
}
