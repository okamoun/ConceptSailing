import ProposalEditorClient from './ProposalEditorClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProposalEditorPage({ params }: Props) {
  const { id } = await params;
  return <ProposalEditorClient id={id} />;
}
