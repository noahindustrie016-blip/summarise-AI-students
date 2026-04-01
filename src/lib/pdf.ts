import * as pdfjsLib from 'pdfjs-dist';

// Use a stable version of pdfjs-dist and ensure the worker is loaded correctly
const PDFJS_VERSION = '4.0.379'; 
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    console.log('Extracting text from PDF:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the document with specific options for better compatibility
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully. Total pages:', pdf.numPages);
    
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => {
            if ('str' in item) return item.str;
            return '';
          })
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageErr) {
        console.warn(`Warning: Could not read page ${i}:`, pageErr);
      }
    }

    const trimmedText = fullText.trim();
    if (!trimmedText) {
      throw new Error("We couldn't find any text in this PDF. It might be a scanned image or a protected file. Try a different document!");
    }

    return trimmedText;
  } catch (err) {
    console.error('Detailed PDF Extraction Error:', err);
    if (err instanceof Error) {
      if (err.message.includes('Worker')) {
        throw new Error("PDF engine failed to start. Please refresh the page and try again.");
      }
      throw err;
    }
    throw new Error("An unknown error occurred while reading your PDF. Please try another file.");
  }
}
