const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'src', 'assets', 'images');

// Dimensiones exactas según Lighthouse: usar el tamaño renderizado en pantalla de escritorio
// Lighthouse evalúa a 1350px de ancho, por lo que usamos 1x (no 2x) para que no sean gigantes
const resizeTasks = [
  { file: 'ServiceLab.webp', width: 220, height: 220 },
  { file: 'ServiceNurse.webp', width: 450, height: 450 },
  { file: 'ServiceEmergency.webp', width: 220, height: 220 },
  { file: 'HomeDoctor.webp', width: 320, height: 320 },
  { file: 'LogoFull2.webp', width: 389, height: 212 },
  { file: 'LogoSOLO.webp', width: 220, height: 120 }
];

async function resizeImages() {
  for (const task of resizeTasks) {
    const inputPath = path.join(imgDir, task.file);
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${task.file}, file not found.`);
      continue;
    }

    const buffer = fs.readFileSync(inputPath);

    try {
      await sharp(buffer)
        .resize({ width: task.width, height: task.height, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toFile(inputPath);
      console.log(`✅ Resized ${task.file} to max ${task.width}x${task.height}`);
    } catch (err) {
      console.error(`❌ Error resizing ${task.file}:`, err);
    }
  }
}

resizeImages();
