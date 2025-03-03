// This script creates placeholder assets for the game
// You would replace these with actual game assets later

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Make sure directories exist
const directories = [
    'src/assets/images', 
    'src/assets/sprites', 
    'src/assets/audio'
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Create placeholder images
function createPlaceholderImage(width, height, color, filename) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    // Add grid lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Add text
    const name = path.basename(filename, path.extname(filename));
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, width / 2, height / 2);
    
    // Save file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    
    console.log(`Created ${filename}`);
}

// Create placeholder sprite sheets
function createSpriteSheet(width, height, rows, cols, color, filename) {
    const canvas = createCanvas(width * cols, height * rows);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width * cols, height * rows);
    
    // Draw grid
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    // Draw each sprite cell
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * width;
            const y = row * height;
            
            // Cell border
            ctx.strokeRect(x, y, width, height);
            
            // Cell index
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${row * cols + col}`, x + width / 2, y + height / 2);
        }
    }
    
    // Save file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    
    console.log(`Created ${filename}`);
}

// Create placeholder audio files (empty files with correct extension)
function createPlaceholderAudio(filename) {
    fs.writeFileSync(filename, '');
    console.log(`Created ${filename}`);
}

// Create placeholder images
createPlaceholderImage(800, 600, '#222222', 'src/assets/images/background.png');
createPlaceholderImage(320, 50, '#333333', 'src/assets/images/ui-panel.png');
createPlaceholderImage(100, 40, '#444444', 'src/assets/images/button.png');
createPlaceholderImage(400, 80, '#222222', 'src/assets/images/loading-background.png');
createPlaceholderImage(300, 30, '#555555', 'src/assets/images/loading-bar.png');

// Create placeholder sprite sheets
createSpriteSheet(32, 32, 4, 4, '#00aa00', 'src/assets/sprites/colonist.png'); // 16 frames (4x4)
createSpriteSheet(64, 64, 3, 4, '#aa5500', 'src/assets/sprites/buildings.png'); // 12 frames (3x4)
createSpriteSheet(32, 32, 2, 4, '#555555', 'src/assets/sprites/terrain.png'); // 8 frames (2x4)
createSpriteSheet(32, 32, 1, 4, '#55aa55', 'src/assets/sprites/resources.png'); // 4 frames (1x4)

// Create placeholder audio files
createPlaceholderAudio('src/assets/audio/background-music.mp3');
createPlaceholderAudio('src/assets/audio/build-sound.mp3');
createPlaceholderAudio('src/assets/audio/click-sound.mp3');

console.log('All placeholder assets created successfully!');