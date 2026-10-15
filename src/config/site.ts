export const siteConfig = {
  name: "ApexWall 3D",
  description:
    "India's premier robotic Direct-to-Wall UV Printing service. Photorealistic 1440+ DPI murals cured instantly onto plaster, wood, glass, brick, and tile.",
  url: "https://apexwall3d.com",
  contact: {
    whatsapp: "919840765477",
    phone: "+91 98407 65477",
    email: "info@apexwall3d.com",
    instagram: "https://instagram.com/apexwall3d",
    // Public Google reviews page. The rating badge in the testimonials section only
    // shows once this is set, so the "45+ reviews" claim always links to its source.
    googleReviewsUrl: "",
    // FormSubmit AJAX endpoint for the contact and feedback forms. The first submission sends an
    // activation email to this inbox; forms deliver only after it is confirmed.
    formEndpoint: "https://formsubmit.co/ajax/jayasuriyamanickavasagam@gmail.com",
  },
  address: "India",
  geo: {
    latitude: 10.7905,
    longitude: 78.7047,
  },
  areaServed: [
    "Pan India",
  ],
  pricing: {
    baseRates: {
      "Smooth Emulsion Wall": 120,
      "Bare Brick / Rough Plaster": 140,
      "Wood / MDF / Canvas Panel": 150,
      "Glass / Acrylic / Ceramic Tile": 175,
    },
    inkAddOns: {
      "Standard CMYK": 0,
      "CMYK + High-Density White Underbase": 25,
      "3D Relief / Embossed Texture Print": 50,
    },
    speedSqFtPerHour: 30,
  },
};
