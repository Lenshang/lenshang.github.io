/* 剧情数据静态校验：检查场景引用 / 物品 / 敌人 / 成就 / 梗 / 支线 */
const fs = require('fs');
const path = require('path');
global.window = global;
require('../js/engine.js');
require('../js/data.js');
require('../js/memes.js');
require('../js/story/ch0.js');
require('../js/story/ch1.js');
require('../js/story/ch2.js');
require('../js/story/ch3.js');
require('../js/story/ch4.js');
require('../js/story/ch5.js');
require('../js/story/ch6.js');
require('../js/story/ch7.js');
require('../js/story/ch8.js');
require('../js/story/side.js');
require('../js/story/post.js');

const errs = [];
const warn = [];
const sceneIds = new Set();   // 'ch:start' 形式
const localIds = {};          // ch -> Set(sceneId)

for (const [chId, ch] of Object.entries(G.chapters)) {
  localIds[chId] = new Set(Object.keys(ch.scenes));
  for (const sid of Object.keys(ch.scenes)) sceneIds.add(chId + ':' + sid);
}
for (const [chId, s] of Object.entries(G.sides)) {
  if (!s.scenes) continue;
  localIds[chId] = new Set(Object.keys(s.scenes));
  for (const sid of Object.keys(s.scenes)) sceneIds.add(chId + ':' + sid);
}

function resolveRef(chId, ref) {
  // 返回规范化的 scene id 或 null
  if (!ref || ref === '@world') return '@world';
  if (ref.includes(':')) {
    const [c, ...rest] = ref.split(':');
    const id = rest.join(':');
    if (localIds[c] && localIds[c].has(id)) return c + ':' + id;
    return null;
  }
  // 本地引用：查找所有同名（宽松模式：当前章节优先）
  for (const c of [chId, ...Object.keys(localIds)]) {
    if (localIds[c] && localIds[c].has(ref)) return c + ':' + ref;
  }
  return null;
}

function checkStep(chId, scId, st) {
  if (!st || typeof st !== 'object') { errs.push(`${chId}:${scId} 步骤非对象: ${JSON.stringify(st)}`); return; }
  const t = st.t;
  const refCh = chId;
  const push = m => errs.push(`${chId}:${scId} [${t}] ${m}`);
  switch (t) {
    case 'bg': case 'bgm': case 'sfx': case 'n': case 'd': case 'think': case 'title':
    case 'give': case 'gold': case 'gongde': case 'meme': case 'ach': case 'quest':
    case 'flag': case 'shard': case 'aff': case 'karma': case 'join': case 'shop':
    case 'inn': case 'unlock': case 'lock': case 'muyu': case 'fish': case 'gacha':
    case 'rps': case 'qte': case 'card': case 'end': case 'post': case 'wait':
    case 'shake': case 'anim': case 'heal': case 'chapter': case 'ckpt': case 'world': case 'lose':
    case 'goto': case 'battle': case 'choice': case 'if': case 'expAll':
      break;
    default: warn.push(`${chId}:${scId} 未知指令类型: ${t}`);
  }
  if (t === 'goto' && st.v && resolveRef(refCh, st.v) === null) push(`goto 目标不存在: ${st.v}`);
  if (t === 'give' && !G.data.items[st.v]) push(`物品不存在: ${st.v}`);
  if (t === 'join' && !G.data.classes[st.v]) push(`职业不存在: ${st.v}`);
  if (t === 'meme' && !G.memes.find(m => m.id === st.v)) push(`梗不存在: ${st.v}`);
  if (t === 'ach' && !G.data.ach[st.v]) push(`成就不存在: ${st.v}`);
  if (t === 'shop' && !G.data.shops[st.v]) push(`商店不存在: ${st.v}`);
  if (t === 'quest' && !(G.sides.quests || []).find(q => q.id === st.v)) push(`委托不存在: ${st.v}`);
  if (t === 'battle' && st.v) {
    for (const e of (st.v.enemies || [])) if (!G.data.enemies[e]) push(`敌人不存在: ${e}`);
    if (st.v.onLose && resolveRef(refCh, st.v.onLose) === null) push(`onLose 场景不存在: ${st.v.onLose}`);
  }
  if (t === 'choice') {
    for (const o of (st.v || [])) {
      if (o.goto && o.goto !== '@skip' && resolveRef(refCh, o.goto) === null) push(`choice goto 不存在: ${o.goto}`);
      if (o.meme && !G.memes.find(m => m.id === o.meme)) push(`choice meme 不存在: ${o.meme}`);
      if (o.aff) for (const w of Object.keys(o.aff)) if (!(w in { youzi: 1, dundun: 1, qianji: 1, yase: 1 })) push(`aff 对象错误: ${w}`);
    }
  }
  if (t === 'if' && st.v) {
    if (st.v.then && resolveRef(refCh, st.v.then) === null) push(`if then 不存在: ${st.v.then}`);
    if (st.v.else && resolveRef(refCh, st.v.else) === null) push(`if else 不存在: ${st.v.else}`);
  }
}

for (const [chId, ch] of Object.entries(G.chapters)) {
  for (const [scId, sc] of Object.entries(ch.scenes)) {
    if (sc.next && resolveRef(chId, sc.next) === null) errs.push(`${chId}:${scId} next 不存在: ${sc.next}`);
    for (const st of (sc.steps || [])) checkStep(chId, scId, st);
  }
}
for (const [chId, s] of Object.entries(G.sides)) {
  if (!s.scenes) continue;
  for (const [scId, sc] of Object.entries(s.scenes)) {
    if (sc.next && resolveRef(chId, sc.next) === null) errs.push(`${chId}:${scId} next 不存在: ${sc.next}`);
    for (const st of (sc.steps || [])) checkStep(chId, scId, st);
  }
}
// 支线场景引用
for (const q of (G.sides.quests || [])) {
  if (q.scene && q.scene.trim() && resolveRef('side', q.scene) === null && resolveRef('post', q.scene) === null) errs.push(`委托 ${q.id} 场景不存在: ${q.scene}`);
}
// 主线目标
const mainScenes = ['ch0:start', 'ch1:start', 'ch2:start', 'ch3:start', 'ch4:start', 'ch5:start', 'ch6:start', 'ch7:start', 'ch8:start'];
for (const m of mainScenes) if (!sceneIds.has(m)) errs.push(`主线场景缺失: ${m}`);
// 技能引用的物品
for (const [k, it] of Object.entries(G.data.items)) {
  if (it.price > 0 && it.type === 'equip' && !it.rarity) warn.push(`装备未设稀有度: ${k}`);
}
// 世界地点引用的委托地点
for (const q of (G.sides.quests || [])) {
  // loc 字段只是展示，不校验
}

console.log('=== 校验结果 ===');
console.log(`场景总数: ${sceneIds.size}`);
if (errs.length) {
  console.log(`\n❌ 错误 ${errs.length} 个:`);
  errs.forEach(e => console.log('  ' + e));
} else console.log('✅ 无错误');
if (warn.length) {
  console.log(`\n⚠️ 提示 ${warn.length} 个:`);
  warn.slice(0, 20).forEach(e => console.log('  ' + e));
}
