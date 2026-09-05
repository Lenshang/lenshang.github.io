'use strict';
/* ============================================================
 * 游戏数据：职业 / 技能 / 物品 / 敌人 / 商店 / 成就 / 扭蛋
 * ============================================================ */
(() => {
  const D = G.data;

  /* ---------------- 元素克制 ---------------- */
  // 攻击属性 -> 受击属性的倍率
  D.elemChart = {
    fire: { water: 1.5 }, water: { fire: 1.5 },
    wind: { earth: 1.5 }, earth: { wind: 1.5 },
    light: { dark: 1.5 }, dark: { light: 1.5 },
    meme: {}, phys: {},
  };

  D.statusInfo = {
    poison: { icon: '☠️', name: '中毒' }, burn: { icon: '🔥', name: '灼烧' },
    chill: { icon: '❄️', name: '冰缓' }, para: { icon: '⚡', name: '麻痹' },
    conf: { icon: '💫', name: '混乱' }, sleep: { icon: '💤', name: '摸鱼' },
    ban: { icon: '😐', name: '班味' }, mute: { icon: '🔇', name: '封技' },
  };

  /* ---------------- 职业（伙伴） ---------------- */
  D.classes = {
    xiaoman: {
      id: 'xiaoman', name: '整活师', emoji: '👧', title: '穿越的社畜少女',
      desc: '前福报科技游戏策划。武器是机械键盘，连招是敲键盘，大招是到点下班。',
      base: { hp: 120, mp: 40, atk: 14, def: 10, mag: 16, res: 12, spd: 11, luk: 9 },
      grow: { hp: 16, mp: 7, atk: 2.6, def: 2.0, mag: 3.2, res: 2.3, spd: 1.4, luk: 0.8 },
      skills: [
        { lv: 2, id: 's_tui' }, { lv: 6, id: 's_wa' }, { lv: 9, id: 's_tingquan' },
        { lv: 13, id: 's_yidu' }, { lv: 17, id: 's_zundu' }, { lv: 21, id: 's_banqing' },
        { lv: 25, id: 's_kfc' }, { lv: 29, id: 's_nazale' }, { lv: 33, id: 's_xianyan' },
      ],
    },
    youzi: {
      id: 'youzi', name: '猫剑士', emoji: '🐱', title: '傲娇的猫娘剑士',
      desc: '柚子。嘴上说着"才不是为了你"，身体却很诚实地挡在前面。',
      base: { hp: 105, mp: 28, atk: 18, def: 9, mag: 6, res: 8, spd: 16, luk: 12 },
      grow: { hp: 13, mp: 4, atk: 3.6, def: 1.7, mag: 0.9, res: 1.5, spd: 2.2, luk: 1.1 },
      skills: [
        { lv: 1, id: 's_miaolian' }, { lv: 5, id: 's_naowa' }, { lv: 10, id: 's_tianxiang' },
        { lv: 14, id: 's_weiba' }, { lv: 18, id: 's_bohe' }, { lv: 23, id: 's_buganxin' },
        { lv: 27, id: 's_aojiao' }, { lv: 36, id: 's_galaxy' },
      ],
    },
    dundun: {
      id: 'dundun', name: '史莱姆', emoji: '🟢', title: '想当龙王的史莱姆',
      desc: '吨吨。梦想是成为龙王，现状是最弱的魔物。梦想和现状之间隔着一口锅。',
      base: { hp: 150, mp: 34, atk: 12, def: 15, mag: 8, res: 12, spd: 8, luk: 7 },
      grow: { hp: 22, mp: 5, atk: 2.0, def: 3.1, mag: 1.3, res: 2.2, spd: 0.9, luk: 0.6 },
      skills: [
        { lv: 1, id: 's_tan' }, { lv: 6, id: 's_nianye' }, { lv: 11, id: 's_zhao' },
        { lv: 16, id: 's_fenlie' }, { lv: 21, id: 's_zhexue' }, { lv: 26, id: 's_longpao' },
      ],
    },
    qianji: {
      id: 'qianji', name: '大模型', emoji: '📕', title: '会幻觉的AI魔书',
      desc: '千机。全知全能的古代AI，偶尔"服务器繁忙"。施法有概率幻觉成别的东西。',
      base: { hp: 95, mp: 60, atk: 7, def: 8, mag: 20, res: 15, spd: 12, luk: 8 },
      grow: { hp: 11, mp: 9, atk: 1.1, def: 1.5, mag: 4.0, res: 2.8, spd: 1.5, luk: 0.7 },
      skills: [
        { lv: 1, id: 's_shengcheng' }, { lv: 5, id: 's_200' }, { lv: 9, id: 's_404' },
        { lv: 13, id: 's_429' }, { lv: 17, id: 's_zhuyili' }, { lv: 21, id: 's_502' },
        { lv: 25, id: 's_shujuliu' }, { lv: 29, id: 's_huanjue' }, { lv: 33, id: 's_503' },
        { lv: 38, id: 's_agi' },
      ],
    },
    yase: {
      id: 'yase', name: '老登战士', emoji: '🧔', title: '膝盖中过箭的前勇者',
      desc: '老亚瑟。三十年前的勇者，现在的大叔。速度不快，但每一剑都是人生阅历。',
      base: { hp: 165, mp: 30, atk: 20, def: 17, mag: 6, res: 11, spd: 7, luk: 6 },
      grow: { hp: 24, mp: 4, atk: 3.8, def: 3.2, mag: 0.9, res: 2.1, spd: 0.8, luk: 0.5 },
      skills: [
        { lv: 1, id: 's_laodeng' }, { lv: 8, id: 's_huiyi' }, { lv: 13, id: 's_jingyan' },
        { lv: 18, id: 's_chongfeng' }, { lv: 24, id: 's_bazhen' }, { lv: 30, id: 's_naodeng' },
      ],
    },
  };

  /* ---------------- 合体技（羁绊技） ---------------- */
  D.combos = [
    {
      id: 'c_jianpanmiao', name: '键盘喵舞', emoji: '⌨️', members: ['xiaoman', 'youzi'], aff: 2, lezi: 30,
      type: 'phys', pow: 1.7, target: 'allEnemies', element: 'phys',
      desc: '小满弹键盘打节拍，柚子跟着节拍起舞砍人。伤害离谱但气势拉满。',
    },
    {
      id: 'c_cat_slime', name: '猫与史莱姆·上下夹击', emoji: '🐱', members: ['youzi', 'dundun'], aff: 2, lezi: 30,
      type: 'phys', pow: 1.4, hits: 2, target: 'oneEnemy', element: 'phys', stun: 0.5,
      desc: '吨吨把柚子弹上天，柚子从天而降。简单粗暴，物理超度。',
    },
    {
      id: 'c_cybermao', name: '赛博逗猫棒', emoji: '✨', members: ['qianji', 'youzi'], aff: 3, lezi: 35,
      type: 'special', target: 'allEnemies',
      desc: '千机全息投影出激光点，柚子暴走追击。敌方防御大降，柚子暴击率暴涨。',
    },
    {
      id: 'c_muyu', name: '电子木鱼·赛博超度', emoji: '🥁', members: ['dundun', 'qianji'], aff: 3, lezi: 40,
      type: 'mag', pow: 2.2, target: 'allEnemies', element: 'meme', cleanse: true,
      desc: '功德+1+1+1+1……木鱼声中超度一切班味。对班味系生物效果拔群。',
    },
    {
      id: 'c_kuadai', name: '跨代整活', emoji: '🤝', members: ['xiaoman', 'yase'], aff: 3, lezi: 35,
      type: 'special', target: 'party',
      desc: '三十年前的经验加上现在的梗，两代整活人联手。全队攻强化并回复三成生命。',
    },
    {
      id: 'c_kaibai', name: '疯狂星期四·全席开摆', emoji: '🍗', members: ['xiaoman', 'youzi', 'dundun', 'qianji', 'yase'], aff: 4, lezi: 100, needAll: true,
      type: 'special', target: 'party', revive: true,
      desc: '今天是疯狂星期四，V我50。全队完全回复，倒下的一人原地复活，乐子值回满。传说中的最终奥义。',
    },
  ];

  /* ---------------- 技能 ---------------- */
  D.skills = {
    // ===== 小满 =====
    s_tui: {
      name: '退退退', emoji: '🚫', cost: { mp: 8 }, type: 'mag', pow: 1.35, target: 'oneEnemy', element: 'meme', tag: 'meme',
      effect: { status: 'para', chance: 0.6, turns: 1 },
      desc: '大妈的祝福。用扇子指着敌人喝退，高概率使其这回合不敢动。', meme: 'tuijitui',
    },
    s_wa: {
      name: '挖呀挖', emoji: '⛏️', cost: { mp: 14 }, type: 'mag', pow: 1.15, target: 'allEnemies', element: 'earth', tag: 'meme',
      desc: '在小小的艾梗大陆挖呀挖呀挖。掘地三尺掀翻全体敌人。', meme: 'wayawa',
    },
    s_tingquan: {
      name: '听劝', emoji: '👂', cost: { mp: 12 }, type: 'buff', target: 'allAllies',
      effect: { buff: { def: 1.3, res: 1.3 }, turns: 3 },
      desc: '听劝！都听劝！全队防御提升。听人劝，吃饱饭。', meme: 'tingquan',
    },
    s_yidu: {
      name: '已读乱回', emoji: '💬', cost: { mp: 16 }, type: 'special', target: 'self',
      effect: { counter: 0.4, turns: 2 },
      desc: '进入乱回姿态：受到攻击时四成伤害反弹，并随机回复一句不相关的话。', meme: 'yiduluanhui',
    },
    s_zundu: {
      name: '尊嘟假嘟', emoji: '🎲', cost: { mp: 18 }, type: 'special', target: 'oneEnemy', tag: 'meme',
      desc: '是尊嘟还是假嘟？完全随机的大效果：可能是天崩地裂，可能是纯纯浪费。',
      meme: 'zundu',
    },
    s_banqing: {
      name: '班味清除术', emoji: '🐈', cost: { mp: 16 }, type: 'heal', pow: 1.4, target: 'ally', tag: 'meme',
      effect: { cure: ['ban', 'poison', 'sleep'] },
      desc: '播放猫猫视频，中和班味。回复生命并解除班味/中毒/摸鱼。', meme: 'banwei',
    },
    s_kfc: {
      name: '疯狂星期四', emoji: '🍗', cost: { mp: 26 }, type: 'heal', pow: 1.6, target: 'allAllies', tag: 'meme',
      effect: { buff: { atk: 1.25 }, turns: 3 },
      desc: 'V我50见证奇迹。全队回复生命并攻击上升。今天肯德基疯狂星期四，谁请我？', meme: 'fkuanghuan',
    },
    s_nazale: {
      name: '那咋了', emoji: '😎', cost: { mp: 14 }, type: 'special', target: 'self',
      effect: { guard: 1.0, turns: 2 },
      desc: '那咋了？摆出无所谓的表情，接下来两次伤害全部无效。心态是最好的护甲。', meme: 'nazale',
    },
    s_xianyan: {
      name: '显眼包', emoji: '🤡', cost: { mp: 12 }, type: 'special', target: 'self',
      effect: { taunt: true, buff: { def: 1.5, res: 1.5 }, turns: 2 },
      desc: '故意整活吸引全部火力，同时防御大幅提升。挨打，但优雅。', meme: 'xianyanbao',
    },
    s_xiaban: {
      name: '到点下班', emoji: '🕘', cost: { mp: 50 }, type: 'mag', pow: 3.2, target: 'allEnemies', element: 'meme', tag: 'meme', ultimate: true,
      effect: { strip: true, healAll: 1.0 },
      desc: '全员！强制下班！！对全体敌人造成巨大梗属性伤害，驱散其一切强化，全队完全回复。', meme: 'daoDian',
    },
    // ===== 柚子 =====
    s_miaolian: { name: '喵喵连打', emoji: '🐾', cost: { mp: 6 }, type: 'phys', pow: 0.75, hits: '2-3', target: 'oneEnemy', element: 'phys', desc: '快速挥出2~3段猫爪连击。' },
    s_naowa: { name: '挠痒痒', emoji: '😼', cost: { mp: 8 }, type: 'phys', pow: 0.95, target: 'oneEnemy', element: 'phys', effect: { status: 'atkDown', chance: 0.7, turns: 2 }, desc: '致命挠痒。降低敌人攻击力。' },
    s_tianxiang: { name: '猫之天翔', emoji: '🌙', cost: { mp: 14 }, type: 'phys', pow: 1.95, target: 'oneEnemy', element: 'phys', desc: '跃至月色高度俯冲突刺。单体重击。' },
    s_weiba: { name: '尾巴横扫', emoji: '🌀', cost: { mp: 14 }, type: 'phys', pow: 1.05, target: 'allEnemies', element: 'phys', desc: '用尾巴横扫全体。猫的尾巴不能碰，碰了就是这个下场。' },
    s_bohe: { name: '猫薄荷时间', emoji: '🌿', cost: { mp: 12 }, type: 'buff', target: 'self', effect: { buff: { spd: 1.6, crit: 2.0 }, turns: 3 }, desc: '闻一下猫薄荷，速度与暴击率暴涨。副作用是想打滚。' },
    s_buganxin: { name: '不甘心！', emoji: '😤', cost: { mp: 20 }, type: 'special', target: 'ally', effect: { reviveGuard: true }, desc: ' stubborn 火焰燃烧：目标获得一次"不甘心"——本战斗中第一次致命伤时以1点生命硬撑。' },
    s_aojiao: { name: '哼，才不是为了你', emoji: '😾', cost: { mp: 16 }, type: 'special', target: 'self', effect: { buff: { atk: 1.65 }, turns: 2, healPct: 0.25 }, desc: '别误会！只是刚好想变强而已！攻击大幅上升并回复两成半生命。' },
    s_galaxy: { name: '十万喵喵拳', emoji: '🌟', cost: { mp: 34 }, type: 'phys', pow: 2.6, hits: 3, target: 'randomEnemies', element: 'phys', ultimate: true, desc: '柚子奥义。以猫科动物之名的乱舞连击，随机打击敌人三次。' },
    // ===== 吨吨 =====
    s_tan: { name: '弹弹弹', emoji: '💧', cost: { mp: 6 }, type: 'phys', pow: 1.15, target: 'oneEnemy', element: 'phys', effect: { status: 'para', chance: 0.25, turns: 1 }, desc: '史莱姆弹射冲撞，小概率撞晕敌人。' },
    s_nianye: { name: '黏液陷阱', emoji: '💧', cost: { mp: 10 }, type: 'debuff', target: 'allEnemies', effect: { status: 'spdDown', chance: 0.85, turns: 3 }, desc: '地面全是黏液。全体敌人速度下降。' },
    s_zhao: { name: '吨吨防护罩', emoji: '🛡️', cost: { mp: 14 }, type: 'buff', target: 'allAllies', effect: { shield: 0.3, turns: 3 }, desc: '把大家裹进黏液里。三回合内受到伤害减免三成。' },
    s_fenlie: { name: '分裂愈身', emoji: '♻️', cost: { mp: 16 }, type: 'heal', target: 'self', healPctSelf: 0.45, desc: '分裂再合并，伤口就愈合了（原理不明）。回复自身四成半生命。' },
    s_zhexue: { name: '史莱姆哲学', emoji: '🤔', cost: { mp: 10 }, type: 'special', target: 'self', effect: { taunt: true, buff: { def: 1.6, res: 1.4 }, turns: 2 }, desc: '"我软，故我在。"嘲讽全体敌人，自身防御大幅提升。' },
    s_longpao: { name: '龙王的咆哮', emoji: '🐉', cost: { mp: 24 }, type: 'phys', pow: 1.55, target: 'allEnemies', element: 'phys', ultimate: true, ignoreDef: true, desc: '"吼——！"（很努力地模仿龙）。无视防御的全体冲击。音效很萌。' },
    // ===== 千机 =====
    s_shengcheng: {
      name: '生成·火球术', emoji: '🔥', cost: { mp: 8 }, type: 'mag', pow: 1.5, target: 'oneEnemy', element: 'fire', halluc: 0.25,
      desc: '标准输出。25%概率发生幻觉，生成别的东西（不保证是火球）。',
    },
    s_200: { name: '200·一切正常', emoji: '✅', cost: { mp: 10 }, type: 'heal', pow: 1.8, target: 'ally', desc: 'HTTP 200 OK。状态码治疗术，回复一名队友生命。' },
    s_404: { name: '404·页面未找到', emoji: '🔍', cost: { mp: 12 }, type: 'mag', pow: 1.25, target: 'oneEnemy', element: 'dark', strip: true, desc: '查无此敌人（的强化）。造成伤害并驱散敌人强化效果。' },
    s_429: { name: '429·请求过多', emoji: '📡', cost: { mp: 18 }, type: 'mag', pow: 0.85, hits: 3, target: 'randomEnemies', element: 'meme', tag: 'meme', desc: 'Too Many Requests。弹幕式三连随机魔法，请求量超限。', meme: 'http429' },
    s_zhuyili: { name: '注意力机制', emoji: '👁️', cost: { mp: 16 }, type: 'buff', target: 'allAllies', effect: { buff: { mag: 1.3, crit: 1.5 }, turns: 3 }, desc: '"Attention is all you need"。全队法强与暴击提升。' },
    s_502: { name: '502·网关错误', emoji: '🚧', cost: { mp: 14 }, type: 'special', target: 'allAllies', effect: { counter: 0.3, turns: 2 }, desc: 'Bad Gateway。全队架起错误页，反弹三成伤害两回合。' },
    s_shujuliu: { name: '数据洪流', emoji: '🌊', cost: { mp: 26 }, type: 'mag', pow: 1.7, target: 'allEnemies', element: 'dark', ultimate: true, desc: '倾泻训练数据。全体大威力魔法。' },
    s_huanjue: { name: '幻觉矫正', emoji: '🧹', cost: { mp: 14 }, type: 'special', target: 'allAllies', cureAll: ['poison', 'burn', 'chill', 'para', 'conf', 'sleep', 'ban', 'mute'], desc: '把幻觉都矫正掉。解除全队所有异常状态。' },
    s_503: { name: '503·服务不可用', emoji: '🛑', cost: { mp: 20 }, type: 'mag', pow: 1.1, target: 'oneEnemy', element: 'meme', tag: 'meme', effect: { status: 'para', chance: 0.75, turns: 1 }, desc: 'Service Unavailable。让敌人的服务器宕机，大概率停止运行一回合。', meme: 'http503' },
    s_agi: { name: '全参数激活', emoji: '🌌', cost: { mp: 44 }, type: 'mag', pow: 2.6, target: 'allEnemies', element: 'light', ultimate: true, effect: { buff: { mag: 1.3 }, turns: 3 }, desc: '千机真界。解放全部参数的创世咏唱，之后全队法强上升。她不再只是检索答案。' },
    // ===== 老亚瑟 =====
    s_laodeng: { name: '老登斩', emoji: '⚔️', cost: { mp: 8 }, type: 'phys', pow: 1.8, target: 'oneEnemy', element: 'phys', desc: '朴实无华的一刀。三十年功力全在里头。' },
    s_huiyi: { name: '回忆杀', emoji: '🎞️', cost: { mp: 12 }, type: 'buff', target: 'allAllies', lezi: 15, effect: { buff: { atk: 1.3 }, turns: 3 }, desc: '"想当年我讨伐魔王的时候……"怀旧加成，全队攻击上升，乐子值增加。' },
    s_jingyan: { name: '经验之谈', emoji: '📖', cost: { mp: 14 }, type: 'buff', target: 'allAllies', effect: { buff: { def: 1.3, res: 1.3 }, turns: 3 }, desc: '"我吃过的盐比你吃过的饭都多。"全队防御与法抗上升。' },
    s_chongfeng: { name: '最后的冲锋', emoji: '🐎', cost: { hp: 0.2 }, type: 'special', target: 'self', effect: { buff: { atk: 1.7, spd: 1.4 }, turns: 2 }, desc: '消耗两成生命点燃斗志。攻击与速度大幅上升两回合。老登爆发起来很可怕。' },
    s_bazhen: { name: '老登阵线', emoji: '🧱', cost: { mp: 16 }, type: 'special', target: 'allAllies', effect: { guard: 0.3, turns: 3 }, desc: '"站我后面。"三回合内全队受到伤害降低三成。' },
    s_naodeng: { name: '三十年前的那道光', emoji: '🌠', cost: { mp: 32 }, type: 'phys', pow: 2.4, target: 'allEnemies', element: 'light', ultimate: true, desc: '"我还没退休呢！"重现当年讨伐魔王的一击，全体大威力光属性斩击。' },

    /* ---------------- 敌人技能 ---------------- */
    e_bite: { name: '咬', emoji: '🦷', type: 'phys', pow: 1.0, target: 'oneEnemy', element: 'phys', enemyOnly: true },
    e_charge: { name: '冲撞', emoji: '💨', type: 'phys', pow: 1.3, target: 'oneEnemy', element: 'phys', enemyOnly: true },
    e_slam: { name: '重压', emoji: '🧱', type: 'phys', pow: 1.5, target: 'oneEnemy', element: 'phys', enemyOnly: true },
    e_poisonfog: { name: '毒雾', emoji: '🟣', type: 'special', target: 'allEnemies', effect: { status: 'poison', chance: 0.6, turns: 3 }, enemyOnly: true },
    e_spore: { name: '孢子喷射', emoji: '🍄', type: 'mag', pow: 1.0, target: 'oneEnemy', element: 'earth', effect: { status: 'sleep', chance: 0.35, turns: 2 }, enemyOnly: true },
    e_howl: { name: '嗷呜', emoji: '🐺', type: 'special', target: 'self', effect: { buff: { atk: 1.35 }, turns: 3 }, enemyOnly: true },
    e_root: { name: '根须缠绕', emoji: '🌿', type: 'special', target: 'oneEnemy', effect: { status: 'para', chance: 0.5, turns: 1 }, enemyOnly: true },
    e_sting: { name: '卷刺', emoji: '🐝', type: 'phys', pow: 1.1, target: 'oneEnemy', element: 'phys', effect: { status: 'ban', chance: 0.3, turns: 2 }, enemyOnly: true },
    e_drain: { name: '精神吸取', emoji: '🌫️', type: 'mag', pow: 1.0, target: 'oneEnemy', element: 'dark', effect: { status: 'ban', chance: 0.45, turns: 2 }, enemyOnly: true },
    e_silence: { name: '沉默术', emoji: '🔇', type: 'special', target: 'oneEnemy', effect: { status: 'mute', chance: 0.65, turns: 2 }, enemyOnly: true },
    e_punch: { name: '老六闷棍', emoji: '🥁', type: 'phys', pow: 1.4, target: 'oneEnemy', element: 'phys', effect: { status: 'conf', chance: 0.25, turns: 1 }, enemyOnly: true },
    e_confuse: { name: '杠精之言', emoji: '🦜', type: 'special', target: 'oneEnemy', effect: { status: 'conf', chance: 0.5, turns: 2 }, enemyOnly: true },
    e_moyuwake: { name: '摸鱼叫醒服务', emoji: '🐟', type: 'special', target: 'oneEnemy', effect: { status: 'sleep', chance: 0.45, turns: 2 }, enemyOnly: true },
    e_iceslash: { name: '雪糕刀法', emoji: '🍦', type: 'phys', pow: 1.6, target: 'oneEnemy', element: 'water', effect: { status: 'chill', chance: 0.5, turns: 2 }, enemyOnly: true },
    e_banaura: { name: '班味领域', emoji: '😐', type: 'special', target: 'allEnemies', effect: { status: 'ban', chance: 0.5, turns: 3 }, enemyOnly: true },
    e_healself: { name: '画饼自愈', emoji: '🥞', type: 'heal', target: 'self', healPctSelf: 0.3, enemyOnly: true },
    e_bing: { name: '虚空大饼', emoji: '🥞', type: 'special', target: 'oneEnemy', effect: { status: 'ban', chance: 0.6, turns: 3 }, enemyOnly: true, desc: '"跟着我干，明年就能上市！"目标沾上大饼味的班味。' },
    e_clone: { name: '分身幻象', emoji: '👥', type: 'special', target: 'self', effect: { clone: true }, enemyOnly: true },
    e_pivot: { name: '数据透视表', emoji: '📊', type: 'mag', pow: 1.6, target: 'allEnemies', element: 'dark', enemyOnly: true },
    e_excel: { name: '五行报表', emoji: '📈', type: 'phys', pow: 0.9, hits: 5, target: 'randomEnemies', element: 'phys', enemyOnly: true, desc: 'A、B、C、D、E列依次砸下。' },
    e_vlookup: { name: 'VLOOKUP·精确匹配', emoji: '🎯', type: 'phys', pow: 1.7, target: 'lowestHp', element: 'phys', enemyOnly: true, desc: '精确匹配生命值最低的目标。' },
    e_996: { name: '996自觉加班', emoji: '🕗', type: 'special', target: 'self', effect: { buff: { atk: 1.3, spd: 1.2 }, turns: 3 }, enemyOnly: true },
    e_crabclaw: { name: '霸王钳', emoji: '🦀', type: 'phys', pow: 1.55, target: 'oneEnemy', element: 'phys', effect: { status: 'chill', chance: 0.3, turns: 2 }, enemyOnly: true },
    e_bubble: { name: '蟹泡弹', emoji: '💧', type: 'mag', pow: 1.1, target: 'allEnemies', element: 'water', enemyOnly: true },
    e_printclone: { name: '双面复印', emoji: '🖨️', type: 'special', target: 'self', effect: { clone: true }, enemyOnly: true },
    e_jam: { name: '卡纸了！', emoji: '📄', type: 'special', target: 'oneEnemy', effect: { status: 'para', chance: 0.55, turns: 1 }, enemyOnly: true, desc: '关键时刻必卡纸。' },
    e_slide: { name: '第38页', emoji: '📽️', type: 'phys', pow: 1.9, target: 'oneEnemy', element: 'dark', enemyOnly: true, desc: '没人知道38页写了什么，只知道挨过的人都说疼。' },
    e_pptbreath: { name: '低质幻灯片吐息', emoji: '🎇', type: 'mag', pow: 1.2, target: 'allEnemies', element: 'dark', effect: { status: 'conf', chance: 0.35, turns: 2 }, enemyOnly: true },
    e_late: { name: '到点不下班', emoji: '🕘', type: 'heal', target: 'self', healPctSelf: 0.18, enemyOnly: true },
    e_despair: { name: '绝望凝视', emoji: '🕳️', type: 'mag', pow: 1.3, target: 'allEnemies', element: 'dark', effect: { status: 'ban', chance: 0.4, turns: 3 }, enemyOnly: true },
    e_final996: { name: '万年加班', emoji: '♾️', type: 'phys', pow: 2.2, target: 'allEnemies', element: 'dark', enemyOnly: true },
    e_moyuwave: { name: '摸鱼冲击', emoji: '🐡', type: 'mag', pow: 1.2, target: 'oneEnemy', element: 'water', effect: { status: 'sleep', chance: 0.3, turns: 1 }, enemyOnly: true },
    e_jinli: { name: '锦鲤护体', emoji: '🐟', type: 'special', target: 'self', effect: { evade: 0.5, turns: 2 }, enemyOnly: true },
    e_zhuanfa: { name: '转发这条锦鲤', emoji: '📨', type: 'special', target: 'oneEnemy', effect: { status: 'conf', chance: 0.55, turns: 2 }, enemyOnly: true },
    e_snowheal: { name: '冰鲜柠檬水', emoji: '🍋', type: 'heal', target: 'self', healPctSelf: 0.25, enemyOnly: true },
    e_kfccombo: { name: '疯狂星期四连击', emoji: '🍗', type: 'phys', pow: 1.3, hits: 3, target: 'randomEnemies', element: 'phys', enemyOnly: true },
    e_honk: { name: '远光灯', emoji: '💡', type: 'special', target: 'allEnemies', effect: { status: 'para', chance: 0.4, turns: 1 }, enemyOnly: true },
    e_truckhit: { name: '卡车冲撞', emoji: '🚚', type: 'phys', pow: 2.6, target: 'oneEnemy', element: 'phys', enemyOnly: true, desc: '穿越事故的头号元凶。被撞到的人会去异世界。' },
    e_chouxiang: { name: '抽象波', emoji: '🌀', type: 'mag', pow: 1.4, target: 'allEnemies', element: 'meme', effect: { status: 'conf', chance: 0.4, turns: 2 }, enemyOnly: true },
    e_memestorm: { name: '梗力风暴', emoji: '🌪️', type: 'mag', pow: 1.8, target: 'allEnemies', element: 'meme', enemyOnly: true },
    e_freeze: { name: '全场冰饮', emoji: '🧊', type: 'mag', pow: 1.3, target: 'allEnemies', element: 'water', effect: { status: 'chill', chance: 0.6, turns: 2 }, enemyOnly: true },
    e_snowball: { name: '雪球重砸', emoji: '⛄', type: 'phys', pow: 1.7, target: 'oneEnemy', element: 'water', enemyOnly: true },
    e_greenscan: { name: '绿灯扫描', emoji: '🟩', type: 'special', target: 'oneEnemy', effect: { status: 'chill', chance: 0.5, turns: 2 }, enemyOnly: true },
    e_packet: { name: '数据包乱拳', emoji: '📦', type: 'phys', pow: 0.9, hits: 3, target: 'randomEnemies', element: 'phys', enemyOnly: true },
    e_firewall: { name: '防火墙', emoji: '🧱', type: 'special', target: 'self', effect: { guard: 0.5, turns: 2 }, enemyOnly: true },
    e_cloudrain: { name: '局部有雨', emoji: '🌧️', type: 'mag', pow: 1.2, target: 'allEnemies', element: 'water', enemyOnly: true },
    e_boargore: { name: '獠牙突刺', emoji: '🐗', type: 'phys', pow: 1.45, target: 'oneEnemy', element: 'phys', enemyOnly: true },
    e_radish: { name: '拔萝卜', emoji: '🥕', type: 'phys', pow: 1.2, target: 'oneEnemy', element: 'earth', enemyOnly: true },
    e_seed: { name: '种子机关枪', emoji: '🌱', type: 'phys', pow: 0.7, hits: 3, target: 'randomEnemies', element: 'earth', enemyOnly: true },
  };

  /* ---------------- 物品 ---------------- */
  // type: consume 消耗品 / equip 装备 / key 关键道具
  const I = {
    // 消耗品
    i_bandaid: { name: '创可贴', emoji: '🩹', type: 'consume', price: 15, battle: true, effect: { heal: 60 }, desc: '贴心小创可贴。异世界也用它， magical。' },
    i_hongyao: { name: '红药水', emoji: '🧴', type: 'consume', price: 60, battle: true, effect: { heal: 220 }, desc: '冒险者标配。味道是红色的。' },
    i_dayao: { name: '十全大补汤', emoji: '🍲', type: 'consume', price: 220, battle: true, effect: { heal: 650 }, desc: '咕咚城老字号秘方。喝完感觉能打十个。' },
    i_lanyao: { name: '蓝药水', emoji: '🧪', type: 'consume', price: 55, battle: true, effect: { mp: 45 }, desc: '梗力补给。喝完眼睛是蓝的。' },
    i_mola: { name: '魔力苏打', emoji: '🥤', type: 'consume', price: 170, battle: true, effect: { mp: 130 }, desc: '气非常足，梗力从毛孔里往外冒。' },
    i_huoxiang: { name: '藿香正气水', emoji: '💊', type: 'consume', price: 40, battle: true, effect: { cure: ['conf', 'para'] }, desc: '中华神秘力量。一口下去，混乱和麻痹当场痊愈（表情也会扭曲）。', meme: 'huoxiang' },
    i_fengyoujing: { name: '风油精', emoji: '🌿', type: 'consume', price: 40, battle: true, effect: { cure: ['sleep', 'chill'], buff: { spd: 1.15 }, turns: 2 }, desc: '提神醒脑，抹完能看见异世界的边。', meme: 'fengyoujing' },
    i_gouqi: { name: '保温杯枸杞茶', emoji: '🥛', type: 'consume', price: 130, battle: true, effect: { heal: 0.3, mp: 0.3 }, desc: '中年人的自律。回三成生命和梗力，养生朋克。', meme: 'gouqi' },
    i_catvideo: { name: '猫猫视频', emoji: '📺', type: 'consume', price: 90, battle: true, effect: { cure: ['ban'], lezi: 20 }, desc: '猫猫是世界上最好的东西，专治班味。', meme: 'catvideo' },
    i_v50: { name: '疯狂星期四券', emoji: '🍗', type: 'consume', price: 300, battle: true, effect: { revive: 0.5 }, desc: '今天是疯狂星期四，V我50，我帮你复活。', meme: 'v50' },
    i_cola: { name: '肥宅快乐水', emoji: '🥫', type: 'consume', price: 70, battle: true, effect: { heal: 80, lezi: 25 }, desc: '快乐是第一生产力。', meme: 'kuaileshui' },
    i_latang: { name: '卫龙辣条', emoji: '🌶️', type: 'consume', price: 80, battle: true, effect: { buff: { atk: 1.3 }, turns: 3 }, desc: '辣条时刻！攻击力上升。辣出来的战斗力。', meme: 'latiao' },
    i_luosi: { name: '螺蛳粉', emoji: '🍜', type: 'consume', price: 150, battle: true, target: 'allEnemies', effect: { damage: 120 }, chancePoison: 0.5, desc: '对敌人全体投掷。生化级武器，附带中毒。闻着臭，哭着疼。', meme: 'luosifen' },
    i_naicha: { name: '秋天的第一杯奶茶', emoji: '🥤', type: 'consume', price: 520, battle: true, effect: { heal: 1.0 }, desc: '入秋仪式感。完全回复一名队友的生命。', meme: 'naicha' },
    i_ningmeng: { name: '冰鲜柠檬水', emoji: '🍋', type: 'consume', price: 420, battle: true, effect: { mp: 1.0 }, desc: '4块钱的冰鲜柠檬水，喝出400块的满足。梗力完全回复。', meme: 'xuewang' },
    i_hanbao: { name: '深海蟹黄堡', emoji: '🍔', type: 'consume', price: 0, battle: true, effect: { heal: 1.0, buff: { atk: 1.3 }, turns: 3 }, desc: '蟹老板的秘方（他不知道被拿走了）。完全回复并提升攻击。', meme: 'xiehuangbao' },
    i_yumao: { name: '打工人之羽', emoji: '🍃', type: 'consume', price: 0, battle: true, effect: { revive: 1.0 }, desc: '传说凤凰都会过劳，这根羽毛是它自愿加班剩下的。完全复活一名队友。' },
    // 装备·键盘（小满）
    q_hongtian: { name: '红轴键盘', emoji: '⌨️', type: 'equip', sub: 'weapon', for: ['xiaoman'], price: 120, atk: 5, mag: 4, desc: ' linear 手感，敲击声是秩序的节拍。' },
    q_qingzhou: { name: '青轴键盘·聒噪', emoji: '⌨️', type: 'equip', sub: 'weapon', for: ['xiaoman'], price: 480, atk: 11, mag: 7, crit: 4, desc: '声大就是正义。敌人还没开打先被吵晕。', rarity: 3 },
    q_yinzhou: { name: '银轴·手速奇迹', emoji: '⌨️', type: 'equip', sub: 'weapon', for: ['xiaoman'], price: 1600, atk: 17, mag: 11, spd: 3, desc: '快到可以一边敲键盘一边躲技能。', rarity: 4 },
    q_hhkb: { name: '圣电容键盘·理财神器', emoji: '⌨️', type: 'equip', sub: 'weapon', for: ['xiaoman'], price: 4800, atk: 26, mag: 18, luk: 6, desc: '理财产品，越用越值钱。传说持有者从不加班。', rarity: 5 },
    // 装备·剑（柚子）
    q_yaqian: { name: '磨亮的牙签', emoji: '🦷', type: 'equip', sub: 'weapon', for: ['youzi'], price: 100, atk: 6, desc: '是牙签，但也是剑。猫的体面。' },
    q_xigua: { name: '西瓜刀·水果自由', emoji: '🍉', type: 'equip', sub: 'weapon', for: ['youzi'], price: 450, atk: 12, spd: 2, desc: '一刀下去，实现水果自由。', rarity: 3 },
    q_yueya: { name: '弯月猫爪刀', emoji: '🌙', type: 'equip', sub: 'weapon', for: ['youzi'], price: 1500, atk: 18, crit: 6, desc: '月牙形状，猫爪开刃。', rarity: 4 },
    q_xianyu: { name: '咸鱼尚方剑', emoji: '🐟', type: 'equip', sub: 'weapon', for: ['youzi'], price: 5200, atk: 28, crit: 10, desc: '如朕亲临，躺着也能赢。上方还挂着一条咸鱼（斩过）。', rarity: 5 },
    // 装备·盾（吨吨）
    q_beike: { name: '贝壳盾', emoji: '🐚', type: 'equip', sub: 'weapon', for: ['dundun'], price: 110, def: 5, hp: 15, desc: '举起来的瞬间很有安全感（对史莱姆来说）。' },
    q_guike: { name: '硬核龟壳', emoji: '🐢', type: 'equip', sub: 'weapon', for: ['dundun'], price: 460, def: 11, hp: 40, desc: '捡来的龟壳。佩戴时语气都会变硬。', rarity: 3 },
    q_tiewan: { name: '铁锅·万物皆可炖', emoji: '🍳', type: 'equip', sub: 'weapon', for: ['dundun'], price: 1500, def: 17, hp: 80, res: 4, desc: '护住半边天的传家宝。', rarity: 4 },
    q_longlin: { name: '龙鳞盾·梦想之鳞', emoji: '🐉', type: 'equip', sub: 'weapon', for: ['dundun'], price: 5000, def: 26, hp: 130, res: 8, desc: ' dream 成真的证明。史莱姆自己的龙鳞。', rarity: 5 },
    // 装备·显卡（千机）
    q_1060: { name: '时代眼泪·GTX1060', emoji: '🟩', type: 'equip', sub: 'weapon', for: ['qianji'], price: 130, mag: 7, mp: 12, desc: '战十年，江湖永远有它的传说。' },
    q_2080: { name: '光追魔导·显卡2080', emoji: '🟦', type: 'equip', sub: 'weapon', for: ['qianji'], price: 500, mag: 14, mp: 28, desc: '开光追之后，火球术带反射阴影。', rarity: 3 },
    q_4090: { name: '卡皇·算力沸腾', emoji: '🟥', type: 'equip', sub: 'weapon', for: ['qianji'], price: 1700, mag: 22, mp: 50, spd: 2, desc: '装机佬的梦想。温度也是真的沸腾。', rarity: 4 },
    q_9090: { name: '显圣卡·神界版', emoji: '🟨', type: 'equip', sub: 'weapon', for: ['qianji'], price: 5500, mag: 32, mp: 80, luk: 4, desc: '已超出物理范围。插上之后千机说话都带混响。', rarity: 5 },
    // 装备·剑（老亚瑟）
    q_paodao: { name: '锈迹斑斑的阔剑', emoji: '⚔️', type: 'equip', sub: 'weapon', for: ['yase'], price: 150, atk: 9, def: 2, desc: '退休生活的一部分。锈是岁月的勋章。' },
    q_jundao: { name: '军团制式巨剑', emoji: '🗡️', type: 'equip', sub: 'weapon', for: ['yase'], price: 520, atk: 16, def: 4, desc: '王都军团遗物，比老亚瑟还年长。', rarity: 3 },
    q_sanbian: { name: '三十年陈鞭', emoji: '🩹', type: 'equip', sub: 'weapon', for: ['yase'], price: 1600, atk: 24, def: 6, desc: '鞭身是三十年前的绷带缠的。意义大于威力（威力也很大）。', rarity: 4 },
    q_shengjian: { name: '圣剑·余晖', emoji: '🌟', type: 'equip', sub: 'weapon', for: ['yase'], price: 5600, atk: 34, def: 8, desc: '当年讨伐魔王的圣剑。重新出鞘那天，剑柄上的手不再发抖。', rarity: 5 },
    // 防具（通用）
    a_buma: { name: '布麻衣', emoji: '👕', type: 'equip', sub: 'armor', price: 80, def: 4, desc: '透气，便宜，耐磨。打工人的标配。' },
    a_piyi: { name: '冒险皮衣', emoji: '🧥', type: 'equip', sub: 'armor', price: 380, def: 9, spd: 1, desc: '防风防雨防哥布林。', rarity: 2 },
    a_gexin: { name: '格子衫·程序员祝福', emoji: '👘', type: 'equip', sub: 'armor', price: 900, def: 13, res: 10, desc: '穿上后 Bug 会绕着你走。对班味系有奇效。', rarity: 3 },
    a_kaijia: { name: '铁壁重铠', emoji: '🛡️', type: 'equip', sub: 'armor', price: 2000, def: 22, res: 4, desc: '王都军团退役装备，防御拉满。', rarity: 4 },
    a_shuiyi: { name: '熟睡睡衣', emoji: '😴', type: 'equip', sub: 'armor', price: 600, def: 6, spd: 4, luk: 4, desc: '"睡觉才是第一生产力。"穿着它战斗莫名轻松。', rarity: 3 },
    a_shengyi: { name: '星辉法袍', emoji: '🌌', type: 'equip', sub: 'armor', price: 2200, def: 12, res: 20, mp: 30, desc: '绣着星图的法袍，梗力如泉涌。', rarity: 4 },
    // 饰品
    x_xingyun: { name: '幸运四叶草', emoji: '🍀', type: 'equip', sub: 'acc', price: 300, luk: 8, desc: '找到它的人运气都不错。' },
    x_ouhuang: { name: '欧皇之手', emoji: '🤙', type: 'equip', sub: 'acc', price: 1500, crit: 12, luk: 6, desc: '摸过的卡包全是金。', rarity: 4 },
    x_feiqiu: { name: '非酋护符', emoji: '🖤', type: 'equip', sub: 'acc', price: 200, luk: -5, desc: '"运气差到极致也是一种运气。"（并没有什么正面效果）', rarity: 2 },
    x_maobo: { name: '猫薄荷香囊', emoji: '🌿', type: 'equip', sub: 'acc', price: 800, spd: 5, luk: 3, desc: '柚子装备后开战自带10点乐子值。别的猫闻了会疯。', for: ['youzi'], battleStartLezi: 10, rarity: 3 },
    x_wending: { name: '稳定君玩偶', emoji: '🐹', type: 'equip', sub: 'acc', price: 0, luk: 5, res: 8, desc: '卡皮巴拉玩偶。全队免疫班味（ equip者生效）。情绪稳定，天下无敌。', noBan: true, rarity: 5 },
    x_baowen: { name: '中年保温杯', emoji: '🥤', type: 'equip', sub: 'acc', price: 1000, mp: 20, mpRegen: 4, desc: '每回合回复4点梗力。枸杞自带。', rarity: 3 },
    x_jiasu: { name: '风油精挂件', emoji: '🏮', type: 'equip', sub: 'acc', price: 700, spd: 6, desc: '闻一下就跑得快。', rarity: 2 },
    x_huiyuan: { name: '公会老会员卡', emoji: '💳', type: 'equip', sub: 'acc', price: 900, luk: 4, goldPlus: 0.2, desc: '战斗获得的金币+20%。老会员的排面。', rarity: 3 },
    x_kfcode: { name: '疯狂星期四之证', emoji: '👑', type: 'equip', sub: 'acc', price: 0, atk: 10, mag: 10, crit: 8, desc: '战胜星期四之鸡的证明。每周四效果拔群（其实每天都是星期四）。', rarity: 5 },
    // 关键道具
    k_phone: { name: '打工人遗物·手机', emoji: '📱', type: 'key', price: 0, desc: '小满穿越时攥着的手机，电量永远显示1%但永远不关机。里面装着电子木鱼App和梗百科。' },
    k_leader: { name: '猫罐头·至尊金枪鱼', emoji: '🐟', type: 'key', price: 0, desc: '传说中的猫罐头，开罐香气能传三里地。' },
    k_kaiyuan: { name: '开源之心', emoji: '💗', type: 'key', price: 0, desc: '一颗会发光的水晶心脏，上面刻着：Knowledge belongs to everyone.' },
    k_antang: { name: '氨糖圣液', emoji: '🧴', type: 'key', price: 0, desc: '传说中的膝盖圣药。老登看了会流泪。' },
    k_shupian: { name: '女神的薯片', emoji: '🥔', type: 'key', price: 0, desc: '摸鱼女神薇薇安的最爱。天界限定口味：加班和解味。' },
    k_contract: { name: '天契·初代勇者卷宗', emoji: '📜', type: 'key', price: 0, desc: '泛黄的契约书。条款第七条："维护期为永久，假期数为零。"' },
    k_piapiao: { name: '鱼食·上等', emoji: '🐛', type: 'key', price: 0, desc: '钓鱼佬看了眼馋的顶级鱼饵。' },
  };
  D.items = I;

  /* ---------------- 敌人 ---------------- */
  // race: 'ban' 班味系（受梗属性1.5倍）
  const E = {
    slime_green: { name: '草原史莱姆', emoji: '🟢', hp: 26, atk: 8, def: 2, mag: 2, res: 2, spd: 6, exp: 8, gold: 8, skills: [{ id: 'e_bite', w: 3 }], drops: [{ id: 'i_bandaid', p: 0.3 }], lines: { die: '啵……' } },
    slime_gray: { name: '班味史莱姆', emoji: '🩶', race: 'ban', hp: 34, atk: 10, def: 3, mag: 6, res: 4, spd: 7, exp: 12, gold: 12, skills: [{ id: 'e_drain', w: 2 }, { id: 'e_bite', w: 3 }], drops: [{ id: 'i_catvideo', p: 0.15 }], lines: { start: '（它散发着办公室下午三点的气息）' } },
    boar_mini: { name: '野猪仔', emoji: 'pig2', hp: 30, atk: 11, def: 4, mag: 0, res: 2, spd: 9, exp: 10, gold: 10, skills: [{ id: 'e_charge', w: 3 }, { id: 'e_bite', w: 2 }], drops: [{ id: 'i_bandaid', p: 0.25 }] },
    goblin_laoliu: { name: '哥布林·老六', emoji: '👺', hp: 40, atk: 14, def: 5, mag: 0, res: 3, spd: 14, exp: 16, gold: 22, skills: [{ id: 'e_punch', w: 3 }, { id: 'e_bite', w: 1 }], drops: [{ id: 'i_huoxiang', p: 0.2 }], lines: { start: '（它躲在了你没有防备的地方）' } },
    wolf_grass: { name: '草原狼', emoji: '🐺', hp: 38, atk: 13, def: 4, mag: 0, res: 3, spd: 12, exp: 14, gold: 12, skills: [{ id: 'e_bite', w: 3 }, { id: 'e_howl', w: 1 }], drops: [{ id: 'i_latang', p: 0.12 }] },
    wolf_mist: { name: '雾隐狼', emoji: '🐺', hp: 55, atk: 17, def: 6, mag: 4, res: 5, spd: 15, exp: 26, gold: 20, skills: [{ id: 'e_bite', w: 3 }, { id: 'e_howl', w: 1 }], drops: [{ id: 'i_fengyoujing', p: 0.2 }] },
    mushroom: { name: '毒蘑菇', emoji: '🍄', hp: 32, atk: 9, def: 3, mag: 10, res: 8, spd: 5, exp: 12, gold: 14, weak: ['fire'], skills: [{ id: 'e_spore', w: 3 }], drops: [{ id: 'i_bandaid', p: 0.3 }] },
    bee_juan: { name: '卷皇蜂', emoji: '🐝', hp: 30, atk: 12, def: 2, mag: 0, res: 2, spd: 17, exp: 15, gold: 15, skills: [{ id: 'e_sting', w: 3 }, { id: 'e_996', w: 1 }], drops: [{ id: 'i_cola', p: 0.15 }], lines: { start: '嗡嗡嗡（它连采蜜都在内卷）' } },
    bat_996: { name: '加班蝙蝠', emoji: '🦇', race: 'ban', hp: 44, atk: 15, def: 4, mag: 6, res: 6, spd: 18, exp: 24, gold: 24, skills: [{ id: 'e_drain', w: 3 }, { id: 'e_bite', w: 2 }], drops: [{ id: 'i_cola', p: 0.25 }] },
    resume_golem: { name: '简历魔像', emoji: '📄', race: 'ban', hp: 90, atk: 16, def: 14, mag: 4, res: 10, spd: 4, exp: 40, gold: 50, skills: [{ id: 'e_slam', w: 3 }, { id: 'e_banaura', w: 1 }], drops: [{ id: 'i_gouqi', p: 0.2 }], lines: { start: '（它全身贴满了"精通""熟练""负责"）' } },
    kpi_inspector: { name: '考核官·K先生', emoji: '🧐', race: 'ban', hp: 70, atk: 14, def: 8, mag: 14, res: 12, spd: 12, exp: 45, gold: 60, skills: [{ id: 'e_silence', w: 2 }, { id: 'e_drain', w: 2 }, { id: 'e_bite', w: 2 }], drops: [{ id: 'i_gouqi', p: 0.3 }] },
    ghost_meeting: { name: '会议室幽灵', emoji: '👻', race: 'ban', hp: 60, atk: 8, def: 6, mag: 16, res: 16, spd: 10, exp: 42, gold: 45, weak: ['light'], skills: [{ id: 'e_silence', w: 3 }, { id: 'e_drain', w: 2 }], drops: [{ id: 'i_catvideo', p: 0.25 }], lines: { start: '（空气突然变得漫长，像开了三个小时的会）' } },
    punch_clock: { name: '打卡机器兽', emoji: '🕒', race: 'ban', hp: 85, atk: 15, def: 16, mag: 0, res: 8, spd: 6, exp: 46, gold: 55, skills: [{ id: 'e_slam', w: 3 }, { id: 'e_jam', w: 2 }], drops: [{ id: 'i_gouqi', p: 0.25 }] },
    keyboard_warrior: { name: '键盘侠', emoji: '⌨️', race: 'ban', hp: 55, atk: 17, def: 5, mag: 8, res: 6, spd: 13, exp: 38, gold: 40, skills: [{ id: 'e_punch', w: 2 }, { id: 'e_confuse', w: 2 }], drops: [{ id: 'i_latang', p: 0.25 }] },
    parrot_gangjing: { name: '杠精鹦鹉', emoji: '🦜', hp: 48, atk: 10, def: 6, mag: 12, res: 14, spd: 14, exp: 36, gold: 42, skills: [{ id: 'e_confuse', w: 3 }, { id: 'e_bite', w: 1 }], drops: [{ id: 'i_huoxiang', p: 0.3 }], lines: { start: '（它清了清嗓子，准备反驳一切）' } },
    turtle_noreply: { name: '已读不回龟', emoji: '🐢', hp: 110, atk: 12, def: 24, mag: 0, res: 20, spd: 2, exp: 55, gold: 70, skills: [{ id: 'e_slam', w: 3 }, { id: 'e_moyuwake', w: 1 }], drops: [{ id: 'i_naicha', p: 0.06 }], lines: { start: '（它看到了你的攻击，但没有回应）' } },
    catfish_moyu: { name: '摸鱼鲶鱼', emoji: '🐟', hp: 66, atk: 13, def: 8, mag: 10, res: 10, spd: 11, exp: 40, gold: 48, skills: [{ id: 'e_moyuwake', w: 3 }, { id: 'e_bite', w: 2 }], drops: [{ id: 'i_cola', p: 0.3 }] },
    icecream_assassin: { name: '雪糕刺客', emoji: '🍦', hp: 58, atk: 24, def: 6, mag: 6, res: 8, spd: 20, exp: 60, gold: 65, weak: ['fire'], skills: [{ id: 'e_iceslash', w: 3 }], drops: [{ id: 'i_ningmeng', p: 0.1 }], lines: { start: '（它安静地躺在冰柜里，直到你结账的那一刻）' } },
    alpaca_tuotuo: { name: '神兽·驼驼', emoji: '🦙', hp: 130, atk: 10, def: 30, mag: 0, res: 30, spd: 26, exp: 400, gold: 300, skills: [{ id: 'e_flee', w: 1 }], drops: [{ id: 'i_naicha', p: 1 }], rare: true, lines: { start: '（传说中的神兽！抓住它能获得大量经验！）' } },
    capybara: { name: '卡皮巴拉', emoji: '🐹', hp: 200, atk: 0, def: 50, mag: 0, res: 50, spd: 5, exp: 30, gold: 30, skills: [{ id: 'e_flee', w: 1 }], lines: { start: '（它泡在温泉里，情绪稳定地看着你）' } },
    pigeon_gugu: { name: '咕咕鸽', emoji: '🕊️', hp: 40, atk: 8, def: 8, mag: 0, res: 8, spd: 22, exp: 30, gold: 90, skills: [{ id: 'e_flee', w: 1 }], drops: [], lines: { start: '（它叼走了你的金币，说好的事情它从来没做到）' } },
    monkey_malou: { name: '吗喽', emoji: '🐵', hp: 45, atk: 14, def: 5, mag: 0, res: 4, spd: 16, exp: 28, gold: 20, skills: [{ id: 'e_radish', w: 2 }, { id: 'e_charge', w: 2 }], drops: [{ id: 'i_cola', p: 0.2 }], lines: { start: '吗喽的命也是命！' } },
    ppt_drone: { name: 'PPT小飞龙', emoji: '🐲', race: 'ban', hp: 50, atk: 12, def: 6, mag: 14, res: 8, spd: 15, exp: 35, gold: 38, skills: [{ id: 'e_pptbreath', w: 3 }], drops: [{ id: 'i_lanyao', p: 0.3 }] },
    server_rack: { name: '服务器机架', emoji: '🖥️', race: 'ban', hp: 120, atk: 10, def: 20, mag: 22, res: 22, spd: 6, exp: 90, gold: 110, weak: ['water'], skills: [{ id: 'e_packet', w: 3 }, { id: 'e_firewall', w: 1 }], drops: [{ id: 'i_mola', p: 0.3 }] },
    cloud_ling: { name: '一朵云', emoji: '☁️', hp: 80, atk: 6, def: 12, mag: 20, res: 24, spd: 14, exp: 85, gold: 100, weak: ['wind'], skills: [{ id: 'e_cloudrain', w: 3 }], drops: [{ id: 'i_mola', p: 0.3 }], lines: { start: '（它飘过来了。就……飘过来了。）' } },
    firewall_imp: { name: '防火墙小鬼', emoji: '🧱', race: 'ban', hp: 70, atk: 16, def: 10, mag: 16, res: 20, spd: 12, exp: 88, gold: 105, skills: [{ id: 'e_packet', w: 2 }, { id: 'e_firewall', w: 2 }], drops: [{ id: 'i_lanyao', p: 0.35 }] },
    kfc_chicken: { name: '战斗鸡·星期四', emoji: '🍗', hp: 260, atk: 26, def: 12, mag: 10, res: 12, spd: 22, exp: 180, gold: 200, skills: [{ id: 'e_kfccombo', w: 3 }, { id: 'e_flee', w: 1 }], drops: [{ id: 'i_v50', p: 1 }], boss: true, fleeAt: 0.3, lines: { start: '咯咯哒！（今天是星期四吗？）' } },

    /* ---- BOSS ---- */
    boss_overtime: {
      name: '加班幽灵', emoji: '👤', race: 'ban', hp: 70, atk: 11, def: 3, mag: 10, res: 6, spd: 8, exp: 30, gold: 30,
      skills: [{ id: 'e_drain', w: 3 }, { id: 'e_bite', w: 2 }], boss: true,
      lines: { start: '「还没下班……你也别想走……」' },
    },
    boss_boar: {
      name: '野猪王·大蹄子', emoji: '🐗', hp: 260, atk: 18, def: 8, mag: 0, res: 5, spd: 10, exp: 90, gold: 120,
      skills: [{ id: 'e_boargore', w: 3 }, { id: 'e_charge', w: 2 }, { id: 'e_howl', w: 1 }], boss: true,
      drops: [{ id: 'q_yaqian', p: 1 }],
      lines: { start: '哼哼！！（田里的萝卜一个都不许动！）', taunt: [{ hp: 0.4, text: '哼哼哼——！（它红温了！）' }] },
    },
    boss_mushroom: {
      name: '菇勇者·毒蘑菇王', emoji: '🍄', hp: 420, atk: 20, def: 12, mag: 24, res: 16, spd: 11, exp: 220, gold: 260,
      weak: ['fire'], skills: [{ id: 'e_spore', w: 2 }, { id: 'e_poisonfog', w: 2 }, { id: 'e_seed', w: 2 }], boss: true,
      lines: {
        start: '「咕咕咕……吾乃菇勇者！森林的……啊啾！」',
        taunt: [{ hp: 0.5, text: '「咳咳……花粉过敏不算弱点！那是战术性打喷嚏！」' }],
      },
    },
    boss_treant: {
      name: '千年老登树', emoji: '🌳', hp: 700, atk: 26, def: 24, mag: 18, res: 20, spd: 5, exp: 380, gold: 400,
      weak: ['fire'], skills: [{ id: 'e_root', w: 2 }, { id: 'e_slam', w: 3 }, { id: 'e_poisonfog', w: 1 }], boss: true,
      lines: {
        start: '「小年轻，这林子我长了三千年，你算老几？」',
        taunt: [{ hp: 0.4, text: '「想当年，这片森林还不叫迷雾森林……」' }],
      },
    },
    boss_examiner: {
      name: '监考魔像', emoji: '🗿', hp: 600, atk: 24, def: 26, mag: 10, res: 18, spd: 8, exp: 350, gold: 300,
      skills: [{ id: 'e_slam', w: 3 }, { id: 'e_silence', w: 2 }, { id: 'e_jam', w: 1 }], boss: true,
      lines: {
        start: '「考试开始。作弊者，抹除。」',
        taunt: [{ hp: 0.5, text: '「第三题不会就跳过，不要影响其他人……的体验。」' }],
      },
    },
    boss_juan: {
      name: '卷之将军·阿卷', emoji: '🌀', race: 'ban', hp: 850, atk: 26, def: 16, mag: 10, res: 14, spd: 18, exp: 600, gold: 500,
      skills: [{ id: 'e_sting', w: 3 }, { id: 'e_996', w: 2 }, { id: 'e_charge', w: 2 }], boss: true, scaleUp: true,
      lines: {
        start: '「休息？我可是在你们睡觉的时候偷偷变强了哦。」',
        taunt: [
          { hp: 0.66, text: '「你们下班了？可我还在成长！」', buff: 'atk' },
          { hp: 0.33, text: '「还不够！我还不够！！」', buff: 'atk' },
        ],
      },
    },
    boss_abyss: {
      name: '深渊凝视者', emoji: '👁️', hp: 950, atk: 22, def: 18, mag: 30, res: 24, spd: 12, exp: 700, gold: 550,
      weak: ['light'], skills: [{ id: 'e_despair', w: 3 }, { id: 'e_drain', w: 2 }, { id: 'e_pivot', w: 2 }], boss: true,
      lines: {
        start: '「当你凝视深渊时，深渊也在给你发已读回执。」',
        taunt: [{ hp: 0.4, text: '「看啊……你的疲惫，多美。」' }],
      },
    },
    boss_bing: {
      name: '饼之魔女·布莉娜', emoji: '🥞', race: 'ban', hp: 1100, atk: 20, def: 16, mag: 34, res: 26, spd: 16, exp: 900, gold: 700,
      skills: [{ id: 'e_bing', w: 3 }, { id: 'e_clone', w: 2 }, { id: 'e_pivot', w: 2 }, { id: 'e_healself', w: 1 }], boss: true, cloneOn: 0.6,
      lines: {
        start: '「小小的冒险者们~想不想年薪百万？想不想财务自由？」',
        taunt: [
          { hp: 0.6, text: '「跟我干！明年ipo后年上市，你们都是原始股东！」' },
          { hp: 0.3, text: '「饼……饼碎了……」' },
        ],
      },
    },
    boss_crab: {
      name: '蟹老板', emoji: '🦀', hp: 1000, atk: 30, def: 22, mag: 14, res: 16, spd: 12, exp: 800, gold: 900,
      weak: ['light'], resist: ['water'], skills: [{ id: 'e_crabclaw', w: 3 }, { id: 'e_bubble', w: 2 }, { id: 'e_healself', w: 1 }], boss: true,
      drops: [{ id: 'i_hanbao', p: 1 }],
      lines: {
        start: '「站住！谁在偷我的秘方！」',
        taunt: [{ hp: 0.35, text: '「我的蟹黄堡……我的钱钱……！」' }],
      },
    },
    boss_noreply: {
      name: '已读不回骑士', emoji: '🛡️', race: 'ban', hp: 1300, atk: 30, def: 34, mag: 10, res: 26, spd: 10, exp: 900, gold: 600,
      skills: [{ id: 'e_slam', w: 3 }, { id: 'e_moyuwake', w: 1 }], boss: true, counter: 0.25,
      lines: {
        start: '「……」',
        taunt: [{ hp: 0.5, text: '「……」（他已读了你所有的呐喊）' }],
      },
    },
    boss_luanhui: {
      name: '已读乱回法师·阿回', emoji: '🃏', race: 'ban', hp: 1400, atk: 18, def: 18, mag: 36, res: 30, spd: 20, exp: 1200, gold: 800,
      skills: [{ id: 'e_memestorm', w: 3 }, { id: 'e_chouxiang', w: 2 }, { id: 'e_zhuanfa', w: 2 }], boss: true, copyLast: true,
      lines: {
        start: '「你们要打我？好的收到！那我打你们！」',
        taunt: [{ hp: 0.5, text: '「（用你的招式还给你，这叫已读乱回！）」' }],
      },
    },
    boss_moshou: {
      name: '记忆卫兵·墨守', emoji: '🗿', hp: 1600, atk: 28, def: 30, mag: 24, res: 28, spd: 14, exp: 1400, gold: 0,
      skills: [{ id: 'e_slam', w: 3 }, { id: 'e_despair', w: 2 }, { id: 'e_silence', w: 1 }], boss: true, merciful: true,
      lines: {
        start: '「这是他的记忆。别看了……求你们，别看了。」',
        taunt: [{ hp: 0.25, text: '「……再往前，就是他不肯想起的地方了。」' }],
      },
    },
    boss_biaoge: {
      name: '周报之影·表哥', emoji: '📊', race: 'ban', hp: 1800, atk: 30, def: 22, mag: 34, res: 26, spd: 16, exp: 1600, gold: 1000,
      skills: [{ id: 'e_excel', w: 3 }, { id: 'e_pivot', w: 2 }, { id: 'e_vlookup', w: 2 }, { id: 'e_banaura', w: 1 }], boss: true,
      lines: {
        start: '「本周工作总结：一、将入侵者转化为工时。二、格式化他们的 resistance。」',
        taunt: [{ hp: 0.4, text: '「你们的行为无法量化！无法量化就无法存在！」' }],
      },
    },
    boss_vivian: {
      name: '摸鱼女神·薇薇安', emoji: '🌸', hp: 2000, atk: 24, def: 24, mag: 40, res: 32, spd: 24, exp: 2000, gold: 0,
      weak: ['meme'], skills: [{ id: 'e_moyuwave', w: 3 }, { id: 'e_jinli', w: 2 }, { id: 'e_zhuanfa', w: 2 }, { id: 'e_snowheal', w: 1 }], boss: true,
      lines: {
        start: '「你们把人家摸鱼的时间都偷走了啦！！认真模式……启动！」',
        taunt: [{ hp: 0.4, text: '「呜呜呜薯片都吓掉了……这局算你们赢一半！」' }],
      },
    },
    boss_printer: {
      name: '虚空打印机', emoji: '🖨️', race: 'ban', hp: 2200, atk: 32, def: 30, mag: 20, res: 22, spd: 14, exp: 2200, gold: 1200,
      skills: [{ id: 'e_printclone', w: 2 }, { id: 'e_jam', w: 2 }, { id: 'e_slam', w: 3 }], boss: true, cloneOn: 0.7,
      lines: {
        start: '咔咔咔……咔纸。（它在复印你的队伍！）',
        taunt: [{ hp: 0.5, text: '「正在打印第 2 份……请稍候。」' }],
      },
    },
    boss_ppt: {
      name: '述职巨龙·PPT龙', emoji: '🐲', race: 'ban', hp: 2600, atk: 34, def: 28, mag: 38, res: 28, spd: 16, exp: 2600, gold: 1500,
      weak: ['meme'], skills: [{ id: 'e_pptbreath', w: 3 }, { id: 'e_slide', w: 3 }, { id: 'e_banaura', w: 1 }], boss: true,
      lines: {
        start: '「本季度的KPI达成率是——（翻页）——你们的疼痛值！」',
        taunt: [{ hp: 0.4, text: '「别急，后面还有128页！」' }],
      },
    },
    boss_juan2: {
      name: '超级阿卷·996形态', emoji: '🌪️', race: 'ban', hp: 3200, atk: 42, def: 26, mag: 20, res: 24, spd: 26, exp: 3200, gold: 1800,
      skills: [{ id: 'e_sting', w: 3 }, { id: 'e_996', w: 2 }, { id: 'e_final996', w: 2 }], boss: true, scaleUp: true,
      lines: {
        start: '「我卷回来了！！这次连轴转、无假期、自带工位！」',
        taunt: [{ hp: 0.5, text: '「你们休息的时候，我又强了亿点点！」' }],
      },
    },
    boss_mowang: {
      name: '班味魔神·季长安', emoji: '😶', race: 'ban', hp: 4600, atk: 44, def: 34, mag: 44, res: 36, spd: 22, exp: 9999, gold: 9999,
      weak: ['meme'], skills: [{ id: 'e_despair', w: 3 }, { id: 'e_final996', w: 3 }, { id: 'e_banaura', w: 2 }, { id: 'e_late', w: 1 }], boss: true, finalBoss: true,
      lines: {
        start: '「又来一个……地球来的孩子。回去吧。这里没有下班的可能。」',
        taunt: [
          { hp: 0.66, text: '「三百年……我求了三百年的一天假期！谁听见了？！」' },
          { hp: 0.33, text: '「疲惫才是平等的！我要让全世界陪我一起……」' },
        ],
      },
    },
    boss_mowang2: {
      name: '初代勇者·季长安', emoji: '🧝', hp: 3800, atk: 40, def: 30, mag: 38, res: 32, spd: 24, exp: 0, gold: 0,
      weak: [], skills: [{ id: 'e_slam', w: 3 }, { id: 'e_despair', w: 2 }, { id: 'e_final996', w: 2 }], boss: true, finalPhase2: true,
      lines: {
        start: '「把我打醒吧……如果你们的「活着」真的那么有说服力。」',
      },
    },
    boss_xuewang: {
      name: '雪王', emoji: '⛄', hp: 5200, atk: 48, def: 36, mag: 40, res: 34, spd: 24, exp: 6000, gold: 5000,
      resist: ['water', 'ice'], weak: ['fire'], skills: [{ id: 'e_snowball', w: 3 }, { id: 'e_freeze', w: 3 }, { id: 'e_snowheal', w: 1 }], boss: true, super: true,
      drops: [{ id: 'i_ningmeng', p: 1 }],
      lines: {
        start: '「你爱我，我爱你～」（但战斗归战斗）',
        taunt: [{ hp: 0.4, text: '「蜜——雪——冰——城——」（战歌响彻雪山）' }],
      },
    },
    boss_kfc_true: {
      name: '星期四之鸡·真身', emoji: '🐓', hp: 5800, atk: 52, def: 34, mag: 36, res: 32, spd: 30, exp: 6500, gold: 5000,
      skills: [{ id: 'e_kfccombo', w: 3 }, { id: 'e_honk', w: 2 }, { id: 'e_memestorm', w: 2 }], boss: true, super: true,
      drops: [{ id: 'x_kfcode', p: 1 }],
      lines: {
        start: '「咯————哒！！」（V我5000！）',
        taunt: [{ hp: 0.4, text: '「疯狂星期四，永远不会结束！」' }],
      },
    },
    boss_truck: {
      name: '卡车君', emoji: '🚚', hp: 6000, atk: 55, def: 40, mag: 10, res: 30, spd: 28, exp: 7000, gold: 6000,
      skills: [{ id: 'e_truckhit', w: 3 }, { id: 'e_honk', w: 2 }], boss: true, super: true, telegraph: 'truck',
      drops: [{ id: 'i_yumao', p: 1 }],
      lines: {
        start: '「哔——————！」（它并不是故意的。它只是……停不下来。）',
        taunt: [{ hp: 0.5, text: '（它的车灯黯淡了一下，好像在道歉）' }],
      },
    },
    boss_hermit: {
      name: '隐者之影', emoji: '🥋', hp: 1900, atk: 32, def: 22, mag: 28, res: 22, spd: 20, exp: 1600, gold: 800,
      skills: [{ id: 'e_slam', w: 3 }, { id: 'e_confuse', w: 2 }, { id: 'e_howl', w: 1 }], boss: true,
      drops: [{ id: 'x_ouhuang', p: 1 }],
      lines: {
        start: '「想见我？先把三十年功力接下来再说。」',
        taunt: [{ hp: 0.4, text: '「有点意思……年轻人，你的招式里有「下班」的气息。」' }],
      },
    },
    boss_chouxiang: {
      name: '抽象之主', emoji: '🌀', hp: 8888, atk: 55, def: 40, mag: 55, res: 44, spd: 34, exp: 9999, gold: 9999,
      weak: [], skills: [{ id: 'e_chouxiang', w: 3 }, { id: 'e_memestorm', w: 3 }, { id: 'e_confuse', w: 2 }, { id: 'e_despair', w: 2 }], boss: true, super: true,
      lines: {
        start: '「你们找到我了。或者……是我允许你们找到我？嘟嘟嘟。」',
        taunt: [{ hp: 0.5, text: '「那么老的登们，接下来是什么梗来着？」' }],
      },
    },
  };
  // emoji 修正（上面个别占位）
  E.boar_mini.emoji = '🐖';
  E.boss_crab.drops = [{ id: 'i_hanbao', p: 1 }];
  D.enemies = E;

  /* ---------------- 商店 ---------------- */
  D.shops = {
    village: {
      name: '王婶小卖部', emoji: '🏪', greet: '王婶：哟，城里来的姑娘？要啥自己挑，婶给你算便宜点（并没有）。',
      stock: ['i_bandaid', 'i_hongyao', 'i_lanyao', 'i_huoxiang', 'i_fengyoujing', 'i_cola', 'i_latang', 'q_hongtian', 'a_buma', 'x_feiqiu'],
    },
    guild: {
      name: '公会补给处', emoji: '🏺', greet: '补给官：公会用度，童叟无欺。疯狂星期四券是战略物资，建议常备。',
      stock: ['i_hongyao', 'i_dayao', 'i_lanyao', 'i_mola', 'i_v50', 'i_catvideo', 'i_gouqi', 'i_luosi', 'a_piyi', 'x_xingyun'],
    },
    capital: {
      name: '王都百货商场', emoji: '🏬', greet: '店员：欢迎光临～本店支持七天无理由退换（武器开封后除外）。',
      stock: ['i_dayao', 'i_mola', 'i_naicha', 'i_cola', 'q_qingzhou', 'q_xigua', 'q_beike', 'q_1060', 'a_gexin', 'a_piyi', 'x_jiasu', 'x_huiyuan'],
    },
    mine: {
      name: '黑金镇铁匠铺', emoji: '⚒️', greet: '铁匠大叔：咱的货，矿洞里验过的货！老板跑了以后价格实惠。',
      stock: ['i_dayao', 'i_mola', 'i_v50', 'q_yinzhou', 'q_yueya', 'q_guike', 'q_2080', 'q_jundao', 'a_kaijia', 'a_shuiyi', 'x_baowen'],
    },
    beach: {
      name: '椰风湾杂货铺', emoji: '🏝️', greet: '老板娘：防晒霜要吗？不买也行，反正这世界的太阳不晒人，只晒梗。',
      stock: ['i_dayao', 'i_naicha', 'i_cola', 'i_fengyoujing', 'q_tiewan', 'q_4090', 'q_sanbian', 'a_shengyi', 'a_kaijia', 'x_ouhuang', 'x_maobo'],
    },
    sky: {
      name: '云端功德商店', emoji: '☁️', greet: '赛博商人：用功德换宝贝，童叟无欺。功德不够就去敲木鱼，本店只收赛博功德。',
      power: true,
      stock: ['i_yumao', 'x_ouhuang', 'x_wending', 'i_naicha', 'i_ningmeng', 'q_hhkb', 'q_xianyu', 'q_longlin', 'q_9090', 'q_shengjian'],
    },
  };
  // 功德价目（只有 sky 商店用）
  D.gongdePrice = { i_yumao: 200, x_ouhuang: 260, x_wending: 480, i_naicha: 120, i_ningmeng: 100, q_hhkb: 500, q_xianyu: 520, q_longlin: 500, q_9090: 520, q_shengjian: 540 };

  /* ---------------- 成就 ---------------- */
  D.ach = {
    first_blood: { name: '第一次的战斗', desc: '赢得第一场战斗。万事开头难，开头之后更难。' },
    ch0_done: { name: '社畜之魂', desc: '完成序章。欢迎来到异世界，这里的空气没有班味。' },
    ch2_done: { name: '森林普通话十级', desc: '完成第二章。' },
    ch4_done: { name: '反饼联盟', desc: '完成第四章。' },
    ch6_done: { name: '真相与长夜', desc: '完成第六章。' },
    ch7_done: { name: '云端之上', desc: '完成第七章。' },
    ch8_done: { name: '加班大厦整改完成', desc: '完成终章。' },
    shard_7: { name: '召唤神龙（误）', desc: '集齐7块梗之碎片。' },
    side_5: { name: '热心市民小满', desc: '完成5个委托。' },
    aff_max: { name: '最强羁绊', desc: '与所有伙伴的羁绊都达到8。' },
    karma_good: { name: '隐形的善良', desc: '人品值达到10。做好事是会攒人品的。' },
    first_die: { name: '这是flag，不是命运', desc: '第一次全灭。别慌，勇者都死过。' },
    die_10: { name: '死亡flag之王', desc: '全灭10次。你到底在立什么flag？' },
    kill_100: { name: '百人斩（？）', desc: '击败100个敌人。' },
    boss_10: { name: 'Boss收割机', desc: '击败10个Boss级敌人。' },
    muyu_10: { name: '功德初现', desc: '敲响10次电子木鱼。' },
    muyu_100: { name: '日行一善', desc: '敲响100次电子木鱼。' },
    muyu_1000: { name: '功德无量', desc: '敲响1000次电子木鱼。赛博佛陀就是你了。' },
    flee_10: { name: '退！退！退！', desc: '成功逃跑10次。战略性撤退也是战术。' },
    v50: { name: 'V我50', desc: '用疯狂星期四券复活队友。' },
    gacha_30: { name: '氪不改命', desc: '扭蛋30次。下次一定出金。' },
    fish_10: { name: '钓鱼佬永不空军', desc: '钓上10条鱼。' },
    rps_5: { name: '猜拳之心', desc: '猜拳赢5场。' },
    pot_30: { name: '药罐子', desc: '使用30次回复药。' },
    cola_10: { name: '肥宅快乐', desc: '喝掉10瓶快乐水。' },
    cat_pet: { name: '猫奴认证', desc: 'rua了柚子10次。' },
    meme_all: { name: '梗王之王', desc: '收录全部梗图鉴。你已经是梗百科编辑了。' },
    meme_30: { name: '梗百科见习编辑', desc: '收录30个梗。' },
    lv20: { name: '六级……不对，20级', desc: '小满达到20级。' },
    lv40: { name: '六边形战士', desc: '小满达到40级。' },
    rich: { name: '先定一个小目标', desc: '持有金币超过10000。' },
    play_3h: { name: '肝帝', desc: '累计游玩3小时。' },
    crit3: { name: '欧皇附体', desc: '单场战斗连续暴击3次。' },
    survive1: { name: '极限一换一', desc: '以1点生命值打赢一场Boss战。' },
    ch1_done: { name: '出村惊魂记', desc: '完成第一章。' },
    ch3_done: { name: '公会新人王', desc: '完成第三章。' },
    ch5_done: { name: '夏日整活祭', desc: '完成第五章。' },
    end_A: { name: '勇者的葬礼', desc: '到达结局A。有些仗打完，心是空的。' },
    end_B: { name: '到点下班', desc: '达成真结局。恭喜你，把魔王也捞下班了。' },
    end_C: { name: '打工皇帝', desc: '达成隐藏结局。你干嘛，哎哟。' },
    post_xuewang: { name: '雪山之巅', desc: '讨伐隐藏Boss雪王。' },
    post_kfc: { name: '星期四永恒', desc: '讨伐星期四之鸡真身。' },
    post_truck: { name: '卡车君的救赎', desc: '帮卡车君完成救赎。' },
    post_chouxiang: { name: '抽象的天花板', desc: '击败最强隐藏Boss抽象之主。' },
    all_clear: { name: '人生小满', desc: '达成真结局并通关全部隐藏Boss。人生不必满分，小满即万全。' },
  };

  /* ---------------- 扭蛋池 ---------------- */
  D.gacha = {
    cost: { gold: 100, gongde: 20 },
    pity: 10,
    pool: {
      3: ['q_qingzhou', 'q_xigua', 'q_guike', 'q_1060', 'a_gexin', 'x_feiqiu', 'x_jiasu', 'a_shuiyi'],
      4: ['q_yinzhou', 'q_yueya', 'q_tiewan', 'q_4090', 'q_jundao', 'a_kaijia', 'a_shengyi', 'x_ouhuang', 'x_baowen', 'x_maobo', 'x_huiyuan'],
      5: ['q_hhkb', 'q_xianyu', 'q_longlin', 'q_9090', 'q_shengjian', 'x_ouhuang'],
    },
    dupGold: { 3: 120, 4: 400, 5: 1200 },
  };
})();
