import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import UserHeader from '@/components/UserHeader'
import UserFooter from '@/components/UserFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'जि. प. प्राथमिक शाळा, जावळी',
  description: 'ज्ञान हेच अमृत, शिक्षण हेच जीवन!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <UserHeader />
      <main className="min-h-screen">
        {children}
      </main>
      
      {/* Footer */}
      <UserFooter/>
    </div>
  )
}