/* 地图数据校验（模拟运行时 sanitize 后检查） */
global.window = global;
global.addEventListener = global.addEventListener || function () {};
global.document = { getElementById() { return null; }, querySelectorAll() { return []; }, addEventListener() {} };
require('../js/engine.js');
require('../js/data.js');
require('../js/memes.js');
require('../js/map.js');
require('../js/maps_data.js');

const WALK = new Set(['.', ',', ';', 'P', 'B', 'S', 'C', '^', '=', '~', '-']);
const errs = [];
let tiles = 0, entities = 0, exits = 0;

for (const [id, raw] of Object.entries(G.mapDefs)) {
  const m = G.map._sanitize(raw);
  if (m.rows.length !== m.h) errs.push(`${id}: 行数 ${m.rows.length} != h ${m.h}`);
  m.rows.forEach((row, y) => { if (row.length !== m.w) errs.push(`${id}: 第${y}行 宽 ${row.length} != w ${m.w}`); tiles += row.length; });
  for (const e of (m.entities || [])) {
    entities++;
    const ch = m.rows[e.y][e.x];
    if (!WALK.has(ch)) errs.push(`${id}: 实体 ${e.type}@${e.x},${e.y} 仍在障碍 '${ch}' 上`);
    if (e.type === 'exit') {
      exits++;
      if (!G.mapDefs[e.to]) errs.push(`${id}: 出口指向不存在的地图 ${e.to}`);
      else {
        const t = G.map._sanitize(G.mapDefs[e.to]);
        if (!WALK.has(t.rows[e.toY][e.toX])) errs.push(`${id}: 出口落点 ${e.to}@${e.toX},${e.toY} 是障碍`);
      }
    }
  }
  if (!WALK.has(m.rows[m.spawn[1]][m.spawn[0]])) errs.push(`${id}: 出生点在障碍上`);
}
console.log(`地图 ${Object.keys(G.mapDefs).length} 张 | 瓦片 ${tiles} | 实体 ${entities} | 出口 ${exits}`);
if (errs.length) { console.log(`❌ ${errs.length} 个问题:`); errs.forEach(e => console.log('  ' + e)); process.exit(1); }
console.log('✅ 地图数据全部合法');
