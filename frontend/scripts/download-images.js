const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  // Hero image - Modern medical facility with technology
  'hero-medical.jpg': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=800&fit=crop&q=80',
  
  // Feature images - Square format for icons
  'scheduling.jpg': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=400&fit=crop&q=80',
  'patient-portal.jpg': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop&q=80',
  'reminders.jpg': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&q=80',
  'digital-records.jpg': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop&q=80',
  
  // Benefit images - Square format for icons
  'efficiency.jpg': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop&q=80',
  'security.jpg': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&q=80',
  'cloud.jpg': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop&q=80',
  'mobile.jpg': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop&q=80',
  
  // Image grid - Landscape format for cards
  'medical-team.jpg': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop&q=80',
  'technology.jpg': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop&q=80',
  'patient-care.jpg': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&q=80'
};

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, '../public/images', filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

const downloadAllImages = async () => {
  const imageDir = path.join(__dirname, '../public/images');
  
  // Create images directory if it doesn't exist
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  console.log('Starting image downloads...');
  
  for (const [filename, url] of Object.entries(images)) {
    try {
      await downloadImage(url, filename);
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
    }
  }
  
  console.log('All downloads completed!');
};

downloadAllImages(); 