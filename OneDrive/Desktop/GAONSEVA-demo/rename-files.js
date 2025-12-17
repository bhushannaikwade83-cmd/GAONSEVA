const fs = require('fs');
const path = require('path');

function renameFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      renameFiles(fullPath);
    } else if (file.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('</') || content.includes('/>') || content.includes('React.Fragment') || content.includes('React.createElement')) {
        const newPath = fullPath.replace(/\.js$/, '.jsx');
        fs.renameSync(fullPath, newPath);
        console.log(`Renamed: ${fullPath} -> ${newPath}`);
      }
    }
  }
}

// Start renaming from the src directory
renameFiles(path.join(__dirname, 'src'));
