"use client"
import { useRouter } from "next/navigation";

export default function Header() {
  const router= useRouter();
  const onClose=()=>{
    router.push('/');
  }
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left side - Page title and breadcrumb */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1"> • Manage your visual content</p>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-4">

          <div className="md:hidden w-8 h-8 bg-linear-to-r from-blue-400 to-purple-500 rounded-full"></div>

        </div>
        <button
      onClick={onClose}
      className="fixed top-4 right-4 z-50 p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all"
      aria-label="Close"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
      </div>
    </header>
  );
}