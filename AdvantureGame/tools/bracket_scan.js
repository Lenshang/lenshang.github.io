// 括号平衡扫描器（字符串感知）
const fs = require('fs');
const file = process.argv[2];
const lines = fs.readFileSync(file, 'utf8').split('\n');
let sq = 0, par = 0, curly = 0, sqLine = [], parLine = [], curlyLine = [];
for (let i = 0; i < lines.length; i++) {
  const L = lines[i];
  let inStr = false, esc = false;
  for (const ch of L) {
    if (esc) { esc = false; continue; }
    if (ch === '\\') { if (inStr) esc = true; continue; }
    if (ch === "'") { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '[') { sq++; sqLine.push(i + 1); }
    else if (ch === ']') { sq--; sqLine.pop(); }
    else if (ch === '(') { par++; parLine.push(i + 1); }
    else if (ch === ')') { par--; parLine.pop(); }
    else if (ch === '{') { curly++; curlyLine.push(i + 1); }
    else if (ch === '}') { curly--; curlyLine.pop(); }
  }
  if (sq < 0 || par < 0 || curly < 0) console.log(`行 ${i + 1} 出现负深度 sq=${sq} par=${par} curly=${curly}`);
}
console.log(`END: 未闭合 [ 共${sq} 开于行 ${sqLine.join(',')} | ( 共${par} 开于行 ${parLine.join(',')} | { 共${curly} 开于行 ${curlyLine.join(',')}`);
