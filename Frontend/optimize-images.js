const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'src', 'assets', 'images');

const images = [
  'ServiceLab.png',
  'ServiceNurse.png',
  'ServiceEmergency.png',
  'HomeDoctor.png',
  'LogoFull2.png',
  'LogoSOLO.png',
  'LogoSOLO2.png',
  'IconoFull.png',
  'FondoLogin.png',
  'DoctorLogin.png',
  'DoctorCrear.png',
  'DoctorRecuperar.png',
  'DoctorEmpleo.png'
];

async function optimizeImages() {
  for (const img of images) {
    const inputPath = path.join(imgDir, img);
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${img}, file not found.`);
      continue;
    }
    
    const outputName = img.replace('.png', '.webp');
    const outputPath = path.join(imgDir, outputName);
    
    try {
      await sharp(inputPath)
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);
      console.log(`✅ Converted ${img} to ${outputName}`);
    } catch (err) {
      console.error(`❌ Error converting ${img}:`, err);
    }
  }
}

optimizeImages();
