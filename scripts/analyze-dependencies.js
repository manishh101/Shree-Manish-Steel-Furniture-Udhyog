#!/usr/bin/env node

/**
 * Dependency Analysis Script
 * Analyzes which dependencies are actually used in the codebase
 */

const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');

console.log('📦 Analyzing Dependencies...\n');

const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});

console.log(`Total dependencies: ${dependencies.length}`);
console.log(`Total devDependencies: ${devDependencies.length}\n`);

// Check which dependencies are imported
function searchImports(dir, deps) {
  const results = {};
  deps.forEach(dep => {
    results[dep] = false;
  });

  function walk(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      // Skip node_modules and .next
      if (file === 'node_modules' || file === '.next' || file === '.git') {
        return;
      }
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          deps.forEach(dep => {
            // Check for various import patterns
            const patterns = [
              `from '${dep}'`,
              `from "${dep}"`,
              `require('${dep}')`,
              `require("${dep}")`,
              `import('${dep}')`,
              `import("${dep}")`,
            ];
            
            if (patterns.some(pattern => content.includes(pattern))) {
              results[dep] = true;
            }
          });
        } catch (err) {
          // Skip files that can't be read
        }
      }
    });
  }
  
  walk(dir);
  return results;
}

console.log('🔍 Scanning for dependency usage...\n');

const appDir = path.join(__dirname, '..');
const usage = searchImports(appDir, dependencies);

console.log('📊 Dependency Usage Report:\n');
console.log('✅ Used Dependencies:');
Object.entries(usage)
  .filter(([, used]) => used)
  .forEach(([dep]) => {
    console.log(`  - ${dep}`);
  });

console.log('\n⚠️  Potentially Unused Dependencies:');
const unused = Object.entries(usage)
  .filter(([, used]) => !used)
  .map(([dep]) => dep);

if (unused.length === 0) {
  console.log('  None found!');
} else {
  unused.forEach(dep => {
    console.log(`  - ${dep}`);
  });
  console.log(`\n💡 Consider removing ${unused.length} unused dependencies to reduce bundle size.`);
}

console.log('\n✨ Analysis complete!');
