jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { POST } from '../app/api/contact-confirmation/route';

const mockCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }));
});

function makeRequest(body: unknown) {
  return { json: async () => body } as never;
}

const VALID_BODY = {
  name: 'Marie Martin',
  email: 'marie@example.com',
  phone: '+33 6 00 11 22 33',
  message: 'We would love a week around the Cyclades in September for 4 guests.',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/contact-confirmation', () => {
  it('returns the AI-generated confirmation message', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Dear Marie,\n\nThank you for your enquiry...' } }],
    });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toContain('Dear Marie');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('sends the guest details to OpenAI in the prompt', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Confirmation.' } }],
    });

    await POST(makeRequest(VALID_BODY));

    const prompt = mockCreate.mock.calls[0][0].messages[0].content as string;
    expect(prompt).toContain('Marie Martin');
    expect(prompt).toContain('marie@example.com');
    expect(prompt).toContain('Cyclades in September');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ name: 'Marie', email: '', message: '' }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 500 when OpenAI throws', async () => {
    mockCreate.mockRejectedValue(new Error('OpenAI down'));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Confirmation generation failed');
  });

  it('returns 500 when OpenAI returns an empty message', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: '   ' } }] });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
  });
});
