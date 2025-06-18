import { ConsultationForm } from "@/components/ConsultationForm";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Calendar, Shield, FileText, Award } from "lucide-react";
import { Link } from "wouter";

interface CustomCTAProps {
  variant: "dashboard" | "visa-analysis" | "enrollment-analysis" | "resources" | "appointments" | "generic";
  source: string;
  className?: string;
}

export function CustomCTA({ variant, source, className = "" }: CustomCTAProps) {
  const ctaConfigs = {
    dashboard: {
      title: "Ready to Take the Next Step?",
      description: "Join thousands of successful students who used our expert guidance to achieve their study abroad dreams. Get personalized consultation tailored to your specific situation.",
      buttonText: "Schedule Expert Consultation",
      buttonClass: "bg-white text-blue-600 hover:bg-gray-50 text-base px-8 py-3 shadow-lg",
      backgroundClass: "bg-gradient-to-r from-blue-600 to-purple-600",
      textColor: "text-white",
      descriptionColor: "text-blue-100",
      supportText: "Free 15-minute consultation available",
      icon: Calendar
    },
    "visa-analysis": {
      title: "Get Expert Help with Your Visa Application",
      description: "Don't let another visa rejection hold you back. Our expert consultants have helped hundreds of students overcome rejection challenges and secure their visas successfully.",
      buttonText: "Book Visa Consultation",
      buttonClass: "bg-red-600 text-white hover:bg-red-700 text-base px-8 py-3 shadow-lg",
      backgroundClass: "bg-gradient-to-r from-red-50 to-pink-50 border border-red-100",
      textColor: "text-gray-900",
      descriptionColor: "text-gray-700",
      supportText: "Specialized visa rejection experts",
      icon: Shield
    },
    "enrollment-analysis": {
      title: "Ensure Your Documents Are Perfect",
      description: "Get peace of mind with expert verification of your enrollment documents. Our consultants will review your paperwork and ensure everything meets university and visa requirements.",
      buttonText: "Book Document Review",
      buttonClass: "bg-green-600 text-white hover:bg-green-700 text-base px-8 py-3 shadow-lg",
      backgroundClass: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100",
      textColor: "text-gray-900",
      descriptionColor: "text-gray-700",
      supportText: "Document compliance specialists",
      icon: FileText
    },
    resources: {
      title: "Need Help With Your Documents?",
      description: "Our resource library is comprehensive, but every situation is unique. Get personalized guidance on which documents you need and how to prepare them perfectly.",
      buttonText: "Get Document Guidance",
      buttonClass: "bg-purple-600 text-white hover:bg-purple-700 text-base px-8 py-3 shadow-lg",
      backgroundClass: "bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100",
      textColor: "text-gray-900",
      descriptionColor: "text-gray-700",
      supportText: "Personalized document roadmap",
      icon: FileText
    },
    appointments: {
      title: "Ready for Your Next Consultation?",
      description: "Based on your previous consultations, take the next step in your study abroad journey. Our experts are here to guide you through every challenge.",
      buttonText: "Schedule Follow-up",
      buttonClass: "bg-blue-600 text-white hover:bg-blue-700 text-base px-8 py-3 shadow-lg",
      backgroundClass: "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100",
      textColor: "text-gray-900",
      descriptionColor: "text-gray-700",
      supportText: "Ongoing support available",
      icon: Calendar
    },
    generic: {
      title: "Get Expert Guidance Today",
      description: "Don't navigate your study abroad journey alone. Our experienced consultants provide personalized advice to help you succeed every step of the way.",
      buttonText: "Book Consultation",
      buttonClass: "bg-blue-600 text-white hover:bg-blue-700 text-base px-8 py-3 shadow-lg",
      backgroundClass: "bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200",
      textColor: "text-gray-900",
      descriptionColor: "text-gray-700",
      supportText: "Expert advice when you need it",
      icon: Award
    }
  };

  const config = ctaConfigs[variant];
  const IconComponent = config.icon;

  return (
    <div className={`${config.backgroundClass} rounded-xl p-6 sm:p-8 text-center ${className}`}>
      <div className="max-w-3xl mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <IconComponent className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${config.textColor}`}>
          {config.title}
        </h2>

        {/* Description */}
        <p className={`mb-6 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${config.descriptionColor}`}>
          {config.description}
        </p>
        
        {/* CTA Button and Support Text */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ConsultationForm 
            buttonVariant="default" 
            buttonSize="lg"
            buttonText={config.buttonText}
            className={config.buttonClass}
            source={source}
            subject={`${config.buttonText} - ${variant}`}
          />
          <div className={`flex items-center gap-2 text-sm ${config.descriptionColor}`}>
            <CheckCircle2 className="h-4 w-4" />
            <span>{config.supportText}</span>
          </div>
        </div>

        {/* Additional Actions for Some Variants */}
        {variant === "dashboard" && (
          <div className="mt-6 pt-6 border-t border-blue-400/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <Link href="/visa-analysis">
                <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-blue-500/20 w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Visa Analysis
                </Button>
              </Link>
              <Link href="/enrollment-analysis">
                <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-blue-500/20 w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Document Analysis  
                </Button>
              </Link>
              <Link href="/document-templates">
                <Button variant="ghost" size="sm" className="text-blue-100 hover:text-white hover:bg-blue-500/20 w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Resources
                </Button>
              </Link>
            </div>
          </div>
        )}

        {variant === "resources" && (
          <div className="mt-6 pt-6 border-t border-purple-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Or explore our comprehensive resource library
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/document-templates">
                  <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-100">
                    <FileText className="h-4 w-4 mr-2" />
                    Document Templates
                  </Button>
                </Link>
                <Link href="/document-checklist">
                  <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-100">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Requirements Checklist
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}