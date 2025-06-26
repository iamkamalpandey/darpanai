import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, Globe, DollarSign, User, FileText, ArrowRight, ArrowLeft, 
  Clock, Target, BookOpen, MapPin, Award, Building2, Calendar, CheckCircle2,
  AlertCircle, Info, Star, TrendingUp, Users, Zap
} from "lucide-react";
import { z } from "zod";

// Comprehensive Assessment Schema
const advancedAssessmentSchema = z.object({
  // Personal Information
  personalInfo: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Phone number is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    nationality: z.string().min(1, "Nationality is required"),
    currentCountry: z.string().min(1, "Current country is required"),
    languagesProficient: z.array(z.string()).min(1, "At least one language required"),
  }),

  // Academic Background
  academicBackground: z.object({
    currentEducationLevel: z.string().min(1, "Education level is required"),
    fieldOfStudy: z.string().min(1, "Field of study is required"),
    institutionName: z.string().min(1, "Institution name is required"),
    graduationYear: z.string().min(1, "Graduation year is required"),
    gpa: z.string().min(1, "GPA is required"),
    gradingScale: z.string().min(1, "Grading scale is required"),
    academicAchievements: z.string().optional(),
    researchExperience: z.string().optional(),
  }),

  // Study Preferences
  studyPreferences: z.object({
    intendedLevel: z.string().min(1, "Intended study level is required"),
    studyField: z.string().min(1, "Study field is required"),
    specificPrograms: z.array(z.string()),
    studyMode: z.string().min(1, "Study mode is required"),
    startSemester: z.string().min(1, "Start semester is required"),
    studyDuration: z.string().min(1, "Study duration is required"),
    researchInterest: z.string().optional(),
    careerGoals: z.string().min(1, "Career goals are required"),
  }),

  // Geographic Preferences
  geographicPreferences: z.object({
    preferredCountries: z.array(z.string()).min(1, "At least one country required"),
    preferredCities: z.array(z.string()),
    climatePreference: z.string().min(1, "Climate preference is required"),
    culturalPreferences: z.array(z.string()),
    languageRequirements: z.array(z.string()),
    proximityToHome: z.string().min(1, "Proximity preference is required"),
  }),

  // Financial Planning
  financialPlanning: z.object({
    annualBudget: z.string().min(1, "Annual budget is required"),
    tuitionBudget: z.string().min(1, "Tuition budget is required"),
    livingExpensesBudget: z.string().min(1, "Living expenses budget is required"),
    fundingSources: z.array(z.string()).min(1, "At least one funding source required"),
    scholarshipInterest: z.string().min(1, "Scholarship interest is required"),
    workPermitInterest: z.string().min(1, "Work permit interest is required"),
    financialSupport: z.string().min(1, "Financial support is required"),
  }),

  // Test Scores & Requirements
  testScores: z.object({
    englishTest: z.string().optional(),
    englishScore: z.string().optional(),
    englishTestDate: z.string().optional(),
    standardizedTest: z.string().optional(),
    standardizedScore: z.string().optional(),
    standardizedTestDate: z.string().optional(),
    gmatGre: z.string().optional(),
    gmatGreScore: z.string().optional(),
    otherTests: z.string().optional(),
  }),

  // Lifestyle & Personal Factors
  lifestyleFactors: z.object({
    accommodationType: z.string().min(1, "Accommodation type is required"),
    campusSize: z.string().min(1, "Campus size preference is required"),
    socialEnvironment: z.string().min(1, "Social environment preference is required"),
    extracurriculars: z.array(z.string()),
    dietaryRequirements: z.string().optional(),
    healthConditions: z.string().optional(),
    transportationNeeds: z.string().optional(),
    technologyAccess: z.string().min(1, "Technology access is required"),
  }),

  // Additional Requirements
  additionalRequirements: z.object({
    visaSupport: z.string().min(1, "Visa support preference is required"),
    internshipOpportunities: z.string().min(1, "Internship interest is required"),
    industryConnections: z.string().min(1, "Industry connections interest is required"),
    alumniNetwork: z.string().min(1, "Alumni network importance is required"),
    postGraduation: z.string().min(1, "Post-graduation plans are required"),
    specialNeeds: z.string().optional(),
    additionalComments: z.string().optional(),
  }),
});

type AdvancedAssessmentFormData = z.infer<typeof advancedAssessmentSchema>;

// Standardized Study Categories
const studyCategories = {
  "Engineering & Technology": [
    "Computer Science & IT", "Electrical Engineering", "Mechanical Engineering", 
    "Civil Engineering", "Chemical Engineering", "Aerospace Engineering", 
    "Software Engineering", "Data Science & Analytics", "Cybersecurity", 
    "Artificial Intelligence", "Robotics", "Biomedical Engineering"
  ],
  "Business & Management": [
    "Business Administration", "Finance & Banking", "Marketing & Sales", 
    "International Business", "Entrepreneurship", "Supply Chain Management", 
    "Human Resources", "Project Management", "Digital Marketing", 
    "E-commerce", "Business Analytics", "Corporate Strategy"
  ],
  "Health & Medicine": [
    "Medicine", "Nursing", "Dentistry", "Pharmacy", "Public Health", 
    "Physiotherapy", "Psychology", "Biomedical Sciences", "Veterinary Medicine", 
    "Health Administration", "Nutrition & Dietetics", "Medical Research"
  ],
  "Natural Sciences": [
    "Biology & Life Sciences", "Chemistry", "Physics", "Mathematics", 
    "Environmental Science", "Geology", "Astronomy", "Marine Biology", 
    "Biotechnology", "Genetics", "Neuroscience", "Materials Science"
  ],
  "Social Sciences & Humanities": [
    "International Relations", "Political Science", "Sociology", "Anthropology", 
    "History", "Philosophy", "Literature", "Linguistics", "Archaeology", 
    "Cultural Studies", "Gender Studies", "Religious Studies"
  ],
  "Arts & Creative Fields": [
    "Fine Arts", "Graphic Design", "Architecture", "Interior Design", 
    "Film & Media Production", "Music", "Theatre Arts", "Fashion Design", 
    "Photography", "Digital Arts", "Animation", "Creative Writing"
  ],
  "Education & Teaching": [
    "Elementary Education", "Secondary Education", "Special Education", 
    "Educational Leadership", "Curriculum Development", "Educational Technology", 
    "Early Childhood Education", "Adult Education", "TESOL/TEFL", 
    "Educational Psychology", "Learning Sciences", "Educational Administration"
  ],
  "Law & Legal Studies": [
    "General Law", "International Law", "Corporate Law", "Criminal Law", 
    "Environmental Law", "Human Rights Law", "Intellectual Property Law", 
    "Maritime Law", "Tax Law", "Constitutional Law", "Legal Studies", "Paralegal Studies"
  ]
};

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "FI", name: "Finland", flag: "🇫🇮" }
];

const languages = [
  "English", "French", "German", "Spanish", "Italian", "Portuguese", 
  "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Mandarin Chinese", 
  "Japanese", "Korean", "Arabic", "Hindi", "Russian", "Other"
];

interface AdvancedAssessmentProps {
  onSubmit: (data: AdvancedAssessmentFormData) => void;
  isLoading?: boolean;
}

export default function AdvancedAssessment({ onSubmit, isLoading = false }: AdvancedAssessmentProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const form = useForm<AdvancedAssessmentFormData>({
    resolver: zodResolver(advancedAssessmentSchema),
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        nationality: "",
        currentCountry: "",
        languagesProficient: [],
      },
      academicBackground: {
        currentEducationLevel: "",
        fieldOfStudy: "",
        institutionName: "",
        graduationYear: "",
        gpa: "",
        gradingScale: "",
        academicAchievements: "",
        researchExperience: "",
      },
      studyPreferences: {
        intendedLevel: "",
        studyField: "",
        specificPrograms: [],
        studyMode: "",
        startSemester: "",
        studyDuration: "",
        researchInterest: "",
        careerGoals: "",
      },
      geographicPreferences: {
        preferredCountries: [],
        preferredCities: [],
        climatePreference: "",
        culturalPreferences: [],
        languageRequirements: [],
        proximityToHome: "",
      },
      financialPlanning: {
        annualBudget: "",
        tuitionBudget: "",
        livingExpensesBudget: "",
        fundingSources: [],
        scholarshipInterest: "",
        workPermitInterest: "",
        financialSupport: "",
      },
      testScores: {
        englishTest: "",
        englishScore: "",
        englishTestDate: "",
        standardizedTest: "",
        standardizedScore: "",
        standardizedTestDate: "",
        gmatGre: "",
        gmatGreScore: "",
        otherTests: "",
      },
      lifestyleFactors: {
        accommodationType: "",
        campusSize: "",
        socialEnvironment: "",
        extracurriculars: [],
        dietaryRequirements: "",
        healthConditions: "",
        transportationNeeds: "",
        technologyAccess: "",
      },
      additionalRequirements: {
        visaSupport: "",
        internshipOpportunities: "",
        industryConnections: "",
        alumniNetwork: "",
        postGraduation: "",
        specialNeeds: "",
        additionalComments: "",
      },
    },
  });

  const handleNext = async () => {
    const currentStepValid = await form.trigger(getFieldsForStep(step));
    if (currentStepValid && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (data: AdvancedAssessmentFormData) => {
    onSubmit(data);
  };

  const getFieldsForStep = (stepNumber: number): (keyof AdvancedAssessmentFormData)[] => {
    switch (stepNumber) {
      case 1: return ["personalInfo"];
      case 2: return ["academicBackground"];
      case 3: return ["studyPreferences"];
      case 4: return ["geographicPreferences"];
      case 5: return ["financialPlanning"];
      case 6: return ["testScores"];
      case 7: return ["lifestyleFactors"];
      case 8: return ["additionalRequirements"];
      default: return [];
    }
  };

  const getStepIcon = (stepNumber: number) => {
    const icons = [
      <User className="w-5 h-5" />,
      <GraduationCap className="w-5 h-5" />,
      <BookOpen className="w-5 h-5" />,
      <Globe className="w-5 h-5" />,
      <DollarSign className="w-5 h-5" />,
      <Award className="w-5 h-5" />,
      <Building2 className="w-5 h-5" />,
      <Target className="w-5 h-5" />
    ];
    return icons[stepNumber - 1];
  };

  const getStepTitle = (stepNumber: number) => {
    const titles = [
      "Personal Information",
      "Academic Background", 
      "Study Preferences",
      "Geographic Preferences",
      "Financial Planning",
      "Test Scores & Requirements",
      "Lifestyle & Personal Factors",
      "Additional Requirements"
    ];
    return titles[stepNumber - 1];
  };

  const getStepDescription = (stepNumber: number) => {
    const descriptions = [
      "Tell us about yourself and your background",
      "Share your current academic status and achievements",
      "Define your study goals and program preferences",
      "Choose your preferred study destinations",
      "Plan your education investment and funding",
      "Provide your test scores and certifications",
      "Share your lifestyle preferences and needs",
      "Any additional requirements or special considerations"
    ];
    return descriptions[stepNumber - 1];
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">AI-Powered University Matching</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Personalized Study Abroad Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete our comprehensive assessment to receive AI-powered university recommendations tailored to your goals
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{step} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-3" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  stepNumber < step 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : stepNumber === step 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {stepNumber < step ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    getStepIcon(stepNumber)
                  )}
                </div>
                <span className={`text-xs mt-2 text-center font-medium ${
                  stepNumber <= step ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  Step {stepNumber}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              {getStepIcon(step)}
              <CardTitle className="text-2xl font-bold text-gray-900">
                {getStepTitle(step)}
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-gray-600">
              {getStepDescription(step)}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {step === 1 && (
                  <PersonalInfoStep form={form} countries={countries} languages={languages} />
                )}
                {step === 2 && (
                  <AcademicBackgroundStep form={form} studyCategories={studyCategories} />
                )}
                {step === 3 && (
                  <StudyPreferencesStep form={form} studyCategories={studyCategories} />
                )}
                {step === 4 && (
                  <GeographicPreferencesStep form={form} countries={countries} languages={languages} />
                )}
                {step === 5 && (
                  <FinancialPlanningStep form={form} />
                )}
                {step === 6 && (
                  <TestScoresStep form={form} />
                )}
                {step === 7 && (
                  <LifestyleFactorsStep form={form} />
                )}
                {step === 8 && (
                  <AdditionalRequirementsStep form={form} />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={step === 1}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating Recommendations...
                        </>
                      ) : (
                        <>
                          Generate Recommendations
                          <Star className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Assessment Tips</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Be as specific as possible with your preferences for better matches</li>
                <li>• All required fields must be completed to proceed to the next step</li>
                <li>• Your responses are saved automatically as you progress</li>
                <li>• The more detailed your answers, the more accurate your recommendations will be</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function PersonalInfoStep({ form, countries, languages }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="personalInfo.fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Full Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter your full legal name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="personalInfo.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Email Address *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="your.email@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="personalInfo.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Phone Number *</FormLabel>
            <FormControl>
              <Input placeholder="+1 (555) 123-4567" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="personalInfo.dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Date of Birth *</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="personalInfo.nationality"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Nationality *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your nationality" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="personalInfo.currentCountry"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Current Country of Residence *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your current country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="personalInfo.languagesProficient"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Languages You're Proficient In *</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {languages.map((language) => (
                  <FormField
                    key={language}
                    control={form.control}
                    name="personalInfo.languagesProficient"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={language}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(language)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, language])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== language
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {language}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function AcademicBackgroundStep({ form, studyCategories }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="academicBackground.currentEducationLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Current Education Level *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="diploma">Diploma/Certificate</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="doctoral">Doctoral Degree</SelectItem>
                  <SelectItem value="professional">Professional Degree</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="academicBackground.fieldOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Current Field of Study *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your field" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(studyCategories).map(([category, fields]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-sm font-semibold text-gray-900 bg-gray-100">
                        {category}
                      </div>
                      {fields.map((field) => (
                        <SelectItem key={field} value={field} className="pl-4">
                          {field}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="academicBackground.institutionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Institution Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter your current institution" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="academicBackground.graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Graduation Year *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="academicBackground.gpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">GPA/Grade *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 3.8, 85%, First Class" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="academicBackground.gradingScale"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Grading Scale *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grading scale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="4.0">4.0 Scale</SelectItem>
                  <SelectItem value="10.0">10.0 Scale</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                  <SelectItem value="uk-class">UK Classification</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="academicBackground.academicAchievements"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Academic Achievements</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="List any academic honors, awards, publications, or notable achievements..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="academicBackground.researchExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Research Experience</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe any research projects, internships, or relevant work experience..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function StudyPreferencesStep({ form, studyCategories }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="studyPreferences.intendedLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Intended Study Level *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select study level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="foundation">Foundation/Pathway Program</SelectItem>
                  <SelectItem value="diploma">Diploma/Certificate</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="doctoral">Doctoral/PhD</SelectItem>
                  <SelectItem value="professional">Professional Degree</SelectItem>
                  <SelectItem value="exchange">Exchange Program</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="studyPreferences.studyField"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Intended Field of Study *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your intended field" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(studyCategories).map(([category, fields]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-sm font-semibold text-gray-900 bg-gray-100">
                        {category}
                      </div>
                      {fields.map((field) => (
                        <SelectItem key={field} value={field} className="pl-4">
                          {field}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="studyPreferences.studyMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Study Mode *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select study mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="distance">Distance Learning</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="studyPreferences.startSemester"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Preferred Start Semester *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start semester" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fall-2025">Fall 2025 (Sep-Oct)</SelectItem>
                  <SelectItem value="spring-2026">Spring 2026 (Jan-Feb)</SelectItem>
                  <SelectItem value="summer-2026">Summer 2026 (May-Jun)</SelectItem>
                  <SelectItem value="fall-2026">Fall 2026 (Sep-Oct)</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="studyPreferences.studyDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Expected Study Duration *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="6-months">6 months</SelectItem>
                  <SelectItem value="1-year">1 year</SelectItem>
                  <SelectItem value="2-years">2 years</SelectItem>
                  <SelectItem value="3-years">3 years</SelectItem>
                  <SelectItem value="4-years">4 years</SelectItem>
                  <SelectItem value="5-years">5+ years</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="studyPreferences.careerGoals"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Career Goals *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your career aspirations and how this degree will help achieve them..."
                className="min-h-[120px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="studyPreferences.researchInterest"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Research Interests</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe any specific research areas or topics you're interested in pursuing..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function GeographicPreferencesStep({ form, countries, languages }: any) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="geographicPreferences.preferredCountries"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Study Countries *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {countries.map((country: any) => (
                <FormField
                  key={country.code}
                  control={form.control}
                  name="geographicPreferences.preferredCountries"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={country.code}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(country.name)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, country.name])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== country.name
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {country.flag} {country.name}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="geographicPreferences.climatePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Climate Preference *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select climate preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tropical">Tropical (Hot & Humid)</SelectItem>
                  <SelectItem value="temperate">Temperate (Mild Seasons)</SelectItem>
                  <SelectItem value="continental">Continental (Cold Winters, Warm Summers)</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean (Dry Summers, Mild Winters)</SelectItem>
                  <SelectItem value="polar">Polar (Cold Year-round)</SelectItem>
                  <SelectItem value="no-preference">No Preference</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="geographicPreferences.proximityToHome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Proximity to Home *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="very-close">Very Close (Same region)</SelectItem>
                  <SelectItem value="moderately-close">Moderately Close (Neighboring regions)</SelectItem>
                  <SelectItem value="far">Far (Different continent)</SelectItem>
                  <SelectItem value="no-preference">No Preference</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="geographicPreferences.culturalPreferences"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Cultural Preferences</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {[
                "Western Culture", "Eastern Culture", "European Culture", 
                "Multicultural Environment", "English-speaking", "Non-English speaking",
                "Urban Environment", "Suburban Environment", "Rural Environment"
              ].map((preference) => (
                <FormField
                  key={preference}
                  control={form.control}
                  name="geographicPreferences.culturalPreferences"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={preference}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(preference)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, preference])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== preference
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {preference}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="geographicPreferences.languageRequirements"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Instruction Language Requirements</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {languages.slice(0, 12).map((language) => (
                <FormField
                  key={language}
                  control={form.control}
                  name="geographicPreferences.languageRequirements"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={language}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(language)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, language])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== language
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {language}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function FinancialPlanningStep({ form }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="financialPlanning.annualBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Total Annual Budget *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="under-20k">Under $20,000</SelectItem>
                  <SelectItem value="20k-40k">$20,000 - $40,000</SelectItem>
                  <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                  <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                  <SelectItem value="80k-100k">$80,000 - $100,000</SelectItem>
                  <SelectItem value="over-100k">Over $100,000</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="financialPlanning.tuitionBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Tuition Budget *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tuition budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="under-10k">Under $10,000</SelectItem>
                  <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                  <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                  <SelectItem value="over-75k">Over $75,000</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="financialPlanning.livingExpensesBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Living Expenses Budget *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select living budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="under-10k">Under $10,000</SelectItem>
                  <SelectItem value="10k-20k">$10,000 - $20,000</SelectItem>
                  <SelectItem value="20k-30k">$20,000 - $30,000</SelectItem>
                  <SelectItem value="30k-40k">$30,000 - $40,000</SelectItem>
                  <SelectItem value="over-40k">Over $40,000</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="financialPlanning.fundingSources"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Funding Sources *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {[
                "Personal Savings", "Family Support", "Student Loans", 
                "Scholarships", "Employer Sponsorship", "Government Funding",
                "Bank Loans", "Education Loans", "Crowdfunding"
              ].map((source) => (
                <FormField
                  key={source}
                  control={form.control}
                  name="financialPlanning.fundingSources"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={source}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(source)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, source])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== source
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {source}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="financialPlanning.scholarshipInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Scholarship Interest *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interest level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="very-interested">Very Interested</SelectItem>
                  <SelectItem value="somewhat-interested">Somewhat Interested</SelectItem>
                  <SelectItem value="not-interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="financialPlanning.workPermitInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Work Permit Interest *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interest level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="very-interested">Very Interested</SelectItem>
                  <SelectItem value="somewhat-interested">Somewhat Interested</SelectItem>
                  <SelectItem value="not-interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="financialPlanning.financialSupport"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Financial Support Level *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select support level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-support">Full Financial Support</SelectItem>
                  <SelectItem value="partial-support">Partial Support</SelectItem>
                  <SelectItem value="minimal-support">Minimal Support</SelectItem>
                  <SelectItem value="self-funded">Self-Funded</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function TestScoresStep({ form }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Test Scores Information</h3>
            <p className="text-blue-800 text-sm">
              Provide your test scores if available. These are optional but help us provide better recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="testScores.englishTest"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">English Proficiency Test</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ielts">IELTS</SelectItem>
                  <SelectItem value="toefl">TOEFL</SelectItem>
                  <SelectItem value="pte">PTE Academic</SelectItem>
                  <SelectItem value="duolingo">Duolingo English Test</SelectItem>
                  <SelectItem value="cambridge">Cambridge English</SelectItem>
                  <SelectItem value="none">Not Taken</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testScores.englishScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">English Test Score</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 7.5, 95, 65" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testScores.englishTestDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">English Test Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testScores.standardizedTest"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Standardized Test</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sat">SAT</SelectItem>
                  <SelectItem value="act">ACT</SelectItem>
                  <SelectItem value="gre">GRE</SelectItem>
                  <SelectItem value="gmat">GMAT</SelectItem>
                  <SelectItem value="lsat">LSAT</SelectItem>
                  <SelectItem value="mcat">MCAT</SelectItem>
                  <SelectItem value="none">Not Taken</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testScores.standardizedScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Standardized Test Score</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1450, 32, 320" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testScores.standardizedTestDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Standardized Test Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="testScores.gmatGre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">GMAT/GRE Score</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 720, 325" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testScores.otherTests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Other Test Scores</FormLabel>
              <FormControl>
                <Input placeholder="Any other relevant test scores" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function LifestyleFactorsStep({ form }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="lifestyleFactors.accommodationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Preferred Accommodation *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="on-campus">On-Campus Dormitory</SelectItem>
                  <SelectItem value="off-campus">Off-Campus Apartment</SelectItem>
                  <SelectItem value="shared">Shared Housing</SelectItem>
                  <SelectItem value="homestay">Homestay</SelectItem>
                  <SelectItem value="private">Private Apartment</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lifestyleFactors.campusSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Campus Size Preference *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="small">Small (Under 5,000 students)</SelectItem>
                  <SelectItem value="medium">Medium (5,000-15,000 students)</SelectItem>
                  <SelectItem value="large">Large (15,000-30,000 students)</SelectItem>
                  <SelectItem value="very-large">Very Large (Over 30,000 students)</SelectItem>
                  <SelectItem value="no-preference">No Preference</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lifestyleFactors.socialEnvironment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Social Environment *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select social preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="very-social">Very Social & Active</SelectItem>
                  <SelectItem value="moderately-social">Moderately Social</SelectItem>
                  <SelectItem value="quiet">Quiet & Studious</SelectItem>
                  <SelectItem value="diverse">Culturally Diverse</SelectItem>
                  <SelectItem value="international">International Community</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lifestyleFactors.technologyAccess"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Technology Access Needs *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technology needs" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">Basic Internet & Computer Access</SelectItem>
                  <SelectItem value="advanced">Advanced Lab Facilities</SelectItem>
                  <SelectItem value="specialized">Specialized Equipment</SelectItem>
                  <SelectItem value="high-tech">Cutting-edge Technology</SelectItem>
                  <SelectItem value="standard">Standard University Facilities</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="lifestyleFactors.extracurriculars"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Extracurricular Interests</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {[
                "Sports & Athletics", "Arts & Music", "Student Government", 
                "Volunteer Work", "Academic Clubs", "Cultural Activities",
                "Entrepreneurship", "Research Groups", "Debate & Public Speaking",
                "Environmental Activities", "Technology Clubs", "Social Clubs"
              ].map((activity) => (
                <FormField
                  key={activity}
                  control={form.control}
                  name="lifestyleFactors.extracurriculars"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={activity}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(activity)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, activity])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== activity
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {activity}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="lifestyleFactors.dietaryRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Dietary Requirements</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vegetarian, Halal, Kosher, Allergies" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lifestyleFactors.transportationNeeds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Transportation Needs</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Public transport, Car access, Bike-friendly" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="lifestyleFactors.healthConditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Health Considerations</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any health conditions, accessibility needs, or medical requirements..."
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function AdditionalRequirementsStep({ form }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="additionalRequirements.visaSupport"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Visa Support Needed *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa support" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-support">Full Visa Support</SelectItem>
                  <SelectItem value="guidance">Guidance Only</SelectItem>
                  <SelectItem value="not-needed">Not Needed</SelectItem>
                  <SelectItem value="unsure">Unsure</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalRequirements.internshipOpportunities"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Internship Opportunities *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="very-important">Very Important</SelectItem>
                  <SelectItem value="somewhat-important">Somewhat Important</SelectItem>
                  <SelectItem value="not-important">Not Important</SelectItem>
                  <SelectItem value="unsure">Unsure</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalRequirements.industryConnections"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Industry Connections *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="very-important">Very Important</SelectItem>
                  <SelectItem value="somewhat-important">Somewhat Important</SelectItem>
                  <SelectItem value="not-important">Not Important</SelectItem>
                  <SelectItem value="unsure">Unsure</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalRequirements.alumniNetwork"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Alumni Network *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="very-important">Very Important</SelectItem>
                  <SelectItem value="somewhat-important">Somewhat Important</SelectItem>
                  <SelectItem value="not-important">Not Important</SelectItem>
                  <SelectItem value="unsure">Unsure</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalRequirements.postGraduation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Post-Graduation Plans *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plans" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="work-locally">Work in Study Country</SelectItem>
                  <SelectItem value="return-home">Return to Home Country</SelectItem>
                  <SelectItem value="further-study">Further Studies</SelectItem>
                  <SelectItem value="entrepreneurship">Start a Business</SelectItem>
                  <SelectItem value="flexible">Flexible Options</SelectItem>
                  <SelectItem value="unsure">Unsure</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="additionalRequirements.specialNeeds"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Special Needs or Accommodations</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any special accommodations, accessibility needs, or specific requirements..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="additionalRequirements.additionalComments"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Additional Comments</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any additional information, questions, or specific requirements you'd like to share..."
                className="min-h-[120px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Summary Section */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Ready to Get Your Recommendations!</h3>
            <p className="text-green-800 mb-4">
              You've completed all sections of the assessment. Click "Generate Recommendations" to receive your personalized university matches based on AI analysis.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-600" />
                <span>Personal Info Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-green-600" />
                <span>Academic Background</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                <span>Study Preferences</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                <span>Geographic Preferences</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}