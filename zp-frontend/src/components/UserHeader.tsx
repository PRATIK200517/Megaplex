import Link from "next/link"
import { HomeIcon, AcademicCapIcon } from "@heroicons/react/24/outline"

export default function UserHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo on Left */}
          <Link href="/" className="flex items-center space-x-3">
            {/* School Logo/Emblem */}
            <div className="flex items-center justify-center w-10 h-10 bg-linear-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            
            {/* School Name */}
            <div className="hidden sm:block">
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  जि. प. प्राथमिक शाळा
                </h1>
                <p className="text-xs text-gray-600 leading-tight">
                  जावळी
                </p>
              </div>
            </div>
          </Link>

          {/* Home Button on Right */}
          <Link 
            href="/"
            className="flex items-center justify-center w-10 h-10 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Go to Home Page"
          >
            <HomeIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}