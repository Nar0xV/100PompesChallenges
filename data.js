
// ============================================================
// data.js — Programme des 100 pompes / 30 jours
// ============================================================

const PROGRAM = [
  {
    id: 1,
    name: "Pompes Diamant",
    reps: 10,
    emoji: "💎",
    description: "Mains en triangle sous la poitrine — triceps & pec intérieur",
    muscles: ["Triceps", "Pec central"]
  },
  {
    id: 2,
    name: "Pompes Larges",
    reps: 15,
    emoji: "💪",
    description: "Mains écartées au-delà des épaules — grand pectoral",
    muscles: ["Grand pec", "Deltoïde ant."]
  },
  {
    id: 3,
    name: "Pompes Pieds Surélevés",
    reps: 10,
    emoji: "🔺",
    description: "Pieds sur une chaise ou marche — pec haut & épaules",
    muscles: ["Pec haut", "Épaules"]
  },
  {
    id: 4,
    name: "Pompes Normales",
    reps: 20,
    emoji: "⚡",
    description: "Position classique, mains largeur épaules — full chest",
    muscles: ["Grand pec", "Triceps", "Core"]
  },
  {
    id: 5,
    name: "Pompes Mains Surélevées",
    reps: 10,
    emoji: "⬇️",
    description: "Mains sur une surface haute — pec bas & sérratus",
    muscles: ["Pec bas", "Sérratus"]
  },
  {
    id: 6,
    name: "Pompes Archer",
    reps: 10,
    emoji: "🏹",
    description: "5 de chaque côté — unilatéral, force & stabilité",
    muscles: ["Pec", "Stabilisateurs"]
  },
  {
    id: 7,
    name: "Pompes Explosives",
    reps: 10,
    emoji: "💥",
    description: "Poussée explosive (clap optionnel) — puissance musculaire",
    muscles: ["Tout le haut du corps"]
  },
  {
    id: 8,
    name: "Pompes Sphinx",
    reps: 5,
    emoji: "🐍",
    description: "Coudes au sol → extension complète — triceps longs",
    muscles: ["Triceps long"]
  }
];

// Ajustements pour total = 100 pompes
PROGRAM[3].reps = 25; // Pompes normales
PROGRAM[1].reps = 20; // Pompes larges

// Challenge mars 2026
const CHALLENGE_START = new Date("2026-03-27");
const CHALLENGE_DAYS = 30;
