import * as Yup from "yup";
const now = new Date();
const tenYearsAgo = new Date(
  new Date().setFullYear(new Date().getFullYear() - 10)
);
const phoneRegExp = /^9\d{9}$/;
const isValidIELTSScore = (value: any) => {
  const score = parseFloat(value);
  return score >= 0 && score <= 9 && (score * 10) % 5 === 0;
};
const isValidPTEScore = (value: any) => {
  const score = parseFloat(value);
  return score >= 10 && score <= 90 && Math.floor(score) === score;
};

// Validation for a single PTE score field
const pteScoreValidation = Yup.string()
  .nullable()
  .test(
    "is-valid-pte-score",
    "PTE score must be between 10 and 90 in whole numbers",
    (value) => !value || isValidPTEScore(value)
  );
// Validation for a single IELTS score field
const ieltsScoreValidation = Yup.string()
  .nullable()
  .test(
    "is-valid-ielts-score",
    "IELTS score must be between 0 and 9 in 0.5 increments",
    (value) => !value || isValidIELTSScore(value)
  );
export const leadValidationSchema = Yup.object().shape({
  first_name: Yup.string().required(),
  last_name: Yup.string().required(),

  gender: Yup.string().nullable(),
  address: Yup.string().nullable(),

  phone_number: Yup.string()
    .matches(phoneRegExp, "Phone number is not valid!")
    .required("Phone number is required"),
  email: Yup.string().matches(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    "Invalid Email"
  ),
  interested_course: Yup.string().nullable(),
  field_of_study: Yup.string().nullable(),
  slc_institution_name: Yup.string().nullable(),
  slc_grade: Yup.string()
    .nullable()
    .test(
      "is-non-negative",
      "SLC grade cannot be negative",
      (value) => !value || parseFloat(value) >= 0
    ),
  slc_year: Yup.string().nullable(),
  highschool_institution_name: Yup.string().nullable(),
  highschool_grade: Yup.string()
    .nullable()
    .test(
      "is-non-negative",
      "Highschool grade cannot be negative",
      (value) => !value || parseFloat(value) >= 0
    ),
  highschool_year: Yup.string().nullable(),
  bachelors_institution_name: Yup.string().nullable(),
  bachelors_grade: Yup.string()
    .nullable()
    .test(
      "is-non-negative",
      "Bachelors grade cannot be negative",
      (value) => !value || parseFloat(value) >= 0
    ),
  bachelors_year: Yup.string().nullable(),
  masters_institution_name: Yup.string().nullable(),
  masters_grade: Yup.string()
    .nullable()
    .test(
      "is-non-negative",
      "Masters grade cannot be negative",
      (value) => !value || parseFloat(value) >= 0
    ),
  masters_year: Yup.string().nullable(),
  ielts_overall_score: ieltsScoreValidation.test(
    "is-valid-range",
    "IELTS overall score must be between 0 and 9",
    (value) => !value || (parseFloat(value) >= 0 && parseFloat(value) <= 9)
  ),
  ielts_listening_score: ieltsScoreValidation,
  ielts_speaking_score: ieltsScoreValidation,
  ielts_reading_score: ieltsScoreValidation,
  ielts_writing_score: ieltsScoreValidation,
  ielts_date: Yup.string().nullable(),
  pte_overall_score: pteScoreValidation,
  pte_listening_score: pteScoreValidation,
  pte_speaking_score: pteScoreValidation,
  pte_reading_score: pteScoreValidation,
  pte_writing_score: pteScoreValidation,
  pte_date: Yup.string().nullable(),
  sat_overall_score: Yup.string()
    .nullable()
    .test(
      "is-non-negative",
      "SAT overall score cannot be negative",
      (value) => !value || parseFloat(value) >= 0
    ),
  sat_math_score: Yup.string()
    .nullable()
    .test(
      "is-non-negative",
      "SAT math score cannot be negative",
      (value) => !value || parseFloat(value) >= 0
    ),
  sat_reading_score: Yup.string()
    .nullable()
    .test(
      "is-non-negative",
      "SAT reading score cannot be negative",
      (value) => !value || parseFloat(value) >= 0
    ),
  sat_writing_and_language_score: Yup.string()
    .nullable()
    .test(
      "is-non-negative",
      "SAT writing and language score cannot be negative",
      (value) => !value || parseFloat(value) >= 0
    ),
  sat_date: Yup.string().nullable(),
});
