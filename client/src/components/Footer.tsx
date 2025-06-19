import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Main Copyright */}
          <div className="text-center">
            <p className="text-gray-700 font-medium">
              © 2025 Darpan Intelligence. All rights reserved.
            </p>
          </div>
          
          {/* Company Attribution */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>A product of</span>
            <span className="font-semibold text-gray-900">Epitome Solutions</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
          </div>
          
          {/* Additional Links - Optional for future */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}