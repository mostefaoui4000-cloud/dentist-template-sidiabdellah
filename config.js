const clinicConfig = {
  name: "Dent'artiste",
  doctorName: "Équipe Dent'artiste",
  speciality: "Cabinet Dentaire Pluri-Spécialisé",

  siteUrl: "https://www.dentartiste.dz",
  pageTitle: "Dent'artiste | Cabinet Dentaire à Sidi Abdellah, Alger",
  metaDescription: "Cabinet dentaire pluri-spécialisé à Sidi Abdellah. Orthodontie, chirurgie dentaire, implantologie, facettes et soins esthétiques. Ouvert 7j/7 de 08h00 à 22h00.",

  phone: "+213 564 52 71 75",
  whatsapp: "213564527175",
  email: "contact@dentartiste.dz",
  address: "ASLAN - 3000 Logements, Bâtiment 46, Commerce 04, Sidi Abdellah, Alger",
  mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3199.123!2d2.86!3d36.68!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQwJzE2LjgiTiAywrA1MSczNi4wIkU!5e0!3m2!1sfr!2sdz!4v1625000000000!3m2!1sfr!2sdz",
  bookingLink: "https://cal.com/dentartiste/",
  facebook: "https://facebook.com/dentartiste",
  instagram: "https://instagram.com/dentartiste",
  
  analytics: {
    ga4Id: "",
    metaPixelId: ""
  },

  // Premium Navy & Gold palette matching banner branding
  colors: {
    primary: "#0B1B3D",
    secondary: "#D4AF37",
    background: "#F4F6F9",
    text: "#1A1A1A"
  },

  stats: {
    experience: 10,
    patients: 8000,
    certificates: 20
  },

  // Services extracted directly from social profiles
services: [
    { icon: "✨", title: "Esthétique Dentaire", desc: "Blanchiment dentaire, couronnes en zircone & céramique pour sublimer votre sourire." },
    { icon: "🦷", title: "Prothèse Dentaire", desc: "Solutions prothétiques fixes et amovibles personnalisées et durables." },
    { icon: "😬", title: "Orthodontie (ODF)", desc: "Consultation offerte avec un spécialiste pour l'alignement dentaire enfants et adultes." },
    { icon: "🩺", title: "Odontologie & Endodontie", desc: "Soins conservateurs, traitement des caries et dévitalisation sans douleur." },
    { icon: "🚨", title: "Chirurgie Dentaire", desc: "Extractions complexes et interventions chirurgicales buccales sécurisées." },
    { icon: "💎", title: "Implantologie", desc: "Remplacement fixe des dents manquantes par implants de haute qualité." }
  ], 
  
  // Before & After Surgery Interactive Comparison Data
  beforeAfterCases: [
    {
      title: "Implants & Restauration Complète",
      desc: "Chirurgie d'implantation et pose de couronnes en zircone pour retrouver fonction et esthétique.",
      beforeImg: "images/before-implant.jpg",
      afterImg: "images/after-implant.jpg"
    },
    {
      title: "Facettes & Alignement Esthétique",
      desc: "Correction des alignements et éclaircissement pour un sourire parfaitement harmonieux.",
      beforeImg: "images/before-facettes.jpg",
      afterImg: "images/after-facettes.jpg"
    }
  ],

  reviews: [
    { name: "Sami K.", rating: 5, text: "Cabinet très propre et équipe très accueillante. L'horaire jusqu'à 22h est super pratique !" },
    { name: "Nadia M.", rating: 5, text: "Consultation en orthodontie parfaite. Des explications claires et un matériel très moderne." },
    { name: "Amine B.", rating: 5, text: "Prise en charge rapide et sans douleur. Je recommande vivement le cabinet Dent'artiste !" }
  ],

  hours: [
    { days: "Lundi - Dimanche (7j/7)", time: "08:00 - 22:00" }
  ]
};