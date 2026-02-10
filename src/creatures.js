export const creatures = [
  {
    id: 'fluffox',
    name: 'Fluffox',
    description: 'A mischievous fire fox with a fluffy tail',
    personality: 'Playful & Curious',
    colors: {
      primary: '#FF7B54',
      secondary: '#FFB26B',
      accent: '#FFD56B'
    },
    gradient: 'linear-gradient(135deg, #FF7B54 0%, #FFB26B 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="38" rx="18" ry="16" fill="#FF7B54"/>
      <ellipse cx="32" cy="42" rx="10" ry="8" fill="#FFD56B"/>
      <path d="M14 30 L20 12 L26 28 Z" fill="#FF7B54"/>
      <path d="M50 30 L44 12 L38 28 Z" fill="#FF7B54"/>
      <path d="M17 26 L21 16 L25 26 Z" fill="#FFB26B"/>
      <path d="M47 26 L43 16 L39 26 Z" fill="#FFB26B"/>
      <ellipse cx="24" cy="36" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="40" cy="36" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="25" cy="37" rx="2.5" ry="3" fill="#3D2B22"/>
      <ellipse cx="41" cy="37" rx="2.5" ry="3" fill="#3D2B22"/>
      <circle cx="26" cy="35.5" r="1" fill="white"/>
      <circle cx="42" cy="35.5" r="1" fill="white"/>
      <ellipse cx="32" cy="44" rx="3" ry="2" fill="#3D2B22"/>
      <path d="M28 48 Q32 51 36 48" stroke="#3D2B22" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="42" r="3" fill="#FFB3B3" opacity="0.5"/>
      <circle cx="44" cy="42" r="3" fill="#FFB3B3" opacity="0.5"/>
    </svg>`,
    sounds: {
      happy: ['Yip!', 'Arf arf!'],
      pet: ['Purrrr~', '*nuzzle*'],
      feed: ['Nom nom!', 'Yummy!']
    }
  },
  {
    id: 'bubbird',
    name: 'Bubbird',
    description: 'A cheerful bird that loves to sing',
    personality: 'Joyful & Musical',
    colors: {
      primary: '#5DADE2',
      secondary: '#85C1E9',
      accent: '#F9E79F'
    },
    gradient: 'linear-gradient(135deg, #5DADE2 0%, #85C1E9 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="38" rx="16" ry="14" fill="#5DADE2"/>
      <ellipse cx="32" cy="42" rx="9" ry="7" fill="#85C1E9"/>
      <circle cx="32" cy="28" r="12" fill="#5DADE2"/>
      <path d="M32 16 L29 8 L32 12 L35 8 L32 16" fill="#F9E79F"/>
      <ellipse cx="27" cy="26" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="37" cy="26" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="28" cy="27" rx="2" ry="2.5" fill="#2C3E50"/>
      <ellipse cx="38" cy="27" rx="2" ry="2.5" fill="#2C3E50"/>
      <circle cx="29" cy="25.5" r="1" fill="white"/>
      <circle cx="39" cy="25.5" r="1" fill="white"/>
      <path d="M32 32 L29 35 L32 34 L35 35 Z" fill="#F5B041"/>
      <path d="M14 36 Q8 32 12 28 Q16 32 14 36" fill="#85C1E9"/>
      <path d="M50 36 Q56 32 52 28 Q48 32 50 36" fill="#85C1E9"/>
      <circle cx="23" cy="30" r="2.5" fill="#FFB3B3" opacity="0.5"/>
      <circle cx="41" cy="30" r="2.5" fill="#FFB3B3" opacity="0.5"/>
    </svg>`,
    sounds: {
      happy: ['Tweet!', 'Chirp chirp!'],
      pet: ['Cooo~', '*flutters*'],
      feed: ['Peck peck!', 'Yum!']
    }
  },
  {
    id: 'leafling',
    name: 'Leafling',
    description: 'A gentle nature spirit from the forest',
    personality: 'Calm & Nurturing',
    colors: {
      primary: '#58D68D',
      secondary: '#82E0AA',
      accent: '#F9E79F'
    },
    gradient: 'linear-gradient(135deg, #58D68D 0%, #82E0AA 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="40" rx="15" ry="14" fill="#58D68D"/>
      <ellipse cx="32" cy="44" rx="9" ry="7" fill="#82E0AA"/>
      <path d="M32 12 Q42 18 38 28 Q32 22 26 28 Q22 18 32 12" fill="#58D68D"/>
      <path d="M32 14 Q38 18 36 24 Q32 20 28 24 Q26 18 32 14" fill="#82E0AA"/>
      <path d="M24 22 Q18 18 22 12 Q28 16 24 22" fill="#58D68D"/>
      <path d="M40 22 Q46 18 42 12 Q36 16 40 22" fill="#58D68D"/>
      <ellipse cx="26" cy="38" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="38" cy="38" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="27" cy="39" rx="2" ry="2.5" fill="#2E4A3F"/>
      <ellipse cx="39" cy="39" rx="2" ry="2.5" fill="#2E4A3F"/>
      <circle cx="28" cy="37.5" r="1" fill="white"/>
      <circle cx="40" cy="37.5" r="1" fill="white"/>
      <ellipse cx="32" cy="46" rx="2.5" ry="1.5" fill="#2E4A3F"/>
      <path d="M29 49 Q32 52 35 49" stroke="#2E4A3F" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="44" r="2.5" fill="#FFB3B3" opacity="0.4"/>
      <circle cx="42" cy="44" r="2.5" fill="#FFB3B3" opacity="0.4"/>
      <circle cx="44" cy="30" r="3" fill="#F9E79F"/>
      <circle cx="45" cy="31" r="1" fill="#F5B041"/>
    </svg>`,
    sounds: {
      happy: ['Rustle~', '*blooms*'],
      pet: ['Shhh...', '*sways*'],
      feed: ['Absorb~', 'Mmm!']
    }
  },
  {
    id: 'sparkitty',
    name: 'Sparkitty',
    description: 'An electric cat with lightning reflexes',
    personality: 'Energetic & Fierce',
    colors: {
      primary: '#F4D03F',
      secondary: '#F9E79F',
      accent: '#FFFFFF'
    },
    gradient: 'linear-gradient(135deg, #F4D03F 0%, #F9E79F 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="40" rx="16" ry="14" fill="#F4D03F"/>
      <ellipse cx="32" cy="44" rx="9" ry="7" fill="#F9E79F"/>
      <path d="M16 34 L14 14 L24 28 Z" fill="#F4D03F"/>
      <path d="M48 34 L50 14 L40 28 Z" fill="#F4D03F"/>
      <path d="M18 30 L17 18 L24 28 Z" fill="#F9E79F"/>
      <path d="M46 30 L47 18 L40 28 Z" fill="#F9E79F"/>
      <ellipse cx="25" cy="38" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="39" cy="38" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="26" cy="39" rx="2.5" ry="3" fill="#2C3E50"/>
      <ellipse cx="40" cy="39" rx="2.5" ry="3" fill="#2C3E50"/>
      <circle cx="27" cy="37" r="1.2" fill="white"/>
      <circle cx="41" cy="37" r="1.2" fill="white"/>
      <ellipse cx="32" cy="46" rx="2.5" ry="1.8" fill="#E67E22"/>
      <path d="M24 50 L26 48 L28 50" stroke="#2C3E50" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M36 50 L38 48 L40 50" stroke="#2C3E50" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M8 24 L12 28 L10 28 L14 32" stroke="#F4D03F" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M56 24 L52 28 L54 28 L50 32" stroke="#F4D03F" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="21" cy="44" r="2.5" fill="#FFB3B3" opacity="0.5"/>
      <circle cx="43" cy="44" r="2.5" fill="#FFB3B3" opacity="0.5"/>
    </svg>`,
    sounds: {
      happy: ['Zzap!', 'Meow!'],
      pet: ['Purrr~', '*sparks*'],
      feed: ['Crunch!', 'Zappy!']
    }
  },
  {
    id: 'aquapup',
    name: 'Aquapup',
    description: 'A playful water pup who loves to splash',
    personality: 'Friendly & Loyal',
    colors: {
      primary: '#5DADE2',
      secondary: '#AED6F1',
      accent: '#FAD7A0'
    },
    gradient: 'linear-gradient(135deg, #5DADE2 0%, #AED6F1 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="40" rx="17" ry="15" fill="#5DADE2"/>
      <ellipse cx="32" cy="45" rx="10" ry="8" fill="#AED6F1"/>
      <ellipse cx="18" cy="32" rx="8" ry="10" fill="#5DADE2" transform="rotate(-20 18 32)"/>
      <ellipse cx="46" cy="32" rx="8" ry="10" fill="#5DADE2" transform="rotate(20 46 32)"/>
      <ellipse cx="18" cy="32" rx="5" ry="7" fill="#AED6F1" transform="rotate(-20 18 32)"/>
      <ellipse cx="46" cy="32" rx="5" ry="7" fill="#AED6F1" transform="rotate(20 46 32)"/>
      <ellipse cx="26" cy="38" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="38" cy="38" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="27" cy="39" rx="2.5" ry="3" fill="#1A5276"/>
      <ellipse cx="39" cy="39" rx="2.5" ry="3" fill="#1A5276"/>
      <circle cx="28" cy="37" r="1.2" fill="white"/>
      <circle cx="40" cy="37" r="1.2" fill="white"/>
      <ellipse cx="32" cy="46" rx="4" ry="2.5" fill="#1A5276"/>
      <ellipse cx="32" cy="45.5" rx="2" ry="1" fill="#5DADE2"/>
      <path d="M26 51 Q32 54 38 51" stroke="#1A5276" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="32" cy="53" rx="3" ry="1.5" fill="#FFB3B3" opacity="0.6"/>
      <circle cx="21" cy="44" r="3" fill="#FFB3B3" opacity="0.4"/>
      <circle cx="43" cy="44" r="3" fill="#FFB3B3" opacity="0.4"/>
      <circle cx="10" cy="50" r="3" fill="#AED6F1" opacity="0.6"/>
      <circle cx="54" cy="48" r="2" fill="#AED6F1" opacity="0.6"/>
      <circle cx="8" cy="44" r="2" fill="#AED6F1" opacity="0.4"/>
    </svg>`,
    sounds: {
      happy: ['Woof!', 'Bark bark!'],
      pet: ['*pant pant*', 'Arf~'],
      feed: ['Slurp!', 'Yum yum!']
    }
  },
  {
    id: 'stardust',
    name: 'Stardust',
    description: 'A cosmic bunny from the stars',
    personality: 'Dreamy & Mystical',
    colors: {
      primary: '#AF7AC5',
      secondary: '#D7BDE2',
      accent: '#F9E79F'
    },
    gradient: 'linear-gradient(135deg, #AF7AC5 0%, #D7BDE2 100%)',
    icon: `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="42" rx="15" ry="14" fill="#AF7AC5"/>
      <ellipse cx="32" cy="46" rx="9" ry="7" fill="#D7BDE2"/>
      <path d="M22 36 Q20 14 24 10 Q28 14 26 36" fill="#AF7AC5"/>
      <path d="M42 36 Q44 14 40 10 Q36 14 38 36" fill="#AF7AC5"/>
      <path d="M23 32 Q22 18 25 14 Q27 18 26 32" fill="#D7BDE2"/>
      <path d="M41 32 Q42 18 39 14 Q37 18 38 32" fill="#D7BDE2"/>
      <ellipse cx="26" cy="40" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="38" cy="40" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="27" cy="41" rx="2" ry="2.5" fill="#4A235A"/>
      <ellipse cx="39" cy="41" rx="2" ry="2.5" fill="#4A235A"/>
      <circle cx="28" cy="39.5" r="1" fill="white"/>
      <circle cx="40" cy="39.5" r="1" fill="white"/>
      <ellipse cx="32" cy="48" rx="2" ry="1.5" fill="#4A235A"/>
      <path d="M29 51 Q32 53 35 51" stroke="#4A235A" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="46" r="2.5" fill="#FFB3B3" opacity="0.5"/>
      <circle cx="42" cy="46" r="2.5" fill="#FFB3B3" opacity="0.5"/>
      <polygon points="12,20 14,24 10,24" fill="#F9E79F"/>
      <polygon points="52,18 54,22 50,22" fill="#F9E79F"/>
      <polygon points="8,32 9.5,35 6.5,35" fill="#F9E79F" opacity="0.7"/>
      <polygon points="56,28 57.5,31 54.5,31" fill="#F9E79F" opacity="0.7"/>
      <circle cx="18" cy="12" r="1.5" fill="#F9E79F"/>
      <circle cx="48" cy="10" r="1" fill="#F9E79F"/>
    </svg>`,
    sounds: {
      happy: ['*sparkle*', 'Squeak!'],
      pet: ['*shimmer*', 'Ooh~'],
      feed: ['*munch*', 'Stardust!']
    }
  }
];

export function getCreatureById(id) {
  return creatures.find(c => c.id === id);
}

export function getCreatureIcon(id) {
  const creature = getCreatureById(id);
  return creature ? creature.icon : '';
}