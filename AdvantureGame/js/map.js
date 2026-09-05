'use strict';
/* ============================================================
 * 瓦片地图探索引擎：Canvas 渲染 / 网格移动 / 摄像机 /
 *                    遭遇战 / 宝箱 / NPC / 出口 / 主线标记
 * 地图数据在 maps_data.js（G.mapDefs）
 * ============================================================ */
(() => {
  const esc = G.u.esc;
  const TILE = 34;                 // 瓦片像素
  const VIEW_W = 25, VIEW_H = 15;  // 可视瓦片数

  // 可行走瓦片
  const WALK = new Set(['.', ',', ';', 'P', 'B', 'S', 'C', '^', '=', '~', '-']);
  // 会遇敌的瓦片
  const ENC = new Set(['.', ';', 'S', 'C']);

  // 各底色（按地图调色板）
  const PALS = {
    grass:  { '.': '#3c6b3f', ',': '#43764a', ';': '#2f5a34', P: '#b39b6d', B: '#8a6b45' },
    town:   { '.': '#4a7a4e', ',': '#528557', ';': '#3c6641', P: '#c2a878', B: '#8a6b45', '=': '#9c7b52' },
    forest: { '.': '#2f5236', ',': '#365c3d', ';': '#24422a', P: '#8f7c58', B: '#75603f' },
    cave:   { '.': '#4a4457', ',': '#544d63', ';': '#3c3750', P: '#6a6178', C: '#514a63', '^': '#5d5470' },
    sand:   { '.': '#d8c07c', ',': '#e0ca8c', ';': '#c7ad67', P: '#e6d49a', S: '#e8d494', B: '#8a6b45' },
    snow:   { '.': '#cfd8e8', ',': '#dbe2f0', ';': '#b8c4da', P: '#e8eef8', S: '#e2e8f2', B: '#7f8db0', '^': '#eef2fa' },
    sky:    { '.': '#a8c4ee', ',': '#b6cff4', ';': '#94b2e4', P: '#d8e4f8', B: '#8fa8d8', '=': '#c8d6f2' },
    office: { '.': '#3c4054', ',': '#444860', ';': '#323648', P: '#565a70', '=': '#4c5068', B: '#5a5e78' },
    memory: { '.': '#6b6f80', ',': '#757a8c', ';': '#5c6070', P: '#9a9eae', B: '#7f8394' },
  };
  // 障碍瓦片绘制
  function drawBlock(ctx, ch, x, y, T, pal) {
    const px = x * T, py = y * T;
    switch (ch) {
      case 'T': {
        ctx.fillStyle = pal[';'] || '#24422a';
        ctx.fillRect(px, py, T, T);
        ctx.font = (T - 6) + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🌲', px + T / 2, py + T / 2 + 1);
        break;
      }
      case 't': {
        ctx.fillStyle = pal['.'] || '#3c6b3f';
        ctx.fillRect(px, py, T, T);
        ctx.font = (T - 8) + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(palmTree(pal), px + T / 2, py + T / 2 + 1);
        break;
      }
      case 'W': {
        ctx.fillStyle = '#3a6ea8';
        ctx.fillRect(px, py, T, T);
        ctx.strokeStyle = 'rgba(255,255,255,.28)';
        ctx.beginPath();
        ctx.moveTo(px + 4, py + T * .4); ctx.quadraticCurveTo(px + T / 2, py + T * .28, px + T - 4, py + T * .4);
        ctx.moveTo(px + 4, py + T * .72); ctx.quadraticCurveTo(px + T / 2, py + T * .6, px + T - 4, py + T * .72);
        ctx.stroke();
        break;
      }
      case 'M': {
        ctx.fillStyle = '#5a5a68';
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = '#787888';
        ctx.beginPath();
        ctx.moveTo(px + 2, py + T - 3); ctx.lineTo(px + T / 2, py + 4); ctx.lineTo(px + T - 2, py + T - 3);
        ctx.closePath(); ctx.fill();
        break;
      }
      case '#': {
        ctx.fillStyle = '#7a5f48';
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = '#8f7257';
        ctx.fillRect(px + 2, py + 2, T - 4, T - 4);
        ctx.fillStyle = 'rgba(255,220,140,.5)';
        ctx.fillRect(px + T * .3, py + T * .35, T * .4, T * .35);
        break;
      }
      case 'R': {
        ctx.fillStyle = pal['.'] || '#3c6b3f';
        ctx.fillRect(px, py, T, T);
        ctx.font = (T - 12) + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🧱', px + T / 2, py + T / 2);
        break;
      }
      case 'E': {
        ctx.fillStyle = '#23283e';
        ctx.fillRect(px, py, T, T);
        ctx.font = (T - 10) + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🖥️', px + T / 2, py + T / 2);
        break;
      }
      case 'L': {
        ctx.fillStyle = '#4a3a2c';
        ctx.fillRect(px, py, T, T);
        ctx.font = (T - 10) + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('📚', px + T / 2, py + T / 2);
        break;
      }
      case 'o': {
        ctx.fillStyle = pal['='] || '#9c7b52';
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = '#6a4f36';
        ctx.fillRect(px + 3, py + 3, T - 6, T - 6);
        break;
      }
      default: {
        ctx.fillStyle = '#333';
        ctx.fillRect(px, py, T, T);
      }
    }
  }
  function palmTree(pal) {
    // 由地图 deco 决定，默认枯树
    return G.map._deco || '🥀';
  }

  const map = G.map = {
    cur: null, px: 0, py: 0, facing: 'down',
    anim: null,            // {fx, fy, tx, ty, t}
    paused: true,
    _keys: new Set(),
    _repaint: 0,
    _deco: '🌲',
    _lastEncStep: 0,
    _steps: 0,

    /* ---------- 初始化 ---------- */
    init() {
      this.canvas = document.getElementById('map-canvas');
      if (!this.canvas) return;
      this.canvas.width = VIEW_W * TILE;
      this.canvas.height = VIEW_H * TILE;
      this.ctx = this.canvas.getContext('2d');
      this.bindInput();
      const loop = (ts) => {
        if (!this.paused && G.state) { this.tick(ts); this.draw(ts); }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },

    bindInput() {
      document.addEventListener('keydown', e => {
        if (this.paused) return;
        const k = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
          this._keys.add(k);
          if (!this.canvas.closest('.screen').classList.contains('hidden')) e.preventDefault();
        }
        if ((k === 'e' || k === ' ' || k === 'enter') && this.visible()) {
          e.preventDefault();
          this.interact();
        }
      });
      document.addEventListener('keyup', e => this._keys.delete(e.key.toLowerCase()));
      window.addEventListener('blur', () => this._keys.clear());
    },
    visible() {
      const el = document.getElementById('screen-map');
      return el && !el.classList.contains('hidden');
    },

    heldDir() {
      const k = this._keys;
      if (k.has('arrowup') || k.has('w')) return [0, -1, 'up'];
      if (k.has('arrowdown') || k.has('s')) return [0, 1, 'down'];
      if (k.has('arrowleft') || k.has('a')) return [-1, 0, 'left'];
      if (k.has('arrowright') || k.has('d')) return [1, 0, 'right'];
      return null;
    },

    /* ---------- 数据规整：行宽补齐 + 实体吸附最近可行走格 ---------- */
    _sanitize(def) {
      if (def._clean) return def;
      def._clean = true;
      def.rows = def.rows.map(r => r.length < def.w ? r + (r[r.length - 1] || 'T').repeat(def.w - r.length) : r.slice(0, def.w));
      const ok = (x, y) => x >= 0 && y >= 0 && x < def.w && y < def.h && WALK.has(def.rows[y][x]);
      const nearest = (x, y) => {
        if (ok(x, y)) return [x, y];
        const seen = new Set([x + ',' + y]);
        const q = [[x, y]];
        while (q.length) {
          const [cx, cy] = q.shift();
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= def.w || ny >= def.h || seen.has(nx + ',' + ny)) continue;
            if (ok(nx, ny)) return [nx, ny];
            seen.add(nx + ',' + ny);
            q.push([nx, ny]);
          }
        }
        return [x, y];
      };
      for (const e of (def.entities || [])) {
        const [nx, ny] = nearest(e.x, e.y);
        e.x = nx; e.y = ny;
        if (e.type === 'exit' && e.toX != null && G.mapDefs[e.to]) {
          const t = G.mapDefs[e.to];
          if (!t._clean) this._sanitize(t);
          const ok2 = (x, y) => x >= 0 && y >= 0 && x < t.w && y < t.h && WALK.has(t.rows[y][x]);
          const nearest2 = (x, y) => {
            if (ok2(x, y)) return [x, y];
            const seen = new Set([x + ',' + y]); const q = [[x, y]];
            while (q.length) {
              const [cx, cy] = q.shift();
              for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nx2 = cx + dx, ny2 = cy + dy;
                if (nx2 < 0 || ny2 < 0 || nx2 >= t.w || ny2 >= t.h || seen.has(nx2 + ',' + ny2)) continue;
                if (ok2(nx2, ny2)) return [nx2, ny2];
                seen.add(nx2 + ',' + ny2); q.push([nx2, ny2]);
              }
            }
            return [x, y];
          };
          const [tx, ty] = nearest2(e.toX, e.toY);
          e.toX = tx; e.toY = ty;
        }
      }
      const [sx, sy] = nearest(def.spawn[0], def.spawn[1]);
      def.spawn = [sx, sy];
      return def;
    },

    /* ---------- 进入地图 ---------- */
    enter(mapId, x, y) {
      let def = G.mapDefs[mapId];
      if (!def) { G.world.openMap(); return; }
      def = this._sanitize(def);
      G.mapDefs[mapId] = def;
      this.cur = def;
      this.curId = mapId;
      G.world.curLoc = mapId;
      this.px = x != null ? x : (def.spawn ? def.spawn[0] : 2);
      this.py = y != null ? y : (def.spawn ? def.spawn[1] : 2);
      this.facing = 'down';
      this.anim = null;
      this._steps = 0;
      this._lastEncStep = 0;
      this._deco = def.deco || '🌲';
      G.state.mapPos = { map: mapId, x: this.px, y: this.py };
      G.audio.bgm(def.bgm || 'field');
      G.ui.show('screen-map');
      this.paused = false;
      this.refreshHud();
      this._centerCam();
    },
    _camX: 0, _camY: 0,
    _centerCam() {
      const mw = this.cur.w * TILE, mh = this.cur.h * TILE;
      const cw = this.canvas.width, chh = this.canvas.height;
      const cx = this.px * TILE + TILE / 2, cy = this.py * TILE + TILE / 2;
      this._camX = mw <= cw ? (mw - cw) / 2 : G.u.clamp(cx - cw / 2, 0, mw - cw);
      this._camY = mh <= chh ? (mh - chh) / 2 : G.u.clamp(cy - chh / 2, 0, mh - chh);
    },

    refreshHud() {
      const el = document.getElementById('map-locname');
      if (el) el.textContent = '📍 ' + (this.cur ? this.cur.name : '');
      const st = document.getElementById('map-stats');
      if (st && G.state) {
        const m = G.state.members[G.state.party[0]];
        st.textContent = '💰' + G.state.gold + ' · 🧩' + G.state.shards + '/7 · 👧Lv.' + (m ? m.level : '?');
      }
      G.ui.refreshHud();
    },

    /* ---------- 主循环 ---------- */
    tick(ts) {
      if (this.anim) {
        this.anim.t += 1 / 9;               // 每格 ~9 帧
        if (this.anim.t >= 1) {
          this.px = this.anim.tx; this.py = this.anim.ty;
          this.anim = null;
          this.onStep();
        }
        return;
      }
      const d = this.heldDir();
      if (d) {
        this.facing = d[2];
        this.tryMove(d[0], d[1]);
      }
    },

    tileAt(x, y) {
      if (!this.cur || x < 0 || y < 0 || x >= this.cur.w || y >= this.cur.h) return 'X';
      return this.cur.rows[y][x];
    },
    blocked(x, y) {
      return !WALK.has(this.tileAt(x, y));
    },
    entityAt(x, y) {
      return (this.cur.entities || []).find(e => e.x === x && e.y === y && !this.entHidden(e));
    },
    entHidden(e) {
      if (e.req && !G.state.flags[e.req]) return true;
      if (e.done && G.state.flags[e.done]) return true;
      if (e.type === 'chest' && G.state.flags['chest_' + this.curId + '_' + e.id]) return true;
      if (e.type === 'monster' && G.state.flags['mon_' + this.curId + '_' + e.id]) return true;
      return false;
    },

    tryMove(dx, dy) {
      const nx = this.px + dx, ny = this.py + dy;
      if (this.blocked(nx, ny)) {
        // 面向已改变（tick 中处理）；撞墙轻微提示
        return;
      }
      const ent = this.entityAt(nx, ny);
      if (ent && ent.solid !== false && ent.type !== 'exit') {
        // NPC/障碍实体阻挡
        return;
      }
      this.anim = { tx: nx, ty: ny, t: 0 };
    },

    onStep() {
      G.state.mapPos = { map: this.curId, x: this.px, y: this.py };
      this._steps++;
      // 出口
      const ent = this.entityAt(this.px, this.py);
      if (ent && ent.type === 'exit') {
        this.paused = true;
        this.flash(() => G.map.enter(ent.to, ent.toX, ent.toY));
        return;
      }
      // 遭遇
      const ch = this.tileAt(this.px, this.py);
      if (ENC.has(ch) && this.cur.encounters && this._steps - this._lastEncStep > 7) {
        const rate = ch === ';' ? 0.1 : 0.07;
        if (Math.random() < rate) {
          this._lastEncStep = this._steps;
          this.randomEncounter();
        }
      }
    },

    async randomEncounter() {
      const pool = this.cur.encounters;
      if (!pool || !pool.length) return;
      this.paused = true;
      this.flash(() => { }, true);
      await G.battle.start({ enemies: [G.u.pick(pool)], bg: this.cur.battleBg || 'field' });
      this.paused = false;
      G.ui.show('screen-map');
    },

    flash(cb, battle) {
      const el = document.getElementById('map-flash');
      if (!el) { cb(); return; }
      el.style.background = battle ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.75)';
      el.classList.add('on');
      setTimeout(() => { cb(); setTimeout(() => el.classList.remove('on'), 260); }, 230);
    },

    /* ---------- 互动 ---------- */
    async interact() {
      if (this.anim || this.paused) return;
      const dirV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const [dx, dy] = dirV[this.facing];
      let ent = this.entityAt(this.px + dx, this.py + dy);
      if (!ent) ent = this.entityAt(this.px, this.py);
      if (!ent) { G.audio.sfx('blip'); return; }
      this.paused = true;
      try {
        await this.act(ent);
      } finally {
        if (this.visible()) this.paused = false;
      }
    },

    async act(ent) {
      const s = G.state;
      switch (ent.type) {
        case 'npc': {
          G.audio.sfx('blip');
          const key = 'npc_' + this.curId + '_' + (ent.id || (ent.x + '_' + ent.y));
          const idx = (s.flags[key] || 0);
          s.flags[key] = idx + 1;
          const lines = ent.lines || ['……'];
          const line = ent.rotate === false ? lines[0] : lines[idx % lines.length];
          await G.ui.dialog({ name: ent.name || '路人', emoji: ent.emoji, text: line });
          if (ent.story && (!ent.req || s.flags[ent.req]) && !ent.storyDone) {
            // npc 附带一次性剧情（如个人线）
          }
          break;
        }
        case 'story': {
          const avail = (!ent.req || s.flags[ent.req]) && !(ent.done && s.flags[ent.done]);
          if (avail) {
            G.audio.sfx('ok');
            this.paused = true;
            await G.ui.playScene(ent.story);
            // playScene 会切屏；恢复交给 world step 或场景
          } else {
            G.audio.sfx('blip');
            const lines = ent.altLines || ['「……」'];
            await G.ui.dialog({ name: ent.name || '', emoji: ent.emoji, text: lines[Math.floor(Math.random() * lines.length)] });
            this.paused = false;
          }
          break;
        }
        case 'chest': {
          const fkey = 'chest_' + this.curId + '_' + ent.id;
          if (s.flags[fkey]) { await G.ui.dialog({ text: '（箱子已经空了。）' }); break; }
          s.flags[fkey] = true;
          G.audio.sfx('chest');
          let msg = '📦 打开了宝箱！<br>';
          if (ent.gold) { G.gainGold(ent.gold); msg += `💰 金币 +${ent.gold}<br>`; }
          if (ent.item) {
            G.gainItem(ent.item, ent.n || 1);
            const it = G.data.items[ent.item];
            msg += `${it.emoji} ${esc(it.name)} ×${ent.n || 1}`;
          }
          await G.ui.dialog({ text: msg });
          break;
        }
        case 'monster': {
          this.paused = true;
          await G.ui.dialog({ text: ent.lines || '（它盯着你看！）' });
          const r = await G.battle.start({ enemies: ent.enemies, boss: ent.boss, bg: this.cur.battleBg || 'field', intro: ent.intro });
          if (r.win) s.flags['mon_' + this.curId + '_' + ent.id] = true;
          this.paused = false;
          G.ui.show('screen-map');
          break;
        }
        case 'shop': await G.ui.openShop(ent.shop); break;
        case 'inn': await G.ui.innScene(ent.cost || 50); break;
        case 'board': await G.world.openBoard(); break;
        case 'save': {
          G.audio.sfx('ok');
          for (const pid of s.party) { const m = s.members[pid]; const st = G.calcStats(m); m.hp = Math.min(st.maxHp, m.hp + Math.floor(st.maxHp * .3)); m.mp = Math.min(st.maxMp, m.mp + Math.floor(st.maxMp * .3)); }
          s.checkpoint = { chapter: s.chapter, scene: s.scene };
          G.saveGame(0);
          // 集章
          if (!s.flags['stamp_' + this.curId]) {
            s.flags['stamp_' + this.curId] = true;
            G.ui.toast(`📑 集章卡盖章：${this.cur.name}！`, 'good');
          }
          await G.ui.dialog({ text: '💠 存档水晶发出柔和的光。<br>状态小幅恢复，进度已保存。' });
          break;
        }
        case 'heal': {
          G.audio.sfx('heal');
          for (const pid of s.party) { const m = s.members[pid]; const st = G.calcStats(m); m.hp = st.maxHp; m.mp = st.maxMp; }
          await G.ui.dialog({ text: ent.lines || '💖 泡了个舒服的澡，全队完全恢复！' });
          break;
        }
        case 'mini': await G.world.miniGame[ent.mini](); break;
        case 'fish': await G.world.miniGame.fishing(); break;
        case 'exit': break; // 踩上去触发
        default: break;
      }
    },

    /* ---------- 绘制 ---------- */
    draw(ts) {
      const ctx = this.ctx, T = TILE;
      if (!ctx || !this.cur) return;
      const def = this.cur, pal = PALS[def.pal] || PALS.grass;
      // 摄像机跟随
      const mw = def.w * T, mh = def.h * T;
      const cw = this.canvas.width, chh = this.canvas.height;
      let px = this.px * T, py = this.py * T;
      if (this.anim) {
        px = (this.anim.fx != null ? this.anim.fx : px) - ((this.anim.fx != null ? this.anim.fx : px) - this.anim.tx * T) * this.anim.t;
        py = (this.anim.fy != null ? this.anim.fy : py) - ((this.anim.fy != null ? this.anim.fy : py) - this.anim.ty * T) * this.anim.t;
      }
      this._camX = mw <= cw ? (mw - cw) / 2 : G.u.clamp(px + T / 2 - cw / 2, 0, mw - cw);
      this._camY = mh <= chh ? (mh - chh) / 2 : G.u.clamp(py + T / 2 - chh / 2, 0, mh - chh);
      const camX = Math.round(this._camX), camY = Math.round(this._camY);

      const x0 = Math.floor(camX / T), y0 = Math.floor(camY / T);
      const x1 = Math.min(def.w - 1, x0 + VIEW_W + 1), y1 = Math.min(def.h - 1, y0 + VIEW_H + 1);
      ctx.fillStyle = '#0b0c16';
      ctx.fillRect(0, 0, cw, chh);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const ch = this.tileAt(x, y);
          const sx = x * T - camX, sy = y * T - camY;
          if (WALK.has(ch)) {
            ctx.fillStyle = pal[ch] || pal['.'] || '#3c6b3f';
            ctx.fillRect(sx, sy, T, T);
            if (ch === ',' || ch === ';') {
              ctx.font = (T - 16) + 'px serif';
              ctx.fillText(ch === ',' ? '🌸' : '🌿', sx + T / 2, sy + T / 2);
            }
            if (ch === 'B') { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(sx, sy + T * .4, T, T * .2); }
            if (ch === '~') { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(sx + 6, sy + T / 2, T - 12, 3); }
          } else {
            drawBlock(ctx, ch, x, y, T, pal);
          }
        }
      }
      // 网格淡线
      ctx.strokeStyle = 'rgba(0,0,0,.06)';
      for (let x = x0; x <= x1 + 1; x++) { ctx.beginPath(); ctx.moveTo(x * T - camX, 0); ctx.lineTo(x * T - camX, chh); ctx.stroke(); }
      for (let y = y0; y <= y1 + 1; y++) { ctx.beginPath(); ctx.moveTo(0, y * T - camY); ctx.lineTo(cw, y * T - camY); ctx.stroke(); }

      // 实体
      const bounce = Math.sin(ts / 240) * 3;
      for (const e of (def.entities || [])) {
        if (this.entHidden(e)) continue;
        const sx = e.x * T - camX, sy = e.y * T - camY;
        if (sx < -T || sy < -T || sx > cw || sy > chh) continue;
        if (e.type === 'exit') {
          ctx.fillStyle = 'rgba(255,235,150,.2)';
          ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
          ctx.font = (T - 14) + 'px serif';
          ctx.fillText('🚪', sx + T / 2, sy + T / 2);
          continue;
        }
        ctx.font = (T - 8) + 'px serif';
        ctx.fillText(e.emoji || '❓', sx + T / 2, sy + T / 2 + (e.type === 'monster' ? bounce * 1.5 : 0));
        // 主线标记
        if (e.main && this.isMainHere()) {
          ctx.font = (T - 16) + 'px serif';
          ctx.fillText('🔻', sx + T / 2, sy - 8 + bounce);
        }
      }
      // 玩家
      const bob = this.anim ? Math.abs(Math.sin(this.anim.t * Math.PI)) * 3 : 0;
      ctx.font = (T - 6) + 'px serif';
      ctx.fillText('👧', px - camX + T / 2, py - camY + T / 2 - bob);
      // 阴影
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath();
      ctx.ellipse(px - camX + T / 2, py - camY + T - 4, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    },

    isMainHere() {
      const m = G.world.currentMain();
      return m && m.loc === this.curId;
    },
  };

  /* ---------- 虚拟按键（鼠标/触屏） ---------- */
  window.addEventListener('DOMContentLoaded', () => {
    const pad = document.getElementById('map-pad');
    if (!pad) return;
    const hold = (el, fn) => {
      let iv = null;
      const start = e => { e.preventDefault(); fn(); iv = setInterval(fn, 150); };
      const stop = () => { if (iv) { clearInterval(iv); iv = null; } };
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', stop);
      el.addEventListener('pointerleave', stop);
      el.addEventListener('pointercancel', stop);
    };
    const dir = (dx, dy, face) => () => {
      if (G.map.paused || !G.map.visible()) return;
      G.map.facing = face;
      if (!G.map.anim) G.map.tryMove(dx, dy);
    };
    pad.querySelectorAll('[data-dir]').forEach(b => {
      const d = b.dataset.dir;
      const m = { up: [0, -1, 'up'], down: [0, 1, 'down'], left: [-1, 0, 'left'], right: [1, 0, 'right'] }[d];
      hold(b, dir(m[0], m[1], m[2]));
    });
    const actBtn = document.getElementById('map-act');
    if (actBtn) actBtn.onclick = () => { if (G.map.visible()) G.map.interact(); };
    const wbtn = document.getElementById('map-world');
    if (wbtn) wbtn.onclick = () => { if (G.map.visible()) { G.map.paused = true; G.world.openMap(); } };
    const mbtn = document.getElementById('map-menu');
    if (mbtn) mbtn.onclick = () => { if (G.map.visible()) { G.map.paused = true; G.ui.openMenu(); } };
  });
})();
