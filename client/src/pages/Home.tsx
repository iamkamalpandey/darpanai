import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Visa Rejection Analyzer</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Understand Your Visa Rejection
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Upload your visa rejection letter and receive personalized insights
              and recommendations to improve your next application.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <Link href="/analyzer">
                <Button size="lg" className="w-full sm:w-auto">
                  Analyze Your Rejection Letter
                </Button>
              </Link>
            </div>
          </div>

          {/* Features section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
              How It Works
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary-50 p-3 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Upload Your Document</h4>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                      Upload your visa rejection letter in PDF, JPG, or PNG format.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary-50 p-3 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">AI Analysis</h4>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                      Our AI analyzes your document to identify specific reasons for rejection.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary-50 p-3 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Get Recommendations</h4>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                      Receive personalized recommendations and next steps for your next application.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Benefits section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
              Why Use Our Visa Rejection Analyzer
            </h3>
            <div className="space-y-4">
              <div className="flex">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <p className="ml-3 text-gray-700 dark:text-gray-300">Understand the exact reasons for your visa rejection</p>
              </div>
              <div className="flex">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <p className="ml-3 text-gray-700 dark:text-gray-300">Get personalized recommendations to improve your next application</p>
              </div>
              <div className="flex">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <p className="ml-3 text-gray-700 dark:text-gray-300">Secure and confidential processing of your documents</p>
              </div>
              <div className="flex">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <p className="ml-3 text-gray-700 dark:text-gray-300">Powered by advanced AI technology for accurate analysis</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2023 Visa Rejection Analyzer. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
