const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace instances of assets/images/SOMETHING.png with .webp
  content = content.replace(/(assets\/images\/[a-zA-Z0-9_-]+)\.png/g, '$1.webp');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach((name) => {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      if (filePath.endsWith('.html') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
        callback(filePath);
      }
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

walkSync(srcDir, replaceInFile);
