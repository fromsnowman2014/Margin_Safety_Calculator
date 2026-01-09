import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SafetyNet</span>
          </Link>

          {/* Navigation - Phase 2 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              Calculator
            </Link>
            {/* Phase 2: Portfolio, About links */}
          </nav>

          {/* Phase 2: Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* Placeholder for auth buttons */}
          </div>
        </div>
      </div>
    </header>
  );
}
