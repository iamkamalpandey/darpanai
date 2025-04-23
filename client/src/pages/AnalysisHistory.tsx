import { Link } from "wouter";
import AnalysisHistory from "@/components/AnalysisHistory";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AnalysisHistoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Visa Rejection Analyzer</h1>
              </div>
            </Link>
            <div className="flex space-x-4">
              <Link href="/analyzer">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnalysisHistory />
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