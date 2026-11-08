export function createStory(ui, stage) {
  const state = { silver: 0, fame: 0, suspicion: 0 };
  const seen = new Set();
  let busy = true;
  let ended = false;

  function give(key, delta, note) {
    state[key] += delta;
    ui.hud(state);
    if (delta > 0) ui.toast(note);
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function open() {
    await ui.intro();
    stage.focus(null);

    await ui.say('旁白', '雨声先到的。\n然后是灯——有人拨了拨灯芯，堂子亮起来，又暗下去一点。');
    await ui.say('旁白', '你在一张长凳上醒过来，后颈发麻，像被人从很高的地方扔下来。');
    await ui.say('铜镜里', '低头看自己的手。\n细，白，右手食指外侧有一层硬茧——是常年握笔的人才有的那种。\n这不是你的手。');
    await ui.say('旁白', '头顶的匾额写着三个字：听雨楼。\n字是新描的，底下的旧漆剥了一半。');
    await ui.say('旁白', '堂上还有三处地方，值得看一眼。');

    busy = false;
    ui.showHint('挪动视线，找找堂上还有什么');
  }

  async function inspect(id) {
    if (busy || ended) return;
    busy = true;
    ui.focusOn(id);
    await wait(700);

    if (!seen.has(id)) {
      if (id === 'ledger') await ledger();
      if (id === 'teller') await teller();
      if (id === 'door') await doorway();
      seen.add(id);
    } else {
      await ui.say('旁白', '再看一遍，也没有新的东西了。');
    }

    if (seen.size >= 2 && !ended) {
      await knock();
    } else {
      ui.focusOn(null);
      busy = false;
    }
  }

  async function ledger() {
    await ui.say('旁白', '账本摊在柜面上，墨迹还没干透。');
    await ui.say('旁白', '最后一页写着：\n「丙三，借宿一夜，押：左手。」\n丙三的名字被划掉了，划得很用力，纸都破了。');
    await ui.say('旁白', '下面新添一行，笔迹和这双手一模一样：\n「沈七，借宿一夜，押：一根舌头。」');
    if (seen.has('teller')) {
      await ui.say('旁白', '页边还夹着半张当票——正是说书人唱的那半张。');
    }
    give('suspicion', 1, '疑心 加一');
    await ui.say('旁白', '你不记得自己写过这一行。\n可这双手记得。');
  }

  async function teller() {
    await ui.say('说书人', '扇子一收，半眯着眼：\n「三更鼓响，有人把命押在桌上，\n赢了半张当票，输了一只手。」');
    await ui.say('说书人', '他停了停，往你这边看。\n「客官，你的手，全着么？」');
    await ui.say('旁白', '他把扇子重新打开，慢悠悠地补了一句：\n「这楼里的东西，认人不认灯。」');
    give('fame', 1, '名声 加一');
  }

  async function doorway() {
    await ui.say('旁白', '门框内侧有几道很深的刻痕。\n不是刀刻的，是拿指甲一点点磨出来的。');
    await ui.say('旁白', '三横，一竖。\n像三个人，站成一排。');
    await ui.say('旁白', '旁边还有一行更小的字，磨得快看不见了：\n「别住西厢。」');
    give('suspicion', 1, '疑心 加一');
  }

  async function knock() {
    stage.knock();
    await wait(1100);
    await ui.say('旁白', '门被拍响。三下，很轻，像怕吵醒谁。');
    stage.focus('door');
    await wait(500);
    await ui.say('黑衣人', '一个穿黑衣的人立在檐下，雨水顺着刀鞘往下滴。\n他不进来，只问一句：\n「今夜，谁进过西厢？」');

    const pick = await ui.choose([
      { label: '「没有人。」——你把账本合上。' },
      { label: '「沈七。」——你翻到那一页。' },
      { label: '你吹灭了灯，让说书人接着唱。' },
    ]);

    ended = true;
    ui.hidePanel();

    if (pick === 0) {
      give('fame', 1, '名声 加一');
      give('suspicion', 1, '疑心 加一');
      stage.focus(null);
      await wait(500);
      await ui.end({
        title: '你替一个陌生人说了谎',
        text: '官差走了。走之前看了你一眼，像在记你的脸。\n\n你把账本最后一页撕下来，折好，压进柜台的缝里。\n上面那行「沈七」，你留给了下一个住店的人。',
        item: '一页撕了一半的账纸',
        hook: '下一队推门进来，会在柜台上先看见它。',
      });
    } else if (pick === 1) {
      give('silver', 1, '银两 加一');
      give('suspicion', 1, '疑心 加一');
      stage.focus(null);
      await wait(500);
      await ui.end({
        title: '你把人交了出去',
        text: '官差推开西厢的门。\n里头没有人，只有半张当票，和一件湿透的衣裳。\n\n你拿到一锭银子，很沉。\n临走前，你把那半张当票留在柜台上——让下一个人知道，这楼里死过人。',
        item: '半张当票',
        hook: '下一队会在柜台上摸到它，纸还带着雨气。',
      });
    } else {
      give('fame', 1, '名声 加一');
      stage.focus(null);
      await wait(500);
      await ui.end({
        title: '你灭了灯',
        text: '灯灭的一瞬，说书人的嗓子亮了起来。\n他唱的不是昨夜的事，是今夜的事。\n\n官差在门口站了很久，最后转身走进雨里。\n再点灯时，说书人不见了，桌上多了一枚铜板。\n你把铜板压在桌角，压得很稳。',
        item: '一枚压得很稳的铜板',
        hook: '下一队掀开茶碗，会看见那枚铜板。',
      });
    }

    ui.hud(state);
  }

  return { open, inspect, state, seen, get busy() { return busy; }, get ended() { return ended; } };
}
