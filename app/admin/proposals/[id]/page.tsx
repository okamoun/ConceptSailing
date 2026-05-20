import ProposalEditorClient from './ProposalEditorClient';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ charterId?: string }>;
}

export default async function ProposalEditorPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { charterId } = await searchParams;
  return <ProposalEditorClient id={id} prefillCharterId={charterId} />;
}
