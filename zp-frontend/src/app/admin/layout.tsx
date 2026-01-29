// src/app/admin/layout.tsx
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt');

  // 1. Initial local check (Fastest)
  if (!token) {
    redirect('/login');
  }

  let user = null;
  let isAuthenticated = false;

  try {
    // 2. Server-to-Server Auth Check
    // We use the full SERVER_URL here because relative paths (/api/main/...) 
    // don't always resolve correctly inside Server Components unless 
    // you provide the full origin.
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/isAuthorized`,
      {},
      {
        headers: {
          // Manually passing the cookie from the browser's request to your backend
          'Cookie': `jwt=${token.value}`,
          'Accept': 'application/json',
        }
      }
    );

    if (response.status === 200) {
      isAuthenticated = true;
      user = response.data.user;
    }
  } catch (error: any) {
    // This will now show up in your Vercel logs
    console.error("Backend Auth Check Failed:", error.response?.data || error.message);
  }

  // 3. Final Protection
  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar username={user?.username} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}