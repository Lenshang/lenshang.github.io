'use strict';
/* ============================================================
 * 战斗系统：回合制 / 元素克制 / 状态效果 / 乐子值 / 合体技 /
 *           Boss机制（越战越强·分身·镜像·三阶段） / 掉落与升级
 * ============================================================ */
(() => {
  const $ = sel => document.querySelector(sel);
  const esc = G.u.esc;
  const sleep = G.u.sleep;

  const battle = G.battle = {
    B: null,

    /* ============ 入口 ============ */
    start(opts) {
      return new Promise(async res => {
        await this.setup(opts);
        await this.loop();
        const win = this.B.result === 'win';
        const result = this.B.result;
        await G.u.sleep(400);
        this.cleanup(res, { win, result });
      });
    },

    async setup(opts) {
      const s = G.state;
      opts = opts || {};
      const B = this.B = {
        opts, result: null, round: 0, lezi: 0, lastAllySkill: null,
        allies: [], enemies: [], over: false, critStreak: 0,
      };
      // 我方
      for (const pid of s.party) {
        const m = s.members[pid];
        const cls = G.data.classes[pid];
        const st = G.calcStats(m);
        B.allies.push({
          side: 'ally', key: pid, name: pid === 'xiaoman' ? s.heroName : cls.name, emoji: cls.emoji,
          hp: m.hp, mp: m.mp, maxHp: st.maxHp, maxMp: st.maxMp,
          stats: st, effects: [], alive: m.hp > 0, mref: m, isAlly: true,
        });
      }
      // 敌方
      for (const eid of (opts.enemies || [])) {
        const e = G.data.enemies[eid];
        if (!e) continue;
        B.enemies.push(this.makeEnemy(eid, e));
      }
      // 猫薄荷香囊：开局乐子
      for (const a of B.allies) {
        if (a.mref.acc && G.data.items[a.mref.acc].battleStartLezi) B.lezi += G.data.items[a.mref.acc].battleStartLezi;
      }
      // UI
      G.ui.show('screen-battle');
      $('#battle-bg').dataset.bg = opts.bg || 'field';
      $('#battle-log').innerHTML = '';
      this.log(opts.intro || (opts.boss ? '⚡ 强敌来袭！空气突然安静……' : '遭遇了敌人！'));
      G.audio.bgm(opts.bgm || (opts.boss ? 'boss' : 'battle'));
      if (opts.boss) G.audio.sfx('boss');
      this.renderAll();
      await sleep(600);
    },

    makeEnemy(eid, e) {
      return {
        side: 'enemy', key: eid, def: e, name: e.name, emoji: e.emoji,
        hp: e.hp, maxHp: e.hp,
        stats: { atk: e.atk, def: e.def, mag: e.mag, res: e.res, spd: e.spd, luk: e.luk || 5, crit: 0 },
        effects: [], alive: true, isAlly: false,
        taunted: {}, cloned: false, phase2: false, mercy: 0,
      };
    },

    cleanup(res, out) {
      const B = this.B;
      // 保存我方血量
      for (const a of B.allies) { a.mref.hp = Math.max(a.mref.hp > 0 ? 1 : 0, a.hp); a.mref.mp = a.mp; }
      this.B = null;
      res(out);
    },

    /* ============ 主循环 ============ */
    async loop() {
      const B = this.B;
      while (!B.over) {
        B.round++;
        await this.checkPhases();
        if (B.over) break;
        const order = [...B.allies, ...B.enemies].filter(u => u.alive)
          .sort((a, b2) => this.eff(b2, 'spd') + G.u.rf(0, 2) - (this.eff(a, 'spd') + G.u.rf(0, 2)));
        for (const u of order) {
          if (B.over) break;
          if (!u.alive) continue;
          if (u.isAlly) await this.allyTurn(u);
          else await this.enemyTurn(u);
          await this.endOfUnit(u);
          this.checkEnd();
        }
        // 阿卷：每回合变强
        for (const e of B.enemies) {
          if (e.alive && e.def.scaleUp) {
            e.stats.atk = Math.min(e.def.atk * 2, e.stats.atk * 1.06);
          }
        }
        await sleep(250);
      }
      if (B.result === 'win' && !B._victoryShown) {
        B._victoryShown = true;
        await this.victory();
      }
    },

    /* ============ 最终Boss阶段转换 ============ */
    async checkPhases() {
      const B = this.B;
      for (const e of B.enemies) {
        if (e.alive && e.def && e.def.finalBoss && !e.phase2 && e.hp <= e.maxHp * 0.5) {
          e.phase2 = true;
          await this.banner('😶 「够了……够了！！」', 'warn');
          await sleep(600);
          await this.banner('💢 灰雾炸裂——那不是魔神，是一个被逼到极限的「人」。', 'taunt');
          const p2 = G.data.enemies.boss_mowang2;
          e.def = p2;
          e.name = p2.name;
          e.emoji = p2.emoji;
          e.maxHp = p2.hp;
          e.hp = p2.hp;
          e.stats = { atk: p2.atk, def: p2.def, mag: p2.mag, res: p2.res, spd: p2.spd, luk: p2.luk || 5 };
          e.effects = [];
          this.log('班味剥落——<b>初代勇者·季长安</b>睁开了眼睛！');
          G.audio.sfx('boss');
          this.renderAll();
          await sleep(900);
        }
      }
    },

    checkEnd() {
      const B = this.B;
      if (B.enemies.every(e => !e.alive)) { B.result = 'win'; B.over = true; }
      else if (B.allies.every(a => !a.alive)) { B.result = 'lose'; B.over = true; }
    },

    /* ============ 数值 ============ */
    eff(u, stat) {
      let v = u.stats[stat] || 0;
      for (const e of u.effects) {
        if (e.k === 'buff' && e.stat === stat) v *= e.mult;
        if (e.k === 'status' && e.s === 'ban' && (stat === 'atk' || stat === 'mag')) v *= 0.7;
      }
      return v;
    },
    effCrit(u) {
      let c = 0.05 + (u.stats.luk || 0) * 0.004;
      for (const e of u.effects) if (e.k === 'buff' && e.stat === 'crit') c *= e.mult;
      return c;
    },
    hasEff(u, k, s) { return u.effects.some(e => e.k === k && (!s || e.s === s)); },

    elemMult(element, defUnit) {
      if (!element || element === 'phys') return 1;
      let m = 1;
      const chart = G.data.elemChart[element] || {};
      if (defUnit.def && defUnit.def.weak && defUnit.def.weak.includes(element)) m *= 1.5;
      if (defUnit.def && defUnit.def.resist && defUnit.def.resist.includes(element)) m *= 0.5;
      if (chart[element]) m *= 1;
      for (const k in chart) if (k === (defUnit.def && defUnit.def.race)) m *= 1; // 占位
      if (element === 'meme' && defUnit.def && defUnit.def.race === 'ban') m *= 1.5;
      return m;
    },

    calcDamage(att, def, skill) {
      const isPhys = !skill.type || skill.type === 'phys';
      let atkStat = isPhys ? this.eff(att, 'atk') : this.eff(att, 'mag');
      let defStat = isPhys ? this.eff(def, 'def') : this.eff(def, 'res');
      if (skill.ignoreDef) defStat = 0;
      let base = atkStat * (isPhys ? 2.2 : 2.4) - defStat * (isPhys ? 1.1 : 1.2);
      base *= (skill.pow || 1);
      base *= this.elemMult(skill.element, def);
      base *= G.u.rf(0.9, 1.1);
      let crit = false;
      if (G.u.chance(this.effCrit(att))) { base *= 1.75; crit = true; }
      // 防御类减免
      if (this.hasEff(def, 'guard')) base *= (1 - def.effects.find(e => e.k === 'guard').val);
      if (this.hasEff(def, 'shield')) base *= (1 - def.effects.find(e => e.k === 'shield').val);
      base = Math.max(1, Math.round(base));
      return { dmg: base, crit };
    },

    /* ============ 伤害与特效 ============ */
    async dealDamage(att, def, skill, mult) {
      const { dmg, crit } = this.calcDamage(att, def, skill);
      let d = Math.round(dmg * (mult || 1));
      // 闪避（锦鲤）
      if (this.hasEff(def, 'evade') && G.u.chance(def.effects.find(e => e.k === 'evade').val)) {
        this.popup(def, 'MISS', 'miss'); this.log(`${def.name} 身形一闪，躲开了！`);
        return 0;
      }
      def.hp -= d;
      // 不甘心
      if (def.hp <= 0 && this.hasEff(def, 'reviveGuard')) {
        def.hp = 1;
        def.effects = def.effects.filter(e => e.k !== 'reviveGuard');
        this.popup(def, '不甘心！', 'buff');
        this.log(`💗 ${def.name}「还不甘心……！」`);
      }
      if (def.hp <= 0) { def.hp = 0; def.alive = false; }
      // 反击
      if (def.alive && this.hasEff(def, 'counter') && skill) {
        const cval = def.effects.find(e => e.k === 'counter').val;
        const back = Math.round(d * cval);
        att.hp -= back;
        if (att.hp <= 0) { att.hp = 0; att.alive = false; }
        this.popup(att, `反击 ${back}`, 'dmg');
        if (!att.alive) this.log(`💀 ${att.name} 被反击击倒了……`);
      }
      // 睡眠被打醒
      def.effects = def.effects.filter(e => !(e.k === 'status' && e.s === 'sleep'));
      this.popup(def, `-${d}${crit ? ' 暴击!' : ''}`, crit ? 'crit' : 'dmg');
      const el = document.querySelector(`[data-unit="${def.side}${def.isAlly ? def.key : B_enKey(def)}"]`);
      if (el) { el.classList.add('hurt'); setTimeout(() => el.classList.remove('hurt'), 350); }
      G.audio.sfx(crit ? 'crit' : 'hit');
      // 乐子值
      if (att.isAlly) {
        this.addLezi(crit ? 4 : 3);
        if (crit) { B_critStreak(); }
      } else if (def.isAlly) this.addLezi(2);
      this.renderAll();
      return d;
    },

    async healUnit(src, tgt, amount) {
      const before = tgt.hp;
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + amount);
      const healed = tgt.hp - before;
      this.popup(tgt, `+${healed}`, 'heal');
      G.audio.sfx('heal');
      this.renderAll();
    },

    addLezi(n, fromBan) {
      const B = this.B;
      if (fromBan) n = Math.ceil(n / 2);
      B.lezi = G.u.clamp(B.lezi + n, 0, 100);
      const lz = $('#lezi-bar');
      if (lz) {
        lz.style.width = B.lezi + '%';
        lz.classList.toggle('full', B.lezi >= 100);
      }
    },

    popup(u, text, kind) {
      const el = document.querySelector(`[data-unit="${u.side}${u.isAlly ? u.key : B_enKey(u)}"]`);
      if (!el) return;
      const p = document.createElement('div');
      p.className = 'pop ' + (kind || 'dmg');
      p.textContent = text;
      el.appendChild(p);
      setTimeout(() => p.remove(), 900);
    },

    log(txt) {
      const el = $('#battle-log');
      const d = document.createElement('div');
      d.innerHTML = txt;
      el.appendChild(d);
      while (el.children.length > 4) el.firstChild.remove();
    },

    banner(text, cls) {
      return new Promise(res => {
        const el = document.createElement('div');
        el.className = 'battle-banner ' + (cls || '');
        el.innerHTML = text;
        $('#screen-battle').appendChild(el);
        setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); res(); }, 350); }, 1500);
      });
    },

    /* ============ 渲染 ============ */
    renderAll() {
      const B = this.B;
      if (!B) return;
      // 敌人
      const eBox = $('#battle-enemies');
      eBox.innerHTML = B.enemies.map((e, i) => {
        if (!e.alive) return '';
        return `<div class="enemy-sprite ${e.big || (e.def && e.def.boss) ? 'big' : ''}" data-unit="enemy${B_enKey(e)}" data-i="${i}">
          <div class="es-emoji">${e.emoji}</div>
          <div class="es-name">${esc(e.name)}</div>
          <div class="es-hp"><i style="width:${Math.max(0, e.hp / e.maxHp * 100)}%"></i></div>
        </div>`;
      }).join('');
      eBox.querySelectorAll('.enemy-sprite').forEach(el => { el.style.opacity = 1; });
      // 我方
      const pBox = $('#battle-party');
      pBox.innerHTML = B.allies.map(a => {
        const st = a.stats;
        return `<div class="ally-card ${a.alive ? '' : 'dead'}" data-unit="ally${a.key}">
          <div class="ac-top"><span class="ac-emoji">${a.emoji}</span><b>${esc(a.name)}</b></div>
          <div class="bar hp"><u style="width:${Math.max(0, a.hp / a.maxHp * 100)}%"></u></div>
          <div class="bar mp"><u style="width:${Math.max(0, a.mp / a.maxMp * 100)}%"></u></div>
          <div class="ac-num">${Math.max(0, a.hp)}/${a.maxHp} · ${Math.max(0, a.mp)}/${a.maxMp}</div>
          <div class="ac-status">${a.effects.map(e => statusIcon(e)).join('')}</div>
        </div>`;
      }).join('');
      // 乐子条
      const cmdBox = $('#battle-cmd');
      if (!cmdBox.dataset.built) {
        cmdBox.dataset.built = '1';
        cmdBox.innerHTML = `<div class="lezi-wrap">🎬 乐子值 <div class="lezi-track"><i id="lezi-bar"></i></div></div><div id="cmd-btns"></div>`;
      }
    },

    /* ============ 我方回合 ============ */
    allyTurn(u) {
      return new Promise(async res => {
        const B = this.B;
        // 异常状态
        if (this.hasEff(u, 'status', 'sleep')) { this.log(`💤 ${u.name} 正在摸鱼……`); return res(); }
        if (this.hasEff(u, 'status', 'para') && G.u.chance(0.45)) { this.log(`⚡ ${u.name} 被硬控了，动弹不得！`); return res(); }
        if (this.hasEff(u, 'status', 'conf') && G.u.chance(0.5)) {
          const tgt = G.u.pick([...B.allies.filter(x => x.alive), ...B.enemies.filter(x => x.alive)]);
          this.log(`💫 ${u.name} 陷入混乱，攻击了 ${tgt.name}！`);
          await sleep(400);
          await this.dealDamage(u, tgt, { type: 'phys', pow: 0.9 });
          return res();
        }
        this.renderAll();
        // 指令 UI
        const btns = $('#cmd-btns');
        const canCombo = G.data.combos.filter(c =>
          c.members.every(mm => B.allies.some(a => a.key === mm && a.alive)) &&
          G.state.affinity[comboMain(c)] >= c.aff &&
          B.lezi >= c.lezi &&
          (!c.needAll || c.members.filter(mm => B.allies.some(a => a.key === mm)).length >= 4));
        btns.innerHTML = `
          <button data-c="atk">⚔️ 攻击</button>
          <button data-c="skill">✨ 技能</button>
          <button data-c="item">🎒 道具</button>
          <button data-c="def">🛡️ 防御</button>
          ${canCombo.length ? `<button data-c="combo" class="hl">🤝 合体技</button>` : ''}
          ${B.lezi >= 100 ? `<button data-c="lezi" class="hl">🎬 整活时间</button>` : ''}
          ${B.opts.canFlee !== false ? `<button data-c="flee">💨 逃跑</button>` : ''}`;
        const act = await new Promise(r => {
          btns.onclick = e => { const b = e.target.closest('[data-c]'); if (b) { G.audio.sfx('blip'); r(b.dataset.c); } };
        });
        if (act === 'atk') {
          const tgt = await this.pickTarget(true);
          if (!tgt) return this.allyTurn(u).then(res);
          await this.doAttack(u, tgt);
          return res();
        }
        if (act === 'def') {
          u.effects.push({ k: 'guard', val: 0.5, turns: 1 });
          u.mp = Math.min(u.maxMp, u.mp + 6);
          this.log(`🛡️ ${u.name} 摆出防御姿态。（回复6点梗力）`);
          this.renderAll();
          await sleep(350);
          return res();
        }
        if (act === 'flee') {
          const avgSpd = B.allies.reduce((x, a) => x + this.eff(a, 'spd'), 0) / B.allies.filter(a => a.alive).length;
          const eSpd = B.enemies.reduce((x, e) => x + e.stats.spd, 0) / B.enemies.length;
          if (G.u.chance(0.55 + (avgSpd - eSpd) * 0.015)) {
            this.log('💨 成功逃跑！退！退！退！');
            G.audio.sfx('flee');
            G.count('flee');
            await sleep(600);
            B.result = 'flee'; B.over = true;
            return res();
          } else {
            this.log('❌ 逃跑失败！（敌人：就这？）');
            await sleep(500);
            return res();
          }
        }
        if (act === 'skill') {
          const sk = await this.pickSkill(u);
          if (!sk) return this.allyTurn(u).then(res);
          if (u.mp < sk.cost.mp) { this.log('梗力不足！'); return this.allyTurn(u).then(res); }
          if (this.hasEff(u, 'status', 'mute')) { this.log(`🔇 ${u.name} 被封技，无法使用技能！`); return res(); }
          u.mp -= sk.cost.mp;
          await this.useSkill(u, sk);
          return res();
        }
        if (act === 'item') {
          const item = await this.pickItem();
          if (!item) return this.allyTurn(u).then(res);
          await this.useItem(u, item);
          return res();
        }
        if (act === 'combo') {
          const c = await this.pickCombo(canCombo);
          if (!c) return this.allyTurn(u).then(res);
          B.lezi -= c.lezi;
          this.addLezi(0);
          await this.useCombo(u, c);
          return res();
        }
        if (act === 'lezi') {
          B.lezi = 0; this.addLezi(0);
          await this.ultimateShow(u);
          return res();
        }
        res();
      });
    },

    async doAttack(u, tgt) {
      const el = document.querySelector(`[data-unit="ally${u.key}"]`);
      if (el) { el.classList.add('attacking'); setTimeout(() => el.classList.remove('attacking'), 400); }
      await sleep(250);
      await this.dealDamage(u, tgt, { type: 'phys', pow: 1.0 });
      await sleep(300);
    },

    pickTarget(allySide, opts) {
      const B = this.B;
      return new Promise(res => {
        const list = (allySide ? B.enemies : B.allies).filter(x => x.alive);
        if (list.length === 1) return res(list[0]);
        this.log('👉 请选择目标（点击画面中的单位）');
        document.querySelectorAll('.enemy-sprite,.ally-card').forEach(el => {
          const id = el.dataset.unit;
          const u = [...B.allies, ...B.enemies].find(x => (x.isAlly ? 'ally' + x.key : 'enemy' + B_enKey(x)) === id);
          if (u && u.alive) el.classList.add('targetable');
        });
        const handler = e => {
          const el = e.target.closest('.targetable');
          if (!el) return;
          const id = el.dataset.unit;
          const u = [...B.allies, ...B.enemies].find(x => (x.isAlly ? 'ally' + x.key : 'enemy' + B_enKey(x)) === id);
          if (u && u.alive) {
            G.audio.sfx('ok');
            cleanup();
            res(u);
          }
        };
        const cancel = e => {
          if (e.key === 'Escape' || e.target.closest('#cmd-btns')) { cleanup(); res(null); }
        };
        function cleanup() {
          document.querySelectorAll('.targetable').forEach(el => el.classList.remove('targetable'));
          document.removeEventListener('click', handler);
          document.removeEventListener('keydown', cancel);
        }
        document.addEventListener('click', handler);
        document.addEventListener('keydown', cancel);
      });
    },

    pickSkill(u) {
      const m = u.mref;
      const cls = G.data.classes[m.cls];
      const skills = m.skills.map(id => G.data.skills[id]).filter(Boolean);
      return new Promise(res => {
        const box = $('#battle-skill-list');
        box.classList.remove('hidden');
        box.innerHTML = `<div class="bs-head">✨ ${esc(u.name)} 的技能 <button class="mini-btn" data-x>返回</button></div>` +
          skills.map(sk => {
            const noMp = u.mp < (sk.cost.mp || 0);
            return `<button class="bs-item ${noMp ? 'no' : ''}" data-sk="${G.state.members[u.key] ? Object.keys(G.data.skills).find(k2 => G.data.skills[k2] === sk) || sk.name : sk.name}" data-mp="${noMp ? 0 : 1}">
            <b>${sk.emoji} ${esc(sk.name)}</b> <span class="dim">💧${sk.cost.mp || 0}</span><div class="dim bs-desc">${esc(sk.desc || '')}</div></button>`;
          }).join('');
        box.querySelectorAll('.bs-item').forEach(b => b.onclick = () => {
          if (b.dataset.mp === '0') { G.audio.sfx('cancel'); return; }
          const name = b.querySelector('b').textContent.replace(/^\S+\s/, '');
          const sk = skills.find(x => x.name === name);
          box.classList.add('hidden');
          res(sk);
        });
        box.querySelector('[data-x]').onclick = () => { box.classList.add('hidden'); res(null); };
      });
    },

    pickItem() {
      const s = G.state;
      const items = Object.entries(s.inv).filter(([id, n]) => n > 0 && G.data.items[id] && G.data.items[id].battle);
      return new Promise(res => {
        const box = $('#battle-item-list');
        box.classList.remove('hidden');
        box.innerHTML = `<div class="bs-head">🎒 战斗道具 <button class="mini-btn" data-x>返回</button></div>` +
          (items.length ? items.map(([id, n]) => {
            const it = G.data.items[id];
            return `<button class="bs-item" data-id="${id}"><b>${it.emoji} ${esc(it.name)}</b> ×${n}<div class="dim bs-desc">${esc(it.desc)}</div></button>`;
          }).join('') : '<div class="dim" style="padding:12px">（没有能用的道具……）</div>');
        box.querySelectorAll('.bs-item').forEach(b => b.onclick = () => {
          box.classList.add('hidden');
          res(b.dataset.id);
        });
        box.querySelector('[data-x]').onclick = () => { box.classList.add('hidden'); res(null); };
      });
    },

    pickCombo(list) {
      return new Promise(res => {
        const box = $('#battle-skill-list');
        box.classList.remove('hidden');
        box.innerHTML = `<div class="bs-head">🤝 合体技（消耗🎬乐子值） <button class="mini-btn" data-x>返回</button></div>` +
          list.map(c => `<button class="bs-item" data-id="${c.id}"><b>${c.emoji} ${esc(c.name)}</b> <span class="dim">🎬${c.lezi}</span><div class="dim bs-desc">${esc(c.desc)}</div></button>`).join('');
        box.querySelectorAll('.bs-item').forEach(b => b.onclick = () => {
          box.classList.add('hidden');
          res(G.data.combos.find(x => x.id === b.dataset.id));
        });
        box.querySelector('[data-x]').onclick = () => { box.classList.add('hidden'); res(null); };
      });
    },

    /* ============ 技能执行 ============ */
    async useSkill(u, sk, fromCombo) {
      const B = this.B;
      this.log(`${u.emoji} ${u.name} 使用了 <b>${sk.emoji} ${sk.name}</b>！`);
      if (sk.tag === 'meme') this.addLezi(6, this.hasEff(u, 'status', 'ban'));
      // 幻觉！
      if (sk.halluc && G.u.chance(sk.halluc)) {
        const alts = [
          { ...sk, name: '生成·猫猫图', type: 'heal', pow: 1.2, target: 'allAllies', element: null },
          { ...sk, element: G.u.pick(['water', 'wind', 'earth', 'light', 'dark']) },
          { ...sk, name: '生成·502 Bad Gateway', pow: 2.2 },
          { ...sk, name: '生成·彩虹猫（18禁循环版）', pow: 0.5 },
        ];
        sk = G.u.pick(alts);
        await this.banner(`🌀 <b>幻觉发生！</b> 实际施放：${sk.name}`, 'halluc');
      }
      await sleep(300);
      const targets = await this.resolveTargets(u, sk);
      for (const tgt of targets) {
        if (!tgt.alive && sk.type !== 'heal' && sk.type !== 'special' && sk.type !== 'buff') continue;
        if (sk.type === 'phys' || sk.type === 'mag') {
          const hits = sk.hits === '2-3' ? G.u.rnd(2, 3) : (typeof sk.hits === 'number' ? sk.hits : 1);
          for (let i = 0; i < hits; i++) {
            if (!tgt.alive) break;
            let real = tgt;
            if (sk.target === 'randomEnemies') {
              const pool = B.enemies.filter(x => x.alive);
              if (!pool.length) break;
              real = G.u.pick(pool);
            }
            await this.dealDamage(u, real, sk);
            await sleep(160);
          }
          if (sk.strip) { tgt.effects = tgt.effects.filter(e => e.k !== 'buff'); this.log(`🌀 ${tgt.name} 的强化被抹掉了！`); }
          if (sk.effect && sk.effect.status && tgt.alive && G.u.chance(sk.effect.chance)) {
            this.applyStatus(tgt, sk.effect.status, sk.effect.turns);
          }
        } else if (sk.type === 'heal') {
          if (sk.target === 'allAllies') {
            for (const a of B.allies.filter(x => x.alive)) {
              await this.healUnit(u, a, this.healAmount(u, sk));
              if (sk.effect && sk.effect.buff) this.applyBuff(a, sk.effect.buff, sk.effect.turns, sk.name);
            }
          } else {
            await this.healUnit(u, tgt, this.healAmount(u, sk));
            if (sk.effect && sk.effect.cure) {
              tgt.effects = tgt.effects.filter(e => !(e.k === 'status' && sk.effect.cure.includes(e.s)));
              this.log(`✨ ${tgt.name} 的异常状态解除了！`);
            }
            if (sk.effect && sk.effect.buff) this.applyBuff(tgt, sk.effect.buff, sk.effect.turns, sk.name);
          }
        } else if (sk.type === 'buff' || sk.type === 'special') {
          const list = sk.target === 'allAllies' ? B.allies.filter(x => x.alive) : sk.target === 'self' ? [u] : [tgt];
          for (const a of list) {
            const eff = sk.effect || {};
            if (eff.buff) this.applyBuff(a, eff.buff, eff.turns, sk.name);
            if (eff.shield) { a.effects.push({ k: 'shield', val: eff.shield, turns: eff.turns }); this.log(`🛡️ ${a.name} 获得了护盾！`); }
            if (eff.guard) { a.effects.push({ k: 'guard', val: eff.guard, turns: eff.turns }); this.log(`🧱 ${a.name} 伤害减免生效！`); }
            if (eff.counter) { a.effects.push({ k: 'counter', val: eff.counter, turns: eff.turns }); this.log(`🔁 ${a.name} 进入反弹姿态！`); }
            if (eff.evade) { a.effects.push({ k: 'evade', val: eff.evade, turns: eff.turns }); this.log(`🐟 ${a.name} 锦鲤护体！`); }
            if (eff.taunt) { a.effects.push({ k: 'taunt', turns: eff.turns }); this.log(`🎯 ${a.name} 吸引了全部火力！`); }
            if (eff.reviveGuard) { a.effects.push({ k: 'reviveGuard' }); this.log(`😤 ${a.name} 燃起了不甘心的火焰！`); }
            if (eff.cure) { a.effects = a.effects.filter(e => !(e.k === 'status' && eff.cure.includes(e.s))); }
            if (sk.cureAll) { a.effects = a.effects.filter(e => e.k !== 'status'); this.log(`🧹 ${a.name} 状态全清！`); }
            if (eff.healPct) await this.healUnit(u, a, Math.round(a.maxHp * eff.healPct));
            if (sk.healPctSelf) await this.healUnit(u, a, Math.round(a.maxHp * sk.healPctSelf));
          }
          if (sk.lezi) this.addLezi(sk.lezi);
        } else if (sk.type === 'debuff') {
          if (sk.effect && sk.effect.status && G.u.chance(sk.effect.chance)) {
            for (const t of targets) this.applyStatus(t, sk.effect.status, sk.effect.turns);
          }
        }
        await sleep(120);
      }
      // 尊嘟假嘟：赌博效果
      if (sk.name === '尊嘟假嘟') {
        const roll = G.u.rnd(1, 8);
        const tgt = targets[0];
        await this.banner('🎲 尊嘟……假嘟？', '');
        await sleep(300);
        if (roll <= 3) { await this.banner('💥 尊嘟！大爆炸！', 'good'); await this.dealDamage(u, tgt, { type: 'mag', pow: 2.8, element: 'meme' }); }
        else if (roll <= 5) { await this.banner('✨ 假嘟变真嘟！全队回复！', 'good'); for (const a of B.allies.filter(x => x.alive)) await this.healUnit(u, a, Math.round(a.maxHp * 0.4)); }
        else if (roll === 6) { await this.banner('😐 敌人睡着了（真的）', ''); for (const e of B.enemies.filter(x => x.alive)) this.applyStatus(e, 'sleep', 2); }
        else { await this.banner('💨 假嘟……什么都没发生（小 means 小浪费）', 'bad'); }
      }
      if (sk.cost && sk.cost.hp) {
        u.hp = Math.max(1, u.hp - Math.round(u.maxHp * sk.cost.hp));
        this.renderAll();
      }
      if (!fromCombo && (sk.type === 'phys' || sk.type === 'mag')) B.lastAllySkill = sk;
      await sleep(400);
    },

    healAmount(u, sk) {
      const base = (this.eff(u, 'mag') * 1.2 + 30) * (sk.pow || 1);
      return Math.round(base);
    },

    async resolveTargets(u, sk) {
      const B = this.B;
      const t = sk.target || 'oneEnemy';
      if (t === 'self') return [u];
      if (t === 'allAllies') return B.allies.filter(x => x.alive);
      if (t === 'allEnemies') return B.enemies.filter(x => x.alive);
      if (t === 'randomEnemies') return B.enemies.filter(x => x.alive).slice(0, 1);
      if (t === 'lowestHp') {
        const list = (u.isAlly ? B.enemies : B.allies).filter(x => x.alive);
        return [list.sort((a, b2) => a.hp / a.maxHp - b2.hp / b2.maxHp)[0]];
      }
      // 需要选择目标
      const isAtk = sk.type === 'phys' || sk.type === 'mag' || sk.type === 'debuff';
      const tgt = await this.pickTarget(u.isAlly ? isAtk : !isAtk);
      return tgt ? [tgt] : [];
    },

    applyBuff(u, buff, turns, name) {
      for (const stat in buff) {
        u.effects = u.effects.filter(e => !(e.k === 'buff' && e.stat === stat));
        u.effects.push({ k: 'buff', stat, mult: buff[stat], turns: turns || 3, name: name || '' });
      }
      G.audio.sfx('buff');
      this.popup(u, 'UP!', 'buff');
      this.renderAll();
    },
    applyStatus(u, s, turns) {
      u.effects = u.effects.filter(e => !(e.k === 'status' && e.s === s));
      u.effects.push({ k: 'status', s, turns: turns || 2 });
      this.popup(u, G.data.statusInfo[s] ? G.data.statusInfo[s].icon + G.data.statusInfo[s].name : s, 'status');
      this.log(`${u.name} 陷入了 <b>${G.data.statusInfo[s] ? G.data.statusInfo[s].name : s}</b>！`);
      this.renderAll();
    },

    async useItem(u, itemId) {
      const s = G.state;
      const it = G.data.items[itemId];
      G.loseItem(itemId, 1);
      this.log(`${u.name} 使用了 ${it.emoji} <b>${it.name}</b>！`);
      await sleep(300);
      const e = it.effect || {};
      if (it.target === 'allEnemies') {
        for (const en of this.B.enemies.filter(x => x.alive)) {
          en.hp -= (e.damage || 0);
          if (en.hp <= 0) { en.hp = 0; en.alive = false; }
          this.popup(en, `-${e.damage}`, 'dmg');
          if (it.chancePoison && G.u.chance(it.chancePoison)) this.applyStatus(en, 'poison', 3);
        }
        await this.banner('😷 臭气弥漫！伤害与污染全场！', '');
      } else {
        let tgt = u;
        if (e.revive) {
          const dead = this.B.allies.filter(a => !a.alive);
          tgt = dead.length ? dead[0] : await this.pickTarget(false);
        } else if (this.B.allies.length > 1) {
          tgt = await this.pickTarget(false) || u;
        }
        if (e.revive && !tgt.alive) { tgt.alive = true; }
        if (e.heal) await this.healUnit(u, tgt, e.heal <= 1 ? Math.round(tgt.maxHp * e.heal) : e.heal);
        if (e.mp) tgt.mp = Math.min(tgt.maxMp, tgt.mp + (e.mp <= 1 ? Math.round(tgt.maxMp * e.mp) : e.mp));
        if (e.cure) tgt.effects = tgt.effects.filter(x => !(x.k === 'status' && e.cure.includes(x.s)));
        if (e.buff) this.applyBuff(tgt, e.buff, it.turns || 3, it.name);
        if (e.lezi) { this.addLezi(e.lezi); }
        if (itemId === 'i_v50') {
          G.count('v50');
          await this.banner('🍗 疯狂星期四！V我50！', 'kfc');
          G.audio.sfx('kfc');
        }
        if (itemId === 'i_cola') G.count('happyWater');
        if (itemId === 'i_hongyao' || itemId === 'i_dayao' || itemId === 'i_bandaid' || itemId === 'i_naicha') G.count('healPot');
      }
      this.renderAll();
      await sleep(400);
    },

    async useCombo(u, c) {
      const B = this.B;
      await this.banner(`${c.emoji} <b>合体技 · ${c.name}！</b>`, 'combo');
      G.audio.sfx('kfc');
      await sleep(500);
      const actors = B.allies.filter(a => c.members.includes(a.key));
      if (c.type === 'phys' || c.type === 'mag') {
        const targets = c.target === 'allEnemies' ? B.enemies.filter(x => x.alive) : [await this.pickTarget(true)];
        for (const tgt of targets) {
          if (!tgt) break;
          const hits = c.hits || 1;
          for (let i = 0; i < hits; i++) {
            if (!tgt.alive) break;
            await this.dealDamage(actors[0], tgt, { type: c.type, pow: c.pow, element: c.element });
            await sleep(150);
          }
          if (c.stun && tgt.alive && G.u.chance(c.stun)) this.applyStatus(tgt, 'para', 1);
        }
      } else if (c.id === 'c_cybermao') {
        for (const e of B.enemies.filter(x => x.alive)) this.applyBuff(e, { def: 0.6 }, 3, '逗猫棒');
        const yz = B.allies.find(a => a.key === 'youzi');
        if (yz) this.applyBuff(yz, { atk: 1.5, crit: 2.5 }, 3, '赛博逗猫');
        this.log('激光点出现，柚子进入暴走模式！');
      } else if (c.id === 'c_muyu') {
        await this.banner('🥁 功德 +1 +1 +1 +1 ……', 'combo');
        for (const e of B.enemies.filter(x => x.alive)) {
          await this.dealDamage(actors.find(a => a.key === 'qianji') || actors[0], e, { type: 'mag', pow: c.pow, element: 'meme' });
        }
        for (const a of B.allies.filter(x => x.alive)) a.effects = a.effects.filter(e => e.k !== 'status');
        this.log('✨ 全队异常状态被超度了！');
      } else if (c.id === 'c_kuadai') {
        for (const a of B.allies.filter(x => x.alive)) {
          this.applyBuff(a, { atk: 1.35, mag: 1.35 }, 3, '跨代整活');
          await this.healUnit(u, a, Math.round(a.maxHp * 0.3));
        }
      } else if (c.id === 'c_kaibai') {
        for (const a of B.allies) {
          a.alive = true; a.hp = a.maxHp; a.mp = a.maxMp; a.effects = [];
        }
        B.lezi = 100;
        this.addLezi(0);
        await this.banner('🍗 今天是疯狂星期四！全员满血复活！！', 'kfc');
        G.audio.sfx('kfc');
      }
      this.renderAll();
      await sleep(600);
    },

    async ultimateShow(u) {
      const B = this.B;
      const shows = [
        {
          name: '奥利给·奥义', async run() {
            await this.banner('💪 奥利给！！！', 'combo');
            for (const a of B.allies.filter(x => x.alive)) this.applyBuff(a, { atk: 1.5, spd: 1.3 }, 3, '奥利给');
          }
        },
        {
          name: '芜湖起飞·空袭', async run() {
            await this.banner('✈️ 芜——湖——起——飞——！', 'combo');
            for (const e of B.enemies.filter(x => x.alive)) await this.dealDamage(u, e, { type: 'mag', pow: 2.0, element: 'wind' });
          }
        },
        {
          name: '猫猫视频疗愈', async run() {
            await this.banner('📺 播放猫猫视频……班味清空！', 'combo');
            for (const a of B.allies.filter(x => x.alive)) { a.effects = a.effects.filter(e => e.k !== 'status'); await this.healUnit(u, a, Math.round(a.maxHp * 0.5)); }
          }
        },
        {
          name: '退退退·大喝', async run() {
            await this.banner('🚫 退！退！退！', 'combo');
            for (const e of B.enemies.filter(x => x.alive)) { this.applyStatus(e, 'para', 1); await this.dealDamage(u, e, { type: 'mag', pow: 1.6, element: 'meme' }); }
          }
        },
        {
          name: '泼天的富贵', async run() {
            await this.banner('💰 泼天的富贵轮到你了！', 'combo');
            const gold = G.u.rnd(50, 150);
            G.gainGold(gold);
            for (const e of B.enemies.filter(x => x.alive)) await this.dealDamage(u, e, { type: 'phys', pow: 1.4 });
          }
        },
      ];
      const show = G.u.pick(shows);
      this.log(`🎬 ${u.name} 发动整活时间：<b>${show.name}</b>！`);
      await show.run.call(this);
      this.renderAll();
      await sleep(600);
    },

    /* ============ 敌人回合 ============ */
    async enemyTurn(e) {
      const B = this.B;
      if (!e.alive) return;
      if (this.hasEff(e, 'status', 'sleep')) { this.log(`💤 ${e.name} 在摸鱼……`); return; }
      if (this.hasEff(e, 'status', 'para') && G.u.chance(0.5)) { this.log(`⚡ ${e.name} 无法行动！`); return; }
      if (this.hasEff(e, 'status', 'conf') && G.u.chance(0.4)) {
        const tgt = G.u.pick([...B.enemies.filter(x => x.alive), ...B.allies.filter(x => x.alive)]);
        this.log(`💫 ${e.name} 混乱了，打到了 ${tgt.name}！`);
        await sleep(400);
        await this.dealDamage(e, tgt, { type: 'phys', pow: 0.9 });
        return;
      }
      // 嘲讽：优先攻击嘲讽者
      const taunter = B.allies.find(a => a.alive && this.hasEff(a, 'taunt'));
      // 选择技能
      let skill = null;
      const ai = e.def;
      if (ai.copyLast && B.lastAllySkill && G.u.chance(0.45)) {
        skill = { ...B.lastAllySkill, name: '乱回·' + B.lastAllySkill.name };
        await this.banner(`🃏 ${e.name}「已读乱回！」把你的招式学走了！`, 'halluc');
      } else if (ai.skills && ai.skills.length) {
        // 特殊条件技能
        const usable = ai.skills.filter(s2 => {
          const sk = G.data.skills[s2.id];
          if (!sk) return false;
          if ((s2.id === 'e_healself' || s2.id === 'e_snowheal' || s2.id === 'e_late') && e.hp > e.maxHp * 0.6) return false;
          if ((s2.id === 'e_996' || s2.id === 'e_howl' || s2.id === 'e_jinli' || s2.id === 'e_firewall') && this.hasEff(e, 'buff') && G.u.chance(0.7)) return false;
          return true;
        });
        if (usable.length) {
          const total = usable.reduce((x, s2) => x + s2.w, 0);
          let roll = G.u.rf(0, total);
          for (const s2 of usable) { roll -= s2.w; if (roll <= 0) { skill = G.data.skills[s2.id]; break; } }
        }
      }
      const el = document.querySelector(`[data-unit="enemy${B_enKey(e)}"]`);
      if (el) { el.classList.add('attacking'); setTimeout(() => el.classList.remove('attacking'), 400); }
      await sleep(350);
      // 卡车君预告
      if (ai.telegraph === 'truck' && skill && skill.id === 'e_truckhit') {
        await this.banner('💡 远光灯闪烁！它要冲过来了——快防御！', 'warn');
        await sleep(600);
      }
      if (!skill) {
        const tgt = taunter || G.u.pick(B.allies.filter(x => x.alive));
        if (!tgt) return;
        this.log(`${e.name} 发起了攻击！`);
        await this.dealDamage(e, tgt, { type: 'phys', pow: 1.0 });
      } else {
        this.log(`${e.emoji} ${e.name} 使用了 <b>${skill.name}</b>！`);
        const targets = await this.resolveTargets(e, skill);
        for (const tgt of targets) {
          if (!tgt.alive && skill.type !== 'heal' && skill.type !== 'special' && skill.type !== 'buff') continue;
          if (skill.type === 'phys' || skill.type === 'mag') {
            const hits = typeof skill.hits === 'number' ? skill.hits : 1;
            for (let i = 0; i < hits; i++) {
              let real = tgt;
              if (skill.target === 'randomEnemies') {
                const pool = B.allies.filter(x => x.alive);
                if (!pool.length) break;
                real = G.u.pick(pool);
              }
              if (!real.alive) break;
              await this.dealDamage(e, real, skill);
              await sleep(150);
            }
            if (skill.effect && skill.effect.status && tgt.alive && G.u.chance(skill.effect.chance)) {
              this.applyStatus(tgt, skill.effect.status, skill.effect.turns);
            }
          } else if (skill.type === 'heal') {
            await this.healUnit(e, e, Math.round(e.maxHp * (skill.healPctSelf || 0.2)));
          } else if (skill.type === 'buff' || skill.type === 'special') {
            const eff = skill.effect || {};
            if (eff.buff) this.applyBuff(e, eff.buff, eff.turns, skill.name);
            if (eff.guard) { e.effects.push({ k: 'guard', val: eff.guard, turns: eff.turns }); this.log(`🧱 ${e.name} 张开了防护！`); }
            if (eff.evade) { e.effects.push({ k: 'evade', val: eff.evade, turns: eff.turns }); }
            if (eff.clone) await this.tryClone(e);
            if (eff.status) {
              const list = skill.target === 'allEnemies' ? B.allies.filter(x => x.alive) : [tgt];
              for (const t of list) if (G.u.chance(eff.chance)) this.applyStatus(t, eff.status, eff.turns);
            }
          } else if (skill.type === 'debuff') {
            for (const t of targets) if (G.u.chance(skill.effect.chance)) this.applyStatus(t, skill.effect.status, skill.effect.turns);
          }
          await sleep(120);
        }
      }
      // Boss 台词触发
      await this.checkTaunt(e);
      // 分身触发
      if (ai.cloneOn && !e.cloned && e.alive && e.hp / e.maxHp < ai.cloneOn) await this.tryClone(e);
      // 逃跑触发（星期四鸡）
      if (ai.fleeAt && e.alive && e.hp / e.maxHp < ai.fleeAt) {
        await this.banner('🍗 「咯咯哒——下次再战！」', 'warn');
        e.alive = false; e.fled = true;
        this.log('战斗鸡逃走了！掉落了它珍藏的疯狂星期四券！');
        G.gainItem('i_v50', 1);
        this.renderAll();
        await sleep(800);
      }
      this.renderAll();
      await sleep(400);
    },

    async tryClone(e) {
      const B = this.B;
      if (B.enemies.length >= 4 || e.cloned) return;
      e.cloned = true;
      const clone = this.makeEnemy(e.key + '_clone', { ...e.def, name: e.name + '·复印件', hp: Math.round(e.maxHp * 0.45) });
      clone.hp = Math.round(e.maxHp * 0.45);
      clone.maxHp = Math.round(e.maxHp * 0.45);
      B.enemies.push(clone);
      await this.banner('👥 ' + (e.key.includes('printer') ? '「正在复印……请取件。」' : '「分身！都是真的！」'), 'warn');
      this.renderAll();
      await sleep(500);
    },

    async checkTaunt(e) {
      if (!e.def || !e.def.lines || !e.def.lines.taunt) return;
      const frac = e.hp / e.maxHp;
      for (const t of e.def.lines.taunt) {
        if (frac < t.hp && !e.taunted[t.hp]) {
          e.taunted[t.hp] = true;
          await this.banner(`${e.emoji} ${esc(t.text)}`, 'taunt');
          if (t.buff === 'atk') { e.stats.atk *= 1.12; this.popup(e, 'ATK UP', 'buff'); }
          await sleep(300);
        }
      }
    },

    /* ============ 回合结束：状态结算 ============ */
    async endOfUnit(u) {
      if (!u.alive) return;
      const B = this.B;
      // 中毒/灼烧
      if (this.hasEff(u, 'status', 'poison')) {
        const d = Math.max(3, Math.round(u.maxHp * 0.06));
        u.hp -= d; this.popup(u, `-${d}☠`, 'dmg');
        if (u.hp <= 0) { u.hp = 0; u.alive = false; this.log(`💀 ${u.name} 被毒素击倒了……`); }
      }
      if (this.hasEff(u, 'status', 'burn')) {
        const d = Math.max(5, Math.round(u.maxHp * 0.05));
        u.hp -= d; this.popup(u, `-${d}🔥`, 'dmg');
        if (u.hp <= 0) { u.hp = 0; u.alive = false; }
      }
      // 保温杯回蓝
      if (u.isAlly && u.mref.acc && G.data.items[u.mref.acc].mpRegen) {
        u.mp = Math.min(u.maxMp, u.mp + G.data.items[u.mref.acc].mpRegen);
      }
      // 效果回合递减
      u.effects = u.effects.map(e => ({ ...e, turns: e.turns != null ? e.turns - 1 : undefined }))
        .filter(e => e.k === 'reviveGuard' || e.turns === undefined || e.turns > 0);
      this.renderAll();
      this.checkEnd();
      await sleep(200);
    },

    /* ============ 胜利结算 ============ */
    async victory() {
      const B = this.B;
      G.audio.stopBgm();
      G.audio.sfx('victory');
      G.audio.bgm('victory');
      let exp = 0, gold = 0;
      const drops = [];
      for (const e of B.enemies) {
        if (e.fled) continue;
        if (B.opts && B.opts.noReward) continue;
        const d = e.def || G.data.enemies[e.key.replace('_clone', '')];
        if (!d) continue;
        exp += d.exp || 0;
        gold += d.gold || 0;
        if (d.drops) for (const dr of d.drops) if (G.u.chance(dr.p)) drops.push(dr.id);
      }
      // 金币加成装备
      for (const a of B.allies) if (a.mref.acc && G.data.items[a.mref.acc].goldPlus) gold = Math.round(gold * (1 + G.data.items[a.mref.acc].goldPlus));
      G.count('kills', B.enemies.filter(e => !e.fled).length);
      if (G.world && G.world.progressHunts) G.world.progressHunts(B.enemies.filter(e => !e.fled).map(e => e.key.replace('_clone', '')));
      await this.banner('🎉 <b>VICTORY!</b>', 'win');
      await sleep(800);
      let msg = `<div class="victory-box">🎉 <b>战斗胜利！</b><br><br>✨ 经验 +${exp}　💰 金币 +${gold}`;
      if (drops.length) {
        msg += `<br><br>掉落物：`;
        for (const id of drops) {
          G.gainItem(id, 1);
          const it = G.data.items[id];
          msg += `<br>${it.emoji} ${esc(it.name)} ×1`;
        }
      }
      G.gainGold(gold);
      const ups = exp > 0 ? G.gainExp(exp) : [];
      if (ups.length) {
        msg += `<br><br>⬆️ <b>升级！</b>`;
        for (const up of ups) {
          const cls = G.data.classes[up.m.cls];
          msg += `<br>${cls.emoji} <b>${esc(up.m.cls === 'xiaoman' ? G.state.heroName : cls.name)}</b> → Lv.${up.m.level}`;
          for (const sk of up.newly) {
            const s2 = G.data.skills[sk];
            if (s2) msg += `<br>　✨ 学会新技能：<b>${s2.emoji} ${esc(s2.name)}</b>`;
          }
        }
      }
      msg += `</div>`;
      $('#battle-log').innerHTML = msg;
      const btn = document.createElement('button');
      btn.className = 'mini-btn big';
      btn.textContent = '继续 ▶';
      $('#battle-log').appendChild(btn);
      await new Promise(res => btn.onclick = () => { G.audio.sfx('ok'); res(); });
      if (G.state.members.xiaoman.level >= 20) G.addAch('lv20');
      if (G.state.members.xiaoman.level >= 40) G.addAch('lv40');
      if (G.state.gold >= 10000) G.addAch('rich');
      G.ui.refreshHud();
    },
  };

  /* ---------- helpers ---------- */
  const _keyMap = new Map();
  function B_enKey(u) {
    if (!_keyMap.has(u)) _keyMap.set(u, 'e' + Math.random().toString(36).slice(2, 8));
    return _keyMap.get(u);
  }
  function comboMain(c) { return c.members[0]; }
  function statusIcon(e) {
    if (e.k === 'status') return G.data.statusInfo[e.s] ? `<span title="${G.data.statusInfo[e.s].name}">${G.data.statusInfo[e.s].icon}</span>` : '';
    if (e.k === 'buff') return `<span class="buff-ico" title="${e.name}">⬆</span>`;
    if (e.k === 'shield') return '🛡️'; if (e.k === 'guard') return '🧱';
    if (e.k === 'counter') return '🔁'; if (e.k === 'taunt') return '🎯';
    if (e.k === 'evade') return '🐟'; if (e.k === 'reviveGuard') return '😤';
    return '';
  }
  function B_critStreak() {
    const B = G.battle.B;
    if (!B) return;
    B.critStreak++;
    if (B.critStreak >= 3) G.addAch('crit3');
  }
})();
