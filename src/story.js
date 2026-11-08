const RELIC_TEXT = {
  cup: '一只倒扣着的茶碗',
  portrait: '半张画着陌生脸孔的画像',
  plaque: '一枚清源派的旧门牌',
};

const LEGACY = { paper: 'cup', ticket: 'portrait', coin: 'plaque' };

/* 平台存档里能对上 3D 实物的，只有这三样；熔岩核心等外来道具按存档原名保留 */
const RELIC_VIS = { cup: true, portrait: true, plaque: true };

const HANDOFF_ITEM = {
  id: 'team23_knife',
  name: '阿七师父的刀',
  type: 'weapon',
  desc: '故人留在桌上的刀。刀鞘还沾着听雨楼的雪，握柄却认得你的手。',
  effect: { stat: 'attack', value: 1, trigger: 'passive' },
};
const HANDOFF_CLUE = '三方要的不是阿七，是你带来的东西';
const EXIT_HOOK = '他握着阿七师父的刀走出雪夜，前方另一座世界的门已经打开。';

const CN = ['零', '一', '二', '三', '四', '五'];
const CN_NUM = { 5: '五', 6: '六', 7: '七', 8: '八' };

/* 三杯酒：刀客、捕快、故人。第三杯由故人接手，不判。 */
const WINE = {
  captain: {
    name: '捕快',
    open: '皂衣客把扣着的酒碗翻过来，推到你手边。\n刀靠桌腿，鞘上还覆着一层雪。',
    ask: '他盯着你的手，只说了三个字：',
    pick: [
      { label: '手稳稳倒满，什么也不问。' },
      { label: '先问一句：「今夜封城？」' },
    ],
    reply: [
      '他没答。眼睛一直落在你的虎口上。',
      '「封了。」他说，「楼里人，一个都别走。」',
    ],
    hit: '他把碗端起来，闻了一下，没喝。\n「你这双手，不像端酒的。」',
    miss: '酒溅在桌上。他没看酒，只看你。\n「手抖什么？」',
  },
  hunter: {
    name: '刀客',
    open: '靠窗那位把长刀横在膝上，刀鞘磕了一下桌沿。\n赏榜压在手肘下面，纸角露出两个字：活口。',
    ask: '他敲了敲碗沿，眼睛没抬：',
    pick: [
      { label: '「客官说笑，脸不都长在脖子上。」' },
      { label: '「这楼里，赏钱最高的东西是什么？」' },
    ],
    reply: [
      '「是啊。」他盯着你的袖口，\n「可有的脸，能摘下来。」',
      '他笑了一下，把一枚铜钱按在桌上。\n「问这种话的人，一般也值点钱。」',
    ],
    hit: '他把酒一口喝干，拇指抹了抹刀鞘。\n「稳。」',
    miss: '酒顺着桌沿滴到他靴子上。他低头看了一眼，笑了。\n「手这么抖，还敢问我赏格。」',
  },
  senior: {
    name: '师兄',
    open: '白衣客面前摆着一只空碗。\n裹布的长剑横在桌上。他抬眼，叫的却不是阿七这个名字。',
  },
};

const AMBIENT = {
  tableE: [
    '旁白', '两个行商在算一笔走不通的账。你添茶时，其中一个把袖里的碎银往里收了收。',
  ],
  tableF: [
    '旁白', '两个老酒客在说闲话。\n「听说了么，容颜城一夜之间，满城没了脸。」\n说完，其中一个往你这边看了一眼。',
  ],
  tableG: [
    '旁白', '堂中这张桌子坐了三个人，穿得都不像本地人。\n你添茶时，那个戴斗笠的把手按在了桌下的刀柄上。',
  ],
  tableH: [
    '旁白', '赶路的一家三口。孩子趴在长凳上睡着了，\n他娘把凉透的茶推到你手边，轻声说：「劳驾，添热点。」',
  ],
  tableI: [
    '旁白', '两个佩刀的江湖客在比划一张湿了边的地图。\n你添茶过去，他们把地图一卷，只留下一句：「这楼里，不止我们一拨人。」',
  ],
  tableJ: [
    '旁白', '一对刚进门的夫妇，鞋上全是泥。\n女人把包袱抱在怀里，男人一直盯着门外，像在等什么人追上来。',
  ],
};

const CHATTER = [
  '邻桌压着嗓子：「容颜城的事，别在这楼里提。」',
  '后厨灶火噼啪响了一声，油香混着雪气飘出来。',
  '楼上的窗纸晃了晃，有个人影一直没动。',
  '街口的更夫敲了三下梆子。',
  '说书人的嗓子又亮起来，唱到「一张脸换一条命」。',
];

export function createStory(ui, stage) {
  const state = { silver: 0, fame: 0, suspicion: 0, served: 0, cups: 0, spills: 0 };
  const seen = new Set();
  let busy = true;
  let ended = false;
  let handedOff = false;
  let failed = false;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function give(key, delta, note) {
    if (key === 'suspicion') {
      state.suspicion = Math.max(0, Math.min(5, state.suspicion + delta));
    } else {
      state[key] = Math.max(0, Math.min(5, state[key] + delta));
    }
    ui.hud(state);
    if (delta > 0) ui.toast(note);
  }

  /* 平台存档：有桥就走桥，没有桥就安静降级（本地双击也能玩） */
  function readSave() {
    try {
      if (window.IW_HANDOFF && typeof window.IW_HANDOFF.read === 'function') {
        const s = window.IW_HANDOFF.read();
        if (s && typeof s === 'object') return s;
      }
      if (typeof WL !== 'undefined' && WL && typeof WL.readSave === 'function') {
        const s = WL.readSave();
        if (s && typeof s === 'object') return s;
      }
    } catch (e) { /* 没有平台桥 */ }
    return {};
  }

  /* 上一关带来的东西：只从存档里取，不凭空写 */
  function readCarry(save) {
    const items = Array.isArray(save.items) ? save.items : [];
    for (let i = items.length - 1; i >= 0; i--) {
      const raw = items[i] || {};
      const key = LEGACY[String(raw.id || '')] || String(raw.id || '');
      return {
        name: raw.name || RELIC_TEXT[key] || '一件说不清来历的东西',
        visual: RELIC_VIS[key] ? key : null,
      };
    }
    try {
      const raw = localStorage.getItem('tingyulou.relic2') || localStorage.getItem('tingyulou.relic');
      if (raw) {
        const key = LEGACY[raw] || raw;
        if (RELIC_TEXT[key]) return { name: RELIC_TEXT[key], visual: RELIC_VIS[key] ? key : null };
      }
    } catch (e) { /* 隐私模式写不进去 */ }
    return null;
  }

  /* 通关交档：熔岩核心等原有背包不动，只追加本关声明过的刀与线索 */
  function completeHandoff() {
    if (handedOff || failed) return;
    handedOff = true;
    const save = readSave();
    if (!save || !Array.isArray(save.items) || typeof WL === 'undefined' || !WL) return;
    if (!save.items.some((item) => item && item.id === HANDOFF_ITEM.id)) {
      WL.addItem(save, HANDOFF_ITEM);
    }
    save.clues = Array.isArray(save.clues) ? save.clues : [];
    if (!save.clues.includes(HANDOFF_CLUE)) WL.addClue(save, HANDOFF_CLUE);
    save.clues = save.clues.slice(-2);
    const opts = { acquiredItemIds: [HANDOFF_ITEM.id], exitHook: EXIT_HOOK };
    if (window.IW_HANDOFF) window.IW_HANDOFF.complete(save, opts);
    else WL.completeLevel(window.CONFIG || {}, save, opts);
  }

  /* 异常或死档兜底：把遗物与墓碑交给下一队，不把人卡在黑屏里 */
  function failHandoff(reason) {
    if (failed || handedOff) return;
    failed = true;
    busy = true;
    ended = true;
    ui.hidePanel();
    ui.hideHint();
    ui.fade(true);
    const save = readSave();
    if (window.IW_HANDOFF) window.IW_HANDOFF.fail(reason, save);
    else if (typeof WL !== 'undefined' && WL && WL.failLevel) {
      WL.failLevel(reason, save, window.CONFIG || {});
    }
  }

  /* ---------- 开场 ---------- */

  async function open() {
    await ui.intro();
    stage.focus(null);

    const incoming = readSave();
    if (incoming.player && (incoming.player.hp <= 0 || incoming.player.status === 'dead')) {
      failHandoff('上一世留下的伤，在这具身体里终于压不住了');
      return;
    }
    const hook = String(incoming.exit_hook || '').trim();
    if (hook) {
      await ui.say('旁白', `上一关留下的最后一句话——\n「${hook}」`);
    } else {
      await ui.say('旁白', '你从上一座世界走出来的时候，身后什么也没留下。');
    }

    await ui.say('旁白', '再睁眼，你是个店小二。\n肩上搭一条发灰的抹布，手背上一块旧烫伤。\n柜台上的木牌写着：阿七。');
    await ui.say('铜镜里', '低头看这双手。\n指节粗，虎口却有握刀的茧。\n不是你练过刀，是这张皮原来的主人练过。');
    await ui.say('旁白', '门外的雪里有三种脚步声：官靴、快靴，还有一把伞。\n他们都在找这具身体。');
    await ui.say('老板娘', '「阿七，发什么愣？」\n她把抹布往你肩上一搭，「三桌客人等着上酒，散桌添茶。\n手脚轻些，别多看，别多问。」');
    await ui.say('旁白', '于是你拎起那把缺了口的酒壶，走进这一堂人。');

    const carry = readCarry(incoming);
    if (carry) {
      if (carry.visual) ui.showRelic(carry.visual);
      await ui.say('旁白', `柜台角上摆着一件不该在这楼里的东西——\n${carry.name}。\n老板娘顺着你的眼神看了一眼，什么也没说。`);
      give('suspicion', 1, '疑心 加一');
    } else {
      await ui.say('旁白', '你身上没有一样东西是别处带来的。\n空着手，也得坐进来。');
    }

    await ui.say('旁白', '三只碗，三种人等。\n酒壶是凉的，眼睛是热的。');

    ui.hidePanel();
    busy = false;
    ui.showHint('先给三桌客人上酒 · 微光亮起时点它');
    ui.toast('柜台在右手边 · 老板娘在等你');
  }

  /* ---------- 点击分流 ---------- */

  async function inspect(id) {
    if (busy || ended || !id) return;
    busy = true;
    ui.focusOn(id);
    if (!WINE[id]) stage.pour(id);
    await wait(620);

    if (!seen.has(id)) {
      if (id === 'keeper') await serveKeeper();
      else if (WINE[id]) await serveWine(id);
      else if (id === 'teller') await teller();
      else if (AMBIENT[id]) await serveAmbient(id);
      seen.add(id);
    } else {
      await ui.say('旁白', REPEAT[id] || '这桌的酒还满着。');
    }

    if (!ended) {
      ui.hidePanel();
      ui.focusOn(null);
      busy = false;
    }
  }

  /* ---------- 老板娘 · 三杯酒 ---------- */

  async function serveKeeper() {
    await ui.say('旁白', '柜台后头，老板娘拿算盘压着账本，眼睛却没看账。');
    await ui.say('老板娘', '「穿皂衣的，是六扇门的捕头。\n靠窗那个把刀横在膝上的，是揭了赏榜的刀客。\n西边白衣的，是你师兄。清源派的人，鼻子比狗还灵。」');
    await ui.say('老板娘', '「三桌都得添。别问，别抬头，手别抖。」\n她把声音压得极低，「这楼里只有灶膛还是热的。东西藏好，倒完就回后厨。」');

    const pick = await ui.choose([
      { label: '「您知道我是谁？」' },
      { label: '「我这就去上酒。」' },
    ]);

    if (pick === 0) {
      await ui.say('老板娘', '「知道。」她终于抬眼看你，「所以才让你端酒。\n端酒的人，最不惹眼。」');
      give('fame', 1, '名声 加一');
      give('suspicion', 1, '疑心 加一');
    } else {
      await ui.say('老板娘', '「去。」她把算盘珠子拨了一下，「手别抖。」');
      give('silver', 1, '赏钱 加一');
    }
  }

  /* 一桌酒：点桌 → 客人报分 → 推镜 → 按住倒 → 松手判 → 拉回 */
  async function serveWine(id) {
    const w = WINE[id];
    await ui.say('旁白', w.open);

    if (!w.pick) {
      /* 第三杯：故人。倒到三成，他接手倒满，这一杯不判。 */
      await ui.say('师兄', '「师弟。」');
      await ui.say('师兄', '「师父让我带话：把东西交出来，山门还认你这个人。」\n他把裹剑的布解开一寸。');
      ui.hidePanel();
      ui.showHint('按住倒酒 · 松手停');
      await stage.pourWine(id, {
        handover: true,
        onTakeover: () => ui.toast('他的手按住了你的手'),
      });
      ui.hideHint();
      await ui.say('旁白', '他的手覆上来，不重，也不容你抽开。\n酒线稳稳落进碗里，满到碗沿，一滴没洒。');
      await ui.say('师兄', '「你还是这样。」\n「天塌了，也先给人倒酒。」');
      await finishWine();
      return;
    }

    const target = stage.pourTarget();
    await ui.say(w.name, `${w.ask}\n「${CN_NUM[Math.round(target * 10)] || '七'}分满。」`);

    const pick = await ui.choose(w.pick);
    await ui.say(w.name, w.reply[pick]);
    if (pick === 0 && id === 'captain') give('fame', 1, '名声 加一');
    if (pick === 1 && id === 'hunter') give('suspicion', 1, '疑心 加一');

    ui.hidePanel();
    ui.showHint('按住倒酒 · 松手停');
    const r = await stage.pourWine(id, { target });
    ui.hideHint();

    if (r.spilled) {
      state.spills += 1;
      await ui.say('旁白', w.miss);
      give('suspicion', 1, '疑心 加一');
    } else {
      await ui.say('旁白', w.hit);
      give('fame', 1, '名声 加一');
    }

    await finishWine();
  }

  /* ---------- 说书人 · 旁桌 ---------- */

  async function teller() {
    await ui.say('说书人', '扇子一收，堂里静了半拍。\n「上回说到，容颜城破，满城的人都在找一张脸。」');
    await ui.say('说书人', '「那张脸不认主人。谁戴上，谁就成了别人。」');
    await ui.say('说书人', '他往你袖口瞟了一眼。\n「客官，你说——是脸跟着人走，还是人跟着脸走？」');

    const pick = await ui.choose([
      { label: '「脸跟着人走。」' },
      { label: '「人跟着脸走。」' },
    ]);

    if (pick === 0) {
      await ui.say('说书人', '他笑了一下。\n「那你还得问问，人愿意不愿意。」');
    } else {
      await ui.say('说书人', '他敲了一下醒木。\n「这话，像是从一张旧脸上说出来的。」');
    }
    give('fame', 1, '名声 加一');
  }

  async function serveAmbient(id) {
    const [speaker, text] = AMBIENT[id];
    await ui.say(speaker, text);
    give('silver', 1, '赏钱 加一');
  }

  /* ---------- 进度 ---------- */

  async function finishWine() {
    state.cups += 1;
    state.served = state.cups;
    ui.hud(state);
    if (state.cups >= 3) {
      await showdown();
      return;
    }
    const left = 3 - state.cups;
    await ui.say('老板娘', KEEPER_AFTER[state.cups - 1]);
    ui.toast(`第${CN[state.cups]}杯 · 还差${CN[left]}桌`);
    ui.showHint(`还有${CN[left]}桌等着上酒`);
  }

  /* ---------- 终局：按洒了几杯走三个版本 ---------- */

  async function showdown() {
    ended = true;
    ui.hidePanel();
    ui.focusOn(null);
    stage.knock();
    await wait(700);

    await ui.say('旁白', '第三只碗放下的时候，堂里忽然静了。\n说书人的扇子停在半空，连窗外的雪都像停了。');
    await ui.say('旁白', '白衣客站起来，把裹布解开，刀搁在桌上。\n「刀留下。」他说，「你走。」');
    await ui.say('旁白', '皂衣客把海捕文书摊开。\n靠窗那位掀了赏榜。三张桌子，三双眼睛。');
    await ui.say('老板娘', '「阿七，灶膛还热着。」');
    ui.hidePanel();
    stage.focus(null);
    await wait(500);

    if (state.spills === 0) {
      await ui.say('旁白', '他走了。\n刀留下了。');
      await ui.say('旁白', '门推开，雪灌进来。\n外面没有人。');
      ui.fade(true);
      await ui.say('旁白', '你走进雪里。\n这张脸不是你的，路是你的。');
      ui.hidePanel();
      await wait(900);
      completeHandoff();
      return;
    }

    if (state.spills === 1) {
      await ui.say('旁白', '门外的雪，埋到脚踝。\n捕快身后站着五个人。');
      await ui.say('旁白', '第一刀你躲开了。\n第二刀没有。');
      await ui.say('旁白', '第三刀你跪下去了。\n膝盖是阿七的，疼是你的。');
      await ui.say('旁白', '你用刀撑着站起来。\n他们没再动。');
      await ui.say('旁白', '血滴在雪上，一个一个洞。\n巷口的灯灭了。\n你还站着。');
      ui.fade(true);
      await ui.say('旁白', '这张脸，从今夜起才算是你的。');
      ui.hidePanel();
      await wait(900);
      completeHandoff();
      return;
    }

    await ui.say('旁白', '门外的雪，比山门那场火还白。\n捕快站在灯下，身后四个人。');
    await ui.say('旁白', '第一刀从左边来。\n你没看清，只听见风。');
    await ui.say('旁白', '刀进了你的肩。\n热的——这具身体的血，也烫。');
    await ui.say('旁白', '第二刀、第三刀——\n你都接住了。');
    await ui.say('旁白', '最后站着的人是你。\n雪落在刀上，化得很慢。');
    ui.fade(true);
    await ui.say('旁白', '你走出巷子，没有回头。');
    ui.hidePanel();
    await wait(900);
    completeHandoff();
  }

  /* ---------- 闲话 ---------- */

  let ci = 0;
  setInterval(() => {
    if (busy || ended) return;
    ui.toast(CHATTER[ci++ % CHATTER.length]);
  }, 28000);

  return {
    open,
    inspect,
    fail: (reason) => failHandoff(reason || '世界线在此处断开'),
    state,
    seen,
    get busy() { return busy; },
    get ended() { return ended; },
  };
}

const KEEPER_AFTER = [
  '老板娘收了空碗，压低声音：\n「捕头那桌，眼睛一直没离开你的手。」',
  '老板娘往窗边瞥了一眼：\n「刀客在数银子。数完了，就该问价了。」',
];

const REPEAT = {
  keeper: '老板娘拨着算盘：「倒完了就去歇着。别在堂里站着。」',
  captain: '皂衣客的酒碗见底了。刀还在桌边。',
  hunter: '刀客在看榜文，没抬头。你的影子落在他纸上。',
  senior: '白衣客面前那只碗，满着。他没再喝。',
  teller: '说书人一展扇子，接着唱下一回。\n这回唱的是雪夜、客栈，和一个端酒的人。',
  tableE: '两个行商的账还没算完。茶还满着。',
  tableF: '两个老酒客换了话题，说今年的雪真大。',
  tableG: '戴斗笠的把手从桌下收了回去。茶还满着。',
  tableH: '孩子醒了，正在揉眼睛。茶还温着。',
  tableI: '佩刀的两个人还在看那张地图，压着嗓子争一个地名。',
  tableJ: '夫妇俩轮流往门外看。桌上的茶，一口没动。',
};
