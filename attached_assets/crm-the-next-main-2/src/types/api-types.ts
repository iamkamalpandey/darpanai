export interface LoginValues {
  email: string;
  password: string;
}
export interface Lead {
  id?: number; // Assuming `id` is the primary key. Use `uid` if you have a specific UUID field.
  first_name: string;
  last_name: string;
  gender?: string;
  phone_number: string;
  email?: string;
  address?: string;
  dob?: Date | string; // Accepting both Date object or ISO string for flexibility
  interested_course?: string;

  // Updated to reflect a many-to-many relationship through a join table or related model structure
  interested_countries?: CountryInterest[];

  field_of_study?: string;
  slc_institution_name?: string;
  slc_grade?: string;
  slc_year?: number;
  highschool_institution_name?: string;
  highschool_grade?: string;
  highschool_year?: number;
  bachelors_institution_name?: string;

  bachelors_grade?: string;
  bachelors_year?: number;
  masters_institution_name?: string;
  masters_grade?: string;
  masters_year?: number;
  ielts_overall_score?: number;
  ielts_taken?: boolean;
  listening_score?: number;
  speaking_score?: number;
  reading_score?: number;
  writing_score?: number;
  createdAt?: string;
}

// Updated Country interface
export interface Country {
  id: number;
  name: string;
  signature: string;
}

// Additional interface to represent the join table or related model for country interests
export interface CountryInterest {
  leadId?: number; // Optional if creating new and ID not yet assigned
  countryId: number;
  country?: Country; // Optional nested object to include country details if needed
}
