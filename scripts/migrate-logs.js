const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../app/api')
];

// Helper to recursively get files
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const importStatement = "import { logger } from '@/lib/logger';\n";

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let modified = false;

  // Replace console.error
  if (content.includes('console.error')) {
    content = content.replace(/console\.error\(/g, 'logger.error(');
    modified = true;
  }

  // Replace console.log
  if (content.includes('console.log')) {
    content = content.replace(/console\.log\(/g, 'logger.info(');
    modified = true;
  }

  if (modified) {
    // Add import statement if not present
    if (!content.includes("@/lib/logger")) {
      // Find the first import statement or insert at start
      if (content.startsWith("'use server'") || content.startsWith('"use server"')) {
        // insert after use server directive
        const firstNewLine = content.indexOf('\n');
        content = content.slice(0, firstNewLine + 1) + importStatement + content.slice(firstNewLine + 1);
      } else {
        content = importStatement + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Migrated: ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
}

console.log('Starting migration...');
targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = getFiles(dir);
    files.forEach(migrateFile);
  }
});
console.log('Migration finished!');
