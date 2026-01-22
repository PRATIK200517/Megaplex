export default function Header() {
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
      </div>
    </header>
  );
}