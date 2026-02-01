// Anime-themed avatars and character data
export const ANIME_AVATARS = [
  { id: 'ninja', emoji: '🥷', name: 'Shadow Ninja', color: 'from-purple-600 to-indigo-700' },
  { id: 'samurai', emoji: '⚔️', name: 'Blade Master', color: 'from-red-600 to-orange-700' },
  { id: 'mage', emoji: '🔮', name: 'Arcane Sorcerer', color: 'from-blue-600 to-cyan-700' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon Tamer', color: 'from-green-600 to-emerald-700' },
  { id: 'hero', emoji: '⚡', name: 'Lightning Hero', color: 'from-yellow-500 to-amber-600' },
  { id: 'warrior', emoji: '🛡️', name: 'Steel Guardian', color: 'from-gray-600 to-slate-700' },
  { id: 'fox', emoji: '🦊', name: 'Spirit Fox', color: 'from-orange-500 to-red-600' },
  { id: 'phoenix', emoji: '🔥', name: 'Flame Phoenix', color: 'from-red-500 to-pink-600' },
  { id: 'sakura', emoji: '🌸', name: 'Cherry Blossom', color: 'from-pink-400 to-rose-500' },
  { id: 'moon', emoji: '🌙', name: 'Moon Guardian', color: 'from-indigo-500 to-purple-600' },
  { id: 'star', emoji: '⭐', name: 'Star Warrior', color: 'from-yellow-400 to-orange-500' },
  { id: 'ice', emoji: '❄️', name: 'Ice Empress', color: 'from-cyan-400 to-blue-500' }
];

// Anime character quotes
export const ANIME_QUOTES = [
  "Believe in yourself and create your own destiny!",
  "The true power comes from protecting what you love.",
  "Never give up, even when the odds are against you!",
  "Strength isn't everything. Strategy wins battles.",
  "A warrior's spirit burns brightest in the darkest hour.",
  "The path of a champion is paved with determination.",
  "Victory belongs to those who believe in it the most.",
  "Your potential is limitless. Keep pushing forward!",
  "True heroes are forged through challenges.",
  "The strongest opponent is yourself. Overcome it!"
];

// Get random quote
export const getRandomQuote = () => {
  return ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];
};

// Get avatar by id
export const getAvatarById = (id) => {
  return ANIME_AVATARS.find(avatar => avatar.id === id) || ANIME_AVATARS[0];
};
