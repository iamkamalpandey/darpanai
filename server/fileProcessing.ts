import { createWorker } from 'tesseract.js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

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
      // For PDF files, we'll convert to text directly
      // Simple approach: For now, return a default message and extract the first 100 characters for preview
      const previewText = fileBuffer.toString('utf-8', 0, 1000).replace(/[^\x20-\x7E]/g, ' ');
      return `This appears to be a PDF document. Here's a preview of its content:\n\n${previewText}\n\nPlease note that complex PDF extraction is limited in this environment.`;
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
