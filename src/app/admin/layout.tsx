'use client'

import { SessionProvider } from 'next-auth/react'
import AdminLayout from './AdminLayout'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </SessionProvider>
  )
}
