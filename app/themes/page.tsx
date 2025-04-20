import adventures from '../adventures-data';
import Link from 'next/link';

export default function ThemesPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-900">Adventure Themes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {adventures.map((adv) => (
          <div key={adv.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <img src={adv.image} alt={adv.name} className="h-56 w-full object-cover" />
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-2xl font-bold mb-2 text-blue-800">{adv.name}</h2>
              <p className="mb-4 text-gray-700">{adv.description}</p>
              <Link href={`/themes/${adv.id}`} className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-lg transition-colors text-center">View 7-Day Experience</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
