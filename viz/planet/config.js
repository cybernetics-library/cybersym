//   API_URL: `http://library.cybernetics.social/checkouts/${HOSTNAME}`,
const PLANET_RADIUS = 6;
const PLANET_PADDING = 4;
const config = {
  // API_URL: `http://library.cybernetics.social`,
  API_URL: 'http://localhost:5000',
  HOSTNAME: 'anarres',
  DEBUG: false,

  MAX_RADIUS: 12,
  PLANET_RADIUS: PLANET_RADIUS,
  MIN_RADIUS: PLANET_RADIUS + PLANET_PADDING,
  COLORS: {
    'economics': 0xef0707,
    'biology': 0x09a323,
    'architecture': 0xe5c212,
    'society': 0x4286f4,
    'computation': 0xff87c7,

    'art': 0xef0707,
    'business': 0x09a323,
    'cognition': 0xe5c212,
    'media': 0x4286f4,
    'humanities': 0xff87c7,

    'politics': 0xef0707,
    'systems': 0x09a323,
    'science': 0xe5c212,

    'design': 0x222222
  }
};
export default config;
