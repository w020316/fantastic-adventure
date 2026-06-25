import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/landing/HeroSection'
import AboutSection from '@/components/landing/AboutSection'
import CapabilitySection from '@/components/landing/CapabilitySection'
import ProjectsSection from '@/components/landing/ProjectsSection'
import ArticlesSection from '@/components/landing/ArticlesSection'
import ContactSection from '@/components/landing/ContactSection'
import SpotlightCursor from '@/components/landing/SpotlightCursor'

export default function HomePage() {
  return (
    <>
      <SpotlightCursor />
      <Header />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <CapabilitySection />
        <ProjectsSection />
        <ArticlesSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
