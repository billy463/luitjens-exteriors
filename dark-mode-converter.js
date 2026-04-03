const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Backgrounds
      content = content.replace(/bg-white/g, 'bg-darker');
      content = content.replace(/bg-gray-50/g, 'bg-dark');
      content = content.replace(/bg-gray-100/g, 'bg-dark/50');
      
      // Text
      content = content.replace(/text-gray-900/g, 'text-gray-100');
      content = content.replace(/text-gray-800/g, 'text-gray-200');
      content = content.replace(/text-gray-700/g, 'text-gray-300');
      content = content.replace(/text-gray-600/g, 'text-gray-400');
      content = content.replace(/text-gray-500/g, 'text-gray-400');
      
      // Explicit Custom Colors
      content = content.replace(/text-darker/g, 'text-white');
      content = content.replace(/text-dark/g, 'text-gray-200');
      
      // Contextual Darts
      // Ensure specific icon classes aren't erased
      
      // Borders & Rings
      content = content.replace(/border-gray-100/g, 'border-gray-800');
      content = content.replace(/border-gray-200/g, 'border-gray-800');
      content = content.replace(/ring-gray-50/g, 'ring-gray-800');
      content = content.replace(/ring-white/g, 'ring-darker');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Converted: ${fullPath}`);
    }
  }
}

const targetDirs = [
  path.join('C:', 'Users', 'billy.willis', '.vscode', 'luitjens-exteriors', 'src', 'pages'),
  path.join('C:', 'Users', 'billy.willis', '.vscode', 'luitjens-exteriors', 'src', 'components')
];

for (const dir of targetDirs) {
  processDir(dir);
}
console.log('Dark mode conversion script completed successfully.');
