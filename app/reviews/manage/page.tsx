import ManageClient from './ManageClient';

interface ManagePageProps {
  searchParams: Promise<{ action?: string }>;
}

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const { action } = await searchParams;
  return <ManageClient action={(action as 'confirm' | 'edit' | 'delete') ?? 'confirm'} />;
}
