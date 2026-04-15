import ManageClient from './ManageClient';

interface ManagePageProps {
  searchParams: Promise<{ token?: string; action?: string }>;
}

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const { token, action } = await searchParams;
  return <ManageClient token={token ?? ''} action={(action as 'confirm' | 'edit' | 'delete') ?? 'confirm'} />;
}
