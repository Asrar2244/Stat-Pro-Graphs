const fs = require('fs');
const path = require('path');

function removeConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeConsoleLogs(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove console.log, console.warn, console.error, console.group, console.groupEnd statements
      // This regex matches console statements that span multiple lines
      content = content.replace(/console\.(log|warn|error|group|groupEnd)\([^;]*\);?\s*/g, '');
      
      // Remove console statements with object literals that span multiple lines
      content = content.replace(/console\.(log|warn|error|group|groupEnd)\([^)]*\{[^}]*\}[^)]*\);?\s*/g, '');
      
      // Remove console statements with template literals
      content = content.replace(/console\.(log|warn|error|group|groupEnd)\(`[^`]*`[^)]*\);?\s*/g, '');
      
      // Remove any remaining console statements
      content = content.replace(/console\.(log|warn|error|group|groupEnd)\([^)]*\);?\s*/g, '');
      
      fs.writeFileSync(filePath, content);
      console.log(`Processed: ${filePath}`);
    }
  });
}

// Remove console logs from the graphs-render utils directory
removeConsoleLogs('src/screens/graphs-render/utils');
console.log('Console log removal complete!');
