// Simple script to generate PWA icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon with a tooth design
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createSVG = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3B82F6"/>
  <g transform="translate(${size * 0.2}, ${size * 0.15})">
    <path d="M ${size * 0.3} ${size * 0.1} 
             Q ${size * 0.5} ${size * 0.05} ${size * 0.7} ${size * 0.1}
             Q ${size * 0.75} ${size * 0.3} ${size * 0.7} ${size * 0.5}
             Q ${size * 0.65} ${size * 0.7} ${size * 0.6} ${size * 0.7}
             L ${size * 0.4} ${size * 0.7}
             Q ${size * 0.35} ${size * 0.7} ${size * 0.3} ${size * 0.5}
             Q ${size * 0.25} ${size * 0.3} ${size * 0.3} ${size * 0.1} Z" 
          fill="white"/>
  </g>
  <text x="50%" y="85%" text-anchor="middle" fill="white" font-size="${size * 0.12}" font-family="Arial, sans-serif" font-weight="bold">Dental AI</text>
</svg>`;

// Generate SVG files
console.log('Generating PWA icons...\n');

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(__dirname, 'public', 'icons', filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✓ Created ${filename}`);
});

console.log('\nAll icons generated successfully!');
console.log('Note: These are SVG icons. Modern browsers support them for PWAs.');
console.log('If you need PNG files, you can use an online SVG-to-PNG converter.');
