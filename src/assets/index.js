// This file helps Vite with asset imports
// It enables importing all assets at once and managing them in one place

// Import assets
// This is a Vite feature that lets us import all assets in a directory
const imageAssets = import.meta.glob('./images/*.{png,jpg,jpeg,gif,svg}', { eager: true });
const spriteAssets = import.meta.glob('./sprites/*.{png,jpg,jpeg,gif,svg}', { eager: true });
const audioAssets = import.meta.glob('./audio/*.{mp3,ogg,wav}', { eager: true });

// Convert import objects to usable URLs
const images = {};
const sprites = {};
const audio = {};

// Process images
Object.entries(imageAssets).forEach(([path, module]) => {
  const key = path.split('/').pop().split('.')[0]; // Extract filename without extension
  images[key] = module.default;
});

// Process sprites
Object.entries(spriteAssets).forEach(([path, module]) => {
  const key = path.split('/').pop().split('.')[0]; // Extract filename without extension
  sprites[key] = module.default;
});

// Process audio
Object.entries(audioAssets).forEach(([path, module]) => {
  const key = path.split('/').pop().split('.')[0]; // Extract filename without extension
  audio[key] = module.default;
});

// Export all assets
export { images, sprites, audio };

// Export a helper function to preload assets in Phaser
export function preloadAssets(scene) {
  // Load images
  Object.entries(images).forEach(([key, url]) => {
    scene.load.image(key, url);
  });
  
  // Load sprite sheets - Note: This needs frameWidth/frameHeight which we don't have here
  // You'd need to extend this with sprite sheet config
  
  // Load audio
  Object.entries(audio).forEach(([key, url]) => {
    scene.load.audio(key, url);
  });
}