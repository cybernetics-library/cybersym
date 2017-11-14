//   API_URL: `http://library.cybernetics.social/checkouts/${HOSTNAME}`,
const PLANET_RADIUS = 6;
const PLANET_PADDING = 2;
const config = {
  // API_URL: `http://library.cybernetics.social`,
  API_URL: 'http://localhost:5000',
  HOSTNAME: 'anarres',
  DEBUG: false,

  MAX_RADIUS: 12,
  PLANET_RADIUS: PLANET_RADIUS,
  MIN_RADIUS: PLANET_RADIUS + PLANET_PADDING,
  COLORS: {
    'economy': 0xef0707,
    'biology': 0x09a323,
    'architecture': 0xe5c212,
    'society': 0x4286f4,
    'technology': 0xff87c7
  }
};
export default config;
