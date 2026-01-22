import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <h1 className="text-center text-3xl font-bold underline mb-8">
        Megaplex Login 
      </h1>

      <Link href="/login">
        <button className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg hover:shadow-xl active:scale-95">
          <span>Login to Admin</span>
          <svg 
            className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </Link>
    </main>
  );
}