const RELIC_TEXT = {
  cup: '一只倒扣着的茶碗',
  portrait: '半张画着陌生脸孔的画像',
  plaque: '一枚清源派的旧门牌',
};

const LEGACY = { paper: 'cup', ticket: 'portrait', coin: 'plaque' };

const CN = ['零', '一', '二', '三', '四', '五'];

const MAIN = ['keeper', 'captain', 'hunter', 'senior'];

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
  '后厨灶火噼啪响了一声，油香混着雨气飘出来。',
  '楼上的窗纸晃了晃，有个人影一直没动。',
  '街口的更夫敲了三下梆子。',
  '说书人的嗓子又亮起来，唱到「一张脸换一条命」。',
];

export function createStory(ui, stage) {
  const state = { silver: 0, fame: 0, suspicion: 0, served: 0 };
  const seen = new Set();
  let busy = true;
  let ended = false;

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

  function readRelic() {
    let raw = null;
    try {
      raw = localStorage.getItem('tingyulou.relic2') || localStorage.getItem('tingyulou.relic');
    } catch (e) { return null; }
    if (!raw) return null;
    const id = LEGACY[raw] || raw;
    return RELIC_TEXT[id] ? id : null;
  }

  /* ---------- 开场 ---------- */

  async function open() {
    await ui.intro();
    stage.focus(null);

    await ui.say('旁白', '上一个副本叫「容颜」。\n你们杀穿了那座城，最后一具尸体倒下时，脸皮自己脱了下来——\n薄得透光，还带着体温。');
    await ui.say('旁白', '你没舍得扔。它跟着你穿过雨，落进了这一世。');
    await ui.say('旁白', '再睁眼，你是个店小二。\n肩上搭一条发灰的抹布，手背上一块旧烫伤。\n柜台上的木牌写着：阿七。');
    await ui.say('铜镜里', '低头看这双手。\n指节粗，虎口却有握刀的茧。\n不是你练过刀，是这张皮原来的主人练过。');
    await ui.say('旁白', '门外的雨里有三种脚步声：官靴、快靴，还有一把伞。\n他们都在找那张脸。');
    await ui.say('老板娘', '「阿七，发什么愣？」\n她把抹布往你肩上一搭，「四桌客人等着添茶。手脚轻些，别多看，别多问。」');
    await ui.say('旁白', '于是你端起茶壶，走进这一堂人。');

    const relic = readRelic();
    if (relic) {
      ui.showRelic(relic);
      await ui.say('旁白', `柜台角上压着一件不该在这楼里的东西——\n${RELIC_TEXT[relic]}。\n老板娘顺着你的眼神看了一眼，什么也没说。`);
      give('suspicion', 1, '疑心 加一');
    }

    await ui.say('旁白', '四桌客人，四种人等。\n茶壶是热的，眼睛是凉的。');

    ui.hidePanel();
    busy = false;
    ui.showHint('给四桌客人添茶 · 微光亮起时点它');
    ui.toast('柜台在右手边 · 老板娘在等你');
  }

  /* ---------- 点击分流 ---------- */

  async function inspect(id) {
    if (busy || ended || !id) return;
    busy = true;
    ui.focusOn(id);
    stage.pour(id);
    await wait(620);

    if (!seen.has(id)) {
      if (id === 'keeper') await serveKeeper();
      else if (id === 'captain') await serveCaptain();
      else if (id === 'hunter') await serveHunter();
      else if (id === 'senior') await serveSenior();
      else if (id === 'teller') await teller();
      else if (AMBIENT[id]) await serveAmbient(id);
      seen.add(id);
    } else {
      await ui.say('旁白', REPEAT[id] || '这桌的茶还满着。');
    }

    if (!ended) {
      ui.hidePanel();
      ui.focusOn(null);
      busy = false;
    }
  }

  /* ---------- 四桌 ---------- */

  async function serveKeeper() {
    await ui.say('旁白', '柜台后头，老板娘拿算盘压着账本，眼睛却没看账。');
    await ui.say('老板娘', '「穿皂衣的，是六扇门的捕头。\n靠窗那个戴斗笠的，是揭了赏榜的人——江湖上叫他们揭榜客。\n西边白衣的，是你师兄。清源派的人，鼻子比狗还灵。」');
    await ui.say('老板娘', '「他进门只叫了一壶茶，然后叫了你的名字。」\n她把声音压得极低，「这楼里只有灶膛还是热的。东西藏好，添完茶就回后厨。」');

    const pick = await ui.choose([
      { label: '「您知道我是谁？」' },
      { label: '「我这就去添茶。」' },
    ]);

    if (pick === 0) {
      await ui.say('老板娘', '「知道。」她终于抬眼看你，「所以才让你端茶。\n端茶的人，最不惹眼。」');
      give('fame', 1, '名声 加一');
      give('suspicion', 1, '疑心 加一');
    } else {
      await ui.say('老板娘', '「去。」她把算盘珠子拨了一下，「手别抖。」');
      give('silver', 1, '赏钱 加一');
    }

    await finishServe();
  }

  async function serveCaptain() {
    await ui.say('旁白', '皂衣客把扣着的茶碗翻过来，推到你手边。\n刀靠桌腿，鞘上还挂着雨水。');
    await ui.say('捕快', '「添满。」他只说这两个字。');
    await ui.say('旁白', '他袖口露出半张海捕文书。\n画上那张脸——是你在容颜城借过的那一张。');

    const pick = await ui.choose([
      { label: '手稳稳添满，什么也不问。' },
      { label: '手腕一抖，茶水泼在桌上。' },
    ]);

    if (pick === 0) {
      await ui.say('捕快', '他盯了你很久。\n「你这双手，不像端茶的。」\n「倒像拿过刀。」');
      give('fame', 1, '名声 加一');
    } else {
      await ui.say('捕快', '他按住刀柄，却没拔。\n「慌什么？」\n「今夜封城。楼里人，一个都别走。」');
      give('suspicion', 1, '疑心 加一');
    }

    await finishServe();
  }

  async function serveHunter() {
    await ui.say('旁白', '行商打扮的客人把一张榜文压在手肘下面。\n纸角露出两个字：活口。');
    await ui.say('揭榜客', '「小二哥，打听个事。」他敲了敲桌沿，\n「听说这楼里，藏着一样从容颜城带出来的东西。」');
    await ui.say('揭榜客', '「活的赏三百两，死的——」他笑了笑，「死的也收，少一百。」');

    const pick = await ui.choose([
      { label: '「客官说笑，脸不都长在脖子上。」' },
      { label: '「三百两，够买下听雨楼了。」' },
    ]);

    if (pick === 0) {
      await ui.say('揭榜客', '「是啊。」他盯着你的袖口，\n「可有的脸，能摘下来。」');
      give('fame', 1, '名声 加一');
      give('suspicion', 1, '疑心 加一');
    } else {
      await ui.say('揭榜客', '他大笑，把一枚铜钱弹在桌上。\n「会说话。可惜会说话的人，通常活不长。」');
      give('silver', 1, '赏钱 加一');
      give('suspicion', 1, '疑心 加一');
    }

    await finishServe();
  }

  async function serveSenior() {
    await ui.say('旁白', '白衣客面前只摆一只空杯。\n剑用布裹着，横在膝上。他抬眼，叫的却不是阿七这个名字。');
    await ui.say('师兄', '「师弟。」');
    await ui.say('师兄', '「师父让我带话：把东西交出来，山门还认你这个人。\n若不交——」他把裹剑的布解开一寸，\n「我带你回去，或者带你的头回去。」');

    const pick = await ui.choose([
      { label: '「师兄，先喝口茶。」' },
      { label: '「你认错人了。」' },
    ]);

    if (pick === 0) {
      await ui.say('师兄', '他接过茶，看了很久。\n「你还是这样。天塌了，也先给人倒茶。」');
      give('fame', 1, '名声 加一');
      give('suspicion', 1, '疑心 加一');
    } else {
      await ui.say('师兄', '「师弟。」他把布重新裹好，\n「你换多少张脸，我都能闻出来。」');
      give('suspicion', -1, '');
    }

    await finishServe();
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

  async function finishServe() {
    state.served += 1;
    ui.hud(state);
    if (state.served >= 4) {
      await showdown();
      return;
    }
    const left = 4 - state.served;
    ui.toast(`第${CN[state.served]}盏茶 · 还差${CN[left]}桌`);
    ui.showHint(`还有${CN[left]}桌客人等着添茶`);
  }

  function leave(id) {
    try { localStorage.setItem('tingyulou.relic2', id); } catch (e) { /* 隐私模式下写不进去 */ }
  }

  /* ---------- 终局 ---------- */

  async function showdown() {
    ended = true;
    ui.hidePanel();
    ui.focusOn(null);
    stage.knock();
    await wait(1200);

    await ui.say('旁白', '第四盏茶添满的时候，堂里忽然静了。\n说书人的扇子停在半空，连雨声都像停了。');
    await ui.say('旁白', '皂衣客站起来，把刀横在桌上。\n戴斗笠的掀开榜文。白衣客解开了裹剑的布。');
    await ui.say('旁白', '三张桌子，三双眼睛，都在你身上。\n柜台后头，老板娘慢慢把抹布叠好。');
    await ui.say('老板娘', '「阿七，灶膛还热着。」');

    const pick = await ui.choose([
      { label: '「三位客官，茶钱还没结。」——你掀了茶壶，往后厨走。' },
      { label: '你把袖子里的东西摊在桌上——一张薄得透光的脸。' },
      { label: '「师兄，我跟你回山门。」' },
    ]);

    ui.hidePanel();
    stage.focus(null);
    await wait(400);

    if (pick === 0) {
      leave('cup');
      await ui.end({
        title: '你掀了茶壶',
        text: '热茶泼在皂衣客的刀上，白汽腾起来。\n你从后厨的门缝里挤出去，灶膛的火光舔了一下你的后脊。\n\n雨在巷子里等了你很久。\n你跑了三条街，才想起来——这一世，你连名字都是借来的。\n\n第二天，听雨楼照常开门。\n柜台角上多了一只倒扣的茶碗，谁也没收走。',
        item: '一只倒扣着的茶碗',
        hook: '下一队进门时，会先看见那只扣着的茶碗。',
      });
    } else if (pick === 1) {
      leave('portrait');
      await ui.end({
        title: '你换了一张脸',
        text: '你把那张脸摊在茶汤上。它自己浮起来，贴上了你的皮肤。\n\n三个人同时看见你，却各看见一张不同的脸：\n捕头看见一个死人，揭榜客看见三百两，师兄看见他自己。\n\n堂里乱成一团。你就从乱里走出去，没人拦。\n只是走到街口时，你摸了摸自己的脸——\n已经想不起原来那张，是什么样子。',
        item: '半张画着陌生脸孔的画像',
        hook: '下一队会在柜台里翻出半张画像。画上的人，像他们中的一个。',
      });
    } else {
      leave('plaque');
      await ui.end({
        title: '你跟着师兄出了门',
        text: '你把茶壶放稳，解下抹布，跟师兄走进雨里。\n捕头和揭榜客没有追。他们只是看着，\n像在看一件被收进箱底的旧物。\n\n山门的钟响了三下。师父在殿里等你，案上摆着一碗还冒热气的茶。\n你跪下的时候，忽然想起——已经很久没人给你倒过茶了。',
        item: '一枚清源派的旧门牌',
        hook: '门牌搁在柜台缝里。下一队会摸到它，然后听见有人在门外叫「师弟」。',
      });
    }
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
    state,
    seen,
    get busy() { return busy; },
    get ended() { return ended; },
  };
}

const REPEAT = {
  keeper: '老板娘拨着算盘：「添完了就去歇着。别在堂里站着。」',
  captain: '皂衣客把碗又扣了回去。刀还在桌边。',
  hunter: '揭榜客在看榜文，没抬头。你的影子落在他纸上。',
  senior: '白衣客面前那只杯子，还是空的。他没再看你。',
  teller: '说书人一展扇子，接着唱下一回。\n这回唱的是雨夜、客栈，和一个端茶的人。',
  tableE: '两个行商的账还没算完。茶还满着。',
  tableF: '两个老酒客换了话题，说今年的雨真长。',
  tableG: '戴斗笠的把手从桌下收了回去。茶还满着。',
  tableH: '孩子醒了，正在揉眼睛。茶还温着。',
  tableI: '佩刀的两个人还在看那张地图，压着嗓子争一个地名。',
  tableJ: '夫妇俩轮流往门外看。桌上的茶，一口没动。',
};
