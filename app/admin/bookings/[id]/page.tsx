import BookingDetailClient from './BookingDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  return <BookingDetailClient id={id} />;
}
