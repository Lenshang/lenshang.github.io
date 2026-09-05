'use strict';
/* ============================================================
 * 启动入口：标题画面 / 新游戏 / 继续游戏 / 计时器
 * ============================================================ */
(() => {
  const G_main = G.main = {
    toTitle() {
      G.audio.stopBgm();
      G.audio.bgm('title');
      G.ui.show('screen-title');
      const el = document.querySelector('#screen-title');
      const saves = G.listSaves();
      const hasSave = saves.some(s => s);
      el.innerHTML = `
        <div class="title-bg">
          <div class="title-float">🎮</div><div class="title-float f2">🍗</div>
          <div class="title-float f3">🐱</div><div class="title-float f4">🥁</div>
          <div class="title-float f5">📚</div><div class="title-float f6">🚚</div>
          <div class="title-float f7">🐹</div><div class="title-float f8">🧩</div>
        </div>
        <div class="title-box">
          <div class="title-sub">～社畜少女与梗之力～</div>
          <h1 class="title-main">异世界小满物语</h1>
          <div class="title- en"></div>
          <div class="title-menu">
            <button class="title-btn main" id="t-new">✨ 开始新游戏</button>
            <button class="title-btn" id="t-continue" ${hasSave ? '' : 'disabled'}>📖 继续游戏</button>
            <button class="title-btn" id="t-about">ℹ️ 关于本作</button>
          </div>
          <div class="title-tip dim">鼠标点击操作 · Enter推进对话 · Esc菜单 · M静音</div>
          <div class="title-ver dim">v1.0 · 一个关于「到点下班」的故事</div>
        </div>`;
      el.querySelector('#t-new').onclick = () => { G.audio.init(); G.audio.sfx('ok'); this.newGame(); };
      el.querySelector('#t-continue').onclick = () => { G.audio.init(); G.audio.sfx('ok'); this.continueGame(); };
      el.querySelector('#t-about').onclick = () => { G.audio.init(); G.audio.sfx('blip'); this.about(); };
    },

    about() {
      const el = document.querySelector('#screen-title');
      const box = document.createElement('div');
      box.className = 'about-box';
      box.innerHTML = `
        <h2>ℹ️ 关于《异世界小满物语》</h2>
        <p>社畜游戏策划林小满在加班的深夜被卡车君送到了「梗力」驱动的艾梗大陆。<br>
        魔王散播班味，四天王卷饼互怼，摸鱼女神躺平三百年——<br>
        而你要做的，是把所有人，都捞下班。</p>
        <p>🎮 纯前端实现，无需安装，进度保存在浏览器里<br>
        ⏱️ 主线流程 3 小时以上，支线、收集、隐藏Boss再加 2 小时<br>
        📖 内置 130 条梗图鉴，等你全部收录</p>
        <p class="dim">攻略提示：多和伙伴聊天选择贴心选项，隐藏结局需要羁绊与碎片。</p>
        <button class="mini-btn" id="about-x">返回</button>`;
      el.appendChild(box);
      box.querySelector('#about-x').onclick = () => { box.remove(); G.audio.sfx('cancel'); };
    },

    newGame() {
      G.state = G.defaultState();
      // 主角入队
      G.state.members.xiaoman = G.newMember('xiaoman', 1);
      G.state.party = ['xiaoman'];
      G.saveGame(0, true);
      G.ui.show('screen-game');
      G.ui.refreshHud();
      G.audio.bgm('office');
      G.ui.playScene('ch0:start');
    },

    continueGame() {
      const el = document.querySelector('#screen-title');
      const old = el.querySelector('.slot-box');
      if (old) old.remove();
      const saves = G.listSaves();
      const box = document.createElement('div');
      box.className = 'slot-box';
      box.innerHTML = `<h3>📖 选择存档</h3>` + saves.map((sv, i) => {
        if (!sv) return `<div class="save-slot empty">📁 ${i === 0 ? '自动存档' : '栏位' + i}：<span class="dim">空</span></div>`;
        return `<div class="save-slot" data-slot="${i}">
          <div>${i === 0 ? '💾 自动存档' : '📁 栏位' + i}：<b>${sv.name}</b> Lv.${sv.level}<br>
          <span class="dim">${sv.chapter} · 游玩 ${G.u.fmtTime(sv.playSec)} · 🧩${sv.shards}/7${sv.endingGot ? ' · 已通关' : ''}</span></div>
        </div>`;
      }).join('') + `<button class="mini-btn" id="slot-x">返回</button>`;
      el.appendChild(box);
      box.querySelectorAll('[data-slot]').forEach(d => d.onclick = () => {
        const s = G.loadGame(parseInt(d.dataset.slot));
        if (!s) return;
        G.audio.sfx('ok');
        G.audio.applyVolumes();
        G.ui.show('screen-game');
        G.ui.refreshHud();
        G.world.openMap();
      });
      box.querySelector('#slot-x').onclick = () => { box.remove(); G.audio.sfx('cancel'); };
    },

    /* 游玩时长统计 */
    startTimer() {
      setInterval(() => {
        if (G.state && document.visibilityState === 'visible') {
          G.state.playSec++;
          if (G.state.playSec >= 3 * 3600) G.addAch('play_3h');
        }
      }, 1000);
      // 自动存档：每60秒
      setInterval(() => {
        if (G.state && !G.battle.B) G.saveGame(0, true);
      }, 60000);
    },
  };

  /* 首次交互时初始化音频（浏览器策略要求用户手势） */
  document.addEventListener('pointerdown', function once() {
    G.audio.init();
    document.removeEventListener('pointerdown', once);
  });

  /* 启动 */
  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.toggle('no-scan', false);
    G_main.startTimer();
    G.map.init();
    G_main.toTitle();
  });
})();
