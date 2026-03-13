// Site Configuration for Dynamic Creative Studios

export interface SiteConfig {
  language: string;
  siteTitle: string;
  siteDescription: string;
}

export const siteConfig: SiteConfig = {
  language: "en",
  siteTitle: "Dynamic Creative Studios | 3D Art & Animation",
  siteDescription: "Dynamic Creative Studios - Creating immersive 3D experiences and digital artistry that pushes the boundaries of imagination.",
};

// Navigation Configuration
export interface NavLink {
  label: string;
  href: string;
}

export const navigationConfig = {
  brandName: "DYNAMIC CREATIVE STUDIOS",
  navLinks: [
    { label: "GALLERY", href: "#gallery" },
    { label: "SHOP", href: "#shop" },
    { label: "ABOUT", href: "#about" },
    { label: "CONTACT", href: "#contact" },
  ] as NavLink[],
};

// Hero Carousel Configuration
export interface HeroImage {
  src: string;
  alt: string;
}

export const heroConfig = {
  images: [
    { src: "/assets/asset_1.jpg", alt: "Robotic dog 3D render in forest environment" },
    { src: "/assets/asset_2.jpg", alt: "Character with fire hand 3D render" },
    { src: "/assets/asset_3.jpg", alt: "Orc warrior character 3D render" },
    { src: "/assets/asset_4.jpg", alt: "Sci-fi gauntlet 3D model" },
    { src: "/assets/asset_5.jpg", alt: "Leather boot 3D model" },
    { src: "/assets/asset_6.jpg", alt: "Brown robe clothing 3D model" },
    { src: "/assets/asset_7.jpg", alt: "Wireframe glove 3D model" },
    { src: "/assets/asset_8.jpg", alt: "Fire hand character shop view" },
  ] as HeroImage[],
  autoAdvanceInterval: 5000,
};

// Gallery Configuration
export interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

export const galleryConfig = {
  title: "GALLERY",
  categories: [
    "GAMES",
    "ANIMATION",
    "3D PRINT",
    "CONCEPT",
    "2D PAINT",
    "PORTRAIT",
    "ILLUSTRATION",
    "GRAPHIC DESIGN",
  ],
  images: [
    { src: "/assets/asset_2.jpg", alt: "Character with fire hand", category: "GAMES" },
    { src: "/assets/asset_3.jpg", alt: "Orc warrior character", category: "ANIMATION" },
    { src: "/assets/asset_4.jpg", alt: "Red sci-fi gauntlet", category: "3D PRINT" },
    { src: "/assets/asset_5.jpg", alt: "Black leather boot", category: "CONCEPT" },
    { src: "/assets/asset_6.jpg", alt: "Brown robe clothing", category: "2D PAINT" },
    { src: "/assets/asset_7.jpg", alt: "Black glove with wireframe", category: "PORTRAIT" },
  ] as GalleryImage[],
};

// Shop Configuration
export interface ShopItem {
  src: string;
  alt: string;
  category: string;
  name: string;
  price: string;
}

export const shopConfig = {
  title: "SHOP",
  categories: [
    "GAMES",
    "ANIMATION",
    "3D PRINT",
    "CONCEPT",
    "2D PAINT",
    "PORTRAIT",
    "ILLUSTRATION",
    "GRAPHIC DESIGN",
  ],
  items: [
    { src: "/assets/asset_8.jpg", alt: "Fire hand character model", category: "GAMES", name: "Fire Mage Character", price: "$49.99" },
    { src: "/assets/asset_9.jpg", alt: "Orc warrior model", category: "ANIMATION", name: "Orc Warrior", price: "$59.99" },
    { src: "/assets/asset_10.jpg", alt: "Sci-fi gauntlet model", category: "3D PRINT", name: "Sci-Fi Gauntlet", price: "$29.99" },
    { src: "/assets/asset_11.jpg", alt: "Leather boot model", category: "CONCEPT", name: "Combat Boot", price: "$24.99" },
    { src: "/assets/asset_12.jpg", alt: "Robe clothing model", category: "2D PAINT", name: "Traditional Robe", price: "$34.99" },
    { src: "/assets/asset_13.jpg", alt: "Tactical glove model", category: "PORTRAIT", name: "Tactical Glove", price: "$19.99" },
  ] as ShopItem[],
};

// About Us Configuration
export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export const aboutConfig = {
  title: "ABOUT US",
  teamMembers: [
    { name: "SM BONIN", role: "Proprietor", image: "/assets/team_1.jpg" },
    { name: "LUTHFUN NAHAR", role: "MD", image: "/assets/asset_15.jpg" },
    { name: "ASHIM AHAMED", role: "MD", image: "/assets/asset_16.jpg" },
    { name: "ASHIM AHAMED", role: "MD", image: "/assets/team_4.jpg" },
    { name: "ASHIM AHAMED", role: "MD", image: "/assets/asset_18.jpg" },
  ] as TeamMember[],
};

// Contact Configuration
export const contactConfig = {
  title: "CONTACT US",
  email: "bonin@dynamiccreativestudios",
  phone: "+880 1675216604",
  backgroundImage: "/assets/asset_19.jpg",
};

// Footer Configuration
export const footerConfig = {
  brandName: "DYNAMIC CREATIVE STUDIOS",
  description: "Creating immersive 3D experiences and digital artistry that pushes the boundaries of imagination.",
  navigation: [
    { label: "Gallery", href: "#gallery" },
    { label: "Shop", href: "#shop" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  socialLinks: [
    { platform: "Instagram", href: "#" },
    { platform: "Twitter", href: "#" },
    { platform: "LinkedIn", href: "#" },
    { platform: "YouTube", href: "#" },
  ],
  copyright: `© ${new Date().getFullYear()} Dynamic Creative Studios. All rights reserved.`,
};
