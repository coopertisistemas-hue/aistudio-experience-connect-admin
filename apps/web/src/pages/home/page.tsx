import { useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ExperienceCategories from './components/ExperienceCategories';
import PlatformFeatures from './components/PlatformFeatures';
import AdminPanel from './components/AdminPanel';
import DriverApp from './components/DriverApp';
import MobileExperience from './components/MobileExperience';
import HospitalityPartners from './components/HospitalityPartners';
import PremiumCTA from './components/PremiumCTA';
import Footer from './components/Footer';

export default function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal, .reveal-fade');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="font-sans bg-sand-50 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ExperienceCategories />
      <PlatformFeatures />
      <AdminPanel />
      <DriverApp />
      <MobileExperience />
      <HospitalityPartners />
      <PremiumCTA />
      <Footer />
    </main>
  );
}