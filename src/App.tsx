import { useEffect } from 'react';
import { Header } from './sections/Header';
import { HeroCarousel } from './sections/HeroCarousel';
import { Gallery } from './sections/Gallery';
import { Shop } from './sections/Shop';
import { AboutUs } from './sections/AboutUs';
import { ContactUs } from './sections/ContactUs';
import { Footer } from './sections/Footer';
import './App.css';

function App() {
  useEffect(() => {
    // Set page title and meta
    document.title = 'Dynamic Creative Studios | 3D Art & Animation';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Dynamic Creative Studios - Creating immersive 3D experiences and digital artistry that pushes the boundaries of imagination.');
    }
    document.documentElement.lang = 'en';
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      {/* Fixed Navigation Header */}
      <Header />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Carousel Section */}
        <HeroCarousel />

        {/* Gallery Section */}
        <Gallery />

        {/* Shop Section */}
        <Shop />

        {/* About Us Section */}
        <AboutUs />

        {/* Contact Us Section */}
        <ContactUs />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
