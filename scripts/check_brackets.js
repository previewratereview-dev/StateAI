const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../src/components/Industries.tsx');
const s = fs.readFileSync(file, 'utf8');
const opens = '([{';
const closes = ')]}';
let stack = [];
for (let i = 0; i < s.length; i++) {
  const c = s[i];
  if (opens.includes(c)) stack.push({ c, i });
  else if (closes.includes(c)) {
    if (stack.length === 0) {
      console.log('Unmatched closing', c, 'at', i);
      process.exit(1);
    }
    const last = stack.pop();
    if (opens.indexOf(last.c) !== closes.indexOf(c)) {
      console.log('Mismatched', last.c, c, 'at', i);
      process.exit(1);
    }
  }
}
if (stack.length) {
  console.log('Unclosed', stack[stack.length - 1].c, 'at', stack[stack.length - 1].i);
  process.exit(1);
}
console.log('All brackets balanced');
