import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const TEMPLATES_DIR = path.join(UPLOADS_DIR, 'templates');

async function ensureUploadDirectories() {
  try {
    await stat(UPLOADS_DIR);
  } catch {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
  
  try {
    await stat(TEMPLATES_DIR);
  } catch {
    await mkdir(TEMPLATES_DIR, { recursive: true });
  }
}

export async function saveTemplateFile(buffer: Buffer, filename: string): Promise<string> {
  await ensureUploadDirectories();
  
  // Generate unique filename to avoid conflicts
  const timestamp = Date.now();
  const extension = path.extname(filename);
  const baseName = path.basename(filename, extension);
  const uniqueFilename = `${baseName}_${timestamp}${extension}`;
  const filePath = path.join(TEMPLATES_DIR, uniqueFilename);
  
  await writeFile(filePath, buffer);
  return path.relative(process.cwd(), filePath);
}

export async function getTemplateFile(filePath: string): Promise<Buffer> {
  const fullPath = path.join(process.cwd(), filePath);
  return await readFile(fullPath);
}

export async function deleteTemplateFile(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), filePath);
  try {
    await unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw error if file doesn't exist
  }
}

export function getFileExtension(filename: string): string {
  return path.extname(filename);
}

export function isAllowedFileType(filename: string): boolean {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
  const extension = getFileExtension(filename).toLowerCase();
  return allowedExtensions.includes(extension);
}

export function getFileSizeInBytes(buffer: Buffer): number {
  return buffer.length;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}