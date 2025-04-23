import { createWorker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Extracts text from an uploaded document (PDF, JPG, PNG)
 * @param fileBuffer The file buffer
 * @param fileExtension The file extension (e.g., .pdf, .jpg, .png)
 * @returns Extracted text
 */
export async function extractTextFromDocument(
  fileBuffer: Buffer, 
  fileExtension: string
): Promise<string> {
  try {
    // Handle based on file type
    if (fileExtension === '.pdf') {
      // For PDFs, we'll apply basic extraction logic
      // This just extracts readable text portions from the PDF buffer
      return extractBasicTextFromPdf(fileBuffer);
    } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
      return extractTextFromImage(fileBuffer);
    } else {
      throw new Error('Unsupported file format');
    }
  } catch (error) {
    console.error('Error extracting text from document:', error);
    throw new Error('Failed to extract text from the document');
  }
}

/**
 * Extracts basic text from a PDF document
 * This method doesn't require additional libraries but has limited capabilities
 * @param pdfBuffer The PDF file buffer
 * @returns Extracted text
 */
function extractBasicTextFromPdf(pdfBuffer: Buffer): string {
  try {
    // Convert buffer to string and filter out non-printable characters
    let text = pdfBuffer.toString('utf-8');
    
    // Extract text that looks like readable content
    // This is a basic approach that works for some PDFs but not all
    const textLines: string[] = [];
    
    // Regular expression to match potential text content
    // This pattern looks for sequences of printable ASCII characters
    const textPattern = /([A-Za-z0-9 .,;:'"()\[\]{}\-+*/\\&%$#@!?<>|=_]){4,}/g;
    
    // Find all matches
    const matches = text.match(textPattern);
    
    if (matches && matches.length > 0) {
      // Join and clean up the extracted text
      text = matches.join(' ')
        .replace(/\\n/g, '\n')       // Convert \n to actual newlines
        .replace(/\s+/g, ' ')        // Replace multiple whitespace with a single space
        .trim();
      
      return text;
    }
    
    return "The PDF file has been processed, but readable text extraction was limited. " +
           "Please ensure your document contains selectable text rather than scanned images of text.";
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return "Unable to process this PDF file. It may be corrupted or password-protected.";
  }
}

/**
 * Extracts text from an image using OCR
 * @param imageBuffer The image file buffer
 * @returns Extracted text
 */
async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    // Initialize Tesseract.js worker
    const worker = await createWorker('eng');
    
    // Recognize text in the image
    const { data } = await worker.recognize(imageBuffer);
    
    // Terminate the worker
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
}
