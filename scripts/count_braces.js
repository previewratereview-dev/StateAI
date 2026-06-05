const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../src/components/Industries.tsx');
const s = fs.readFileSync(file, 'utf8');
const opens = (s.match(/\{/g) || []).length;
const closes = (s.match(/\}/g) || []).length;
console.log('Open braces:', opens);
console.log('Close braces:', closes);
console.log('Delta (Open - Close):', opens - closes);
