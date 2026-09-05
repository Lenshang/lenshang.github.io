'use strict';
/* ============================================================
 * UI 框架：屏幕切换 / 打字机对话框 / 剧情步进执行器 /
 *          主菜单（状态/背包/装备/技能/任务/图鉴/成就/系统）/ 商店
 * ============================================================ */
(() => {
  const $ = sel => document.querySelector(sel);
  const esc = G.u.esc;

  const ui = G.ui = {
    _goto: null,
    _busy: false,
    _typing: false,
    _typeTimer: null,
    _resolveClick: null,

    /* ================= 屏幕管理 ================= */
    show(id) {
      for (const s of document.querySelectorAll('.screen')) s.classList.add('hidden');
      const el = $('#' + id);
      if (el) el.classList.remove('hidden');
    },

    /* ================= Toast ================= */
    toast(msg, kind) {
      const box = $('#toasts');
      if (!box) return;
      const t = document.createElement('div');
      t.className = 'toast ' + (kind || '');
      t.innerHTML = msg;
      box.appendChild(t);
      setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2600);
      while (box.children.length > 5) box.firstChild.remove();
    },

    /* ================= HUD ================= */
    refreshHud() {
      const s = G.state;
      if (!s) return;
      const hud = $('#hud');
      if (!hud || $('#screen-game').classList.contains('hidden')) return;
      let html = `<div class="hud-party">`;
      for (const pid of s.party) {
        const m = s.members[pid];
        if (!m) continue;
        const cls = G.data.classes[m.cls];
        const st = G.calcStats(m);
        html += `<div class="hud-member" title="${esc(cls.name)} Lv.${m.level}">
          <span class="hm-emoji">${cls.emoji}</span>
          <span class="hm-info"><b>${esc(pid === 'xiaoman' ? s.heroName : cls.name)}</b> Lv.${m.level}
          <i class="bar hp"><u style="width:${Math.max(0, m.hp / st.maxHp * 100)}%"></u></i>
          <i class="bar mp"><u style="width:${Math.max(0, m.mp / st.maxMp * 100)}%"></u></i></span></div>`;
      }
      html += `</div><div class="hud-right">
        <span>📍 ${esc((G.world && G.world.curLocName()) || '')}</span>
        <span>💰 ${s.gold}</span><span>🥁 功德 ${s.gongde}</span><span>🧩 碎片 ${s.shards}/7</span></div>`;
      hud.innerHTML = html;
    },

    /* ================= 打字机对话框 ================= */
    _typeText(text, speed) {
      return new Promise(res => {
        const el = $('#dialog-text');
        el.innerHTML = '';
        this._typing = true;
        this._typeResolve = res;
        this._typeCache = text;
        let i = 0;
        const step = () => {
          if (!this._typing) return; // 由 _skipType 完成收尾
          if (i >= text.length) { this._typing = false; this._typeTimer = null; this._typeResolve = null; res(); return; }
          // 每次吐 1 个字符（中文），遇标签整体吐出
          const ch = text[i];
          if (ch === '<') {
            const j = text.indexOf('>', i);
            if (j === -1) { el.innerHTML += text.slice(i); i = text.length; this._typeTimer = setTimeout(step, speed); return; }
            el.innerHTML += text.slice(i, j + 1); i = j + 1;
          } else { el.innerHTML += ch; i++; }
          this._typeTimer = setTimeout(step, speed);
        };
        step();
      });
    },
    _skipType() {
      this._typing = false;
      if (this._typeTimer) { clearTimeout(this._typeTimer); this._typeTimer = null; }
      if (this._typeResolve) {
        const el = $('#dialog-text');
        if (this._typeCache != null) el.innerHTML = this._typeCache;
        const r = this._typeResolve;
        this._typeResolve = null;
        r();
      }
    },
    _waitClick() {
      return new Promise(res => { this._resolveClick = res; });
    },
    clickAdv() {
      if (this._typing) { this._skipType(); return; }
      if (this._resolveClick) { const r = this._resolveClick; this._resolveClick = null; r(); }
    },

    async dialog(opts) {
      // opts: {name, emoji, text, think}
      const wrap = $('#dialog-wrap');
      wrap.classList.remove('hidden');
      const nameEl = $('#dialog-name');
      if (opts.name) {
        nameEl.classList.remove('hidden');
        nameEl.innerHTML = `${opts.emoji ? `<span class="dn-emoji">${opts.emoji}</span>` : ''}${esc(opts.name)}`;
      } else nameEl.classList.add('hidden');
      $('#dialog').classList.toggle('think', !!opts.think);
      $('#dialog-next').style.visibility = 'hidden';
      await this._typeText(opts.text, G.state.settings.textSpeed);
      $('#dialog-next').style.visibility = 'visible';
      await this._waitClick();
      G.audio.sfx('blip');
    },

    async choice(options) {
      const box = $('#choices');
      box.classList.remove('hidden');
      box.innerHTML = options.map((o, i) =>
        `<button class="choice-btn" data-i="${i}"><b>${i + 1}</b> ${esc(o.label)}</button>`).join('');
      const pick = await new Promise(res => {
        box.onclick = e => {
          const b = e.target.closest('.choice-btn');
          if (b) { G.audio.sfx('ok'); res(parseInt(b.dataset.i)); }
        };
      });
      box.classList.add('hidden');
      box.onclick = null;
      return options[pick];
    },

    showTitleCard(text) {
      return new Promise(res => {
        const el = $('#title-card');
        el.textContent = text;
        el.classList.remove('hidden');
        setTimeout(() => { el.classList.add('hidden'); setTimeout(res, 400); }, 2200);
      });
    },

    /* ============================================================
     * 剧情步进执行器
     * ============================================================ */
    async playScene(sceneId) {
      const s = G.state;
      this.show('screen-game');
      this.refreshHud();
      // 支持跨章节/支线场景："ch1:xxx" 或 "side:q_xxx:xxx"
      let chId = s.chapter, scId = sceneId;
      if (sceneId.includes(':')) {
        const p = sceneId.split(':');
        chId = p[0]; scId = p.slice(1).join(':');
      }
      let sc = (G.chapters[chId] && G.chapters[chId].scenes[scId]) ||
               (G.sides[chId] && G.sides[chId].scenes && G.sides[chId].scenes[scId]) ||
               (G.chapters[chId] && G.chapters[chId].scenes && G.chapters[chId].scenes[scId]);
      if (!sc) { console.warn('场景不存在:', chId, scId); G.world.openMap(); return; }
      s.scene = scId;
      this._goto = null;
      for (const step of sc.steps) {
        await this.execStep(step);
        if (this._goto) break;
      }
      if (this._goto === '@world') { G.world.openMap(); return; }
      const next = this._goto || sc.next;
      if (next) { await this.playScene(next); return; }
      // 没有后续 → 回世界地图
      G.world.openMap();
    },

    async execStep(st) {
      const s = G.state;
      switch (st.t) {
        case 'bg': this.setBg(st.v); break;
        case 'bgm': G.audio.bgm(st.v); break;
        case 'sfx': G.audio.sfx(st.v); break;
        case 'n': await this.dialog({ text: st.v }); break;
        case 'd': await this.dialog({ name: st.w, emoji: st.e, text: st.v }); break;
        case 'think': await this.dialog({ name: st.w, emoji: st.e, text: `（${st.v}）`, think: true }); break;
        case 'title': await this.showTitleCard(st.v); break;
        case 'give': {
          G.gainItem(st.v, st.n || 1);
          const it = G.data.items[st.v];
          G.audio.sfx('chest');
          this.toast(`🎁 获得 ${it.emoji} ${it.name} ×${st.n || 1}`, 'good');
          if (!st.quiet) await this.dialog({ text: `获得了 <b>${it.emoji} ${it.name}×${st.n || 1}</b>！<br><span class="dim">${esc(it.desc)}</span>` });
          break;
        }
        case 'gold': G.gainGold(st.v); this.toast(`💰 金币 ${st.v > 0 ? '+' : ''}${st.v}`, 'good'); break;
        case 'gongde': G.gainGongde(st.v); this.toast(`🥁 功德 +${st.v}`, 'good'); break;
        case 'meme': G.addMeme(st.v); break;
        case 'ach': G.addAch(st.v); break;
        case 'quest': G.quest(st.v, st.s); break;
        case 'flag': if (st.n != null) { s.flags[st.k] = (s.flags[st.k] || 0) + st.n; } else s.flags[st.k] = st.v == null ? true : st.v; break;
        case 'shard': G.shard(st.v); break;
        case 'aff': G.aff(st.w, st.v); break;
        case 'karma': G.karma(st.v); break;
        case 'join': {
          if (!s.party.includes(st.v)) {
            const avg = s.party.length ? Math.max(1, Math.round(s.party.reduce((a, p) => a + s.members[p].level, 0) / s.party.length)) : 1;
            s.members[st.v] = G.newMember(st.v, avg);
            s.party.push(st.v);
            const cls = G.data.classes[st.v];
            G.audio.sfx('level');
            await this.dialog({ text: `🎉 <b>${cls.emoji} ${cls.name}「${cls.id === 'xiaoman' ? s.heroName : cls.name.replace(cls.name, cls.name)}」</b> 加入了队伍！<br><span class="dim">${esc(cls.desc)}</span>` });
            this.toast(`伙伴加入：${cls.emoji} ${cls.id === 'xiaoman' ? s.heroName : cls.name}`, 'join');
          }
          break;
        }
        case 'battle': {
          const r = await G.battle.start(st.v);
          this.show('screen-game');
          this.refreshHud();
          if (r.result === 'lose') {
            if (st.v.onLose) { this._goto = st.v.onLose; }
            else { await this.deathFlow(); }
          } else if (st.v.boss && r.result === 'win') {
            G.count('bossKills');
            G.saveGame(0, true);
          }
          break;
        }
        case 'choice': {
          const opt = await this.choice(st.v);
          if (opt.aff) for (const w in opt.aff) G.aff(w, opt.aff[w]);
          if (opt.karma) G.karma(opt.karma);
          if (opt.flag) for (const k in opt.flag) s.flags[k] = opt.flag[k];
          if (opt.meme) G.addMeme(opt.meme);
          if (opt.count) G.count(opt.count);
          if (opt.goto) this._goto = opt.goto;
          break;
        }
        case 'if': {
          const c = st.v;
          let ok = true;
          if (c.flag != null) ok = !!s.flags[c.flag];
          else if (c.noflag != null) ok = !s.flags[c.noflag];
          else if (c.shards != null) ok = s.shards >= c.shards;
          else if (c.gold != null) ok = s.gold >= c.gold;
          else if (c.aff) ok = (s.affinity[c.aff.who] || 0) >= c.aff.gte;
          else if (c.meme != null) ok = !!s.memes[c.meme];
          else if (c.item != null) ok = G.hasItem(c.item);
          else if (c.quest != null) ok = (s.quests[c.quest] || {}).s === (c.state || 'done');
          this._goto = ok ? c.then : (c.else || null);
          if (!this._goto && !ok && !c.else && c.then) this._goto = null;
          break;
        }
        case 'lose': G.loseItem(st.v, st.n || 1); break;
        case 'goto': this._goto = st.v; break;
        case 'ckpt': s.checkpoint = { chapter: s.chapter, scene: st.v }; G.saveGame(0, true); break;
        case 'chapter': s.chapter = st.v; G.saveGame(0, true); break;
        case 'heal': {
          for (const pid of s.party) { const m = s.members[pid]; const cst = G.calcStats(m); m.hp = cst.maxHp; m.mp = cst.maxMp; }
          this.toast('💖 全队状态完全恢复！', 'good'); break;
        }
        case 'shop': await this.openShop(st.v); break;
        case 'inn': await this.innScene(st.v); break;
        case 'unlock': if (!s.unlockedLocs.includes(st.v)) s.unlockedLocs.push(st.v); break;
        case 'lock': s.unlockedLocs = s.unlockedLocs.filter(l => l !== st.v); break;
        case 'world': this._goto = '@world'; break;
        case 'muyu': await G.world.miniGame.muyu(); break;
        case 'fish': await G.world.miniGame.fishing(); break;
        case 'gacha': await G.world.miniGame.gacha(); break;
        case 'rps': await G.world.miniGame.rps(st.v); break;
        case 'qte': await G.world.miniGame.qte(st.v); break;
        case 'card': {
          await this.dialog({ text: `<div class="item-card"><div class="ic-emoji">${st.emoji || '❔'}</div><div class="ic-name">${esc(st.name || '')}</div><div class="ic-desc">${esc(st.desc || '')}</div></div>` });
          break;
        }
        case 'end': if (G.story) await G.story.ending(st.v); break;
        case 'post': s.postGame = true; break;
        case 'wait': await G.u.sleep(st.v || 600); break;
        case 'shake': this.shakeStage(st.v || 400); break;
        case 'anim': this.stageAnim(st.v); break;
        default: console.warn('未知剧情指令', st);
      }
    },

    setBg(preset) {
      const stage = $('#stage');
      stage.className = '';
      stage.id = 'stage';
      stage.dataset.bg = preset;
      // 清除旧角色
      $('#stage-fx').innerHTML = '';
    },
    stageSprite(emoji, pos) {
      const fx = $('#stage-fx');
      const sp = document.createElement('div');
      sp.className = 'stage-sprite ' + (pos || '');
      sp.textContent = emoji;
      fx.appendChild(sp);
    },
    shakeStage(ms) {
      const st = $('#stage');
      st.classList.add('shake');
      setTimeout(() => st.classList.remove('shake'), ms);
    },
    stageAnim(kind) {
      const st = $('#stage');
      st.classList.add(kind);
      setTimeout(() => st.classList.remove(kind), 1800);
    },

    /* ================= 住宿/存档点 ================= */
    async innScene(cost) {
      const s = G.state;
      const ok = await this.choice([
        { label: `住宿恢复（${cost} 金币）+ 自动存档`, flag: {} },
        { label: '只是看看，不住', goto: '@skip' },
      ]);
      if (ok.goto) return;
      if (s.gold < cost) { await this.dialog({ text: '（钱包比脸还干净……先去赚点钱吧。）' }); return; }
      G.gainGold(-cost);
      G.audio.bgm('inn');
      await this.dialog({ text: '你在柔软的床上睡了一觉。<br>梦里没有KPI，只有一片安静的草原。' });
      for (const pid of s.party) { const m = s.members[pid]; const cst = G.calcStats(m); m.hp = cst.maxHp; m.mp = cst.maxMp; }
      s.checkpoint = { chapter: s.chapter, scene: s.scene };
      G.saveGame(0);
      await this.dialog({ text: '✅ 生命与梗力完全恢复！进度已保存。' });
      G.audio.bgm('town');
    },

    /* ================= 死亡流程 ================= */
    async deathFlow() {
      const s = G.state;
      G.audio.stopBgm();
      G.audio.sfx('die');
      s.counters.deaths++;
      G.count('deaths', 0);
      const lose = Math.floor(s.gold * 0.1);
      s.gold -= lose;
      this.show('screen-game');
      await this.dialog({ text: `<div class="death-box">💀 <b>你被班味淹没了……</b><br><br>醒来时发现自己躺在${s.checkpoint.scene.includes('hub') || true ? '安全的地方' : ''}。<br><span class="dim">（丢失了 ${lose} 金币的住院费。老板不会惋惜你，但队友会等你。）</span></div>` });
      for (const pid of s.party) { const m = s.members[pid]; const cst = G.calcStats(m); m.hp = cst.maxHp; m.mp = cst.maxMp; }
      s.chapter = s.checkpoint.chapter;
      await this.playScene(s.checkpoint.scene);
    },

    /* ============================================================
     * 主菜单
     * ============================================================ */
    openMenu(tab) {
      const s = G.state;
      if (!s) return;
      this.show('screen-menu');
      const tabs = [
        ['status', '👥 状态'], ['bag', '🎒 背包'], ['equip', '⚔️ 装备'],
        ['quest', '📜 委托'], ['dex', '📖 梗图鉴'], ['ach', '🏆 成就'], ['sys', '⚙️ 系统'],
      ];
      tab = tab || this._menuTab || 'status';
      this._menuTab = tab;
      const el = $('#screen-menu');
      el.innerHTML = `
        <div class="menu-frame">
          <div class="menu-tabs">${tabs.map(t => `<button class="mtab ${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}
            <button class="mtab close" data-t="@close">✕ 关闭</button></div>
          <div class="menu-body" id="menu-body"></div>
        </div>`;
      el.querySelectorAll('.mtab').forEach(b => b.onclick = () => {
        G.audio.sfx('blip');
        if (b.dataset.t === '@close') { G.world.openMap(); return; }
        this.openMenu(b.dataset.t);
      });
      const body = $('#menu-body');
      if (tab === 'status') this.menuStatus(body);
      else if (tab === 'bag') this.menuBag(body);
      else if (tab === 'equip') this.menuEquip(body);
      else if (tab === 'quest') this.menuQuest(body);
      else if (tab === 'dex') this.menuDex(body);
      else if (tab === 'ach') this.menuAch(body);
      else if (tab === 'sys') this.menuSys(body);
    },

    menuStatus(body) {
      const s = G.state;
      let html = `<div class="party-grid">`;
      for (const pid of s.party) {
        const m = s.members[pid];
        const cls = G.data.classes[m.cls];
        const st = G.calcStats(m);
        const need = G.expNext(m.level);
        const affNames = { youzi: '柚子', dundun: '吨吨', qianji: '千机', yase: '老亚瑟' };
        html += `<div class="p-card">
          <div class="p-head"><span class="p-emoji">${cls.emoji}</span>
            <div><b>${esc(pid === 'xiaoman' ? s.heroName : cls.name)}</b><br><small>${cls.title} · Lv.${m.level}</small></div></div>
          <div class="p-bars">
            <div>❤️ HP <i class="bar hp"><u style="width:${m.hp / st.maxHp * 100}%"></u></i> ${m.hp}/${st.maxHp}</div>
            <div>💧 梗力 <i class="bar mp"><u style="width:${m.mp / st.maxMp * 100}%"></u></i> ${m.mp}/${st.maxMp}</div>
            <div>⭐ EXP <i class="bar xp"><u style="width:${m.exp / need * 100}%"></u></i> ${m.exp}/${need}</div>
          </div>
          <div class="p-stats">atk ${st.atk} · def ${st.def} · mag ${st.mag} · res ${st.res} · spd ${st.spd} · luk ${st.luk}</div>
          <div class="p-eq">${['weapon', 'armor', 'acc'].map(sl => {
            const it = m[sl] && G.data.items[m[sl]];
            return `<div>${sl === 'weapon' ? '武' : sl === 'armor' ? '防' : '饰'}：${it ? it.emoji + ' ' + esc(it.name) : '<span class="dim">空</span>'}</div>`;
          }).join('')}</div>
        </div>`;
      }
      html += `</div>
      <div class="status-extra">
        <div>💰 金币 <b>${s.gold}</b> · 🥁 功德 <b>${s.gongde}</b> · 🧩 梗之碎片 <b>${s.shards}/7</b></div>
        <div>💗 羁绊：${Object.entries(s.affinity).filter(([k]) => s.party.includes(k)).map(([k, v]) => `${{ youzi: '柚子', dundun: '吨吨', qianji: '千机', yase: '亚瑟' }[k]} ${'❤'.repeat(Math.min(v, 5))}${v >= 6 ? '💕' : ''}`).join('　')}</div>
        <div>😇 人品值：${s.karma} · ⏱️ 游玩时间：${G.u.fmtTime(s.playSec)}</div>
      </div>`;
      body.innerHTML = html;
    },

    menuBag(body) {
      const s = G.state;
      const inv = Object.entries(s.inv).filter(([k, v]) => v > 0);
      const eq = Object.entries(s.equipBag).filter(([k, v]) => v > 0);
      let html = `<h3 class="menu-h">🎒 消耗品与杂物</h3><div class="bag-grid">`;
      if (!inv.length) html += `<div class="dim">（空空如也，比钱包还空）</div>`;
      for (const [id, n] of inv) {
        const it = G.data.items[id];
        html += `<div class="bag-item" data-id="${id}">
          <div class="bi-top">${it.emoji} <b>${esc(it.name)}</b> ×${n}</div>
          <div class="bi-desc dim">${esc(it.desc)}</div>
          ${(() => {
            const e2 = it.effect || {};
            const usable = e2.heal || e2.mp || e2.lezi || e2.revive || e2.cure || e2.buff;
            return usable ? `<button class="mini-btn" data-use="${id}">使用</button>` : '';
          })()}
        </div>`;
      }
      html += `</div><h3 class="menu-h">⚔️ 装备库（去「装备」页穿戴）</h3><div class="bag-grid">`;
      if (!eq.length) html += `<div class="dim">（没有多余的装备）</div>`;
      for (const [id, n] of eq) {
        const it = G.data.items[id];
        html += `<div class="bag-item r${it.rarity || 1}"><div class="bi-top">${it.emoji} <b>${esc(it.name)}</b> ×${n}</div><div class="bi-desc dim">${esc(it.desc)}</div></div>`;
      }
      html += `</div>`;
      body.innerHTML = html;
      body.querySelectorAll('[data-use]').forEach(b => b.onclick = async () => {
        const id = b.dataset.use;
        const it = G.data.items[id];
        const target = await this.pickMember(it.target === 'allEnemies' || it.target === 'allAllies' || !it.target ? null : '选择使用的目标');
        if (target === null) return;
        const m = s.members[target];
        const cst = G.calcStats(m);
        if (it.effect.heal) m.hp = Math.min(cst.maxHp, m.hp + (it.effect.heal <= 1 ? Math.floor(cst.maxHp * it.effect.heal) : it.effect.heal));
        if (it.effect.mp) m.mp = Math.min(cst.maxMp, m.mp + (it.effect.mp <= 1 ? Math.floor(cst.maxMp * it.effect.mp) : it.effect.mp));
        if (it.effect.lezi) m.lezi = Math.min(100, m.lezi + it.effect.lezi);
        G.loseItem(id, 1);
        G.audio.sfx('heal');
        if (id.startsWith('i_hongyao') || id.startsWith('i_dayao') || id.startsWith('i_bandaid') || id === 'i_naicha') G.count('healPot');
        if (id === 'i_cola') G.count('happyWater');
        this.toast(`使用了 ${it.emoji} ${it.name}`, 'good');
        this.openMenu('bag');
      });
    },

    pickMember(title) {
      const s = G.state;
      if (s.party.length === 1) return s.party[0];
      return new Promise(res => {
        const overlay = $('#overlay');
        overlay.classList.remove('hidden');
        overlay.innerHTML = `<div class="mini-modal"><h3>${title || '选择谁？'}</h3>
          ${s.party.map(p => `<button class="choice-btn" data-p="${p}">${G.data.classes[s.members[p].cls].emoji} ${esc(p === 'xiaoman' ? s.heroName : G.data.classes[p].name)}</button>`).join('')}
          <button class="choice-btn cancel" data-p="@x">取消</button></div>`;
        overlay.onclick = e => {
          const b = e.target.closest('[data-p]');
          if (!b) return;
          overlay.classList.add('hidden');
          res(b.dataset.p === '@x' ? null : b.dataset.p);
        };
      });
    },

    menuEquip(body) {
      const s = G.state;
      let who = this._eqWho || s.party[0];
      if (!s.party.includes(who)) who = s.party[0];
      this._eqWho = who;
      const m = s.members[who];
      const cls = G.data.classes[who];
      const slots = [['weapon', '武器'], ['armor', '防具'], ['acc', '饰品']];
      let html = `<div class="eq-picker">${s.party.map(p => `<button class="mini-btn ${p === who ? 'on' : ''}" data-w="${p}">${G.data.classes[p].emoji} ${esc(p === 'xiaoman' ? s.heroName : G.data.classes[p].name)}</button>`).join('')}</div>`;
      for (const [slot, label] of slots) {
        const cur = m[slot] ? G.data.items[m[slot]] : null;
        html += `<h3 class="menu-h">${label}：${cur ? cur.emoji + ' ' + esc(cur.name) : '<span class="dim">未装备</span>'}</h3><div class="bag-grid">`;
        const candidates = Object.entries(s.equipBag).filter(([id, n]) => n > 0 && G.data.items[id].sub === (slot === 'weapon' ? 'weapon' : slot) && (!G.data.items[id].for || G.data.items[id].for.includes(who)));
        if (!candidates.length) html += `<div class="dim">（背包里没有可用的${label}）</div>`;
        for (const [id] of candidates) {
          const it = G.data.items[id];
          const statTxt = ['atk', 'def', 'mag', 'res', 'spd', 'luk', 'hp', 'mp', 'crit'].map(k => it[k] ? `${k}${it[k] > 0 ? '+' : ''}${it[k]}` : '').filter(Boolean).join(' ');
          html += `<div class="bag-item r${it.rarity || 1}"><div class="bi-top">${it.emoji} <b>${esc(it.name)}</b></div>
            <div class="bi-desc dim">${statTxt}</div><button class="mini-btn" data-eq="${slot}:${id}">装备</button></div>`;
        }
        if (cur) html += `<div class="bag-item"><div class="bi-top">${cur.emoji} <b>${esc(cur.name)}</b></div><button class="mini-btn" data-uneq="${slot}">卸下</button></div>`;
        html += `</div>`;
      }
      body.innerHTML = html;
      body.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { this._eqWho = b.dataset.w; this.openMenu('equip'); });
      body.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => {
        const [slot, id] = b.dataset.eq.split(':');
        if (m[slot]) { s.equipBag[m[slot]] = (s.equipBag[m[slot]] || 0) + 1; }
        s.equipBag[id]--; if (s.equipBag[id] <= 0) delete s.equipBag[id];
        m[slot] = id;
        G.audio.sfx('ok');
        this.openMenu('equip');
      });
      body.querySelectorAll('[data-uneq]').forEach(b => b.onclick = () => {
        const slot = b.dataset.uneq;
        s.equipBag[m[slot]] = (s.equipBag[m[slot]] || 0) + 1;
        m[slot] = null;
        G.audio.sfx('cancel');
        this.openMenu('equip');
      });
    },

    menuQuest(body) {
      const s = G.state;
      const qs = G.sides.quests || [];
      const act = qs.filter(q => (s.quests[q.id] || {}).s === 'active');
      const done = qs.filter(q => (s.quests[q.id] || {}).s === 'done');
      let html = `<h3 class="menu-h">📜 进行中的委托（${act.length}）</h3>`;
      if (!act.length) html += `<div class="dim">（暂无。去各地的告示板看看吧。）</div>`;
      for (const q of act) html += `<div class="quest-item"><b>${esc(q.name)}</b> <span class="dim">[${esc(q.where || '')}]</span><div class="dim">${esc(q.desc)}</div>${q.reward ? `<div class="q-reward">奖励：${esc(q.reward)}</div>` : ''}</div>`;
      html += `<h3 class="menu-h">✅ 已完成（${done.length}/${qs.length}）</h3>`;
      for (const q of done) html += `<div class="quest-item done"><b>${esc(q.name)}</b><div class="dim">${esc(q.desc)}</div></div>`;
      body.innerHTML = html;
    },

    menuDex(body) {
      const s = G.state;
      const cats = ['网络', '职场', '游戏', '动漫', '影视'];
      const total = G.memes.length;
      const got = Object.keys(s.memes).length;
      let html = `<div class="dex-head">📖 梗图鉴 <b>${got}/${total}</b>（收集齐有神秘成就与隐藏Boss钥匙）</div>`;
      for (const cat of cats) {
        const list = G.memes.filter(m => m.cat === cat);
        html += `<h3 class="menu-h">${cat}系（${list.filter(m => s.memes[m.id]).length}/${list.length}）</h3><div class="dex-grid">`;
        for (const m of list) {
          if (s.memes[m.id]) html += `<div class="dex-item on" title="${esc(m.text)}"><b>${esc(m.name)}</b><div class="dim">${esc(m.text)}</div></div>`;
          else html += `<div class="dex-item"><b>？？？</b><div class="dim">尚未收录</div></div>`;
        }
        html += `</div>`;
      }
      body.innerHTML = html;
    },

    menuAch(body) {
      const s = G.state;
      const list = Object.entries(G.data.ach);
      const got = list.filter(([id]) => s.ach[id]).length;
      let html = `<div class="dex-head">🏆 成就 <b>${got}/${list.length}</b></div><div class="dex-grid">`;
      for (const [id, a] of list) {
        if (s.ach[id]) html += `<div class="dex-item on"><b>✅ ${esc(a.name)}</b><div class="dim">${esc(a.desc)}</div></div>`;
        else html += `<div class="dex-item"><b>🔒 ${esc(a.name)}</b><div class="dim">${esc(a.desc)}</div></div>`;
      }
      body.innerHTML = html + `</div>`;
    },

    menuSys(body) {
      const s = G.state;
      const st = s.settings;
      body.innerHTML = `
        <h3 class="menu-h">⚙️ 设置</h3>
        <div class="sys-row">文字速度 <input type="range" id="cfg-speed" min="5" max="60" value="${61 - st.textSpeed}"> <span class="dim">${st.textSpeed <= 15 ? '很快' : st.textSpeed <= 30 ? '适中' : '悠闲'}</span></div>
        <div class="sys-row">🎵 BGM音量 <input type="range" id="cfg-bgm" min="0" max="100" value="${st.bgmVol * 100}"></div>
        <div class="sys-row">🔊 音效音量 <input type="range" id="cfg-sfx" min="0" max="100" value="${st.sfxVol * 100}"></div>
        <div class="sys-row"><label><input type="checkbox" id="cfg-scan" ${st.scanlines ? 'checked' : ''}> CRT扫描线滤镜</label>
          <label><input type="checkbox" id="cfg-auto" ${st.autoText ? 'checked' : ''}> 自动播放对话</label></div>
        <h3 class="menu-h">💾 存档</h3>
        <div id="save-slots"></div>
        <h3 class="menu-h">📤 传送码</h3>
        <div class="sys-row"><button class="mini-btn" id="btn-export">导出存档码</button> <button class="mini-btn" id="btn-import">导入存档码</button></div>
        <textarea id="save-code" class="save-code" placeholder="导出的存档码会出现在这里；导入时粘贴到这里再点导入"></textarea>
        <div class="sys-row dim">游戏进度保存在浏览器 localStorage。换设备或换浏览器请使用传送码。</div>`;
      body.querySelector('#cfg-speed').oninput = e => { st.textSpeed = 61 - parseInt(e.target.value); };
      body.querySelector('#cfg-bgm').oninput = e => { st.bgmVol = parseInt(e.target.value) / 100; G.audio.applyVolumes(); };
      body.querySelector('#cfg-sfx').oninput = e => { st.sfxVol = parseInt(e.target.value) / 100; G.audio.applyVolumes(); };
      body.querySelector('#cfg-scan').onchange = e => { st.scanlines = e.target.checked; document.body.classList.toggle('no-scan', !st.scanlines); };
      body.querySelector('#cfg-auto').onchange = e => { st.autoText = e.target.checked; };
      body.querySelector('#btn-export').onclick = () => { body.querySelector('#save-code').value = G.exportSave(); G.audio.sfx('ok'); };
      body.querySelector('#btn-import').onclick = async () => {
        const code = body.querySelector('#save-code').value;
        if (!code) { this.toast('先粘贴存档码！', 'bad'); return; }
        if (G.importSave(code)) { this.toast('✅ 导入成功！', 'good'); G.world.openMap(); }
        else this.toast('❌ 存档码无效', 'bad');
      };
      const slotsEl = body.querySelector('#save-slots');
      const saves = G.listSaves();
      slotsEl.innerHTML = saves.slice(1).map((sv, i) => {
        const slot = i + 1;
        return `<div class="save-slot"><div>${sv ? `📁 栏位${slot}：${esc(sv.name)} Lv.${sv.level} · ${esc(sv.chapter)} · ${G.u.fmtTime(sv.playSec)}前` : `📁 栏位${slot}：空`}</div>
          <div><button class="mini-btn" data-save="${slot}">保存</button>${sv ? `<button class="mini-btn" data-load="${slot}">读取</button>` : ''}</div></div>`;
      }).join('');
      slotsEl.querySelectorAll('[data-save]').forEach(b => b.onclick = () => { G.saveGame(parseInt(b.dataset.save)); this.openMenu('sys'); });
      slotsEl.querySelectorAll('[data-load]').forEach(b => b.onclick = async () => {
        const s2 = G.loadGame(parseInt(b.dataset.load));
        if (s2) { this.toast('✅ 读取成功！', 'good'); G.world.openMap(); }
      });
    },

    /* ================= 商店 ================= */
    async openShop(shopId) {
      const s = G.state;
      const shop = G.data.shops[shopId];
      if (!shop) return;
      G.audio.bgm('inn');
      const isPower = !!shop.power;
      const render = () => {
        const el = $('#screen-shop');
        el.classList.remove('hidden');
        el.innerHTML = `<div class="shop-frame">
          <div class="shop-head"><span>${shop.emoji} <b>${esc(shop.name)}</b></span>
            <span>💰 ${s.gold}${isPower ? ` · 🥁 功德 ${s.gongde}` : ''}</span>
            <button class="mini-btn" id="shop-close">离开</button></div>
          <div class="shop-greet">${esc(shop.greet)}</div>
          <div class="shop-grid">${shop.stock.map(id => {
            const it = G.data.items[id];
            const price = isPower ? (G.data.gongdePrice[id] || 999) : it.price;
            const cur = isPower ? s.gongde : s.gold;
            const owned = (s.inv[id] || 0) + (s.equipBag[id] || 0);
            return `<div class="shop-item r${it.rarity || 1}">
              <div class="bi-top">${it.emoji} <b>${esc(it.name)}</b></div>
              <div class="bi-desc dim">${esc(it.desc)}</div>
              <div class="shop-foot"><span class="${cur < price ? 'dim' : ''}">${isPower ? '🥁' : '💰'} ${price}</span>
                <span class="dim">${owned ? `持有${owned}` : ''}</span>
                <button class="mini-btn" data-buy="${id}" ${cur < price ? 'disabled' : ''}>购买</button></div>
            </div>`;
          }).join('')}</div></div>`;
        el.querySelector('#shop-close').onclick = () => { el.classList.add('hidden'); G.audio.bgm(G.world.curBgmFor() || 'town'); };
        el.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
          const id = b.dataset.buy;
          const price = isPower ? (G.data.gongdePrice[id] || 999) : G.data.items[id].price;
          if (isPower) { if (s.gongde < price) return; G.gainGongde(-price); }
          else { if (s.gold < price) return; G.gainGold(-price); }
          G.gainItem(id, 1);
          G.audio.sfx('coin');
          const it = G.data.items[id];
          if (it.type === 'equip') this.toast(`🛒 买下 ${it.emoji} ${it.name}`, 'good');
          else this.toast(`🛒 买下 ${it.emoji} ${it.name} ×1`, 'good');
          render();
        });
      };
      await new Promise(res => { render(); $('#screen-shop #shop-close').addEventListener('click', () => res(), { once: true }); });
    },
  };

  /* 键盘操作 */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#screen-menu').classList.contains('hidden')) { G.ui.openWorld(); return; }
      if (G.state && !$('#screen-battle').classList.contains('hidden')) return;
      if (G.state) G.ui.openMenu();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (!$('#dialog-wrap').classList.contains('hidden') && $('#choices').classList.contains('hidden')) { G.ui.clickAdv(); e.preventDefault(); }
    }
    if (e.key === 'm' || e.key === 'M') {
      G.audio.setMuted(G.audio.master && G.audio.master.gain.value !== 0);
    }
    const n = parseInt(e.key);
    if (n >= 1 && n <= 4 && !$('#choices').classList.contains('hidden')) {
      const btns = document.querySelectorAll('#choices .choice-btn');
      if (btns[n - 1]) btns[n - 1].click();
    }
  });

  /* 点击对话框推进 */
  document.addEventListener('click', e => {
    if (e.target.closest('#dialog') && !e.target.closest('#choices')) G.ui.clickAdv();
  });
})();
