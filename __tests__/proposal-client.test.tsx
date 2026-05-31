jest.mock('../lib/availability', () => ({
  getCharterByProposalToken: jest.fn(),
  markCharterProposalViewed: jest.fn().mockResolvedValue(undefined),
  addCharterProposalComment: jest.fn().mockResolvedValue(undefined),
  approveCharterProposal: jest.fn().mockResolvedValue(undefined),
  rejectCharterProposal: jest.fn().mockResolvedValue(undefined),
  calcTotals: jest.fn().mockReturnValue({
    base: 10000, apa: 3000, extrasSum: 0, discount: 0, charterFee: 10000, grandTotal: 15000,
  }),
  proposalRef: jest.fn().mockReturnValue('PROP-CHARTER1'),
}));

jest.mock('../app/marinas-data', () => ({
  getMarinaById: jest.fn().mockReturnValue(null),
}));

jest.mock('../app/config/contact', () => ({
  CONTACT: {
    email: 'contact@test.com',
    phone: { formatted: '+33 6 00 00 00 00' },
    company: { name: 'Test Co' },
  },
}));

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProposalClient from '../app/proposal/[token]/ProposalClient';
import {
  getCharterByProposalToken,
  markCharterProposalViewed,
  addCharterProposalComment,
  approveCharterProposal,
  rejectCharterProposal,
} from '../lib/availability';

const mockGet = getCharterByProposalToken as jest.MockedFunction<typeof getCharterByProposalToken>;
const mockViewed = markCharterProposalViewed as jest.MockedFunction<typeof markCharterProposalViewed>;
const mockComment = addCharterProposalComment as jest.MockedFunction<typeof addCharterProposalComment>;
const mockApprove = approveCharterProposal as jest.MockedFunction<typeof approveCharterProposal>;
const mockReject = rejectCharterProposal as jest.MockedFunction<typeof rejectCharterProposal>;

const BASE_PROPOSAL = {
  token: 'abc123def456',
  status: 'sent' as const,
  pricing: {
    basePrice: 10000, currency: 'EUR', apaPercentage: 30,
    securityDeposit: 2000, discountPercentage: 0, extras: [],
  },
  paymentTerms: [
    { label: 'Deposit — 50%', percentage: 50, description: '50% due on signing of MYBA.' },
    { label: 'Balance — 50%', percentage: 50, description: '50% due 28 days before.' },
  ],
  comments: [],
  expiresAt: '2026-06-01',
  sentAt: null,
  viewedAt: null,
};

const BASE_CHARTER = {
  id: 'charter-123',
  status: 'booked' as const,
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  phone: '+33 6 12 34 56 78',
  boat: 'BlueOne — Fountaine Pajot Aura 51',
  passengers: 4,
  deliveryPoint: 'alimos',
  redeliveryPoint: 'alimos',
  createdAt: null,
  proposal: BASE_PROPOSAL,
};

beforeEach(() => {
  jest.clearAllMocks();
  window.print = jest.fn();
});

describe('ProposalClient — loading and error states', () => {
  it('shows a loading message before the fetch resolves', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<ProposalClient token="abc123def456" />);
    expect(screen.getByText('Loading proposal…')).toBeInTheDocument();
  });

  it('shows the not-found view when the token returns null', async () => {
    mockGet.mockResolvedValue(null);
    render(<ProposalClient token="bad-token" />);
    expect(await screen.findByText('Proposal Not Found')).toBeInTheDocument();
    expect(screen.getByText('contact@test.com')).toBeInTheDocument();
  });

  it('shows the not-found view when the fetch rejects', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<ProposalClient token="bad-token" />);
    expect(await screen.findByText('Proposal Not Found')).toBeInTheDocument();
  });
});

describe('ProposalClient — data display', () => {
  it('renders the client name and email in the "Prepared for" section', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    expect(await screen.findByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('jean@example.com')).toBeInTheDocument();
    expect(screen.getByText('+33 6 12 34 56 78')).toBeInTheDocument();
  });

  it('renders the proposal reference in the header', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    expect(await screen.findByText('PROP-CHARTER1')).toBeInTheDocument();
  });

  it('renders the vessel and passengers', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');
    expect(screen.getByText('BlueOne — Fountaine Pajot Aura 51')).toBeInTheDocument();
    expect(screen.getByText('4 passengers')).toBeInTheDocument();
  });

  it('renders company contact info from CONTACT config', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');
    expect(screen.getByText('Test Co')).toBeInTheDocument();
  });
});

describe('ProposalClient — mark as viewed', () => {
  it('calls markCharterProposalViewed when status is "sent"', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER); // status: 'sent'
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');
    expect(mockViewed).toHaveBeenCalledWith('charter-123');
  });

  it('does NOT call markCharterProposalViewed when status is "viewed"', async () => {
    mockGet.mockResolvedValue({
      ...BASE_CHARTER,
      proposal: { ...BASE_PROPOSAL, status: 'viewed' as const },
    });
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');
    expect(mockViewed).not.toHaveBeenCalled();
  });

  it('does NOT call markCharterProposalViewed when status is "approved"', async () => {
    mockGet.mockResolvedValue({
      ...BASE_CHARTER,
      proposal: { ...BASE_PROPOSAL, status: 'approved' as const },
    });
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');
    expect(mockViewed).not.toHaveBeenCalled();
  });
});

describe('ProposalClient — approve / reject', () => {
  it('shows approve and decline buttons when status allows action', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER); // status: 'sent' → canAct
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');
    expect(screen.getByText('✓ Approve This Proposal')).toBeInTheDocument();
    expect(screen.getByText('✕ Decline')).toBeInTheDocument();
  });

  it('does NOT show approve/decline buttons when proposal is already approved', async () => {
    mockGet.mockResolvedValue({
      ...BASE_CHARTER,
      proposal: { ...BASE_PROPOSAL, status: 'approved' as const },
    });
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');
    expect(screen.queryByText('✓ Approve This Proposal')).not.toBeInTheDocument();
    expect(screen.getByText('Proposal Approved')).toBeInTheDocument();
  });

  it('approve flow: shows confirmation then calls approveCharterProposal', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');

    fireEvent.click(screen.getByText('✓ Approve This Proposal'));
    expect(await screen.findByText('Yes, Approve')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Approve'));
    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledWith('charter-123');
    });
  });

  it('approve flow: cancel returns to initial buttons', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');

    fireEvent.click(screen.getByText('✓ Approve This Proposal'));
    await screen.findByText('Yes, Approve');

    fireEvent.click(screen.getByText('Cancel'));
    expect(await screen.findByText('✓ Approve This Proposal')).toBeInTheDocument();
    expect(mockApprove).not.toHaveBeenCalled();
  });

  it('reject flow: shows confirmation then calls rejectCharterProposal', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');

    fireEvent.click(screen.getByText('✕ Decline'));
    expect(await screen.findByText('Yes, Decline')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Decline'));
    await waitFor(() => {
      expect(mockReject).toHaveBeenCalledWith('charter-123');
    });
  });
});

describe('ProposalClient — comment form', () => {
  it('submits a comment with isAdmin: false', async () => {
    // Use 'viewed' status to avoid the auto-mark-viewed transition changing state
    // before the comment is submitted.
    const viewedCharter = {
      ...BASE_CHARTER,
      proposal: { ...BASE_PROPOSAL, status: 'viewed' as const },
    };
    mockGet.mockResolvedValue(viewedCharter);
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');

    fireEvent.change(screen.getByPlaceholderText('Jean Dupont'), {
      target: { value: 'A Reviewer' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ask a question or leave feedback…'), {
      target: { value: 'Can we adjust the APA?' },
    });
    fireEvent.click(screen.getByText('Send Message'));

    await waitFor(() => {
      expect(mockComment).toHaveBeenCalledWith(
        'charter-123',
        { author: 'A Reviewer', text: 'Can we adjust the APA?', isAdmin: false },
        'viewed'
      );
    });
  });

  it('shows a success message after comment is sent', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');

    fireEvent.change(screen.getByPlaceholderText('Jean Dupont'), {
      target: { value: 'A Reviewer' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ask a question or leave feedback…'), {
      target: { value: 'Great proposal!' },
    });
    fireEvent.click(screen.getByText('Send Message'));

    expect(await screen.findByText('Message sent — thank you!')).toBeInTheDocument();
  });

  it('does not show the comment form for draft proposals', async () => {
    mockGet.mockResolvedValue({
      ...BASE_CHARTER,
      proposal: { ...BASE_PROPOSAL, status: 'draft' as const },
    });
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');
    expect(screen.queryByPlaceholderText('Ask a question or leave feedback…')).not.toBeInTheDocument();
  });
});

describe('ProposalClient — print', () => {
  it('renders the Download PDF button and calls window.print on click', async () => {
    mockGet.mockResolvedValue(BASE_CHARTER);
    render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');

    const printBtn = screen.getByText('⬇ Download PDF');
    expect(printBtn).toBeInTheDocument();
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
