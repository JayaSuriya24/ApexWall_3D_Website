export const siteConfig = {
  name: "ApexWall 3D",
  description:
    "Central Tamil Nadu's first robotic Direct-to-Wall UV Printing service. Photorealistic 1440+ DPI murals cured instantly onto plaster, wood, glass, brick, and tile.",
  url: "https://apexwall3d.com",
  contact: {
    whatsapp: "919876543210", // Placeholder WhatsApp
    phone: "+91 98765 43210", // Placeholder Phone
    email: "hello@apexwall3d.com",
  },
  address: "Tiruchirappalli (Trichy), Tamil Nadu, India",
  geo: {
    latitude: 10.7905,
    longitude: 78.7047,
  },
  areaServed: [
    "Tiruchirappalli",
    "Thanjavur",
    "Karur",
    "Pudukkottai",
    "Dindigul",
    "Perambalur",
  ],
  pricing: {
    baseRates: {
      "Smooth Emulsion Wall": 120,
      "Bare Brick / Rough Plaster": 140,
      "Wood / MDF / Canvas Panel": 150,
      "Glass / Acrylic / Ceramic Tile": 175,
    },
    multipliers: {
      "Smooth Emulsion Wall": 1.0,
      "Bare Brick / Rough Plaster": 1.15,
      "Wood / MDF / Canvas Panel": 1.25,
      "Glass / Acrylic / Ceramic Tile": 1.4,
    },
    inkAddOns: {
      "Standard CMYK": 0,
      "CMYK + High-Density White Underbase": 25,
      "3D Relief / Embossed Texture Print": 50,
    },
    speedSqFtPerHour: 30,
  },
};
