import { extractTextFromDocument } from './fileProcessing';

/**
 * Core student information interface for different countries
 */
export interface CoreStudentInfo {
  // Basic Information
  studentName: string;
  studentId: string;
  dateOfBirth?: string;
  nationality: string;
  passportNumber?: string;
  
  // Institution Information
  institutionName: string;
  institutionAddress?: string;
  program: string;
  programLevel: string;
  duration: string;
  startDate: string;
  endDate?: string;
  
  // Academic Information
  cricos?: string; // Australia
  sevisId?: string; // USA
  casNumber?: string; // UK
  dli?: string; // Canada
  
  // Financial Information
  tuitionFee: string;
  totalCost?: string;
  currency: string;
  paymentSchedule?: string;
  
  // Country-specific fields
  countrySpecific: {
    [key: string]: any;
  };
  
  // Document metadata
  documentType: string;
  issuedDate?: string;
  country: string;
}

/**
 * Extract core student information from document text using pattern matching
 */
export function extractCoreStudentInfo(documentText: string, fileName: string): CoreStudentInfo {
  const text = documentText.toLowerCase();
  
  // Detect country based on document content
  const country = detectCountry(text);
  
  // Extract basic information
  const studentName = extractPattern(documentText, [
    /student name[:\s]+([^\n\r]+)/i,
    /name[:\s]+([a-zA-Z\s]+)/i,
    /dear\s+([a-zA-Z\s]+)/i
  ]) || 'Not specified';
  
  const studentId = extractPattern(documentText, [
    /student\s*id[:\s#]*([0-9A-Z-]+)/i,
    /id\s*number[:\s#]*([0-9A-Z-]+)/i,
    /application\s*number[:\s#]*([0-9A-Z-]+)/i
  ]) || 'Not specified';
  
  const nationality = extractPattern(documentText, [
    /nationality[:\s]+([a-zA-Z\s]+)/i,
    /citizen\s*of[:\s]+([a-zA-Z\s]+)/i,
    /from\s+([a-zA-Z\s]+)\s+passport/i
  ]) || 'Not specified';
  
  // Extract institution information
  const institutionName = extractInstitutionName(documentText, country);
  
  const program = extractPattern(documentText, [
    /program[:\s]+([^\n\r]+)/i,
    /course[:\s]+([^\n\r]+)/i,
    /degree[:\s]+([^\n\r]+)/i,
    /studying[:\s]+([^\n\r]+)/i
  ]) || 'Not specified';
  
  const programLevel = extractProgramLevel(text);
  
  const duration = extractPattern(documentText, [
    /duration[:\s]+([^\n\r]+)/i,
    /period[:\s]+([^\n\r]+)/i,
    /(\d+\s*years?\s*\d*\s*months?)/i,
    /(\d+\s*semesters?)/i
  ]) || 'Not specified';
  
  const startDate = extractPattern(documentText, [
    /start\s*date[:\s]+([^\n\r]+)/i,
    /commencement[:\s]+([^\n\r]+)/i,
    /begin[:\s]+([^\n\r]+)/i,
    /intake[:\s]+([^\n\r]+)/i
  ]) || 'Not specified';
  
  // Extract financial information
  const { tuitionFee, currency, totalCost } = extractFinancialInfo(documentText);
  
  // Extract country-specific information
  const countrySpecific = extractCountrySpecificInfo(documentText, country);
  
  return {
    studentName: cleanText(studentName),
    studentId: cleanText(studentId),
    nationality: cleanText(nationality),
    institutionName: cleanText(institutionName),
    program: cleanText(program),
    programLevel,
    duration: cleanText(duration),
    startDate: cleanText(startDate),
    tuitionFee,
    currency,
    totalCost,
    countrySpecific,
    documentType: detectDocumentType(text),
    country,
  };
}

/**
 * Detect country based on document content
 */
function detectCountry(text: string): string {
  if (text.includes('cricos') || text.includes('australia') || text.includes('aud')) {
    return 'Australia';
  }
  if (text.includes('sevis') || text.includes('usa') || text.includes('united states') || text.includes('usd')) {
    return 'USA';
  }
  if (text.includes('cas') || text.includes('united kingdom') || text.includes('uk') || text.includes('gbp')) {
    return 'UK';
  }
  if (text.includes('dli') || text.includes('canada') || text.includes('cad')) {
    return 'Canada';
  }
  return 'Other';
}

/**
 * Extract institution name with country-specific patterns
 */
function extractInstitutionName(text: string, country: string): string {
  const patterns = [
    /institution[:\s]+([^\n\r]+)/i,
    /university[:\s]+([^\n\r]+)/i,
    /college[:\s]+([^\n\r]+)/i,
    /school[:\s]+([^\n\r]+)/i,
    /institute[:\s]+([^\n\r]+)/i,
  ];
  
  // Add country-specific patterns
  if (country === 'Australia') {
    patterns.push(/pty\s+ltd[^\n\r]*/i);
  }
  
  return extractPattern(text, patterns) || 'Not specified';
}

/**
 * Extract program level
 */
function extractProgramLevel(text: string): string {
  if (text.includes('bachelor') || text.includes('undergraduate')) {
    return 'Bachelor';
  }
  if (text.includes('master') || text.includes('postgraduate')) {
    return 'Master';
  }
  if (text.includes('phd') || text.includes('doctorate')) {
    return 'PhD';
  }
  if (text.includes('diploma') || text.includes('certificate')) {
    return 'Diploma/Certificate';
  }
  return 'Not specified';
}

/**
 * Extract financial information with currency detection
 */
function extractFinancialInfo(text: string): { tuitionFee: string; currency: string; totalCost?: string } {
  // Currency patterns
  const currencyPatterns = {
    'AUD': /aud|\$\s*(?:aud|australian)/i,
    'USD': /usd|\$\s*(?:usd|us)/i,
    'GBP': /gbp|£/i,
    'CAD': /cad|\$\s*(?:cad|canadian)/i,
  };
  
  let currency = 'Not specified';
  for (const [curr, pattern] of Object.entries(currencyPatterns)) {
    if (pattern.test(text)) {
      currency = curr;
      break;
    }
  }
  
  // Tuition fee patterns
  const tuitionPatterns = [
    /tuition[:\s]*(?:fee)?[:\s]*([£$]?[\d,]+(?:\.\d{2})?)/i,
    /course\s*fee[:\s]*([£$]?[\d,]+(?:\.\d{2})?)/i,
    /program\s*cost[:\s]*([£$]?[\d,]+(?:\.\d{2})?)/i,
    /total\s*(?:tuition|cost)[:\s]*([£$]?[\d,]+(?:\.\d{2})?)/i,
  ];
  
  const tuitionFee = extractPattern(text, tuitionPatterns) || 'Not specified';
  
  const totalCostPatterns = [
    /total\s*cost[:\s]*([£$]?[\d,]+(?:\.\d{2})?)/i,
    /total\s*amount[:\s]*([£$]?[\d,]+(?:\.\d{2})?)/i,
  ];
  
  const totalCost = extractPattern(text, totalCostPatterns);
  
  return { tuitionFee: cleanText(tuitionFee), currency, totalCost: totalCost ? cleanText(totalCost) : undefined };
}

/**
 * Extract country-specific information
 */
function extractCountrySpecificInfo(text: string, country: string): { [key: string]: any } {
  const countrySpecific: { [key: string]: any } = {};
  
  switch (country) {
    case 'Australia':
      countrySpecific.cricos = extractPattern(text, [
        /cricos[:\s#]*([0-9A-Z]+)/i,
        /provider\s*code[:\s#]*([0-9A-Z]+)/i
      ]);
      countrySpecific.oshc = extractPattern(text, [
        /oshc[:\s]*([^\n\r]+)/i,
        /health\s*insurance[:\s]*([^\n\r]+)/i
      ]);
      break;
      
    case 'USA':
      countrySpecific.sevisId = extractPattern(text, [
        /sevis[:\s#]*([0-9A-Z-]+)/i,
        /i-20[:\s#]*([0-9A-Z-]+)/i
      ]);
      countrySpecific.schoolCode = extractPattern(text, [
        /school\s*code[:\s#]*([0-9A-Z]+)/i
      ]);
      break;
      
    case 'UK':
      countrySpecific.casNumber = extractPattern(text, [
        /cas[:\s#]*([0-9A-Z-]+)/i,
        /confirmation[:\s]*([0-9A-Z-]+)/i
      ]);
      countrySpecific.sponsor = extractPattern(text, [
        /sponsor[:\s]*([^\n\r]+)/i
      ]);
      break;
      
    case 'Canada':
      countrySpecific.dli = extractPattern(text, [
        /dli[:\s#]*([0-9A-Z-]+)/i,
        /designated\s*learning[:\s#]*([0-9A-Z-]+)/i
      ]);
      break;
  }
  
  return countrySpecific;
}

/**
 * Detect document type
 */
function detectDocumentType(text: string): string {
  if (text.includes('offer') && text.includes('letter')) {
    return 'Offer Letter';
  }
  if (text.includes('confirmation') && text.includes('enrollment')) {
    return 'COE';
  }
  if (text.includes('i-20')) {
    return 'I-20 Form';
  }
  if (text.includes('cas')) {
    return 'CAS Statement';
  }
  return 'Other';
}

/**
 * Extract text using regex patterns
 */
function extractPattern(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Clean extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/[:\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}