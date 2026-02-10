// Creature definitions - Palworld/Pokemon style creatures
export const CREATURES = [
  {
    id: 'fluffox',
    name: 'Fluffox',
    emoji: '🦊',
    description: 'A fluffy fire fox with a warm heart',
    colors: {
      primary: 0xFF6B4A,
      secondary: 0xFFB347,
      accent: 0xFFE4B5
    },
    personality: 'playful',
    sounds: {
      happy: ['Yip!', 'Fluff!', '♪'],
      pet: ['Purrrr~', '❤️', 'Cozy!'],
      feed: ['Yum!', 'Nomnom!', 'Tasty!']
    }
  },
  {
    id: 'bubbird',
    name: 'Bubbird',
    emoji: '🐦',
    description: 'A cheerful bubble bird that loves to sing',
    colors: {
      primary: 0x7EC8E3,
      secondary: 0xB8E0FF,
      accent: 0xFFFFFF
    },
    personality: 'cheerful',
    sounds: {
      happy: ['Tweet!', 'Chirp!', '♬'],
      pet: ['Coo~', 'Fluffy!', 'Nice!'],
      feed: ['Peck!', 'Yummy!', 'More!']
    }
  },
  {
    id: 'leafling',
    name: 'Leafling',
    emoji: '🌿',
    description: 'A gentle plant spirit from the forest',
    colors: {
      primary: 0x6BCB77,
      secondary: 0x98D8AA,
      accent: 0xFFE4C9
    },
    personality: 'gentle',
    sounds: {
      happy: ['Rustle~', '🌸', 'Bloom!'],
      pet: ['Soft~', 'Green!', 'Peace~'],
      feed: ['Absorb!', 'Sun!', 'Grow!']
    }
  },
  {
    id: 'sparkitty',
    name: 'Sparkitty',
    emoji: '⚡',
    description: 'An electric kitten with shocking cuteness',
    colors: {
      primary: 0xFFD93D,
      secondary: 0xFFF176,
      accent: 0xFFFFFF
    },
    personality: 'energetic',
    sounds: {
      happy: ['Zap!', 'Meow!', '⚡'],
      pet: ['Purrrzzt~', 'Shock!', 'Tingle!'],
      feed: ['Charge!', 'Energy!', 'Power!']
    }
  },
  {
    id: 'aquapup',
    name: 'Aquapup',
    emoji: '💧',
    description: 'A water puppy from the ocean depths',
    colors: {
      primary: 0x4ECDC4,
      secondary: 0x7FDBDA,
      accent: 0xFFE4E4
    },
    personality: 'friendly',
    sounds: {
      happy: ['Splash!', 'Woof!', '💦'],
      pet: ['Bubble~', 'Wet!', 'Cool!'],
      feed: ['Gulp!', 'Fish!', 'Yum!']
    }
  },
  {
    id: 'stardust',
    name: 'Stardust',
    emoji: '✨',
    description: 'A cosmic creature from the stars',
    colors: {
      primary: 0x7C5CFF,
      secondary: 0xB39DDB,
      accent: 0xFFE082
    },
    personality: 'mysterious',
    sounds: {
      happy: ['Sparkle~', '★', 'Cosmic!'],
      pet: ['Twinkle~', 'Shine!', 'Glow!'],
      feed: ['Absorb~', 'Stars!', 'Energy!']
    }
  }
];

export function getCreatureById(id) {
  return CREATURES.find(c => c.id === id);
}
