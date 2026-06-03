import type { Metadata } from 'next';
import ExperienceEditorClient from './ExperienceEditorClient';

export const metadata: Metadata = {
  title: 'Experience Editor | Admin',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExperienceEditorPage({ params }: Props) {
  const { id } = await params;
  return <ExperienceEditorClient id={id} />;
}
