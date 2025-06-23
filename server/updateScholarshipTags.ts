import { db } from './db';
import { scholarships } from '../shared/scholarshipSchema';
import { eq } from 'drizzle-orm';

// Enhanced tagging generator
function generateScholarshipTags(scholarship: any): {
  countryTags: string[];
  academicLevelTags: string[];
  fundingTypeTags: string[];
  courseTagsDetailed: string[];
  primaryCountry: string;
  primaryAcademicLevel: string;
  primaryFundingType: string;
  primaryCourseCategory: string;
  searchKeywords: string;
  eligibilityHash: string;
} {
  // Country tags from all related fields
  const countryTags = Array.from(new Set([
    scholarship.providerCountry,
    ...(Array.isArray(scholarship.hostCountries) ? scholarship.hostCountries : []),
    ...(Array.isArray(scholarship.eligibleCountries) ? scholarship.eligibleCountries : [])
  ].filter(Boolean)));

  // Academic level tags with normalization
  const academicLevelTags = Array.from(new Set(
    (Array.isArray(scholarship.studyLevels) ? scholarship.studyLevels : [scholarship.studyLevels])
      .filter(Boolean)
      .map((level: string) => level.toLowerCase().trim())
  ));

  // Funding type tags
  const fundingTypeTags = [
    scholarship.fundingType,
    scholarship.fundingType === 'full' ? 'full-funding' : 'partial-funding',
    `${scholarship.fundingCurrency}-funding`
  ].filter(Boolean);

  // Course tags with detailed categorization
  const courseTagsDetailed = Array.from(new Set([
    ...(Array.isArray(scholarship.fieldCategories) ? scholarship.fieldCategories : [scholarship.fieldCategories]),
    ...(Array.isArray(scholarship.specificFields) ? scholarship.specificFields : [scholarship.specificFields])
  ].filter(Boolean).map((field: string) => field.toLowerCase().trim())));

  // Primary fields for quick lookup
  const primaryCountry = countryTags[0] || scholarship.providerCountry;
  const primaryAcademicLevel = academicLevelTags[0] || '';
  const primaryFundingType = scholarship.fundingType;
  const primaryCourseCategory = courseTagsDetailed[0] || '';

  // Search keywords for full-text search
  const searchKeywords = [
    scholarship.name,
    scholarship.shortName,
    scholarship.providerName,
    scholarship.description,
    ...countryTags,
    ...academicLevelTags,
    ...courseTagsDetailed,
    ...fundingTypeTags
  ].filter(Boolean).join(' ').toLowerCase();

  // Eligibility hash for quick matching
  const eligibilityData = {
    countries: countryTags.sort(),
    levels: academicLevelTags.sort(),
    fields: courseTagsDetailed.sort(),
    funding: scholarship.fundingType,
    gpa: scholarship.minGpa
  };
  const eligibilityHash = Buffer.from(JSON.stringify(eligibilityData)).toString('base64').slice(0, 32);

  return {
    countryTags,
    academicLevelTags,
    fundingTypeTags,
    courseTagsDetailed,
    primaryCountry,
    primaryAcademicLevel,
    primaryFundingType,
    primaryCourseCategory,
    searchKeywords,
    eligibilityHash
  };
}

// Update all existing scholarships with enhanced tags
export async function updateAllScholarshipTags() {
  console.log('[Enhanced Tags] Starting scholarship tag update...');
  
  try {
    // Get all existing scholarships
    const existingScholarships = await db.select().from(scholarships);
    
    console.log(`[Enhanced Tags] Found ${existingScholarships.length} scholarships to update`);
    
    let updated = 0;
    let errors = 0;
    
    for (const scholarship of existingScholarships) {
      try {
        // Generate enhanced tags
        const enhancedTags = generateScholarshipTags(scholarship);
        
        // Update scholarship with new tags (cast to any to fix type issues)
        await db
          .update(scholarships)
          .set({
            countryTags: enhancedTags.countryTags as any,
            academicLevelTags: enhancedTags.academicLevelTags as any,
            fundingTypeTags: enhancedTags.fundingTypeTags as any,
            courseTagsDetailed: enhancedTags.courseTagsDetailed as any,
            primaryCountry: enhancedTags.primaryCountry,
            primaryAcademicLevel: enhancedTags.primaryAcademicLevel,
            primaryFundingType: enhancedTags.primaryFundingType,
            primaryCourseCategory: enhancedTags.primaryCourseCategory,
            searchKeywords: enhancedTags.searchKeywords,
            eligibilityHash: enhancedTags.eligibilityHash,
            updatedDate: new Date()
          })
          .where(eq(scholarships.id, scholarship.id));
        
        updated++;
        console.log(`[Enhanced Tags] Updated scholarship: ${scholarship.name}`);
        
      } catch (error) {
        console.error(`[Enhanced Tags] Error updating scholarship ${scholarship.id}:`, error);
        errors++;
      }
    }
    
    console.log(`[Enhanced Tags] Update complete: ${updated} updated, ${errors} errors`);
    return { updated, errors, total: existingScholarships.length };
    
  } catch (error) {
    console.error('[Enhanced Tags] Fatal error during update:', error);
    throw error;
  }
}

// Run update if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateAllScholarshipTags()
    .then((result) => {
      console.log('Update result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Update failed:', error);
      process.exit(1);
    });
}