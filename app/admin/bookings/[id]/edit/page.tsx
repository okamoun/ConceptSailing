import BookingEditClient from './BookingEditClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookingEditPage({ params }: Props) {
  const { id } = await params;
  return <BookingEditClient id={id} />;
}
