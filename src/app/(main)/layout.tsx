import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AIChat from '@/components/ai/AIChat'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">{children}</main>
      <Footer />
      <AIChat />
    </>
  )
}
