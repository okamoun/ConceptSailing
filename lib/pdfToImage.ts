// Client-only helper: rasterize the first page of a PDF to a JPEG blob using
// pdf.js. Passport copies uploaded as PDFs are converted to images so they
// display and print inline in the crew manifest (a browser can't print a
// cross-origin PDF <object>). Throws when rendering isn't possible (e.g. no
// DOM / no canvas) so callers can fall back to storing the original file.

export async function pdfFirstPageToJpeg(
  file: Blob,
  maxWidth = 1600,
  quality = 0.85,
): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('pdf-to-image: no DOM available');
  }
  // Probe canvas 2D support before loading pdf.js — jsdom (tests) returns null.
  const probe = document.createElement('canvas');
  if (!probe.getContext('2d')) {
    throw new Error('pdf-to-image: canvas 2D context unavailable');
  }

  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  try {
    const page = await pdf.getPage(1);

    const base = page.getViewport({ scale: 1 });
    // Scale up to maxWidth for a crisp copy, but never beyond 2x.
    const scale = Math.min(Math.max(maxWidth / base.width, 1), 2);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('pdf-to-image: no 2D context');

    // White backdrop so transparent regions render/print as white, not black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob) throw new Error('pdf-to-image: canvas.toBlob returned null');
    return blob;
  } finally {
    pdf.destroy();
  }
}
