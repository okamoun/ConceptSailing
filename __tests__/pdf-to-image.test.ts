import { pdfFirstPageToJpeg } from '../lib/pdfToImage';

// jsdom has no real canvas 2D context, so conversion is not possible here.
// The helper must reject (rather than hang or throw at import time) so the
// upload flow can fall back to storing the original PDF.
describe('pdfFirstPageToJpeg', () => {
  it('rejects when a canvas 2D context is unavailable', async () => {
    const pdf = new File(['%PDF-1.4 fake'], 'passport.pdf', { type: 'application/pdf' });
    await expect(pdfFirstPageToJpeg(pdf)).rejects.toThrow(/canvas 2D context unavailable/i);
  });
});
