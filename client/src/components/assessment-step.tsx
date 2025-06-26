import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface AssessmentStepProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  children: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  canContinue: boolean;
  isLoading?: boolean;
}

export default function AssessmentStep({
  currentStep,
  totalSteps,
  title,
  description,
  children,
  onNext,
  onPrevious,
  canContinue,
  isLoading = false
}: AssessmentStepProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-slate-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="text-lg">{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                onClick={onNext}
                disabled={!canContinue || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {currentStep === totalSteps ? 'Complete Assessment' : 'Next'}
                    {currentStep < totalSteps && <ChevronRight className="h-4 w-4" />}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface CountrySelectionProps {
  selectedCountries: string[];
  onSelectionChange: (countries: string[]) => void;
}

export function CountrySelection({ selectedCountries, onSelectionChange }: CountrySelectionProps) {
  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' }
  ];

  const toggleCountry = (countryCode: string) => {
    const newSelection = selectedCountries.includes(countryCode)
      ? selectedCountries.filter(c => c !== countryCode)
      : [...selectedCountries, countryCode];
    
    onSelectionChange(newSelection);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {countries.map((country) => (
        <div
          key={country.code}
          onClick={() => toggleCountry(country.code)}
          className={`
            p-4 border rounded-lg cursor-pointer transition-all
            ${selectedCountries.includes(country.code)
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{country.flag}</span>
            <div>
              <div className="font-medium">{country.name}</div>
              <div className="text-sm text-slate-600">{country.code}</div>
            </div>
            {selectedCountries.includes(country.code) && (
              <div className="ml-auto">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}