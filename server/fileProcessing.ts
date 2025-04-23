import { createWorker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';

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
    console.log(`Extracting text from file with extension: ${fileExtension}`);
    
    // Handle based on file type
    if (fileExtension === '.pdf') {
      return await extractTextFromPdf(fileBuffer);
    } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
      return await extractTextFromImage(fileBuffer);
    } else {
      throw new Error('Unsupported file format');
    }
  } catch (error) {
    console.error('Error extracting text from document:', error);
    throw new Error('Failed to extract text from the document: ' + (error as Error).message);
  }
}

/**
 * Enhanced PDF text extraction using pdf-parse library
 * @param pdfBuffer The PDF file buffer
 * @returns Extracted text
 */
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log('Using pdf-parse to extract text from PDF');
    
    // Parse PDF using pdf-parse library
    const data = await pdfParse(pdfBuffer);
    
    // Check if we got reasonable text content
    if (data.text && data.text.length > 20) {
      console.log(`Successfully extracted ${data.text.length} characters from PDF`);
      return data.text;
    }
    
    // Fallback to basic extraction if pdf-parse result is too short
    console.log('PDF parsing returned insufficient text, trying basic extraction');
    return extractBasicTextFromPdf(pdfBuffer);
  } catch (error) {
    console.error('Error using pdf-parse:', error);
    console.log('Falling back to basic PDF text extraction');
    
    // Fallback to basic extraction method
    return extractBasicTextFromPdf(pdfBuffer);
  }
}

/**
 * Basic text extraction from PDF for fallback
 * @param pdfBuffer The PDF file buffer
 * @returns Extracted text
 */
function extractBasicTextFromPdf(pdfBuffer: Buffer): string {
  try {
    // Convert buffer to string and filter out non-printable characters
    let text = pdfBuffer.toString('utf-8');
    
    // Extract text that looks like readable content
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
      
      console.log(`Basic extraction found ${matches.length} text segments, total length: ${text.length}`);
      return text;
    }
    
    console.log('Basic PDF extraction failed to find readable text');
    return "The PDF file has been processed, but readable text extraction was limited. " +
           "Please ensure your document contains selectable text rather than scanned images of text.";
  } catch (error) {
    console.error('Error with basic PDF text extraction:', error);
    return "Unable to process this PDF file. It may be corrupted or password-protected.";
  }
}

/**
 * Enhanced text extraction from images using Tesseract.js OCR
 * @param imageBuffer The image file buffer
 * @returns Extracted text
 */
async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    console.log('Starting OCR processing for image');
    
    // Initialize Tesseract.js worker with English language
    const worker = await createWorker('eng');
    
    // Recognize text in the image
    console.log('Running OCR recognition...');
    const { data } = await worker.recognize(imageBuffer);
    
    // Terminate the worker
    await worker.terminate();
    
    console.log(`OCR extracted ${data.text.length} characters of text`);
    
    if (data.text.length < 10) {
      console.log('OCR extracted very little text, might be an issue with the image');
      return "The image was processed, but very little text could be extracted. " +
             "Please ensure the image is clear and contains visible text.";
    }
    
    return data.text;
  } catch (error) {
    console.error('Error extracting text from image with OCR:', error);
    throw new Error('Failed to extract text from image: ' + (error as Error).message);
  }
}
