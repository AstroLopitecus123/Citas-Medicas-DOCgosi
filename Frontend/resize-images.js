const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'src', 'assets', 'images');

const resizeTasks = [
  { file: 'ServiceLab.webp', width: 440, height: 440 },
  { file: 'ServiceNurse.webp', width: 900, height: 900 },
  { file: 'ServiceEmergency.webp', width: 440, height: 440 },
  { file: 'HomeDoctor.webp', width: 640, height: 640 },
  { file: 'LogoFull2.webp', width: 778, height: 424 },
  { file: 'LogoSOLO.webp', width: 440, height: 240 }
];

async function resizeImages() {
  for (const task of resizeTasks) {
    const inputPath = path.join(imgDir, task.file);
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${task.file}, file not found.`);
      continue;
    }
    
    // Read the file to a buffer first to avoid locking issues
    const buffer = fs.readFileSync(inputPath);
    
    try {
      await sharp(buffer)
        .resize({ width: task.width, height: task.height, fit: 'inside' })
        .webp({ quality: 85, effort: 6 })
        .toFile(inputPath);
      console.log(`✅ Resized ${task.file} to ${task.width}x${task.height}`);
    } catch (err) {
      console.error(`❌ Error resizing ${task.file}:`, err);
    }
  }
}

resizeImages();
