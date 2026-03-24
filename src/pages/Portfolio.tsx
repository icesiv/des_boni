import { useEffect } from 'react';
import { Header } from '../sections/Header';
import { HeroCarousel } from '../sections/HeroCarousel';
import { Gallery } from '../sections/Gallery';
import { Shop } from '../sections/Shop';
import { AboutUs } from '../sections/AboutUs';
import { ContactUs } from '../sections/ContactUs';
import { Footer } from '../sections/Footer';

export function Portfolio() {
  useEffect(() => {
    // Set page title and meta
    document.title = 'Dynamic Creative Studios | 3D Art & Animation';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Dynamic Creative Studios - Creating immersive 3D experiences and digital artistry that pushes the boundaries of imagination.'
      );
    }
    document.documentElement.lang = 'en';
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      <Header />
      <main className="relative">
        <HeroCarousel />
        <Gallery />
        <Shop />
        <AboutUs />
        <ContactUs />
      </main>
      <Footer />
    </div>
  );
}
