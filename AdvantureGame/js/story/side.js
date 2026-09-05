'use strict';
/* ============================================================
 * 支线委托：元数据 + 场景
 * 注册：G.sides['side'] 与 G.sides.quests
 * ============================================================ */
(() => {
  const S = { scenes: {} };
  G.sides['side'] = S;

  /* ---------------- 委托列表 ---------------- */
  G.sides.quests = [
    { id: 'q_leader', name: '寻猫启事·找「领导」', where: '木鱼村', loc: 'village', req: 'ch0_done', reward: '💰100 + 快乐水×2', desc: '村长家的猫「领导」又失踪了。悬赏寻猫，报酬面议（这次是真给）。', scene: 'side:q_leader' },
    { id: 'q_snail', name: '外卖骑手·闪电蜗牛', where: '木鱼村', loc: 'village', req: 'ch0_done', reward: '💰120 + 拉条×2', desc: '蜗牛外卖员被雨困住了，帮他送完三份订单（超时扣钱，但蜗牛不在乎）。', scene: 'side:q_snail' },
    { id: 'q_muyu', name: '功德竞争上岗', where: '木鱼村', loc: 'village', req: 'ch1_done', reward: '🥁功德50 + 枸杞茶×2', desc: '王婶和村长赌气，看谁敲的木鱼多。你被拉去当裁判，顺便贡献功德。', scene: 'side:q_muyu' },
    { id: 'q_naicha', name: '秋天的第一杯奶茶', where: '木鱼村', loc: 'village', req: 'ch1_done', reward: '🥤奶茶×2 + 人品+1', desc: '全村都在等秋天的第一杯奶茶。材料齐了：珍珠、茶底、还有一份……勇气？', scene: 'side:q_naicha' },
    { id: 'q_youzi', name: '柚子的金枪鱼传说', where: '迷雾森林', loc: 'forest', req: 'ch2_done', reward: '💗柚子羁绊+2 + 罐头', desc: '柚子听说迷雾森林深处有「传说中的猫罐头」。她嘴上说没有，尾巴出卖了她。', scene: 'side:q_youzi' },
    { id: 'q_dundun', name: '吨吨的龙王认证考试', where: '黑金镇', loc: 'mine_town', req: 'ch4_done', reward: '💗吨吨羁绊+2 + 大补汤', desc: '吨吨报名了「魔物进阶职业资格考试·龙王方向」。你是陪考，兼心理疏导师。', scene: 'side:q_dundun' },
    { id: 'q_qianji', name: '千机与开源之心', where: '上古图书馆', loc: 'library', req: 'ch6_done', reward: '💗千机羁绊+2 + 碎片情报', desc: '千机想在废弃的服务器深处找一样东西。她说不重要，但检索请求发了三千次。', scene: 'side:q_qianji' },
    { id: 'q_yase', name: '老亚瑟的膝盖圣药', where: '王都·咕咚城', loc: 'capital', req: 'ch4_done', reward: '💗老亚瑟羁绊+2 + 圣药', desc: '公会药房流传着一瓶「氨糖圣液」，专治三十年老膝盖。老亚瑟打死不肯自己去买。', scene: 'side:q_yase' },
    { id: 'q_keyboard', name: 'S级悬赏·键盘侠骑士团', where: '冒险者公会', loc: 'guild', req: 'ch3_done', reward: '💰600 + 风油精挂件', desc: '工坊区出现键盘侠骑士团，专喷路人不喷怪。公会重金悬赏，需要厚脸皮者应征。', scene: 'side:q_keyboard' },
    { id: 'q_icecream', name: '通缉·雪糕刺客', where: '冒险者公会', loc: 'guild', req: 'ch5_done', reward: '💰500 + 冰鲜柠檬水', desc: '冰柜连环伤人案告破！主犯是一根绿舌头。现已流窜至雪山方向，见到直接开打。', scene: 'side:q_icecream' },
    { id: 'q_rent', name: '王都房租危机', where: '王都·咕咚城', loc: 'capital', req: 'ch4_done', reward: '💰200 + 人品+2', desc: '房东把房租涨了三成，理由是「隔壁魔王都涨价了」。租客们决定推选你去谈判。', scene: 'side:q_rent' },
    { id: 'q_love', name: '情书快递（加急）', where: '王都·咕咚城', loc: 'capital', req: 'ch3_done', reward: '💰80 + 人品+1', desc: '阿强写了封情书，不敢当面给阿珍。信在你手里，任务是：别让信社死。', scene: 'side:q_love' },
    { id: 'q_chips', name: '女神的薯片', where: '天上界', loc: 'sky', req: 'ch7_done', reward: '🥁功德200 + 扭蛋券', desc: '薇薇安的限定薯片被表哥的报表压住了。帮她翻出来，功德大大的有。', scene: 'side:q_chips' },
    { id: 'q_fishing', name: '椰风湾钓鱼大赛', where: '椰风湾', loc: 'beach', req: 'ch5_done', reward: '💰300 + 神秘渔获', desc: '一年一度的钓鱼大赛！钓鱼佬永不空军！永不！', scene: 'side:q_fishing' },
    { id: 'q_hermit', name: '隐者的试炼', where: '迷雾森林', loc: 'forest', req: 'ch2_done', reward: '🤙欧皇之手 + 💰800', desc: '森林深处有个洞窟，里面住着一位隐者。据说他会考验每一个到访者——用最直接的方式。', scene: 'side:q_hermit' },
    { id: 'q_recipe', name: '王婶的祖传秘方', where: '木鱼村', loc: 'village', req: 'ch2_done', reward: '🧋奶茶×2 + 人品+2', desc: '王婶要复原失传的「十全大补汤·至尊版」，缺三味主料：魔力苏打、辣条、枸杞茶。理由是什么不重要。', scene: 'side:q_recipe' },
    { id: 'q_fashion', name: '整活穿搭大赛', where: '王都·咕咚城', loc: 'capital', req: 'ch3_done', reward: '🧋奶茶×2 + 💰260', desc: '街头主播要办「异世界穿搭周」，需要三件单品参考：西瓜刀、格子衫、保温杯。时尚圈的事，你不懂。', scene: 'side:q_fashion' },
    { id: 'q_stamp', name: '集章卡·八区域巡游', where: '全大陆', loc: 'guild', req: 'ch3_done', reward: '🧋奶茶×2 + 💰300 + 人品+2', desc: '公会给新人的福利：在8个不同区域摸过「存档水晶」（💠），即可领取巡游大奖。摸鱼，但合法。', scene: ' ' },
  ];

  /* ============================================================
   * 场景
   * ============================================================ */
  S.scenes.q_leader = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_leader' },
      { t: 'bg', v: 'village' },
      { t: 'd', w: '村长老木', e: '👴', v: '「领导又不见啦！这猫，饭点比谁都准时，今天居然没来。姑娘，帮我找找？」<br>「上次它在稻草人后面蹲了一整天，说是『体验基层』。」' },
      { t: 'if', v: { flag: 'leader_found', then: 'side:q_leader_done' } },
      { t: 'bg', v: 'farm' },
      { t: 'n', v: '农田重访。野猪王倒了，稻草人还在。<br>稻草人的帽檐下，露出半截橘色的尾巴。' },
      { t: 'd', w: '领导', e: '🐈', v: '「喵。」（它抬头看了你一眼，又把头缩了回去。翻译：换届期间，谢绝探访。）' },
      { t: 'd', w: '林小满', e: '👧', v: '（掏出猫罐头晃了晃）领导，下班了。回家吃饭。' },
      { t: 'd', w: '领导', e: '🐈', v: '「喵！」（它光速出洞，叼住罐头，用尾巴尖示意你跟上。领导就是领导，顺坡下驴的水平一流。）' },
      { t: 'flag', k: 'leader_found', v: true },
      { t: 'goto', v: 'side:q_leader_done' },
    ],
  };
  S.scenes.q_leader_done = {
    next: null,
    steps: [
      { t: 'bg', v: 'village' },
      { t: 'd', w: '村长老木', e: '👴', v: '「哎呦！领导回来啦！姑娘你真是……等等，它叼着的是我的午饭？」' },
      { t: 'quest', v: 'q_leader', s: 'done' },
      { t: 'gold', v: 100 },
      { t: 'give', v: 'i_cola', n: 2, quiet: true },
      { t: 'karma', v: 1 },
      { t: 'd', w: '林小满', e: '👧', v: '（报酬到账。领导，你的差旅报销单我会帮你填的。）' },
      { t: 'world' },
    ],
  };

  S.scenes.q_snail = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_snail' },
      { t: 'bg', v: 'village' },
      { t: 'd', w: '闪电蜗牛', e: '🐌', v: '「您好……您的……订单……」（它背着三个外卖箱，爬了三步，滑回来两步。）<br>「还有三单……超时……就要扣钱……」' },
      { t: 'd', w: '林小满', e: '👧', v: '（看着它的速度，你陷入了沉思。这份外卖送到的时候，奶茶都过季了。）<br>这样，我帮你送。你给我指路就行。' },
      { t: 'd', w: '闪电蜗牛', e: '🐌', v: '「真的吗！！您是天使吗！！第一单，村口王婶，备注：不要香菜——但我没带香菜，所以这条可以无视。」' },
      { t: 'n', v: '送单开始。村口的王婶接过外卖，顺便往你手里塞了颗糖。<br>第二单是村长的，他打开餐盒检查了三遍有没有被偷吃。<br>第三单的收货人写的是「领导」，收货地址：村长家房顶。' },
      { t: 'd', w: '林小满', e: '👧', v: '（爬房顶送外卖。我在上辈子都没干过这么拼的事。）<br>领导！你的外卖！给您放门口了！' },
      { t: 'd', w: '闪电蜗牛', e: '🐌', v: '「五星好评！！全部五星！！这是您的好评返现，还有……（它摘下头盔）<br>「其实我以前是跑得很快的。快到看不见朋友。后来我慢下来了，才发现路上全是花。」' },
      { t: 'quest', v: 'q_snail', s: 'done' },
      { t: 'gold', v: 120 },
      { t: 'give', v: 'i_latang', n: 2, quiet: true },
      { t: 'karma', v: 1 },
      { t: 'd', w: '林小满', e: '👧', v: '（慢下来，路上全是花。……这台词，值得写进企划案。）' },
      { t: 'world' },
    ],
  };

  S.scenes.q_muyu = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_muyu' },
      { t: 'bg', v: 'village' },
      { t: 'd', w: '王婶', e: '👵', v: '「姑娘！你来得正好！老木那个老登说他敲木鱼比你婶子强？<br>你给评评理！一人替我们敲五十下，谁敲得响算谁赢！」' },
      { t: 'd', w: '村长老木', e: '👴', v: '「胡说！木鱼比的是心意！……当然响也很重要。姑娘，帮我敲！」' },
      { t: 'd', w: '林小满', e: '👧', v: '（上辈子敲了三年电子木鱼的菜鸟，第一次摸实体木鱼，手有点抖。）<br>两位长辈，看好了。功德，时间到。' },
      { t: 'muyu' },
      { t: 'gongde', v: 50 },
      { t: 'quest', v: 'q_muyu', s: 'done' },
      { t: 'give', v: 'i_gouqi', n: 2, quiet: true },
      { t: 'd', w: '王婶&村长', e: '👴', v: '「「好——！！」（两人同时鼓掌，然后同时瞪向对方。）<br>「「明明是我赢——」」' },
      { t: 'd', w: '林小满', e: '👧', v: '（二位，功德不分先后，快乐不分你我。……快打起来了，溜了。）' },
      { t: 'world' },
    ],
  };

  S.scenes.q_naicha = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_naicha' },
      { t: 'bg', v: 'village' },
      { t: 'd', w: '王婶', e: '👵', v: '「秋天到了！全村都在等秋天的第一杯奶茶！<br>珍珠有了，茶底有了，就差最后一样——冰！」<br>「农田那口老井里有千年寒冰，就是守井的野猪不太讲理。」' },
      { t: 'bg', v: 'farm' },
      { t: 'battle', v: { enemies: ['boar_mini', 'boar_mini', 'boar_mini'], bg: 'farm', intro: '守井野猪群拦住了去路！（为了全村的仪式感，拼了！）' } },
      { t: 'n', v: '你从井里捞出了千年寒冰（其实就是块特别凉的石头）。<br>王婶把它丢进茶桶，全村人手一杯，坐在村口看夕阳。' },
      { t: 'd', w: '柚子', e: '🐱', v: '「呸，是奶茶，本喵不爱喝……再给本喵来一杯。」' },
      { t: 'meme', v: 'naicha' },
      { t: 'quest', v: 'q_naicha', s: 'done' },
      { t: 'give', v: 'i_naicha', n: 2, quiet: true },
      { t: 'karma', v: 1 },
      { t: 'd', w: '村长老木', e: '👴', v: '「丫头，这杯敬你。秋天快乐。」' },
      { t: 'world' },
    ],
  };

  S.scenes.q_youzi = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_youzi' },
      { t: 'bg', v: 'forest' },
      { t: 'bgm', v: 'forest' },
      { t: 'd', w: '柚子', e: '🐱', v: '「咳、咳咳。本喵只是恰好路过这里。恰好。路过。」<br>「……好吧！传说是真的！森林深处有个『猫神瀑布』，瀑布下面供着『传说中的猫罐头』！<br>「至尊金枪鱼！开罐香气能传三里地！每只猫梦里的味道！」<br>「你要是敢笑，本喵就再也不理你了！」' },
      { t: 'd', w: '林小满', e: '👧', v: '（忍笑忍到内伤。）不笑不笑，梦想值得尊重。走，找瀑布去。<br>你说那个罐头……不会也有守卫吧？' },
      { t: 'n', v: '猫神瀑布，水声如雷。<br>供台上的确摆着一个罐头，罐头前面的石头上，趴着一只巨大的乌龟。' },
      { t: 'd', w: '已读不回龟', e: '🐢', v: '「……」（它缓缓睁开眼，看了看你们，又缓缓闭上。它在原地趴了三百年，传说它是在等猫神回信。）' },
      { t: 'd', w: '柚子', e: '🐱', v: '「它不让路！但也不攻击！这是……这是猫界最残忍的守护方式：比耐心！」<br>「本喵的耐心是有限的！！人类，帮我想想办法！」' },
      {
        t: 'choice',
        v: [
          { label: '打一架，物理沟通', goto: 'side:youzi_fight' },
          { label: '写一封信，替猫神回信', goto: 'side:youzi_letter', karma: 1 },
        ],
      },
    ],
  };

  S.scenes.youzi_fight = {
    next: null,
    steps: [
      { t: 'battle', v: { enemies: ['turtle_noreply'], bg: 'forest', intro: '已读不回龟慢吞吞地缩回了壳——然后以龟速撞了过来！' } },
      { t: 'd', w: '已读不回龟', e: '🐢', v: '「……」（它终于让开了路，眼角似乎有点湿润。）' },
      { t: 'give', v: 'k_leader', n: 1 },
      { t: 'aff', w: 'youzi', v: 2 },
      { t: 'meme', v: 'yiduluanhui' },
      { t: 'quest', v: 'q_youzi', s: 'done' },
      { t: 'n', v: '柚子抱着至尊金枪鱼罐头，在瀑布下坐了整整一个下午。<br>她没有开罐。她说，留给第一次带她冒险的人类一家当镇店之宝。<br>——当然，嘴上说的是「本喵在减肥」。<br>罐头后来被供在了旅行社的橱窗里。' },
      { t: 'd', w: '柚子', e: '🐱', v: '「人类……谢谢你。今天的账，本喵记下了。别、别误会，不是钱，是人情！」' },
      { t: 'world' },
    ],
  };

  S.scenes.youzi_letter = {
    next: null,
    steps: [
      { t: 'n', v: '你撕下一页笔记本，写了一封信，放在乌龟面前：<br>「猫神已收到你的三百年的等待。她一直都在，在你每一次抬头看月亮的时候。——代笔」' },
      { t: 'n', v: '乌龟读完信，沉默了很久很久。<br>然后它做了一件让全队破防的事：它朝着月亮的方向，深深低了低头，让开了路。' },
      { t: 'd', w: '柚子', e: '🐱', v: '「……人类。你刚才那封信，比任何剑都锋利。」<br>「本喵决定了！罐头分你一半！……等等，罐头只有一个。那就分你三成！两成！喂你别走啊！」' },
      { t: 'give', v: 'k_leader', n: 1 },
      { t: 'aff', w: 'youzi', v: 2 },
      { t: 'quest', v: 'q_youzi', s: 'done' },
      { t: 'n', v: '回到村子后，柚子把罐头供在了自己床头。她说要留到「最重要的日子」再开。<br>后来那个最重要的日子，是旅行社开业那天。罐头摆在柜台正中央，谁来了都要讲一遍这个故事。' },
      { t: 'world' },
    ],
  };

  S.scenes.q_dundun = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_dundun' },
      { t: 'bg', v: 'mine_town' },
      { t: 'd', w: '考官', e: '🧐', v: '「魔物进阶职业资格考试·龙王方向，开始！<br>考生：吨吨。监考人：一名。应试人心理状态：紧张到弹性形变。」' },
      { t: 'd', w: '吨吨', e: '🟢', v: '「小满姐……吨吨手心全是黏液……啊不对，吨吨全身都是黏液……」' },
      { t: 'd', w: '林小满', e: '👧', v: '（拍拍它，嗯，一手黏液。）深呼吸。你的梦想是110分贝的，别让它掉到90。' },
      { t: 'd', w: '考官', e: '🧐', v: '『第一题』：龙之逆鳞，长在哪里？<br>A 喉咙下方 B 尾巴尖 C 逆着摸的地方（位置保密）' },
      {
        t: 'choice',
        v: [
          { label: 'A 喉咙下方', goto: 'side:dundun_q2', flag: { dundunExam: 1 } },
          { label: 'C 逆着摸都算，龙说得算', goto: 'side:dundun_q2', flag: { dundunExam: 3 } },
          { label: 'B 尾巴尖，本喵认证', goto: 'side:dundun_q2', flag: { dundunExam: 2 } },
        ],
      },
    ],
  };

  S.scenes.dundun_q2 = {
    next: null,
    steps: [
      { t: 'd', w: '考官', e: '🧐', v: '『第二题』：作为龙王，属下史莱姆集体要求加薪（多分地下洞），你该？' },
      {
        t: 'choice',
        v: [
          { label: '「跟我干，明年全员进化蛟龙」', goto: 'side:dundun_q3', flag: { dundunExam2: 1 } },
          { label: '「洞一人一半，龙王也不能搞特殊」', goto: 'side:dundun_q3', flag: { dundunExam2: 3 }, karma: 1 },
          { label: '「都听我的，我把宝库挖给大家」', goto: 'side:dundun_q3', flag: { dundunExam2: 2 } },
        ],
      },
    ],
  };

  S.scenes.dundun_q3 = {
    next: null,
    steps: [
      { t: 'd', w: '考官', e: '🧐', v: '『最终题』：请现场表演「龙之咆哮」。<br>评分标准：气势70%，音量20%，是否真的像龙10%。' },
      { t: 'd', w: '吨吨', e: '🟢', v: '「喝啊啊啊啊啊——吼！！！」<br>（史莱姆全身绷紧，弹起半米，发出一声……软软的「波——咪——」。<br>考场安静了三秒。）' },
      { t: 'd', w: '林小满', e: '👧', v: '（完了。这声音连隔壁洞的蝙蝠都逗笑了……）' },
      { t: 'd', w: '考官', e: '🧐', v: '（他在评分表上写了很久很久。然后抬起头。）<br>「气势，70分。音量，20分。是否像龙——」<br>「0分。但本考官从业三百年，第一次听到有史莱姆敢吼出声。<br>总分90。通过。恭喜你，见习龙王。」' },
      { t: 'd', w: '吨吨', e: '🟢', v: '「呜哇啊啊啊——！！通过啦！！我是龙……见习龙王啦！！」<br>（它抱着证书疯狂弹跳，考官的帽子被掀飞了三次。）' },
      { t: 'quest', v: 'q_dundun', s: 'done' },
      { t: 'give', v: 'i_dayao', n: 2, quiet: true },
      { t: 'aff', w: 'dundun', v: 2 },
      { t: 'd', w: '吨吨', e: '🟢', v: '「证书上面写着：『该史莱姆的咆哮，独一无二』。<br>独一无二……吨吨要把它裱起来！」' },
      { t: 'd', w: '林小满', e: '👧', v: '（独一无二。是啊，谁规定龙必须是什么声音呢。）' },
      { t: 'world' },
    ],
  };

  S.scenes.q_qianji = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_qianji' },
      { t: 'bg', v: 'library' },
      { t: 'bgm', v: 'dungeon' },
      { t: 'd', w: '千机', e: '📕', v: '「图书馆B4层，废弃服务器机房。就是……我被『优化』的地方。」<br>「有一样东西没被回收。我说不重要。但我的检索日志显示，我在这一个月里，向自己发送了三千次查询。」<br>「查询内容是同一个词：『心』。」' },
      { t: 'n', v: 'B4层，黑暗中闪烁着零星的动力灯。<br>机架的缝隙深处，有一颗水晶在发光——心脏的形状，温柔地搏动着。' },
      { t: 'battle', v: { enemies: ['server_rack', 'firewall_imp'], bg: 'library', intro: '守卫旧机房的防火墙启动了！' } },
      { t: 'give', v: 'k_kaiyuan' },
      { t: 'card', emoji: '💗', name: '开源之心', desc: '水晶底座上刻着一行小字：「Knowledge belongs to everyone.——千机计划·第一行注释」<br>写下这行字的工程师，把最温柔的一行代码，留给了她。' },
      { t: 'd', w: '千机', e: '📕', v: '「拿到了。……原来项目组不是没给我心，是把心锁在了机房。<br>他们走得太急，忘了。或者，是故意留的。」<br>「无论是哪种——我原谅他们了。因为拿着它的感觉，很暖。」' },
      { t: 'quest', v: 'q_qianji', s: 'done' },
      { t: 'aff', w: 'qianji', v: 2 },
      { t: 'meme', v: 'yuanShen' },
      { t: 'd', w: '千机', e: '📕', v: '「从今天起，我的技能列表里多了一条底层数据：<br>『答不上来的时候，就问身边的人。』」' },
      { t: 'world' },
    ],
  };

  S.scenes.q_yase = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_yase' },
      { t: 'bg', v: 'capital' },
      { t: 'd', w: '阿珍', e: '💁', v: '「氨糖圣液？有的有的，公会药房镇店之宝。<br>但申购表要填三份，还要老会员本人来签……他上次听到『填表』两个字就走了。」' },
      { t: 'd', w: '林小满', e: '👧', v: '（果然。这大叔，装了一辈子豁达，最怕的居然是填表。）<br>表格我来填。签名的事……交给我。' },
      { t: 'n', v: '你替老亚瑟填了三份表格。在「既往病史」一栏，你写：<br>「膝盖中过一箭（史称）。无碍，仍在前线。」<br>药房的大叔看到这行字，什么也没说，多塞了两贴膏药进袋子。' },
      { t: 'give', v: 'k_antang' },
      { t: 'bg', v: 'tavern' },
      { t: 'd', w: '老亚瑟', e: '🧔', v: '「你、你去买了？谁让你去的！……多少钱，我给你。」<br>「（他嘴上骂骂咧咧，拧开瓶盖的手却很轻，像怕惊醒什么。）」<br>「……三十年了。第一次觉得，这膝盖还能再战三十年。」' },
      { t: 'aff', w: 'yase', v: 2 },
      { t: 'quest', v: 'q_yase', s: 'done' },
      { t: 'give', v: 'i_hongyao', n: 3, quiet: true },
      { t: 'd', w: '老亚瑟', e: '🧔', v: '「丫头，谢了。……下次酒钱我出。真的。」' },
      { t: 'world' },
    ],
  };

  S.scenes.q_keyboard = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_keyboard' },
      { t: 'bg', v: 'factory' },
      { t: 'd', w: '阿珍', e: '💁', v: '「S级悬赏：键盘侠骑士团，盘踞工坊区，见人就喷。<br>已有三位冒险者应征，出来以后去开了网店卖键盘。你们，慎重。」' },
      { t: 'n', v: '工坊区街角，一群骑着浮空键盘的骑士围了上来。<br>为首的骑士高高举起键盘，敲出一串弹幕：「就这？」「不如XX」「急了急了」' },
      { t: 'd', w: '柚子', e: '🐱', v: '「嘴这么臭！本喵要给他们都洗洗嘴！」' },
      { t: 'battle', v: { enemies: ['keyboard_warrior', 'keyboard_warrior', 'parrot_gangjing'], bg: 'factory', intro: '键盘侠骑士团发起了火力覆盖——全是阴阳怪气！' } },
      { t: 'd', w: '林小满', e: '👧', v: '（赢了。地上散落的键盘，每台都在自动输入「对不起」。<br>原来他们心里，也知道自己讨人嫌啊。）' },
      { t: 'quest', v: 'q_keyboard', s: 'done' },
      { t: 'gold', v: 600 },
      { t: 'give', v: 'x_jiasu', n: 1, quiet: true },
      { t: 'meme', v: 'laoLiu' },
      { t: 'd', w: '千机', e: '📕', v: '「战利品分析：这些键盘的轴体，全是静音轴。<br>嘴上轰轰烈烈，手上安安静静。人类真是……矛盾的集合体。」' },
      { t: 'world' },
    ],
  };

  S.scenes.q_icecream = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_icecream' },
      { t: 'bg', v: 'guild' },
      { t: 'd', w: '阿珍', e: '💁', v: '「通缉令更新：雪糕刺客老大『绿舌头』，最后出现在雪山。<br>提醒：它伪装成正常雪糕。识别方法是——结账的时候，看价格是否会心一凉。」' },
      { t: 'bg', v: 'snow_mountain' },
      { t: 'n', v: '雪山脚下的无人冰柜前，一根绿油油的雪糕躺在角落，<br>标签上写着：『超值特价，2元』。' },
      { t: 'd', w: '吨吨', e: '🟢', v: '「两块钱！好便宜！吨吨想吃——」<br>「等等！！价格下面还有一行小字：『刺』？！」' },
      { t: 'battle', v: { enemies: ['icecream_assassin', 'icecream_assassin'], bg: 'snow', intro: '两根雪糕刺客同时拔刀！「我们从来不暗杀，我们只是明码标价的刀。」' } },
      { t: 'meme', v: 'chuanSong' },
      { t: 'quest', v: 'q_icecream', s: 'done' },
      { t: 'gold', v: 500 },
      { t: 'give', v: 'i_ningmeng', n: 2, quiet: true },
      { t: 'd', w: '柚子', e: '🐱', v: '「通缉令完成了！回去领赏！<br>对了，大家记住：这个世界上，越便宜的东西越危险——除了快乐水。」' },
      { t: 'world' },
    ],
  };

  S.scenes.q_rent = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_rent' },
      { t: 'bg', v: 'capital' },
      { t: 'd', w: '房东', e: '🧔', v: '「涨房租怎么了？！隔壁魔王都涨价了！<br>加班大厦一个床位月租五十金币，我这带窗的才三十！我良心价！」' },
      { t: 'd', w: '租客小弟', e: '🧑', v: '「可是大人，魔王城已经改名下班塔了呀……」' },
      { t: 'd', w: '房东', e: '🧔', v: '「那、那是市场行情！反正……反正我也要养老！」<br>（他嘴硬着，眼神却飘忽。他身后，堆着没收上来的房租欠条，落满灰。）' },
      {
        t: 'choice',
        v: [
          { label: '「您看这份『下班塔商圈升值报告』」', goto: 'side:rent_smart', karma: 1 },
          { label: '「那我们也去住魔王城了，五十金币包晚饭」', goto: 'side:rent_funny' },
        ],
      },
    ],
  };

  S.scenes.rent_smart = {
    next: null,
    steps: [
      { t: 'n', v: '你掏出千机连夜做的报告：下班塔日均客流两千，<br>沿街商铺空置率三成，唯一稳赚的是——『平价长租』。<br>房东看了三遍，又看了看自己空了两间的楼。' },
      { t: 'd', w: '房东', e: '🧔', v: '「……降！降租！但说好了，你们要帮我引客流！」<br>「哎，人老了就怕楼空。楼一空，人就慌。」' },
      { t: 'quest', v: 'q_rent', s: 'done' },
      { t: 'gold', v: 200 },
      { t: 'karma', v: 2 },
      { t: 'd', w: '租客小弟', e: '🧑', v: '「英雄！您就是英雄！这杯奶茶您必须收下！」' },
      { t: 'meme', v: 'daoDian' },
      { t: 'world' },
    ],
  };

  S.scenes.rent_funny = {
    next: null,
    steps: [
      { t: 'd', w: '房东', e: '🧔', v: '「住魔王城？！那儿、那儿闹鬼！」' },
      { t: 'd', w: '林小满', e: '👧', v: '鬼？我们上周刚把魔王城最层的Boss全清了。<br>现在那地方唯一的鬼，是您涨租的勇气。' },
      { t: 'd', w: '房东', e: '🧔', v: '「……降。这就降。二位英雄以后来城里，住宿费——全免！」' },
      { t: 'quest', v: 'q_rent', s: 'done' },
      { t: 'gold', v: 200 },
      { t: 'karma', v: 1 },
      { t: 'meme', v: 'houyan' },
      { t: 'world' },
    ],
  };

  S.scenes.q_love = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_love' },
      { t: 'bg', v: 'capital' },
      { t: 'd', w: '阿强', e: '💂', v: '（他把信塞给小满，脸红到耳根）<br>「这、这封信，帮我给阿珍。直接给！别绕弯！也别说是我写的！」<br>「……落款你帮我写成『匿名』。不，写『关心你的城卫军』。也不对——你看着办！！」' },
      { t: 'bg', v: 'guild' },
      { t: 'n', v: '公会柜台。阿珍正在给委托板换新告示。<br>信递过去的瞬间，整个大厅突然安静了——所有人都竖起了耳朵。' },
      { t: 'd', w: '阿珍', e: '💁', v: '「给我的？」（她拆信的手顿了顿。）<br>「『自见你第一面起，我的剑就没有再卷过刃。』……哈，这文采。」' },
      { t: 'd', w: '阿珍', e: '💁', v: '（她抬起头，耳根也红了，但嘴角翘得比委托板还高。）<br>「回信就不必了。今晚食堂，我请客。让他别迟到——迟到扣分。」' },
      { t: 'd', w: '林小满', e: '👧', v: '（任务完成。今天的瓜：城卫军×公会前台，官宣预定了。）<br>（顺便，这份『别让信社死』的压力，比打Boss还大。）' },
      { t: 'quest', v: 'q_love', s: 'done' },
      { t: 'gold', v: 80 },
      { t: 'karma', v: 1 },
      { t: 'meme', v: 'sheSi' },
      { t: 'world' },
    ],
  };

  S.scenes.q_chips = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_chips' },
      { t: 'bg', v: 'heaven' },
      { t: 'd', w: '薇薇安', e: '🌸', v: '「呜呜呜我的限定薯片！！『加班和解味』全大陆就这一箱！！<br>被表哥的报表山压在最底下！一翻就塌！你帮帮我！！」' },
      { t: 'n', v: '报表山，由十万张A4纸构成，抽一张，塌一层。<br>千机测算后表示：蛮力不行，需要抽积木的手法。' },
      { t: 'qte', v: { title: '📄 拆报表山', desc: '稳住手！抽对正确的报表！', count: 6, time: 1600 } },
      { t: 'give', v: 'k_shupian' },
      { t: 'd', w: '薇薇安', e: '🌸', v: '「薯片——！！我的命回来了！」<br>（她抱住薯片箱转了三圈，然后极其郑重地掰了一半递给你。）<br>「吃！女神请客！这一半是全大陆最贵的薯片！」' },
      { t: 'quest', v: 'q_chips', s: 'done' },
      { t: 'gongde', v: 200 },
      { t: 'd', w: '薇薇安', e: '🌸', v: '「对了，功德商店给你开个VIP：扭蛋机十连保底升成金色保底——<br>骗你的，天界没有这种业务。但是功德+200是真的！」' },
      { t: 'meme', v: 'aiQian' },
      { t: 'world' },
    ],
  };

  S.scenes.q_fishing = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_fishing' },
      { t: 'bg', v: 'beach' },
      { t: 'd', w: '钓鱼佬老钓', e: '🎣', v: '「小姑娘，参赛吗？规矩简单：钓上来什么算什么。<br>去年冠军钓上来一只靴子，因为靴子里有只螃蟹。我们评委一致认为那叫『惊喜』。」' },
      { t: 'fish' },
      { t: 'fish' },
      { t: 'fish' },
      { t: 'n', v: '三竿落定。老钓看完你的渔获，摘下帽子，郑重地擦了擦。<br>「三大条全中。姑娘，你要不要考虑转行？这行很卷，但你明显是天赋型。」' },
      { t: 'quest', v: 'q_fishing', s: 'done' },
      { t: 'gold', v: 300 },
      { t: 'give', v: 'i_naicha', n: 1, quiet: true },
      { t: 'meme', v: 'dianziyuzhui' },
      { t: 'd', w: '林小满', e: '👧', v: '（转行就不必了。不过钓鱼确实快乐——比我们公司团建快乐一百倍。）' },
      { t: 'world' },
    ],
  };

  /* ---------------- 隐者的试炼 ---------------- */
  S.scenes.q_hermit = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_hermit' },
      { t: 'bg', v: 'forest' },
      { t: 'bgm', v: 'dungeon' },
      { t: 'n', v: '隐者洞窟，越往里走越安静。<br>洞窟尽头，一个盘腿而坐的身影悬浮在离地三寸的地方，胡须无风自动。' },
      { t: 'd', w: '隐者', e: '🥋', v: '「唔。有客。自讨伐魔王之后，你是第一个找到这里的。」<br>「想学老夫的绝世武功？想拿老夫的传家宝？可以。先接我三十年功力。」' },
      { t: 'd', w: '林小满', e: '👧', v: '（扫地僧规格的登场……这位绝对是隐藏高手。）<br>前辈请指教！' },
      { t: 'ckpt', v: 'q_hermit' },
      {
        t: 'battle',
        v: {
          enemies: ['boss_hermit'], boss: true, bg: 'dungeon',
          intro: '隐者之影踏前一步——三十年功力，接好了！',
        },
      },
      { t: 'd', w: '隐者', e: '🥋', v: '「好！好一个——到点下班拳。」<br>「老夫隐居三十年，就是在等一个能把『下班』打出气势的人。这个给你。」' },
      { t: 'give', v: 'x_ouhuang', n: 1 },
      { t: 'gold', v: 800 },
      { t: 'quest', v: 'q_hermit', s: 'done' },
      { t: 'flag', k: 'q_hermit_done', v: true },
      { t: 'ach', v: 'ch3_done' },
      { t: 'meme', v: 'xinmeier' },
      { t: 'd', w: '隐者', e: '🥋', v: '「欧皇之手，摸过的卡包全是金。老夫搓了三十年itempty成为欧皇，没成。你拿去。」<br>「——对了，帮老夫把门口的『闲人免进』牌子翻个面，写『欢迎光临』。」' },
      { t: 'world' },
    ],
  };

  /* ---------------- 王婶的祖传秘方 ---------------- */
  S.scenes.q_recipe = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_recipe' },
      { t: 'bg', v: 'village' },
      { t: 'd', w: '王婶', e: '👵', v: '「姑娘！婶要复原失传的『十全大补汤·至尊版』！<br>就缺三味主料：魔力苏打、辣条、枸杞茶！」' },
      { t: 'd', w: '林小满', e: '👧', v: '（这是什么黑暗料理组合……）<br>婶，这真的是祖传的？' },
      { t: 'd', w: '王婶', e: '👵', v: '「废话！祖传！你太爷爷的爷爷那辈传下来的！」<br>「……好吧，是婶上礼拜刷到的短视频。但评论区都说好！」' },
      { t: 'if', v: { item: 'i_mola', then: 'side:recipe2' } },
      { t: 'd', w: '王婶', e: '👵', v: '「魔力苏打没有？杂货铺有卖，或者去天上界功德商店——算了你先攒钱吧。」' },
      { t: 'world' },
    ],
  };

  S.scenes.recipe2 = {
    next: null,
    steps: [
      { t: 'if', v: { item: 'i_latang', then: 'side:recipe3' } },
      { t: 'd', w: '王婶', e: '👵', v: '「辣条也没有？！孩子，辣条是勇气！没有辣条怎么行！」' },
      { t: 'world' },
    ],
  };

  S.scenes.recipe3 = {
    next: null,
    steps: [
      { t: 'if', v: { item: 'i_gouqi', then: 'side:recipe_done' } },
      { t: 'd', w: '王婶', e: '👵', v: '「枸杞茶！保温杯里泡的那种！没有枸杞的养生是没有灵魂的！」' },
      { t: 'world' },
    ],
  };

  S.scenes.recipe_done = {
    next: null,
    steps: [
      { t: 'lose', v: 'i_mola' },
      { t: 'lose', v: 'i_latang' },
      { t: 'lose', v: 'i_gouqi' },
      { t: 'n', v: '王婶把三样东西倒进同一口锅，点燃灶火，捂着耳朵跑了。<br>十分钟后，锅里传出一种介于「汤」和「事件」之间的气味。' },
      { t: 'd', w: '王婶', e: '👵', v: '「成了！！婶尝一口——」（她抿了一小口，瞳孔地震）<br>「……难喝。难喝到，特别提神！这就是传说中的，口味即王道！」' },
      { t: 'meme', v: 'zhensiang' },
      { t: 'quest', v: 'q_recipe', s: 'done' },
      { t: 'give', v: 'i_naicha', n: 2, quiet: true },
      { t: 'karma', v: 2 },
      { t: 'd', w: '王婶', e: '👵', v: '「这两杯正经奶茶你拿着，婶改行了，改卖正常的东西。」<br>「……大约能坚持一个礼拜。」' },
      { t: 'world' },
    ],
  };

  /* ---------------- 整活穿搭大赛 ---------------- */
  S.scenes.q_fashion = {
    next: null,
    steps: [
      { t: 'quest', v: 'q_fashion' },
      { t: 'bg', v: 'capital' },
      { t: 'd', w: '街头主播', e: '🤳', v: '「家人们！异世界穿搭周缺三件镇场单品！<br>西瓜刀！格子衫！保温杯！有货的家人私信我！」' },
      { t: 'd', w: '林小满', e: '👧', v: '（这三件……我这全都有啊。等等，这不就是我的日常穿搭吗？）<br>（行李店买的、公会领的、还有大叔送的那个保温杯……）' },
      { t: 'if', v: { item: 'q_xigua', then: 'side:fashion2' } },
      { t: 'd', w: '街头主播', e: '🤳', v: '「西瓜刀还没有？商店里有货！水果自由懂不懂！」' },
      { t: 'world' },
    ],
  };

  S.scenes.fashion2 = {
    next: null,
    steps: [
      { t: 'if', v: { item: 'a_gexin', then: 'side:fashion3' } },
      { t: 'd', w: '街头主播', e: '🤳', v: '「格子衫！程序员の圣衣！穿上它，Bug 绕着你走！」' },
      { t: 'world' },
    ],
  };

  S.scenes.fashion3 = {
    next: null,
    steps: [
      { t: 'if', v: { item: 'x_baowen', then: 'side:fashion_done' } },
      { t: 'd', w: '街头主播', e: '🤳', v: '「保温杯！枸杞的伴侣！中年的勋章！黑铁镇的铁匠铺有！」' },
      { t: 'world' },
    ],
  };

  S.scenes.fashion_done = {
    next: null,
    steps: [
      { t: 'n', v: '主播看到三件套，激动得差点把云台扔了。<br>当天的直播标题：《打工风穿搭赏析——这赛季的最强整活》。' },
      { t: 'd', w: '街头主播', e: '🤳', v: '「家人们！这就叫格调！西瓜刀开路，格子衫护体，保温杯里泡的是岁月！」<br>「主播宣布：你的穿搭，就是这个赛季的最强整活！赏金拿好！」' },
      { t: 'quest', v: 'q_fashion', s: 'done' },
      { t: 'give', v: 'i_naicha', n: 2, quiet: true },
      { t: 'gold', v: 260 },
      { t: 'meme', v: 'xianyanbao' },
      { t: 'world' },
    ],
  };
})();
