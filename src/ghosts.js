export const ghosts = [
  {
    id: 'kuntilanak',
    name: 'Kuntilanak',
    description: 'Hantu perempuan berambut panjang berbaju putih',
    lore: 'Konon arwah perempuan yang meninggal saat melahirkan. Sering muncul di pohon besar pada malam hari dengan tawa khasnya.',
    rarity: 'rare',
    hp: 120,
    difficulty: 3,
    colors: {
      primary: '#EDE7E3',
      secondary: '#1A0F2E',
      accent: '#C0392B'
    },
    gradient: 'linear-gradient(135deg, #EDE7E3 0%, #1A0F2E 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <path d="M12 22Q10 50 16 58L22 60V34Q22 20 32 18Q42 20 42 34V60L48 58Q54 50 52 22Q52 8 32 8Q12 8 12 22Z" fill="#1A0F2E"/>
      <ellipse cx="32" cy="32" rx="11" ry="13" fill="#EDE7E3"/>
      <path d="M20 22Q24 14 32 14Q40 14 44 22Q40 24 36 22Q32 18 28 22Q24 24 20 22Z" fill="#1A0F2E"/>
      <ellipse cx="26" cy="32" rx="2" ry="3" fill="#1A0F2E"/>
      <ellipse cx="38" cy="32" rx="2" ry="3" fill="#1A0F2E"/>
      <circle cx="26" cy="31" r="0.9" fill="#C0392B"/>
      <circle cx="38" cy="31" r="0.9" fill="#C0392B"/>
      <path d="M28 40Q32 43 36 40" stroke="#C0392B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`,
    spawnPoints: [
      { lat: -6.9175, lng: 107.6191, label: 'Pohon Tua Dago' }
    ],
    sounds: {
      appear: ['Kikikiki~', '*angin dingin berhembus*'],
      hit: ['KYAAAH!', '*menjerit*'],
      captured: ['*tersedot ke teko*', 'Tidaaak...!']
    }
  },
  {
    id: 'pocong',
    name: 'Pocong',
    description: 'Hantu terbungkus kain kafan yang melompat-lompat',
    lore: 'Arwah yang belum dilepas ikatan kafannya setelah dimakamkan. Bergerak dengan cara melompat karena kaki terbungkus.',
    rarity: 'common',
    hp: 80,
    difficulty: 2,
    colors: {
      primary: '#E8E8E0',
      secondary: '#8FAF8F',
      accent: '#2D4A2D'
    },
    gradient: 'linear-gradient(135deg, #E8E8E0 0%, #8FAF8F 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <rect x="20" y="10" rx="10" ry="10" width="24" height="48" fill="#E8E8E0"/>
      <rect x="22" y="12" rx="8" ry="8" width="20" height="44" fill="#F5F5F0" opacity="0.5"/>
      <ellipse cx="32" cy="28" rx="8" ry="10" fill="#D4D4CC"/>
      <ellipse cx="28" cy="27" rx="2.5" ry="3" fill="#1A1A1A"/>
      <ellipse cx="36" cy="27" rx="2.5" ry="3" fill="#1A1A1A"/>
      <ellipse cx="32" cy="33" rx="2.5" ry="3" fill="#1A1A1A"/>
      <path d="M20 14Q32 8 44 14" stroke="#8FAF8F" stroke-width="1" fill="none" opacity="0.6"/>
      <path d="M20 50Q32 56 44 50" stroke="#8FAF8F" stroke-width="1" fill="none" opacity="0.6"/>
    </svg>`,
    spawnPoints: [
      { lat: -6.9145, lng: 107.6098, label: 'Kuburan Tua' }
    ],
    sounds: {
      appear: ['*lompat lompat*', 'Huuuu...'],
      hit: ['Uugh!', '*terjatuh*'],
      captured: ['*tersedot*', 'Lepaskaan...']
    }
  },
  {
    id: 'tuyul',
    name: 'Tuyul',
    description: 'Makhluk kecil botak yang suka mencuri uang',
    lore: 'Roh anak kecil yang dipelihara untuk mencuri. Bertubuh kecil, botak, dan bergerak sangat cepat.',
    rarity: 'common',
    hp: 60,
    difficulty: 4,
    colors: {
      primary: '#B8A89A',
      secondary: '#8B7D6B',
      accent: '#4A3728'
    },
    gradient: 'linear-gradient(135deg, #B8A89A 0%, #8B7D6B 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="36" rx="10" ry="12" fill="#B8A89A"/>
      <ellipse cx="32" cy="40" rx="6" ry="5" fill="#C8B8A8"/>
      <circle cx="32" cy="24" r="12" fill="#B8A89A"/>
      <circle cx="32" cy="20" r="10" fill="#C8B8A8"/>
      <ellipse cx="26" cy="26" rx="3" ry="3.5" fill="white"/>
      <ellipse cx="38" cy="26" rx="3" ry="3.5" fill="white"/>
      <circle cx="27" cy="26.5" r="2" fill="#1A1A1A"/>
      <circle cx="39" cy="26.5" r="2" fill="#1A1A1A"/>
      <circle cx="27.5" cy="25.5" r="0.8" fill="white"/>
      <circle cx="39.5" cy="25.5" r="0.8" fill="white"/>
      <path d="M29 32Q32 35 35 32" stroke="#4A3728" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="30" r="2.5" fill="#D4A89A" opacity="0.5"/>
      <circle cx="42" cy="30" r="2.5" fill="#D4A89A" opacity="0.5"/>
    </svg>`,
    spawnPoints: [
      { lat: -6.9210, lng: 107.6070, label: 'Pasar Lama' }
    ],
    sounds: {
      appear: ['*kekekeke*', '*langkah kecil*'],
      hit: ['Hiii!', '*berlari*'],
      captured: ['*menangis*', 'Huweee...']
    }
  },
  {
    id: 'genderuwo',
    name: 'Genderuwo',
    description: 'Hantu besar berbulu hitam yang sangat kuat',
    lore: 'Makhluk gaib bertubuh besar, tinggi, berbulu hitam lebat. Sering mengganggu manusia dan sangat sulit ditaklukkan.',
    rarity: 'legendary',
    hp: 200,
    difficulty: 5,
    colors: {
      primary: '#2C1810',
      secondary: '#4A3020',
      accent: '#FF4444'
    },
    gradient: 'linear-gradient(135deg, #2C1810 0%, #4A3020 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="38" rx="16" ry="18" fill="#2C1810"/>
      <ellipse cx="32" cy="42" rx="10" ry="10" fill="#3A2418"/>
      <circle cx="32" cy="22" r="12" fill="#2C1810"/>
      <ellipse cx="24" cy="22" rx="4" ry="4.5" fill="#1A0E08"/>
      <ellipse cx="40" cy="22" rx="4" ry="4.5" fill="#1A0E08"/>
      <circle cx="25" cy="22" r="2.5" fill="#FF4444"/>
      <circle cx="41" cy="22" r="2.5" fill="#FF4444"/>
      <circle cx="25.5" cy="21" r="0.8" fill="#FF8888"/>
      <circle cx="41.5" cy="21" r="0.8" fill="#FF8888"/>
      <path d="M26 30Q32 34 38 30" stroke="#1A0E08" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="28" y="28" width="2" height="3" rx="0.5" fill="#F0F0F0"/>
      <rect x="34" y="28" width="2" height="3" rx="0.5" fill="#F0F0F0"/>
      <path d="M14 26Q10 38 16 50" stroke="#2C1810" stroke-width="6" stroke-linecap="round"/>
      <path d="M50 26Q54 38 48 50" stroke="#2C1810" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    spawnPoints: [
      { lat: -6.9250, lng: 107.6150, label: 'Hutan Gelap' }
    ],
    sounds: {
      appear: ['GRAAAH!', '*bumi bergetar*'],
      hit: ['*mengaum*', 'RRRGH!'],
      captured: ['*meraung*', 'TIDAAAK!!']
    }
  },
  {
    id: 'sundel_bolong',
    name: 'Sundel Bolong',
    description: 'Hantu perempuan cantik dengan lubang di punggung',
    lore: 'Arwah perempuan yang meninggal karena diperlakukan tidak adil. Tampak cantik dari depan, namun punggungnya berlubang.',
    rarity: 'rare',
    hp: 100,
    difficulty: 3,
    colors: {
      primary: '#F0E6FF',
      secondary: '#2D1B4E',
      accent: '#9B59B6'
    },
    gradient: 'linear-gradient(135deg, #F0E6FF 0%, #2D1B4E 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <path d="M14 20Q12 48 18 58L24 60V38Q24 22 32 18Q40 22 40 38V60L46 58Q52 48 50 20Q48 8 32 8Q16 8 14 20Z" fill="#2D1B4E"/>
      <ellipse cx="32" cy="30" rx="10" ry="12" fill="#F0E6FF"/>
      <path d="M22 20Q26 14 32 14Q38 14 42 20Q38 22 35 20Q32 18 29 20Q26 22 22 20Z" fill="#2D1B4E"/>
      <ellipse cx="28" cy="30" rx="1.8" ry="2.5" fill="#2D1B4E"/>
      <ellipse cx="36" cy="30" rx="1.8" ry="2.5" fill="#2D1B4E"/>
      <circle cx="28" cy="29.5" r="0.7" fill="#9B59B6"/>
      <circle cx="36" cy="29.5" r="0.7" fill="#9B59B6"/>
      <path d="M29 36Q32 38 35 36" stroke="#9B59B6" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <circle cx="24" cy="34" r="2" fill="#D4B8E8" opacity="0.4"/>
      <circle cx="40" cy="34" r="2" fill="#D4B8E8" opacity="0.4"/>
      <ellipse cx="32" cy="50" rx="4" ry="5" fill="#1A0F2E" opacity="0.8"/>
    </svg>`,
    spawnPoints: [
      { lat: -6.9120, lng: 107.6220, label: 'Gang Sepi' }
    ],
    sounds: {
      appear: ['*tertawa pelan*', '*angin berhembus*'],
      hit: ['Aaakh!', '*menghilang sesaat*'],
      captured: ['*menangis*', '*tersedot ke teko*']
    }
  },
  {
    id: 'wewe_gombel',
    name: 'Wewe Gombel',
    description: 'Hantu tua yang suka menculik anak-anak nakal',
    lore: 'Arwah seorang wanita tua yang kesepian. Dikenal suka menculik anak-anak yang nakal dan durhaka kepada orang tua.',
    rarity: 'legendary',
    hp: 150,
    difficulty: 4,
    colors: {
      primary: '#4A3A5C',
      secondary: '#2E1F3E',
      accent: '#7D5BA6'
    },
    gradient: 'linear-gradient(135deg, #4A3A5C 0%, #2E1F3E 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <path d="M10 24Q8 50 16 58L22 60V36Q22 24 32 20Q42 24 42 36V60L48 58Q56 50 54 24Q52 10 32 8Q12 10 10 24Z" fill="#2E1F3E"/>
      <ellipse cx="32" cy="30" rx="11" ry="12" fill="#6B5B7B"/>
      <path d="M18 22Q24 16 32 16Q40 16 46 22Q42 24 38 22Q32 18 26 22Q22 24 18 22Z" fill="#2E1F3E"/>
      <ellipse cx="26" cy="30" rx="2.5" ry="3" fill="#1A1A1A"/>
      <ellipse cx="38" cy="30" rx="2.5" ry="3" fill="#1A1A1A"/>
      <circle cx="26" cy="29.5" r="1" fill="#7D5BA6"/>
      <circle cx="38" cy="29.5" r="1" fill="#7D5BA6"/>
      <path d="M26 37Q32 40 38 37" stroke="#2E1F3E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <line x1="22" y1="34" x2="18" y2="32" stroke="#6B5B7B" stroke-width="2" opacity="0.6"/>
      <line x1="42" y1="34" x2="46" y2="32" stroke="#6B5B7B" stroke-width="2" opacity="0.6"/>
      <line x1="20" y1="38" x2="16" y2="38" stroke="#6B5B7B" stroke-width="2" opacity="0.6"/>
      <line x1="44" y1="38" x2="48" y2="38" stroke="#6B5B7B" stroke-width="2" opacity="0.6"/>
    </svg>`,
    spawnPoints: [
      { lat: -6.9300, lng: 107.6100, label: 'Rumah Tua' }
    ],
    sounds: {
      appear: ['*suara anak menangis*', 'Kemari nak...'],
      hit: ['HAHAHA!', '*tertawa seram*'],
      captured: ['*meratap*', 'Anak-anakkuu...']
    }
  }
];

export function getGhostById(id) {
  return ghosts.find(g => g.id === id);
}

export function getGhostsByRarity(rarity) {
  return ghosts.filter(g => g.rarity === rarity);
}
