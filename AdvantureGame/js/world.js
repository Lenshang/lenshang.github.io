'use strict';
/* ============================================================
 * 世界地图 / 地点 / 支线委托板 / 小游戏（木鱼·钓鱼·扭蛋·猜拳·QTE）
 * ============================================================ */
(() => {
  const esc = G.u.esc;
  const $ = sel => document.querySelector(sel);

  const world = G.world = {
    /* ---------------- 地点定义 ---------------- */
    locs: {
      home_office: { name: '福报科技大厦', emoji: '🏢', desc: '996 的家。班味浓度：饱和。', bgm: 'office' },
      village: { name: '木鱼村', emoji: '🏘️', desc: '艾梗大陆的新手村，以敲木鱼攒功德为传统。', bgm: 'town', encounters: ['slime_green', 'boar_mini', 'monkey_malou'], shop: 'village', inn: 30, minigames: ['muyu'] },
      farm: { name: '村外农田', emoji: '🌾', desc: '村长的萝卜田，最近被野猪王惦记上了。', bgm: 'field', encounters: ['boar_mini', 'slime_green', 'goblin_laoliu', 'alpaca_tuotuo'] },
      forest: { name: '迷雾森林', emoji: '🌲', desc: '雾很大，蘑菇很大，树很老。', bgm: 'forest', encounters: ['wolf_mist', 'mushroom', 'bee_juan', 'slime_gray', 'alpaca_tuotuo'] },
      library: { name: '上古图书馆遗迹', emoji: '🏛️', desc: '收藏着大陆所有的"资料"。Wi-Fi 信号意外地好。', bgm: 'dungeon', encounters: ['ghost_meeting', 'mushroom', 'parrot_gangjing'] },
      capital: { name: '王都·咕咚城', emoji: '🏰', desc: '圣咕噜王国的心脏。公会、酒馆、和排不完的队。', bgm: 'town', shop: 'capital', inn: 80, minigames: ['rps'] },
      guild: { name: '冒险者公会', emoji: '🏺', desc: '接委托、领悬赏、被前台姐姐治愈的地方。', bgm: 'inn', shop: 'guild' },
      factory: { name: '王都工坊区', emoji: '🏭', desc: '最近工人们集体眼神涣散，连打铁都开始内卷。', bgm: 'office', encounters: ['bee_juan', 'keyboard_warrior', 'bat_996'] },
      mine_town: { name: '黑金镇', emoji: '⛰️', desc: '因矿而兴的小镇。最近镇上流行听「布姐」讲上市。', bgm: 'town', encounters: ['monkey_malou', 'catfish_moyu'], shop: 'mine', inn: 60, minigames: ['rps'] },
      mine: { name: '废弃矿坑', emoji: '🕳️', desc: '深处传来念报表的声音。别回头看深渊。', bgm: 'dungeon', encounters: ['resume_golem', 'kpi_inspector', 'bat_996', 'punch_clock'] },
      beach: { name: '椰风湾', emoji: '🏝️', desc: '大陆最南端的度假胜地。蟹老板在这里开了分店。', bgm: 'sky', encounters: ['catfish_moyu', 'icecream_assassin', 'turtle_noreply', 'pigeon_gugu'], shop: 'beach', inn: 70, minigames: ['fishing', 'rps'] },
      canal: { name: '王都运河', emoji: '🌉', desc: '连接王都与外界的水路。桥上站着一位不说话的骑士。', bgm: 'field', encounters: ['turtle_noreply', 'keyboard_warrior'] },
      memory: { name: '初代勇者的故乡遗迹', emoji: '🏚️', desc: '三百年前的小村庄。风一吹，都是旧时光。', bgm: 'sad', encounters: ['ghost_meeting', 'resume_golem'] },
      corrupted: { name: '被污染的林地', emoji: '🥀', desc: '迷雾森林深处。这里的雾会学你说话。', bgm: 'dungeon', encounters: ['slime_gray', 'ghost_meeting', 'ppt_drone'] },
      sky: { name: '天上界·云端机房', emoji: '☁️', desc: '诸神的服务器就架在云上。散热全靠信仰。', bgm: 'sky', encounters: ['cloud_ling', 'server_rack', 'firewall_imp'], shop: 'sky', minigames: ['gacha', 'muyu'] },
      castle: { name: '魔王城·加班大厦', emoji: '🏢', desc: '100层。全楼禁烟，禁笑，禁止下班。', bgm: 'office', encounters: ['bat_996', 'resume_golem', 'kpi_inspector', 'punch_clock', 'ppt_drone'] },
      snow_mountain: { name: '霜语雪山', emoji: '🏔️', desc: '大陆之巅。传闻山上有位白色的大王。', bgm: 'forest', encounters: ['icecream_assassin', 'wolf_mist'] },
      thursday: { name: '星期四平原', emoji: '🌾', desc: '每到星期四，天空就会响起炸鸡的香味。', bgm: 'field', encounters: ['kfc_chicken'] },
      road_truck: { name: '轮回公路', emoji: '🛣️', desc: '异世界传送事故高发路段。请勿横穿马路。', bgm: 'field', encounters: [] },
    },

    curLoc: 'village',

    curLocName() {
      const l = this.locs[this.curLoc];
      return l ? l.name : '';
    },
    curBgmFor() {
      const l = this.locs[this.curLoc];
      return l ? l.bgm : 'town';
    },

    /* ---------------- 主线进度表 ---------------- */
    mainTargets() {
      const f = G.state.flags;
      const T = [
        { id: 'm0', loc: 'home_office', done: f.ch0_done, scene: 'ch0:start', label: '序章·社畜的最后一夜' },
        { id: 'm1', loc: 'village', done: f.ch1_done, scene: 'ch1:start', label: '第一章·木鱼村的骚动', req: f.ch0_done },
        { id: 'm2', loc: 'forest', done: f.ch2_done, scene: 'ch2:start', label: '第二章·迷雾森林与图书馆', req: f.ch1_done },
        { id: 'm3', loc: 'capital', done: f.ch3_done, scene: 'ch3:start', label: '第三章·王都与公会', req: f.ch2_done },
        { id: 'm4', loc: 'mine_town', done: f.ch4_done, scene: 'ch4:start', label: '第四章·黑金镇与画饼魔女', req: f.ch3_done },
        { id: 'm5', loc: 'beach', done: f.ch5_done, scene: 'ch5:start', label: '第五章·椰风湾夏日祭', req: f.ch4_done },
        { id: 'm6', loc: 'memory', done: f.ch6_done, scene: 'ch6:start', label: '第六章·三百年前的真相', req: f.ch5_done },
        { id: 'm7', loc: 'sky', done: f.ch7_done, scene: 'ch7:start', label: '第七章·天上界·云端机房', req: f.ch6_done },
        { id: 'm8', loc: 'castle', done: f.ch8_done, scene: 'ch8:start', label: '终章·加班大厦100层', req: f.ch7_done },
      ];
      return T;
    },
    currentMain() {
      return this.mainTargets().find(t => !t.done && (!t.req || t.req)) || null;
    },

    /* ---------------- 行程图（快速旅行） ---------------- */
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

  /* ---------------- 委托板 + 讨伐悬赏 ---------------- */
  genHunt() {
    const s = G.state;
    let pools = s.unlockedLocs.map(id => (G.mapDefs[id] && G.mapDefs[id].encounters) || []).filter(p => p.length);
    // 排除稀有/Boss怪（打不到的不做悬赏）
    pools = pools.map(p => p.filter(e => { const d = G.data.enemies[e]; return d && !d.rare && !d.boss && !d.super; })).filter(p => p.length);
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
    const sides = (G.sides.quests || []).filter(q => q.scene && q.scene.trim() && !s.flags[q.id + '_done'] && (!q.req || s.flags[q.req]) && (!q.chapter || s.flags[q.chapter]));
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

  };

  /* ============================================================
   * 小游戏
   * ============================================================ */
  world.miniGame = {
    overlay(html) {
      const ov = $('#overlay');
      ov.classList.remove('hidden');
      ov.innerHTML = html;
      return ov;
    },
    close(ov) { ov.classList.add('hidden'); ov.innerHTML = ''; },

    /* ---------- 电子木鱼 ---------- */
    muyu() {
      const ov = this.overlay(`<div class="mg-box">
        <h2>🥁 电子木鱼</h2>
        <div class="muyu-count" id="my-count">功德：${G.state.gongde}</div>
        <div class="muyu-disc" id="my-disc">🥁</div>
        <div class="dim">点击木鱼，功德+1。焦虑退散，赛博往生。<br>（功德可在天上界的功德商店消费，也能扭蛋）</div>
        <button class="mini-btn" id="my-close">收工</button></div>`);
      const disc = ov.querySelector('#my-disc');
      const count = ov.querySelector('#my-count');
      let combo = 0, comboT = null;
      disc.onclick = () => {
        G.audio.sfx('muyu');
        G.gainGongde(1);
        G.count('muyu');
        combo++;
        count.textContent = `功德：${G.state.gongde}` + (combo >= 10 ? `（连击 ×${combo}！）` : '');
        disc.classList.add('hit');
        setTimeout(() => disc.classList.remove('hit'), 100);
        const f = document.createElement('div');
        f.className = 'muyu-float';
        f.textContent = '功德+1';
        f.style.left = (30 + Math.random() * 40) + '%';
        ov.querySelector('.mg-box').appendChild(f);
        setTimeout(() => f.remove(), 900);
        clearTimeout(comboT);
        comboT = setTimeout(() => combo = 0, 1500);
      };
      ov.querySelector('#my-close').onclick = () => { this.close(ov); if (document.querySelector('#screen-game').classList.contains('hidden')) G.world.openMap(); };
    },

    /* ---------- 扭蛋机 ---------- */
    async gacha() {
      const s = G.state;
      const cfg = G.data.gacha;
      const ov = this.overlay(`<div class="mg-box">
        <h2>🎰 扭蛋机·梗力胶囊</h2>
        <div class="gacha-machine" id="g-m">🎁</div>
        <div class="dim">💰${cfg.cost.gold}/次 或 🥁${cfg.cost.gongde}功德/次 · 十连保底紫色以上<br><span class="dim">重复装备自动折算成金币（非酋保护条款第3条）</span></div>
        <div class="gacha-btns">
          <button class="mini-btn" id="g-gold">💰 单抽（金币）</button>
          <button class="mini-btn" id="g-gd">🥁 单抽（功德）</button>
          <button class="mini-btn hl" id="g-ten">💰 十连</button>
          <button class="mini-btn" id="g-close">离开</button>
        </div>
        <div class="gacha-result" id="g-r"></div></div>`);
      ov.querySelector('#g-close').onclick = () => { this.close(ov); if (document.querySelector('#screen-game').classList.contains('hidden')) G.world.openMap(); };
      const doRoll = (currency, times) => {
        const results = [];
        for (let i = 0; i < times; i++) {
          const cost = cfg.cost[currency];
          if (currency === 'gold' ? s.gold < cost : s.gongde < cost) break;
          if (currency === 'gold') G.gainGold(-cost); else G.gainGongde(-cost);
          G.count('gacha');
          s.flags = s.flags || {};
          s.flags._pity = (s.flags._pity || 0) + 1;
          let r = G.u.chance(0.55) ? 3 : G.u.chance(0.75) ? 4 : 5;
          if (s.flags._pity >= cfg.pity) { r = Math.max(r, 4); }
          if (!cfg.pool[r]) r = 3;
          const id = G.u.pick(cfg.pool[r]);
          if (r >= 4) s.flags._pity = 0;
          // 重复折算
          if (G.state.equipBag[id] > 0) {
            const dup = cfg.dupGold[r] || 100;
            G.gainGold(dup);
            results.push({ id, r, dup });
          } else {
            G.gainItem(id, 1);
            results.push({ id, r });
          }
        }
        G.audio.sfx('gacha');
        const box = ov.querySelector('#g-r');
        box.innerHTML = results.map(x => {
          const it = G.data.items[x.id];
          return `<div class="gacha-item r${x.r}"><div class="gi-r">★${x.r}</div><div class="gi-e">${it.emoji}</div><b>${esc(it.name)}</b>${x.dup ? `<div class="dim">重复→💰${x.dup}</div>` : ''}</div>`;
        }).join('');
        if (results.some(x => x.r === 5)) box.innerHTML = `<div class="gacha-flash">✨✨ 出金！！✨✨<br>快截图发群炫耀（划掉）</div>` + box.innerHTML;
        ov.querySelector('#g-m').classList.add('shake');
        setTimeout(() => ov.querySelector('#g-m').classList.remove('shake'), 500);
      };
      ov.querySelector('#g-gold').onclick = () => doRoll('gold', 1);
      ov.querySelector('#g-gd').onclick = () => doRoll('gongde', 1);
      ov.querySelector('#g-ten').onclick = () => doRoll('gold', 10);
    },

    /* ---------- 钓鱼 ---------- */
    async fishing() {
      return new Promise(res => {
        const ov = this.overlay(`<div class="mg-box">
          <h2>🎣 钓鱼</h2>
          <div class="fish-zone"><div class="fish-aim" id="f-aim"></div><div class="fish-fish" id="f-fish">🐟</div></div>
          <div class="dim">鱼在游，看准时机点「收杆」！连续3次成功就能钓上来。</div>
          <button class="mini-btn hl" id="f-pull">🪝 收杆！</button>
          <button class="mini-btn" id="f-quit">不钓了</button>
          <div id="f-msg" class="fish-msg"></div></div>`);
        const zone = ov.querySelector('.fish-zone');
        const fish = ov.querySelector('#f-fish');
        const aim = ov.querySelector('#f-aim');
        let fx = 10, fv = 1.6, score = 0;
        const iv = setInterval(() => {
          fx += fv;
          if (fx > 82 || fx < 0) { fv = -fv; fx = G.u.clamp(fx, 0, 82); }
          fish.style.left = fx + '%';
        }, 30);
        const stop = () => { clearInterval(iv); this.close(ov); res(); };
        ov.querySelector('#f-quit').onclick = stop;
        ov.querySelector('#f-pull').onclick = () => {
          const fx2 = parseFloat(fish.style.left) / 100;
          const ax = parseFloat(aim.style.left || 0.42) ;
          const diff = Math.abs(fx2 - 0.42);
          if (diff < 0.12) {
            score++;
            G.audio.sfx('fish');
            ov.querySelector('#f-msg').textContent = ['稳！', '漂亮！', '手感来了！', '钓鱼佬永不空军！'][score % 4] + `（${score}/3）`;
            fv *= 1.25;
            if (score >= 3) {
              clearInterval(iv);
              const fishId = G.u.pick(['i_hongyao', 'i_bandaid', 'i_cola', 'i_lanyao']);
              G.gainItem(fishId, 1);
              const gold = G.u.rnd(30, 90);
              G.gainGold(gold);
              G.count('fish');
              const it = G.data.items[fishId];
              ov.querySelector('#f-msg').innerHTML = `🎉 钓到了 ${it.emoji} ${esc(it.name)} 和 💰${gold}！`;
              setTimeout(stop, 1600);
            }
          } else {
            score = 0;
            G.audio.sfx('bad');
            ov.querySelector('#f-msg').textContent = '空军了……鱼跑了。（进度清零）';
          }
        };
      });
    },

    /* ---------- 猜拳 ---------- */
    async rps(betGold) {
      const bet = betGold || 50;
      return new Promise(res => {
        const taunts = [
          '「出剪刀吧，我让你。」', '「我看了你的训练数据，你下一把出石头。」',
          '「多年猜拳，从未败绩（自封）。」', '「你猜我出什么？对，就那个。」',
        ];
        const ov = this.overlay(`<div class="mg-box">
          <h2>✊ 猜拳摊</h2>
          <div id="r-npc" class="rps-npc">🧙 神秘老登：${G.u.pick(taunts)}</div>
          <div id="r-result" class="rps-result">三局两胜，赌注 💰${bet}</div>
          <div class="rps-btns">
            <button class="mini-btn" data-h="rock">✊ 石头</button>
            <button class="mini-btn" data-h="scissors">✌️ 剪刀</button>
            <button class="mini-btn" data-h="paper">🖐️ 布</button>
          </div>
          <button class="mini-btn" id="r-quit">溜了</button></div>`);
        const hands = { rock: '✊', scissors: '✌️', paper: '🖐️' };
        const beats = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
        let wins = 0, losses = 0;
        const finish = (win) => {
          setTimeout(() => { this.close(ov); res(win); }, 1500);
        };
        ov.querySelector('#r-quit').onclick = () => { this.close(ov); res(false); };
        ov.querySelectorAll('[data-h]').forEach(b => b.onclick = () => {
          if (wins >= 2 || losses >= 2) return;
          const mine = b.dataset.h;
          const cheat = G.state.members.xiaoman.acc === 'x_ouhuang';
          const npc = cheat ? Object.keys(beats).find(k => beats[mine] === k) : G.u.pick(Object.keys(hands));
          const el = ov.querySelector('#r-result');
          if (mine === npc) { el.innerHTML = `${hands[mine]} vs ${hands[npc]} —— 平！`; }
          else if (beats[mine] === npc) {
            wins++;
            el.innerHTML = `${hands[mine]} vs ${hands[npc]} —— <b>你赢了！（${wins}胜${losses}负）</b>`;
            G.audio.sfx('ok');
          } else {
            losses++;
            el.innerHTML = `${hands[mine]} vs ${hands[npc]} —— 输了（${wins}胜${losses}负）`;
            G.audio.sfx('bad');
          }
          if (wins >= 2) {
            G.gainGold(bet);
            G.count('rpsWin');
            el.innerHTML += `<br>🎉 赢了 💰${bet}！「不 …不可能！」`;
            finish(true);
          } else if (losses >= 2) {
            G.gainGold(-bet);
            el.innerHTML += `<br>💸 输了 💰${bet}。「承让承让。」`;
            finish(false);
          }
        });
      });
    },

    /* ---------- QTE（节奏点击） ---------- */
    async qte(opts) {
      opts = opts || {};
      const seq = opts.seq || ['⬅️', '⬆️', '⬇️', '➡️'];
      const time = opts.time || 1400;
      return new Promise(res => {
        const ov = this.overlay(`<div class="mg-box">
          <h2>${opts.title || '🎵 节奏挑战'}</h2>
          <div class="dim">${opts.desc || '按照顺序点击出现的按钮！'}</div>
          <div class="qte-stage" id="q-stage"></div>
          <div id="q-score" class="fish-msg"></div></div>`);
        const stage = ov.querySelector('#q-stage');
        let i = 0, score = 0;
        const next = () => {
          const qScore = ov.querySelector('#q-score');
          const qStage = ov.querySelector('#q-stage');
          if (!qScore || !qStage) { this.close(ov); res(0); return; }
          if (i >= (opts.count || 6)) {
            const rank = score >= 5 ? 'SSS·科目三之神！' : score >= 4 ? 'S·舞王附体！' : score >= 2 ? 'B·勉强能看' : 'D·你的舞蹈很危险';
            qScore.textContent = `结果：${score} hits —— ${rank}`;
            if (opts.meme) G.addMeme(opts.meme);
            if (score >= 4 && opts.reward) G.gainItem(opts.reward, 1);
            setTimeout(() => { this.close(ov); res(score); }, 1200);
            return;
          }
          const btn = document.createElement('button');
          btn.className = 'qte-btn';
          btn.textContent = G.u.pick(seq);
          stage.innerHTML = '';
          stage.appendChild(btn);
          const t = setTimeout(() => { i++; next(); }, time);
          btn.onclick = () => {
            clearTimeout(t);
            score++;
            G.audio.sfx('blip');
            btn.classList.add('hit');
            i++;
            setTimeout(next, 150);
          };
        };
        next();
      });
    },
  };
})();
