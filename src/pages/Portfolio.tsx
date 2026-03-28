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
    <div className="min-h-screen bg-gradient-to-b from-[#1b2b43] to-[#09090b]">
      <div className="max-w-7xl mx-auto shadow-[0_0_280px_rgba(255,255,255,.1),_0_10px_20px_rgba(0,0,0,.8)]">

        <Header />
        <main className="relative ">
          <HeroCarousel />
          <Gallery />
          <Shop />
          <AboutUs />
          <ContactUs />
        </main>
        <Footer />

      </div>
    </div>
  );
}
