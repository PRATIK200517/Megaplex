// src/app/admin/layout.tsx
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt');
  console.log("Checking for token in AdminLayout...", token ? "FOUND" : "MISSING");
  let user = null;
  if (!token) {
    console.log(token)
    redirect('/login');
  }

  let isAuthenticated = false;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/isAuthorized`,
      {},
      {
        headers: {
          'Cookie': `jwt=${token.value}`,
          'Accept': 'application/json',
        },
        withCredentials: true
      }
    );

    if (response.status === 200) {
      isAuthenticated = true;
      user = response.data.user
    }
  } catch (error: any) {
    console.error("Backend Auth Check Failed:", error.response?.data || error.message);
  }

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
