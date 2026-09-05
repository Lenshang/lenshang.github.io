# -*- coding: utf-8 -*-
"""world.js 大改：行程图→进入地图 / 委托板+讨伐悬赏 / 移除旧地点菜单"""
p = 'js/world.js'
src = open(p, encoding='utf-8').read()

# 1. 重写 openMap 区块
start = src.index('    /* ---------------- 世界地图画面 ---------------- */')
end = src.index('    /* ---------------- 地点画面 ---------------- */')
new_openmap = '''    /* ---------------- 行程图（快速旅行） ---------------- */
    openMap() {
      const s = G.state;
      this.curLoc = s.unlockedLocs.includes(this.curLoc) ? this.curLoc : s.unlockedLocs[s.unlockedLocs.length - 1];
      const el = $('#screen-world');
      G.ui.show('screen-world');
      const main = this.currentMain();
      const post = s.postGame;
      const order = ['home_office', 'village', 'farm', 'thursday', 'forest', 'forest2', 'library', 'capital', 'guild', 'factory', 'canal', 'road_truck', 'mine_town', 'mine', 'memory', 'corrupted', 'beach', 'snow_mountain', 'sky', 'castle'];
      const locs = order.filter(id => s.unlockedLocs.includes(id) && G.mapDefs[id]);
      if (!s.hunts) s.hunts = [];
      el.innerHTML = `
        <div class="world-frame">
          <div class="world-head">
            <b>🗺️ 艾梗大陆 · 行程图</b>
            <span class="dim">🧩 碎片 ${s.shards}/7 · 💰 ${s.gold} · ⏱️ ${G.u.fmtTime(s.playSec)}${post ? ' · 🌙 后日谈' : ''}</span>
          </div>
          ${main && !post ? `<div class="main-quest">📜 当前主线：<b>${esc(main.label)}</b> @ ${this.locs[main.loc] ? this.locs[main.loc].emoji + this.locs[main.loc].name : main.loc}　<span class="dim">（进入区域后找 🔻 标记）</span></div>` : ''}
          ${post ? `<div class="main-quest">🌙 后日谈：挑战隐藏Boss、敲完图鉴，或者就……摆着。</div>` : ''}
          ${s.mapPos && G.mapDefs[s.mapPos.map] ? `<div class="main-quest"><button class="mini-btn hl" id="w-back">📍 返回当前区域：${this.locs[s.mapPos.map] ? esc(this.locs[s.mapPos.map].name) : s.mapPos.map}</button></div>` : ''}
          <div class="world-grid">
            ${locs.map(id => {
      const l = this.locs[id] || {};
      const isMain = main && main.loc === id && !post;
      const region = G.mapDefs[id];
      const chests = region ? (region.entities || []).filter(e => e.type === 'chest').length : 0;
      return `<div class="loc-card ${isMain ? 'main' : ''}" data-loc="${id}">
                <div class="loc-emoji">${l.emoji || '❔'}</div><b>${esc(l.name || id)}</b>
                <div class="dim loc-desc">${esc(l.desc || '')}</div>
                <div class="dim" style="font-size:11px;margin-top:4px">🧭 可探索 · 📦×${chests}${l.encounters && l.encounters.length ? ' · ⚔️ 有魔物' : ''}</div>
                ${isMain ? '<div class="loc-go">▶ 主线在此</div>' : ''}
              </div>`;
    }).join('')}
          </div>
          <div class="world-foot">
            <button class="mini-btn" id="w-menu">☰ 菜单</button>
            <button class="mini-btn" id="w-board">📋 委托板</button>
            <button class="mini-btn" id="w-gacha">🎰 扭蛋机</button>
            <button class="mini-btn" id="w-muyu">🥁 电子木鱼</button>
            <button class="mini-btn" id="w-title">🏠 回标题</button>
            <span class="dim">提示：点击区域进入地图自由探索。方向键/WASD移动，E/空格互动。</span>
          </div>
        </div>`;
      el.querySelectorAll('.loc-card').forEach(c => c.onclick = () => { G.audio.sfx('ok'); this.enterMap(c.dataset.loc); });
      $('#w-menu').onclick = () => G.ui.openMenu();
      $('#w-board').onclick = () => this.openBoard();
      $('#w-gacha').onclick = () => this.miniGame.gacha();
      $('#w-muyu').onclick = () => this.miniGame.muyu();
      $('#w-title').onclick = async () => {
        const o = await G.ui.choice([{ label: '回标题（自动存档）' }, { label: '取消' }]);
        if (o.label.includes('取消')) return;
        G.saveGame(0, true);
        G.main.toTitle();
      };
      const back = $('#w-back');
      if (back) back.onclick = () => { G.audio.sfx('ok'); this.enterMap(s.mapPos.map, s.mapPos.x, s.mapPos.y); };
    },
    openWorld() { this.openMap(); },
    enterMap(mapId, x, y) {
      if (!G.mapDefs[mapId]) return;
      if (!G.state.unlockedLocs.includes(mapId)) G.state.unlockedLocs.push(mapId);
      G.map.enter(mapId, x, y);
    },

'''
src = src[:start] + new_openmap + src[end:]

# 2. 删除旧 openLoc
ol_start = src.index('    /* ---------------- 地点画面 ---------------- */')
ol_end = src.index('  };')
src = src[:ol_start] + src[ol_end:]

# 3. 委托板 + 讨伐悬赏（插在小游戏区之前）
anchor = '  /* ============================================================\n   * 小游戏'
board_code = '''  /* ---------------- 委托板 + 讨伐悬赏 ---------------- */
  genHunt() {
    const s = G.state;
    const pools = s.unlockedLocs.map(id => (this.locs[id] && this.locs[id].encounters) || []).filter(p => p.length);
    if (!pools.length) return null;
    const pool = G.u.pick(pools);
    const enemy = G.u.pick(pool);
    const tier = Math.max(1, Math.floor(Object.keys(s.flags).filter(f => f.startsWith('ch') && f.endsWith('_done')).length / 2) + 1);
    const need = G.u.rnd(3, 6);
    const eDef = G.data.enemies[enemy];
    return { id: 'h' + Date.now() + '_' + G.u.rnd(1, 999), enemy, need, got: 0, accepted: false, done: false,
      gold: Math.round((eDef.gold || 20) * need * 1.6 + tier * 60), name: eDef.name, emoji: eDef.emoji };
  },
  progressHunts(keys) {
    const s = G.state;
    if (!s.hunts) return;
    let hit = false;
    for (const h of s.hunts) {
      if (!h.accepted || h.done) continue;
      for (const k of keys) {
        if (k === h.enemy && h.got < h.need) { h.got++; hit = true; }
      }
      if (h.got >= h.need && hit) G.ui.toast('📜 悬赏目标已达成：' + h.name + '！回去委托板交付吧', 'good');
    }
  },
  openBoard() {
    const s = G.state;
    if (!s.hunts) s.hunts = [];
    while (s.hunts.filter(h => !h.accepted).length < 3) {
      const h = this.genHunt();
      if (!h) break;
      s.hunts.push(h);
    }
    const ov = $('#overlay');
    ov.classList.remove('hidden');
    const sides = (G.sides.quests || []).filter(q => !s.flags[q.id + '_done'] && (!q.req || s.flags[q.req]) && (!q.chapter || s.flags[q.chapter]));
    const stamps = Object.keys(s.flags).filter(f => f.indexOf('stamp_') === 0).length;
    const stampReady = s.quests.q_stamp && s.quests.q_stamp.s === 'active' && stamps >= 8;
    const render = () => {
      const offers = s.hunts.filter(h => !h.accepted);
      const act = s.hunts.filter(h => h.accepted && !h.done);
      const doneL = s.hunts.filter(h => h.done).slice(-3);
      ov.innerHTML = '<div class="mg-box" style="text-align:left"><h2>📋 冒险者委托板</h2>' +
        '<h3 class="menu-h">📜 支线委托（' + sides.length + '）</h3>' +
        (sides.length ? sides.map(q => '<div class="quest-item"><b>' + esc(q.name) + '</b> <span class="dim">[' + esc(q.where || '') + ']</span><div class="dim">' + esc(q.desc) + '</div><div class="q-reward">奖励：' + esc(q.reward || '') + '</div><button class="mini-btn" data-q="' + esc(q.scene) + '">前往</button></div>').join('') : '<div class="dim">（暂无可接委托，推进主线后再来看看。）</div>') +
        '<h3 class="menu-h">⚔️ 讨伐悬赏（击杀指定魔物，交付领赏，可反复接取）</h3>' +
        offers.map(h => '<div class="quest-item"><b>' + h.emoji + ' ' + esc(h.name) + '</b> ×' + h.need + '<div class="dim">报酬：💰' + h.gold + '</div><button class="mini-btn" data-acc="' + h.id + '">接取</button></div>').join('') +
        act.map(h => '<div class="quest-item"><b>' + h.emoji + ' ' + esc(h.name) + '</b> 进度 ' + h.got + '/' + h.need + ' ' +
          (h.got >= h.need ? '<button class="mini-btn hl" data-fin="' + h.id + '">交付！领💰' + h.gold + '</button>' : '<span class="dim">讨伐中……（在野外地图走动遇敌即可）</span>') + '</div>').join('') +
        doneL.map(h => '<div class="quest-item done">✅ ' + esc(h.name) + ' ×' + h.need + ' 已交付</div>').join('') +
        (stampReady ? '<div class="quest-item"><b>📑 集章卡·八区域巡游</b><div class="dim">已集 ' + stamps + ' 枚印章！</div><button class="mini-btn hl" data-stamp="1">交付！领奖励</button></div>' : '') +
        '<div style="text-align:center;margin-top:10px"><button class="mini-btn" id="board-x">合上委托板</button></div></div>';
      ov.querySelector('#board-x').onclick = () => { ov.classList.add('hidden'); ov.innerHTML = ''; };
      ov.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
        ov.classList.add('hidden'); ov.innerHTML = '';
        G.ui.playScene(b.dataset.q);
      });
      ov.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => {
        const h = s.hunts.find(x => x.id === b.dataset.acc);
        if (h) { h.accepted = true; G.audio.sfx('ok'); G.ui.toast('📜 接取悬赏：讨伐 ' + h.name + ' ×' + h.need, 'good'); }
        render();
      });
      ov.querySelectorAll('[data-fin]').forEach(b => b.onclick = () => {
        const h = s.hunts.find(x => x.id === b.dataset.fin);
        if (h) {
          h.done = true;
          G.gainGold(h.gold);
          G.gainExp(Math.round(h.gold * 0.8));
          G.audio.sfx('level');
          G.ui.toast('🏆 悬赏完成！💰' + h.gold + ' 与经验入账', 'good');
        }
        render();
      });
      const st = ov.querySelector('[data-stamp]');
      if (st) st.onclick = () => {
        G.quest('q_stamp', 'done');
        s.flags.q_stamp_done = true;
        G.gainItem('i_naicha', 2);
        G.gainGold(300);
        G.karma(2);
        G.audio.sfx('level');
        render();
      };
    };
    render();
  },

'''
src = src.replace(anchor, board_code + anchor)

# 4. 小游戏关闭时：仅在既不在剧情也不在地图时才回行程图
src = src.replace(
  "if (document.querySelector('#screen-game').classList.contains('hidden')) G.world.openMap(); };".replace("'", "\\'"),
  "if (document.querySelector('#screen-game').classList.contains('hidden') && document.querySelector('#screen-map').classList.contains('hidden')) G.world.openMap(); };")

open(p, 'w', encoding='utf-8').write(src)
print('world.js rewritten, len =', len(src))
