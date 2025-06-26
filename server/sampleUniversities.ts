import { storage } from "./storage";

export const sampleUniversities = [
  {
    name: "Massachusetts Institute of Technology",
    country: "United States",
    city: "Cambridge",
    ranking: 1,
    tuitionFee: 57986,
    acceptanceRate: 7,
    requiredGpa: 3.9,
    requiredSat: 1520,
    requiredIelts: 7.0,
    requiredToefl: 100,
    programs: ["Computer Science", "Engineering", "Physics", "Mathematics", "Business"],
    scholarships: ["MIT Need-Based Aid", "MIT Merit Scholarships"],
    researchOpportunities: true,
    campusSize: "Medium",
    studentPopulation: 11520,
    internationalStudents: 3800,
    website: "https://web.mit.edu",
    description: "Leading technology and research university with world-class engineering and science programs"
  },
  {
    name: "University of Toronto",
    country: "Canada",
    city: "Toronto",
    ranking: 34,
    tuitionFee: 58160,
    acceptanceRate: 43,
    requiredGpa: 3.7,
    requiredSat: 1350,
    requiredIelts: 6.5,
    requiredToefl: 89,
    programs: ["Computer Science", "Engineering", "Medicine", "Business", "Arts"],
    scholarships: ["Lester B. Pearson International Scholarship", "University of Toronto Scholar Award"],
    researchOpportunities: true,
    campusSize: "Large",
    studentPopulation: 97000,
    internationalStudents: 25000,
    website: "https://www.utoronto.ca",
    description: "Canada's leading university with strong research programs and diverse academic offerings"
  },
  {
    name: "University of Oxford",
    country: "United Kingdom",
    city: "Oxford",
    ranking: 5,
    tuitionFee: 47800,
    acceptanceRate: 17,
    requiredGpa: 3.8,
    requiredSat: 1470,
    requiredIelts: 7.0,
    requiredToefl: 100,
    programs: ["Law", "Medicine", "Philosophy", "History", "Engineering"],
    scholarships: ["Rhodes Scholarship", "Clarendon Fund", "Oxford-Weidenfeld and Hoffmann Scholarships"],
    researchOpportunities: true,
    campusSize: "Medium",
    studentPopulation: 24515,
    internationalStudents: 12310,
    website: "https://www.ox.ac.uk",
    description: "World's oldest English-speaking university with exceptional academic reputation"
  },
  {
    name: "University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    ranking: 42,
    tuitionFee: 45000,
    acceptanceRate: 70,
    requiredGpa: 3.5,
    requiredSat: 1280,
    requiredIelts: 6.5,
    requiredToefl: 79,
    programs: ["Medicine", "Engineering", "Business", "Law", "Arts"],
    scholarships: ["Melbourne Chancellor's Scholarship", "Australia Awards"],
    researchOpportunities: true,
    campusSize: "Large",
    studentPopulation: 51000,
    internationalStudents: 20000,
    website: "https://www.unimelb.edu.au",
    description: "Australia's leading university with strong international reputation and research excellence"
  },
  {
    name: "ETH Zurich",
    country: "Switzerland",
    city: "Zurich",
    ranking: 11,
    tuitionFee: 1460,
    acceptanceRate: 8,
    requiredGpa: 3.8,
    requiredSat: 1450,
    requiredIelts: 7.0,
    requiredToefl: 100,
    programs: ["Engineering", "Computer Science", "Mathematics", "Physics", "Architecture"],
    scholarships: ["ETH Excellence Scholarship", "Swiss Government Excellence Scholarships"],
    researchOpportunities: true,
    campusSize: "Medium",
    studentPopulation: 22200,
    internationalStudents: 8900,
    website: "https://ethz.ch",
    description: "Premier European technical university known for engineering and technology excellence"
  },
  {
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    ranking: 50,
    tuitionFee: 0,
    acceptanceRate: 8,
    requiredGpa: 3.6,
    requiredSat: 1380,
    requiredIelts: 6.5,
    requiredToefl: 88,
    programs: ["Engineering", "Computer Science", "Medicine", "Natural Sciences", "Management"],
    scholarships: ["DAAD Scholarships", "Deutschlandstipendium", "TUM Graduate School"],
    researchOpportunities: true,
    campusSize: "Large",
    studentPopulation: 45000,
    internationalStudents: 11000,
    website: "https://www.tum.de",
    description: "Leading German technical university with no tuition fees and strong industry connections"
  },
  {
    name: "University of Amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    ranking: 61,
    tuitionFee: 2314,
    acceptanceRate: 4,
    requiredGpa: 3.4,
    requiredSat: 1250,
    requiredIelts: 6.5,
    requiredToefl: 83,
    programs: ["Business", "Economics", "Psychology", "Political Science", "Medicine"],
    scholarships: ["Amsterdam Merit Scholarship", "Holland Scholarship", "Orange Tulip Scholarship"],
    researchOpportunities: true,
    campusSize: "Large",
    studentPopulation: 41000,
    internationalStudents: 7000,
    website: "https://www.uva.nl",
    description: "Prestigious Dutch university with diverse programs and affordable European education"
  },
  {
    name: "KTH Royal Institute of Technology",
    country: "Sweden",
    city: "Stockholm",
    ranking: 89,
    tuitionFee: 0,
    acceptanceRate: 36,
    requiredGpa: 3.3,
    requiredSat: 1200,
    requiredIelts: 6.5,
    requiredToefl: 79,
    programs: ["Engineering", "Computer Science", "Architecture", "Technology", "Industrial Engineering"],
    scholarships: ["Swedish Institute Scholarships", "KTH Scholarship"],
    researchOpportunities: true,
    campusSize: "Medium",
    studentPopulation: 13500,
    internationalStudents: 3200,
    website: "https://www.kth.se",
    description: "Leading Scandinavian technical university with no tuition fees for EU students"
  }
];

export async function initializeSampleUniversities() {
  try {
    console.log("Checking if universities exist in database...");
    const existingUniversities = await storage.getAllUniversities();
    
    if (existingUniversities.length === 0) {
      console.log("No universities found. Adding sample universities...");
      
      for (const university of sampleUniversities) {
        try {
          await storage.createUniversity(university);
          console.log(`Added university: ${university.name}`);
        } catch (error) {
          console.error(`Failed to add university ${university.name}:`, error);
        }
      }
      
      console.log(`Successfully added ${sampleUniversities.length} sample universities`);
    } else {
      console.log(`Found ${existingUniversities.length} universities already in database`);
    }
  } catch (error) {
    console.error("Error initializing sample universities:", error);
  }
}