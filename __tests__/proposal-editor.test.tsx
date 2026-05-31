jest.mock('../lib/availability', () => ({
  getCharterById: jest.fn(),
  updateCharter: jest.fn().mockResolvedValue(undefined),
  initCharterProposal: jest.fn().mockResolvedValue('new-proposal-token'),
  updateCharterProposal: jest.fn().mockResolvedValue(undefined),
  markCharterProposalSent: jest.fn().mockResolvedValue(undefined),
  addCharterProposalComment: jest.fn().mockResolvedValue(undefined),
  proposalRef: jest.fn().mockReturnValue('PROP-CHARTER1'),
  calcTotals: jest.fn().mockReturnValue({
    base: 0, apa: 0, vat: 0, extrasSum: 0, discount: 0, charterFee: 0, grandTotal: 0,
  }),
  DEFAULT_PAYMENT_TERMS: [
    { label: 'Deposit — 50%', percentage: 50, description: 'MYBA: 50% deposit on signing.' },
    { label: 'Balance — 50%', percentage: 50, description: 'MYBA: 50% balance 28 days before.' },
  ],
  DEFAULT_PRICING: {
    basePrice: 0, currency: 'EUR', apaPercentage: 25, vatPercentage: 13,
    securityDeposit: 2000, discountPercentage: 0, extras: [],
  },
}));

jest.mock('../lib/financial', () => ({
  getPricingConfig: jest.fn().mockResolvedValue({
    highSeasonRate: 24000, midSeasonRate: 21000, lowSeasonRate: 18000,
    apaPercent: 25, vatPercent: 13, relocationFee: 1000,
  }),
  getSeasonTier: jest.fn().mockReturnValue('mid'),
}));

jest.mock('../app/marinas-data', () => ({
  getMarinaById: jest.fn().mockReturnValue(null),
}));

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProposalEditorClient from '../app/admin/proposals/[id]/ProposalEditorClient';
import {
  getCharterById,
  updateCharter,
  initCharterProposal,
  updateCharterProposal,
  markCharterProposalSent,
  addCharterProposalComment,
} from '../lib/availability';

const mockGetCharter = getCharterById as jest.MockedFunction<typeof getCharterById>;
const mockUpdateCharter = updateCharter as jest.MockedFunction<typeof updateCharter>;
const mockInitProposal = initCharterProposal as jest.MockedFunction<typeof initCharterProposal>;
const mockUpdateProposal = updateCharterProposal as jest.MockedFunction<typeof updateCharterProposal>;
const mockSentProposal = markCharterProposalSent as jest.MockedFunction<typeof markCharterProposalSent>;
const mockAddComment = addCharterProposalComment as jest.MockedFunction<typeof addCharterProposalComment>;

const DRAFT_PROPOSAL = {
  token: 'tok-draft-abc123',
  status: 'draft' as const,
  pricing: {
    basePrice: 8000, currency: 'EUR', apaPercentage: 25, vatPercentage: 13,
    securityDeposit: 2000, discountPercentage: 0, extras: [],
  },
  paymentTerms: [
    { label: 'Custom Term 1', percentage: 60, description: 'Custom 60% up front.' },
    { label: 'Custom Term 2', percentage: 40, description: 'Custom 40% later.' },
  ],
  comments: [],
  expiresAt: '2026-06-15',
  sentAt: null,
  viewedAt: null,
};

const CHARTER_NO_PROPOSAL = {
  id: 'charter-new',
  status: 'booked' as const,
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  name: 'Marie Martin',
  email: 'marie@example.com',
  phone: '+33 6 00 11 22 33',
  boat: 'BlueOne — Fountaine Pajot Aura 51',
  passengers: 4,
  createdAt: null,
};

const CHARTER_WITH_DRAFT = {
  id: 'charter-draft',
  status: 'booked' as const,
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  name: 'Pierre Blanc',
  email: 'pierre@example.com',
  phone: '+33 6 11 22 33 44',
  boat: 'BlueOne — Fountaine Pajot Aura 51',
  passengers: 2,
  createdAt: null,
  proposal: DRAFT_PROPOSAL,
};

const CHARTER_WITH_COMMENTS = {
  ...CHARTER_WITH_DRAFT,
  id: 'charter-comments',
  proposal: {
    ...DRAFT_PROPOSAL,
    comments: [
      {
        id: 'c1', author: 'Pierre Blanc',
        text: 'Can we get a skipper?',
        createdAt: '2026-05-01T10:00:00Z', isAdmin: false,
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: second getCharterById call (refresh after save) returns same charter
  mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
});

describe('ProposalEditorClient — loading and error states', () => {
  it('shows a loading indicator before data arrives', () => {
    mockGetCharter.mockReturnValue(new Promise(() => {}));
    render(<ProposalEditorClient id="charter-draft" />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows "Booking not found." when getCharterById returns null', async () => {
    mockGetCharter.mockResolvedValue(null);
    render(<ProposalEditorClient id="unknown-id" />);
    expect(await screen.findByText('Booking not found.')).toBeInTheDocument();
  });
});

describe('ProposalEditorClient — create vs edit mode', () => {
  it('shows "Create Proposal" heading and submit button when no proposal exists', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_NO_PROPOSAL as any);
    render(<ProposalEditorClient id="charter-new" />);
    // Both the heading and the submit button show "Create Proposal"
    const headings = await screen.findAllByText('Create Proposal');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Edit Proposal" heading when proposal already exists', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    expect(await screen.findByText('Edit Proposal')).toBeInTheDocument();
  });

  it('shows "Save Changes" submit button when proposal already exists', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    expect(await screen.findByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });
});

describe('ProposalEditorClient — form pre-population', () => {
  it('pre-populates client name from the charter document', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    expect(await screen.findByDisplayValue('Pierre Blanc')).toBeInTheDocument();
  });

  it('pre-populates client email from the charter document', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    expect(await screen.findByDisplayValue('pierre@example.com')).toBeInTheDocument();
  });

  it('pre-populates start and end dates', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    await screen.findByDisplayValue('Pierre Blanc');
    expect(screen.getByDisplayValue('2026-07-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-07-08')).toBeInTheDocument();
  });

  it('renders the proposal reference in the header', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    await screen.findByText('Edit Proposal');
    expect(screen.getByText('PROP-CHARTER1')).toBeInTheDocument();
  });
});

describe('ProposalEditorClient — shareable link', () => {
  it('shows the Client Link section when a token exists', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    expect(await screen.findByText('Client Link')).toBeInTheDocument();
  });

  it('shows the token in the link URL', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    await screen.findByText('Client Link');
    expect(screen.getByText(/tok-draft-abc123/)).toBeInTheDocument();
  });

  it('does NOT show the Client Link section before a proposal is created', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_NO_PROPOSAL as any);
    render(<ProposalEditorClient id="charter-new" />);
    await screen.findAllByText('Create Proposal');
    expect(screen.queryByText('Client Link')).not.toBeInTheDocument();
  });
});

describe('ProposalEditorClient — save flow', () => {
  it('calls initCharterProposal on the first save (no existing proposal)', async () => {
    // Return no-proposal charter for both initial load and the refresh after save
    mockGetCharter.mockResolvedValue(CHARTER_NO_PROPOSAL as any);
    mockInitProposal.mockResolvedValue('new-proposal-token');

    render(<ProposalEditorClient id="charter-new" />);
    await screen.findAllByText('Create Proposal');

    fireEvent.click(screen.getByRole('button', { name: 'Create Proposal' }));

    await waitFor(() => {
      expect(mockInitProposal).toHaveBeenCalledWith('charter-new');
    });
    expect(mockUpdateProposal).toHaveBeenCalled();
    expect(mockUpdateCharter).toHaveBeenCalled();
  });

  it('does NOT call initCharterProposal when proposal already exists', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    await screen.findByRole('button', { name: 'Save Changes' });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(mockUpdateProposal).toHaveBeenCalled();
    });
    expect(mockInitProposal).not.toHaveBeenCalled();
  });

  it('shows a validation error when required fields are missing', async () => {
    mockGetCharter.mockResolvedValue({ ...CHARTER_NO_PROPOSAL, name: '' } as any);
    const { container } = render(<ProposalEditorClient id="charter-new" />);
    await screen.findAllByText('Create Proposal');

    // Use fireEvent.submit directly to bypass jsdom's HTML5 required-field validation,
    // so the component's own JS validation runs and sets the error state.
    fireEvent.submit(container.querySelector('form')!);

    expect(await screen.findByText('Please fill in client name, email, and charter dates.')).toBeInTheDocument();
    expect(mockInitProposal).not.toHaveBeenCalled();
  });
});

describe('ProposalEditorClient — send to client', () => {
  it('shows "Send to Client" button for draft proposals', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    expect(await screen.findByText('📤 Send to Client')).toBeInTheDocument();
  });

  it('calls markCharterProposalSent when "Send to Client" is clicked', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    await screen.findByText('📤 Send to Client');

    fireEvent.click(screen.getByText('📤 Send to Client'));

    await waitFor(() => {
      expect(mockSentProposal).toHaveBeenCalledWith('charter-draft');
    });
  });
});

describe('ProposalEditorClient — payment terms', () => {
  it('renders payment term labels from the charter proposal', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    expect(await screen.findByDisplayValue('Custom Term 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Custom Term 2')).toBeInTheDocument();
  });

  it('resets payment terms to MYBA defaults when the reset button is clicked', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    await screen.findByDisplayValue('Custom Term 1');

    fireEvent.click(screen.getByText('Reset to MYBA defaults'));

    expect(await screen.findByDisplayValue('Deposit — 50%')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Balance — 50%')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Custom Term 1')).not.toBeInTheDocument();
  });
});

describe('ProposalEditorClient — admin reply', () => {
  it('renders the reply form when there are existing comments', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_COMMENTS as any);
    render(<ProposalEditorClient id="charter-comments" />);
    expect(await screen.findByPlaceholderText('Reply to client…')).toBeInTheDocument();
  });

  it('calls addCharterProposalComment with isAdmin: true on reply submit', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_COMMENTS as any);
    render(<ProposalEditorClient id="charter-comments" />);
    const replyInput = await screen.findByPlaceholderText('Reply to client…');

    fireEvent.change(replyInput, { target: { value: 'Of course, we can include a skipper.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reply' }));

    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith(
        'charter-comments',
        { author: 'BlueOne Team', text: 'Of course, we can include a skipper.', isAdmin: true },
        'draft'
      );
    });
  });

  it('does NOT show the reply form when there are no comments', async () => {
    mockGetCharter.mockResolvedValue(CHARTER_WITH_DRAFT as any);
    render(<ProposalEditorClient id="charter-draft" />);
    await screen.findByText('Edit Proposal');
    expect(screen.queryByPlaceholderText('Reply to client…')).not.toBeInTheDocument();
  });
});
