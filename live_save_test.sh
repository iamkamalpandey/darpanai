#!/bin/bash

echo "=== COMPREHENSIVE SAVE FUNCTION TEST - ALL SECTIONS ==="
echo "Testing data validation, persistence, and retrieval"
echo ""

# Test 1: Personal Information Save
echo "1. Testing Personal Information Save..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "firstName": "SaveTest",
    "lastName": "PersonalData",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1995-05-15",
    "gender": "Male",
    "nationality": "Nepal",
    "passportNumber": "SAVE123456",
    "secondaryNumber": "+9876543210",
    "address": "123 Save Test Street, Test City, Test State 12345"
  }' | jq -r '.message // .error'

sleep 2

# Test 2: Academic Information Save
echo "2. Testing Academic Information Save..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "highestQualification": "Master'\''s Degree",
    "highestInstitution": "Save Test University",
    "highestCountry": "USA",
    "highestGpa": "3.8",
    "graduationYear": 2020,
    "currentAcademicGap": 5
  }' | jq -r '.message // .error'

sleep 2

# Test 3: Study Preferences Save
echo "3. Testing Study Preferences Save..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "interestedCourse": "Computer Science Save Test",
    "fieldOfStudy": "Technology",
    "preferredIntake": "Fall 2025",
    "budgetRange": "50000-75000",
    "preferredCountries": ["USA", "Canada", "Australia"]
  }' | jq -r '.message // .error'

sleep 2

# Test 4: Financial Information Save
echo "4. Testing Financial Information Save..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "fundingSource": "Self-funded",
    "estimatedBudget": "50000-75000",
    "savingsAmount": "25000-50000",
    "loanApproval": true,
    "loanAmount": 30000,
    "sponsorDetails": "Family Support Save Test",
    "financialDocuments": true
  }' | jq -r '.message // .error'

sleep 2

# Test 5: Employment Information Save
echo "5. Testing Employment Information Save..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "currentEmploymentStatus": "Employed",
    "workExperienceYears": 3,
    "jobTitle": "Software Developer Save Test",
    "organizationName": "Tech Company Save Test",
    "fieldOfWork": "Information Technology"
  }' | jq -r '.message // .error'

sleep 2

# Test 6: Language Proficiency Save
echo "6. Testing Language Proficiency Save..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "englishProficiencyTests": [{
      "testType": "IELTS",
      "overallScore": "7.5",
      "reading": "8.0",
      "writing": "7.0",
      "speaking": "7.5",
      "listening": "8.0",
      "testDate": "2024-01-15",
      "expiryDate": "2026-01-15"
    }]
  }' | jq -r '.message // .error'

sleep 2

echo ""
echo "=== VERIFICATION: RETRIEVING SAVED DATA ==="
echo "Fetching user profile to verify all saves..."

curl -s "http://localhost:5000/api/user/fresh" \
  -H "Cookie: $(cat cookies.txt)" | jq '{
    personal: {
      firstName: .firstName,
      lastName: .lastName,
      phoneNumber: .phoneNumber,
      dateOfBirth: .dateOfBirth,
      gender: .gender,
      nationality: .nationality,
      passportNumber: .passportNumber,
      address: .address
    },
    academic: {
      highestQualification: .highestQualification,
      highestInstitution: .highestInstitution,
      highestCountry: .highestCountry,
      highestGpa: .highestGpa,
      graduationYear: .graduationYear,
      currentAcademicGap: .currentAcademicGap
    },
    study: {
      interestedCourse: .interestedCourse,
      fieldOfStudy: .fieldOfStudy,
      preferredIntake: .preferredIntake,
      budgetRange: .budgetRange,
      preferredCountries: .preferredCountries
    },
    financial: {
      fundingSource: .fundingSource,
      estimatedBudget: .estimatedBudget,
      savingsAmount: .savingsAmount,
      loanApproval: .loanApproval,
      loanAmount: .loanAmount,
      sponsorDetails: .sponsorDetails,
      financialDocuments: .financialDocuments
    },
    employment: {
      currentEmploymentStatus: .currentEmploymentStatus,
      workExperienceYears: .workExperienceYears,
      jobTitle: .jobTitle,
      organizationName: .organizationName,
      fieldOfWork: .fieldOfWork
    },
    language: {
      englishProficiencyTests: .englishProficiencyTests
    }
  }'

echo ""
echo "=== VALIDATION TESTS ==="

# Test invalid birth date (future date)
echo "7. Testing Invalid Birth Date (Future Date)..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "dateOfBirth": "2030-01-01"
  }' | jq -r '.message // .error'

sleep 1

# Test invalid passport format
echo "8. Testing Invalid Passport Format..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "passportNumber": "123"
  }' | jq -r '.message // .error'

sleep 1

# Test invalid GPA percentage
echo "9. Testing Invalid GPA Percentage..."
curl -s -X PATCH "http://localhost:5000/api/user/complete-profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "highestGpa": "150%"
  }' | jq -r '.message // .error'

echo ""
echo "=== SAVE FUNCTION TEST COMPLETE ==="