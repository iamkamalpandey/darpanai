import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" className="text-xl font-bold">
                Darpan Intelligence
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/simple-assessment">
              <Button variant="ghost">Assessment</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}