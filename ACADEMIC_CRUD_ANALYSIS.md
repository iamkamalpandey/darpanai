# Academic Qualification CRUD Operations Analysis

## Overview
This document analyzes the complete CRUD (Create, Read, Update, Delete) operations pattern for academic qualification information in the Darpan Intelligence platform.

## Data Structure
Academic qualification includes 7 core fields:
- `highestQualification` (string): Degree level (Bachelor's Degree, Master's Degree, etc.)
- `highestInstitution` (string): Institution name
- `highestCountry` (string): Country of education
- `highestGpa` (string): GPA or grade percentage
- `graduationYear` (number): Year of graduation
- `currentAcademicGap` (number): Years since graduation (auto-calculated)
- `educationHistory` (string): Additional education details

## CRUD Operations Pattern

### CREATE Operation
**Endpoint**: `PATCH /api/user/complete-profile`
**Flow**:
1. Frontend collects academic data via ProfileSectionEditor form
2. Data validated against academic validation rules
3. Section-specific fields filtered and sent to backend
4. Backend validates using Zod schema
5. Storage layer uses `setField()` pattern to add new academic fields
6. Database updated via Drizzle ORM with proper type handling

```typescript
// Example CREATE payload
{
  "highestQualification": "Bachelor's Degree",
  "highestInstitution": "University of Technology",
  "highestCountry": "India",
  "highestGpa": "85",
  "graduationYear": 2023,
  "currentAcademicGap": 2
}
```

### READ Operation
**Endpoint**: `GET /api/user`
**Flow**:
1. Frontend requests user profile data
2. Backend retrieves complete user object from database
3. Academic fields included in response with proper type casting
4. Frontend updates form data and profile display

### UPDATE Operation
**Endpoint**: `PATCH /api/user/complete-profile`
**Flow**:
1. Same as CREATE - uses upsert pattern
2. `setField()` helper only updates provided fields
3. Undefined fields are preserved (no overwrite)
4. Auto-calculation of currentAcademicGap based on graduationYear
5. Database transaction ensures data consistency

```typescript
// Storage layer pattern for academic fields
setField('highestQualification', profileData.highestQualification);
setField('highestInstitution', profileData.highestInstitution);
setField('highestCountry', profileData.highestCountry);
setField('highestGpa', profileData.highestGpa);
setField('graduationYear', profileData.graduationYear);
setField('currentAcademicGap', profileData.currentAcademicGap);
setField('educationHistory', profileData.educationHistory);
```

### DELETE Operation
**Pattern**: Soft delete via null values
- No explicit DELETE endpoint
- Fields set to null when cleared
- Database constraints preserve data integrity
- Academic gap recalculated when graduation year cleared

## Validation Rules
Academic section has 4 mandatory fields:
1. `highestQualification` - Required for profile completion
2. `highestInstitution` - Required for profile completion
3. `highestGpa` - Required for profile completion
4. `graduationYear` - Required with range validation (1980-current year +10)

Optional fields:
- `highestCountry`, `currentAcademicGap`, `educationHistory`

### Advanced Validation
- Graduation year must be between 1980 and current year + 10
- Academic gap auto-calculated: `currentYear - graduationYear`
- GPA accepts both percentage (0-100) and scale (0-4.0) formats

## Data Flow Example
Server logs show successful academic operations:
```
Profile update request body: { 
  highestQualification: "Bachelor's Degree",
  highestInstitution: "Kuvempu",
  highestGpa: "95",
  graduationYear: 2023
}
Validated data: { 
  highestQualification: "Bachelor's Degree",
  highestInstitution: "Kuvempu", 
  highestGpa: "95",
  graduationYear: 2023
}
Updated user: { 
  ...
  highestQualification: "Bachelor's Degree",
  highestInstitution: "Kuvempu",
  highestGpa: "95", 
  graduationYear: 2023,
  currentAcademicGap: 2
  ...
}
```

## Error Handling
- Frontend validation prevents invalid submissions
- Backend Zod validation catches malformed data
- Database constraints ensure data integrity
- Success/error feedback based on actual persistence verification

## Performance Optimizations
- Section-specific field filtering reduces payload size
- Cache invalidation only on successful updates
- React Query optimizes data fetching and caching
- Auto-calculation reduces frontend computation

## Security Considerations
- Authentication required for all operations
- User can only modify their own academic data
- Input sanitization prevents injection attacks
- Academic data properly validated for authenticity

## Integration Points
- Profile completion percentage calculation
- Academic gap auto-calculation
- Study destination AI recommendations
- Scholarship matching algorithms