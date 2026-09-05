'use strict';
/* ============================================================
 * 异世界小满物语 —— 引擎核心
 * 全局命名空间 G：工具 / 音频合成 / 存档 / 数值 / 事件提示
 * ============================================================ */
window.G = { ver: '1.0.0' };

/* ---------------- 工具 ---------------- */
G.u = {
  rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
  rf(a, b) { return Math.random() * (b - a) + a; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  chance(p) { return Math.random() < p; },
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  sleep(ms) { return new Promise(r => setTimeout(r, ms)); },
  clone(o) { return JSON.parse(JSON.stringify(o)); },
  fmtTime(sec) {
    sec = Math.floor(sec || 0);
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60);
    return h > 0 ? `${h}小时${m}分` : `${m}分${sec % 60}秒`;
  },
  midi(n) { return 440 * Math.pow(2, (n - 69) / 12); },
};

G.chapters = {};
G.register = function (id, ch) { G.chapters[id] = ch; };
G.data = {};   // data.js 填充
G.sides = {};  // side.js 填充：{ id: {scenes:{}, ...} }

/* ============================================================
 * 音频：WebAudio 芯片音合成（BGM 循环 + SFX），零外部资源
 * ============================================================ */
G.audio = {
  ctx: null, master: null, bgmGain: null, sfxGain: null,
  inited: false, pendingBgm: null, curBgm: null,
  _timers: [], _runId: 0,

  init() {
    if (this.inited) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.master);
      this.applyVolumes();
    } catch (e) { console.warn('音频初始化失败', e); }
    this.inited = true;
    if (this.pendingBgm) { const b = this.pendingBgm; this.pendingBgm = null; this.bgm(b); }
  },
  applyVolumes() {
    if (!this.inited || !this.ctx) return;
    const s = (G.state && G.state.settings) || { bgmVol: 0.5, sfxVol: 0.7 };
    this.bgmGain.gain.value = s.bgmVol;
    this.sfxGain.gain.value = s.sfxVol;
  },
  setMuted(m) {
    if (this.master) this.master.gain.value = m ? 0 : 0.6;
  },

  _tone(freq, dur, type, when, vol, dest) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(dest);
    o.start(when); o.stop(when + dur + 0.05);
    return o;
  },
  _noise(dur, when, vol) {
    const ctx = this.ctx;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(g); g.connect(this.sfxGain);
    src.start(when);
  },

  bgm(name) {
    if (!this.inited) { this.pendingBgm = name; return; }
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.curBgm === name) return;
    this.stopBgm();
    const track = G.bgmTracks[name];
    if (!track) return;
    this.curBgm = name;
    const runId = ++this._runId;
    const self = this;
    const beat = 60 / track.bpm;
    let loopCount = 0;
    const scheduleLoop = () => {
      if (runId !== self._runId) return;
      const t0 = self.ctx.currentTime + 0.08;
      const total = track.mel.reduce((s, n) => s + n[1], 0) * beat;
      let t = t0;
      for (const [note, b] of track.mel) {
        if (note > 0) self._tone(G.u.midi(note), b * beat * (track.melDecay || 0.92), track.wave || 'square', t, (track.vol || 0.16), self.bgmGain);
        t += b * beat;
      }
      t = t0;
      for (const [note, b] of track.bass) {
        if (note > 0) self._tone(G.u.midi(note), b * beat * 0.9, track.bassWave || 'triangle', t, (track.bassVol || 0.2), self.bgmGain);
        t += b * beat;
      }
      loopCount++;
      const id = setTimeout(scheduleLoop, Math.max(200, total * 1000 - 120));
      self._timers.push(id);
    };
    scheduleLoop();
  },
  stopBgm() {
    this._runId++;
    for (const id of this._timers) clearTimeout(id);
    this._timers = [];
    this.curBgm = null;
  },

  sfx(name) {
    if (!this.inited || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;
    const S = this.sfxGain;
    const seq = (arr, type, vol) => { let tt = t; for (const [f, d] of arr) { if (f > 0) this._tone(f, d, type, tt, vol, S); tt += d; } };
    switch (name) {
      case 'blip': seq([[660, 0.05]], 'square', 0.12); break;
      case 'ok': seq([[660, 0.06], [990, 0.08]], 'square', 0.14); break;
      case 'cancel': seq([[440, 0.06], [294, 0.09]], 'square', 0.12); break;
      case 'hit': this._noise(0.09, t, 0.3); this._tone(140, 0.09, 'square', t, 0.2, S); break;
      case 'crit': this._noise(0.12, t, 0.35); seq([[880, 0.05], [1174, 0.09]], 'square', 0.2); break;
      case 'heal': seq([[523, 0.08], [659, 0.08], [784, 0.12]], 'sine', 0.16); break;
      case 'level': seq([[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.25]], 'square', 0.18); break;
      case 'coin': seq([[988, 0.05], [1319, 0.12]], 'square', 0.16); break;
      case 'muyu': this._tone(880, 0.06, 'sine', t, 0.5, S); this._noise(0.03, t, 0.25); break;
      case 'bad': seq([[300, 0.12], [200, 0.14], [120, 0.2]], 'sawtooth', 0.16); break;
      case 'buff': seq([[440, 0.07], [554, 0.07], [659, 0.1]], 'triangle', 0.16); break;
      case 'die': seq([[392, 0.15], [311, 0.15], [233, 0.2], [155, 0.3]], 'sawtooth', 0.16); break;
      case 'flee': seq([[700, 0.05], [500, 0.05], [350, 0.08]], 'square', 0.12); break;
      case 'chest': seq([[659, 0.07], [988, 0.14]], 'triangle', 0.18); break;
      case 'gacha': seq([[523, 0.08], [659, 0.08], [784, 0.08], [1046, 0.2]], 'triangle', 0.18); break;
      case 'dex': seq([[1568, 0.07], [2093, 0.16]], 'sine', 0.2); break;
      case 'boss': seq([[110, 0.25], [110, 0.25], [87, 0.4]], 'sawtooth', 0.24); break;
      case 'kfc': seq([[784, 0.09], [659, 0.09], [880, 0.09], [1046, 0.22]], 'square', 0.18); break;
      case 'fish': seq([[659, 0.06], [880, 0.06], [659, 0.06], [1046, 0.18]], 'sine', 0.16); break;
      case 'down': seq([[392, 0.1], [330, 0.1], [262, 0.16]], 'triangle', 0.16); break;
    }
  },
};

/* ---------------- BGM 曲目（简易双轨循环） ---------------- */
G.bgmTracks = {
  title: {
    bpm: 96, wave: 'triangle', bassWave: 'square', vol: 0.16, bassVol: 0.1,
    mel: [[72, .5], [76, .5], [79, .5], [84, .5], [83, .5], [79, .5], [76, .5], [74, .5], [72, .5], [76, .5], [79, 1], [0, .5], [81, .5], [79, .5], [76, .5], [74, .5], [72, 1.5], [0, .5]],
    bass: [[48, 1], [0, .5], [48, .5], [43, 1], [45, 1], [41, 1], [0, .5], [43, .5], [48, 1], [45, 1], [43, 1], [48, 1]],
  },
  town: {
    bpm: 100, wave: 'square', bassWave: 'triangle', vol: 0.1, bassVol: 0.14,
    mel: [[65, .5], [69, .5], [72, .5], [69, .5], [77, .5], [76, .5], [72, .5], [69, .5], [67, .5], [72, .5], [76, .5], [74, .5], [72, 1], [0, 1], [65, .5], [69, .5], [72, .5], [76, .5], [77, 1], [76, .5], [72, .5], [69, 1.5], [0, .5]],
    bass: [[41, 1], [48, 1], [41, 1], [45, 1], [43, 1], [50, 1], [43, 1], [47, 1], [41, 1], [48, 1], [43, 1], [47, 1]],
  },
  field: {
    bpm: 120, wave: 'square', bassWave: 'triangle', vol: 0.09, bassVol: 0.13,
    mel: [[67, .5], [74, .5], [72, .5], [69, .5], [67, .5], [69, .5], [72, 1], [74, .5], [76, .5], [74, .5], [72, .5], [69, 1], [0, 1], [67, .5], [69, .5], [72, .5], [74, .5], [76, .5], [79, .5], [76, 1], [74, .5], [72, .5], [69, 1.5], [0, .5]],
    bass: [[43, .5], [43, .5], [50, .5], [43, .5], [45, .5], [45, .5], [52, .5], [45, .5], [41, .5], [41, .5], [48, .5], [41, .5], [43, .5], [43, .5], [50, .5], [43, .5], [43, .5], [43, .5], [50, .5], [43, .5], [45, .5], [45, .5], [52, .5], [45, .5]],
  },
  forest: {
    bpm: 92, wave: 'triangle', bassWave: 'sine', vol: 0.15, bassVol: 0.14, melDecay: 1.4,
    mel: [[64, .75], [67, .25], [71, .5], [72, .5], [71, .5], [67, .5], [64, 1], [0, .5], [62, .75], [64, .25], [69, .5], [71, .5], [69, .5], [64, .5], [62, 1.5], [0, .5]],
    bass: [[40, 1], [47, 1], [45, 1], [43, 1], [38, 1], [45, 1], [43, 1], [40, 1]],
  },
  battle: {
    bpm: 148, wave: 'square', bassWave: 'sawtooth', vol: 0.09, bassVol: 0.11,
    mel: [[69, .25], [69, .25], [72, .25], [76, .25], [79, .5], [76, .25], [72, .25], [74, .5], [72, .25], [69, .25], [67, .25], [69, .25], [72, .5], [0, .5], [69, .25], [69, .25], [72, .25], [76, .25], [81, .5], [79, .25], [76, .25], [74, .5], [76, .25], [74, .25], [72, .25], [69, .25], [68, .75], [0, .25]],
    bass: [[45, .25], [45, .25], [52, .25], [45, .25], [45, .25], [45, .25], [52, .25], [45, .25], [41, .25], [41, .25], [48, .25], [41, .25], [43, .25], [43, .25], [50, .25], [43, .25], [45, .25], [45, .25], [52, .25], [45, .25], [45, .25], [45, .25], [52, .25], [45, .25], [41, .25], [41, .25], [48, .25], [41, .25], [43, .25], [43, .25], [50, .25], [43, .25]],
  },
  boss: {
    bpm: 156, wave: 'sawtooth', bassWave: 'square', vol: 0.08, bassVol: 0.13,
    mel: [[62, .25], [62, .25], [65, .25], [68, .25], [74, .5], [68, .25], [65, .25], [62, .5], [61, .5], [62, .25], [62, .25], [65, .25], [68, .25], [73, .5], [74, .5], [68, .5], [65, .5], [61, .5], [62, .75], [0, .25]],
    bass: [[38, .25], [38, .25], [45, .25], [38, .25], [38, .25], [38, .25], [45, .25], [38, .25], [36, .25], [36, .25], [43, .25], [36, .25], [34, .25], [34, .25], [41, .25], [34, .25], [38, .25], [38, .25], [45, .25], [38, .25], [38, .25], [38, .25], [45, .25], [38, .25], [36, .25], [36, .25], [43, .25], [36, .25], [34, .25], [34, .25], [41, .25], [34, .25]],
  },
  sad: {
    bpm: 66, wave: 'triangle', bassWave: 'sine', vol: 0.16, bassVol: 0.12, melDecay: 1.6,
    mel: [[69, 1], [67, .5], [64, .5], [65, 1.5], [0, .5], [60, 1], [64, .5], [65, .5], [69, 2], [0, 1]],
    bass: [[45, 2], [41, 2], [43, 2], [40, 2]],
  },
  sky: {
    bpm: 112, wave: 'triangle', bassWave: 'sine', vol: 0.15, bassVol: 0.1, melDecay: 1.2,
    mel: [[77, .5], [81, .5], [84, 1], [83, .5], [79, .5], [77, 1], [76, .5], [79, .5], [84, 1], [81, .5], [77, .5], [79, 2], [0, .5]],
    bass: [[53, 1], [60, 1], [55, 1], [62, 1], [57, 1], [64, 1], [53, 1], [60, 1]],
  },
  office: {
    bpm: 104, wave: 'square', bassWave: 'triangle', vol: 0.1, bassVol: 0.12,
    mel: [[63, .5], [63, .5], [70, .5], [68, .5], [63, .5], [63, .5], [70, .5], [75, .5], [73, .5], [70, .5], [68, .5], [70, 1], [63, .5], [63, .5], [70, .5], [68, .5], [61, .5], [63, .5], [68, .5], [70, .5], [63, 1.5], [0, .5]],
    bass: [[51, .5], [51, .5], [51, .5], [51, .5], [49, .5], [49, .5], [49, .5], [49, .5], [46, .5], [46, .5], [46, .5], [46, .5], [51, .5], [51, .5], [51, .5], [51, .5]],
  },
  final: {
    bpm: 138, wave: 'sawtooth', bassWave: 'square', vol: 0.09, bassVol: 0.12,
    mel: [[64, .5], [67, .5], [71, .5], [76, .5], [74, 1], [71, .5], [67, .5], [69, 1], [71, .5], [69, .5], [67, 1], [64, .5], [67, .5], [71, .5], [79, .5], [78, 1.5], [0, .5]],
    bass: [[40, .5], [40, .5], [47, .5], [40, .5], [45, .5], [45, .5], [52, .5], [45, .5], [41, .5], [41, .5], [48, .5], [41, .5], [40, .5], [40, .5], [47, .5], [40, .5]],
  },
  victory: {
    bpm: 130, wave: 'square', bassWave: 'triangle', vol: 0.15, bassVol: 0.14,
    mel: [[72, .25], [72, .25], [72, .25], [72, .75], [69, .5], [72, .5], [77, 1.5], [0, .5], [74, .5], [76, .5], [77, .5], [79, .5], [84, 1.5]],
    bass: [[48, .5], [48, .5], [48, .5], [48, .5], [45, 1], [48, 1], [43, 1], [48, 1.5]],
  },
  inn: {
    bpm: 84, wave: 'triangle', bassWave: 'sine', vol: 0.14, bassVol: 0.1, melDecay: 1.3,
    mel: [[64, 1], [67, .5], [71, .5], [72, 1.5], [0, .5], [74, .5], [72, .5], [71, .5], [67, .5], [64, 2], [0, 1]],
    bass: [[52, 2], [50, 2], [45, 2], [52, 2]],
  },
  dungeon: {
    bpm: 100, wave: 'triangle', bassWave: 'square', vol: 0.12, bassVol: 0.1,
    mel: [[57, .5], [60, .5], [64, .5], [63, .5], [60, .5], [57, .5], [55, 1], [0, .5], [57, .5], [60, .5], [65, .5], [64, .5], [60, .5], [57, .5], [56, 1.5], [0, .5]],
    bass: [[33, 1], [40, 1], [33, 1], [38, 1], [31, 1], [38, 1], [33, 1], [40, 1]],
  },
};

/* ============================================================
 * 状态 & 存档
 * ============================================================ */
G.SAVE_VER = 3;
G.SAVE_KEY = i => `gxm_save_${i}`;
G.CFG_KEY = 'gxm_cfg';

G.defaultState = function () {
  return {
    ver: G.SAVE_VER,
    createdAt: Date.now(), savedAt: Date.now(), playSec: 0,
    heroName: '小满',
    gold: 80, gongde: 0, shards: 0, shardLog: [],
    chapter: 'ch0', scene: 'ch0_1',
    checkpoint: { chapter: 'ch0', scene: 'ch0_1' },
    party: [],           // 队伍成员 id 列表
    members: {},         // id -> 成员运行时数据
    inv: {}, equipBag: {},   // 消耗品/杂物，装备
    flags: {},
    quests: {},
    memes: {}, ach: {},
    affinity: { youzi: 0, dundun: 0, qianji: 0, yase: 0 },
    karma: 0,
    unlockedLocs: ['home_office'],
    settings: { textSpeed: 24, bgmVol: 0.5, sfxVol: 0.7, scanlines: true, autoText: false },
    counters: { kills: 0, deaths: 0, muyu: 0, flee: 0, v50: 0, gacha: 0, fish: 0, rpsWin: 0, bossKills: 0, healPot: 0, happyWater: 0, pet: 0, choiceKarma: 0 },
    postGame: false, endingGot: null,
  };
};

/* ---------- 成员数值 ---------- */
G.newMember = function (clsId, lv) {
  const cls = G.data.classes[clsId];
  const m = {
    id: cls.id, cls: cls.id, level: lv || 1, exp: 0,
    hp: 1, mp: 1, hpBoost: 0,
    weapon: null, armor: null, acc: null,
    skills: [], lezi: 0,
  };
  m.skills = cls.skills.filter(s => s.lv <= m.level).map(s => s.id);
  const st = G.calcStats(m);
  m.hp = st.maxHp; m.mp = st.maxMp;
  return m;
};

G.calcStats = function (m) {
  const cls = G.data.classes[m.cls];
  const L = m.level - 1;
  const st = {
    maxHp: cls.base.hp + cls.grow.hp * L + (m.hpBoost || 0),
    maxMp: cls.base.mp + cls.grow.mp * L,
    atk: cls.base.atk + cls.grow.atk * L,
    def: cls.base.def + cls.grow.def * L,
    mag: cls.base.mag + cls.grow.mag * L,
    res: cls.base.res + cls.grow.res * L,
    spd: cls.base.spd + cls.grow.spd * L,
    luk: cls.base.luk + (cls.grow.luk || 0) * L,
  };
  for (const slot of ['weapon', 'armor', 'acc']) {
    const it = m[slot] && G.data.items[m[slot]];
    if (it) {
      for (const k of ['maxHp', 'maxMp', 'atk', 'def', 'mag', 'res', 'spd', 'luk']) {
        if (it[k]) st[k] += it[k];
      }
    }
  }
  return st;
};

G.expNext = lv => Math.floor(26 * Math.pow(lv, 1.6));

/* ---------- 资源操作 ---------- */
G.gainGold = function (n) {
  G.state.gold = Math.max(0, G.state.gold + n);
  if (n > 0) G.audio.sfx('coin');
  G.ui && G.ui.refreshHud();
};
G.gainGongde = function (n) {
  G.state.gongde = Math.max(0, G.state.gongde + n);
  G.ui && G.ui.refreshHud();
};
G.gainItem = function (id, n) {
  n = n == null ? 1 : n;
  const inv = G.data.items[id] && G.data.items[id].type === 'equip' ? G.state.equipBag : G.state.inv;
  inv[id] = (inv[id] || 0) + n;
  if (inv[id] <= 0) delete inv[id];
};
G.hasItem = (id, n) => (G.state.inv[id] || 0) >= (n || 1) || (G.state.equipBag[id] || 0) >= (n || 1);
G.loseItem = function (id, n) {
  n = n == null ? 1 : n;
  if (G.state.inv[id]) G.gainItem(id, -n);
  else if (G.state.equipBag[id]) G.gainItem(id, -n);
};
G.gainExp = function (n) {
  const ups = [];
  for (const id of G.state.party) {
    const m = G.state.members[id];
    if (!m) continue;
    m.exp += n;
    while (m.exp >= G.expNext(m.level) && m.level < 60) {
      m.exp -= G.expNext(m.level);
      m.level++;
      const cls = G.data.classes[m.cls];
      const newly = cls.skills.filter(s => s.lv === m.level).map(s => s.id);
      for (const sk of newly) if (!m.skills.includes(sk)) m.skills.push(sk);
      const st = G.calcStats(m);
      m.hp = st.maxHp; m.mp = st.maxMp;
      ups.push({ m, newly });
    }
  }
  return ups;
};
G.shard = function (from) {
  G.state.shards++;
  G.state.shardLog.push(from || '???');
  G.audio.sfx('chest');
  G.ui && G.ui.toast(`🧩 获得梗之碎片！（${G.state.shards}/7）`, 'good');
};
G.addMeme = function (id) {
  if (!id || G.state.memes[id]) return;
  const e = G.memes.find(m => m.id === id);
  if (!e) return;
  G.state.memes[id] = true;
  G.audio.sfx('dex');
  G.ui && G.ui.toast(`📖 梗图鉴收录【${e.name}】！`, 'dex');
  if (Object.keys(G.state.memes).length >= G.memes.length) { G.addAch('meme_all'); G.state.flags.meme_all_done = true; }
  if (Object.keys(G.state.memes).length >= 30) G.addAch('meme_30');
};
G.addAch = function (id) {
  if (!id || G.state.ach[id]) return;
  const a = G.data.ach[id];
  if (!a) return;
  G.state.ach[id] = Date.now();
  G.audio.sfx('level');
  G.ui && G.ui.toast(`🏆 成就达成【${a.name}】`, 'ach');
};
G.quest = function (id, state) {
  const q = (G.sides.quests || []).find(x => x.id === id);
  if (!G.state.quests[id]) G.state.quests[id] = { s: 'active' };
  if (state) G.state.quests[id].s = state;
  if (state === 'done') { G.audio.sfx('ok'); G.ui && G.ui.toast(`✅ 委托完成【${q ? q.name : id}】`, 'good'); }
  else if (state === 'fail') { G.state.quests[id].s = 'fail'; G.ui && G.ui.toast(`❌ 委托失败【${q ? q.name : id}】`, 'bad'); }
  else G.ui && G.ui.toast(`📜 接受委托【${q ? q.name : id}】`, 'good');
};
G.aff = function (who, d) {
  if (!(who in G.state.affinity)) return;
  G.state.affinity[who] = G.u.clamp(G.state.affinity[who] + d, 0, 10);
  if (d > 0) {
    const names = { youzi: '柚子', dundun: '吨吨', qianji: '千机', yase: '老亚瑟' };
    G.ui && G.ui.toast(`💗 ${names[who]}的好感度提升了`, 'aff');
  }
};
G.karma = function (d) { G.state.karma += d; };

/* ---------- 存档 ---------- */
G.saveGame = function (slot, silent) {
  const s = G.state;
  s.savedAt = Date.now();
  try {
    localStorage.setItem(G.SAVE_KEY(slot), JSON.stringify(s));
    if (!silent) G.ui && G.ui.toast(slot === 0 ? '💾 已自动存档' : `💾 已保存到存档栏 ${slot}`, 'good');
  } catch (e) {
    G.ui && G.ui.toast('存档失败：浏览器存储不可用', 'bad');
  }
};
G.loadGame = function (slot) {
  const raw = localStorage.getItem(G.SAVE_KEY(slot));
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (s.ver !== G.SAVE_VER) {
      // 简易迁移：版本不符时仍尝试读取关键字段
      s.ver = G.SAVE_VER;
    }
    G.state = s;
    return s;
  } catch (e) { return null; }
};
G.listSaves = function () {
  const out = [];
  for (let i = 0; i <= 3; i++) {
    const raw = localStorage.getItem(G.SAVE_KEY(i));
    if (!raw) { out.push(null); continue; }
    try {
      const s = JSON.parse(raw);
      out.push({
        slot: i, name: s.heroName, chapter: (G.chapters[s.chapter] || {}).title || s.chapter,
        level: s.members && s.party[0] ? s.members[s.party[0]].level : '?',
        playSec: s.playSec, savedAt: s.savedAt, shards: s.shards, endingGot: s.endingGot || null,
      });
    } catch (e) { out.push(null); }
  }
  return out;
};
G.exportSave = function () {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(G.state)))); } catch (e) { return ''; }
};
G.importSave = function (code) {
  try {
    const s = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!s || !s.members) throw new Error('bad');
    s.ver = G.SAVE_VER;
    G.state = s;
    G.saveGame(0, true);
    return true;
  } catch (e) { return false; }
};

/* ---------- 全局计数成就钩子 ---------- */
G.count = function (key, n) {
  if (!G.state.counters) G.state.counters = {};
  G.state.counters[key] = (G.state.counters[key] || 0) + (n == null ? 1 : n);
  const c = G.state.counters;
  // 成就检查
  if (c.kills >= 100) G.addAch('kill_100');
  if (c.deaths >= 1) G.addAch('first_die');
  if (c.deaths >= 10) G.addAch('die_10');
  if (c.muyu >= 10) G.addAch('muyu_10');
  if (c.muyu >= 100) G.addAch('muyu_100');
  if (c.muyu >= 1000) G.addAch('muyu_1000');
  if (c.flee >= 10) G.addAch('flee_10');
  if (c.v50 >= 1) G.addAch('v50');
  if (c.gacha >= 30) G.addAch('gacha_30');
  if (c.fish >= 10) G.addAch('fish_10');
  if (c.rpsWin >= 5) G.addAch('rps_5');
  if (c.bossKills >= 10) G.addAch('boss_10');
  if (c.healPot >= 30) G.addAch('pot_30');
  if (c.happyWater >= 10) G.addAch('cola_10');
  if (c.pet >= 10) G.addAch('cat_pet');
};
