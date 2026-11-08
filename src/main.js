import * as THREE from '../vendor/three.module.js';
import { buildWorld } from './world.js';
import { createPour } from './pour.js';
import { createStory } from './story.js';
import { playTransition } from './transition.js';
import { playRift } from './rift.js';

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 60);

const world = buildWorld(scene, renderer);
const pour = createPour(scene);

/* ---------- 镜头 ---------- */

const BASE_POS = new THREE.Vector3(0.8, 1.62, 7.0);
const BASE_LOOK = new THREE.Vector3(1.1, 1.42, -3.8);
const player = { position: new THREE.Vector3(0.8, 0, 7.0), floor: 0, radius: 0.32, eyeHeight: 1.62 };
const keys = new Set();

let yaw = 0, pitch = 0;
let targetYaw = 0, targetPitch = 0;
let pointerX = 0.5, pointerY = 0.5;
let hoveredId = null;
let shake = 0;
let flash = 0;

const camPos = BASE_POS.clone();
const camLook = BASE_LOOK.clone();
const lookDir = new THREE.Vector3();

const focusMap = {};
world.hotspots.forEach((h) => { focusMap[h.id] = h; });

function focus(id) {
  hoveredId = null;
  document.getElementById('cursor-tag').classList.remove('on');
  document.body.classList.remove('hot');
  activeFocus = id;
}

let activeFocus = null;
let arrival = null;

/* ---------- 交互 ---------- */

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tagEl = document.getElementById('cursor-tag');
const hintEl = document.getElementById('hint');

let pointerDownAt = null;
let dragging = false;

function pickHotspot(clientX, clientY) {
  ndc.x = (clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(world.raycastables, false);
  for (const h of hits) {
    let o = h.object, id = null;
    while (o) {
      if (o.userData && o.userData.hotspot) { id = o.userData.hotspot; break; }
      o = o.parent;
    }
    if (id) return id;
  }
  return null;
}

function pickAnyObject(clientX, clientY) {
  ndc.x = (clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  return raycaster.intersectObjects(world.raycastables, false).length > 0;
}

/* ---------- 指针锁定：第一人称视角 ---------- */

const reticleEl = document.getElementById('reticle');
const reticleLabel = document.getElementById('reticle-label');
let locked = false;
let lockHintShown = false;

function requestLock() {
  const p = canvas.requestPointerLock();
  if (p && p.catch) p.catch(() => {});
}

document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  document.body.classList.toggle('locked', locked);
  pointerDownAt = null;
  dragging = false;
  tagEl.classList.remove('on');
  document.body.classList.remove('hot');
  reticleEl.hidden = !locked;
  if (!locked) {
    hoveredId = null;
    reticleEl.className = '';
  } else if (!lockHintShown) {
    lockHintShown = true;
    toast('移动鼠标环视 · 点击准星对准的客人互动');
  }
});

const MISS_LINES = ['这一处，只有潮气和油烟。', '茶客们各说各的，没人理你。', '你只是个端茶的。', '帘子后头，什么也没有。'];
let lastMissAt = 0;

window.addEventListener('pointermove', (e) => {
  // 锁定后：鼠标位移直接转成视角，不再依赖拖拽
  if (locked) {
    targetYaw = THREE.MathUtils.clamp(targetYaw - e.movementX * 0.0021, -3.05, 3.05);
    targetPitch = THREE.MathUtils.clamp(targetPitch - e.movementY * 0.0017, -0.28, 0.34);
    return;
  }
  pointerX = e.clientX / window.innerWidth;
  pointerY = e.clientY / window.innerHeight;

  tagEl.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 16}px)`;

  if (pointerDownAt && !dragging) {
    const dx = e.clientX - pointerDownAt.x;
    const dy = e.clientY - pointerDownAt.y;
    if (Math.hypot(dx, dy) > 6) dragging = true;
  }
  if (dragging && pointerDownAt) {
    targetYaw = THREE.MathUtils.clamp(targetYaw - (e.clientX - pointerDownAt.x) * 0.0022, -3.05, 3.05);
    targetPitch = THREE.MathUtils.clamp(targetPitch + (e.clientY - pointerDownAt.y) * 0.0016, -0.22, 0.3);
    pointerDownAt = { x: e.clientX, y: e.clientY };
  }

  if (story.busy) { tagEl.classList.remove('on'); document.body.classList.remove('hot'); return; }
  if (dragging) return;

  const id = pickHotspot(e.clientX, e.clientY);
  if (id && id !== hoveredId) {
    const hs = focusMap[id];
    tagEl.textContent = hs ? hs.label : '';
    tagEl.classList.add('on');
    document.body.classList.add('hot');
  } else if (!id) {
    tagEl.classList.remove('on');
    document.body.classList.remove('hot');
  }
  hoveredId = id;
});

window.addEventListener('pointerdown', (e) => {
  startAudio();
  if (pour.active) { pour.press(); return; }
  if (locked) return;
  pointerDownAt = { x: e.clientX, y: e.clientY };
  dragging = false;
});

window.addEventListener('pointerup', (e) => {
  if (pour.active) {
    pointerDownAt = null;
    dragging = false;
    pour.release();
    return;
  }
  // 锁定中：点击 = 与准星对准的客人互动
  if (locked) {
    if (story.busy) return;
    const id = pickHotspot(window.innerWidth / 2, window.innerHeight / 2);
    if (id) {
      hintEl.classList.add('gone');
      world.setGlow(id, false);
      story.inspect(id);
    }
    return;
  }
  const wasDrag = dragging;
  pointerDownAt = null;
  dragging = false;
  if (wasDrag) return;
  if (story.busy) return;
  const id = pickHotspot(e.clientX, e.clientY);
  if (id) {
    hintEl.classList.add('gone');
    world.setGlow(id, false);
    story.inspect(id);
    return;
  }
  // 点到画面空白：进入第一人称视角；若点中的是死物件，顺带给一句反馈
  if (e.target === canvas) {
    if (pickAnyObject(e.clientX, e.clientY)) {
      const t = performance.now();
      if (t - lastMissAt > 2200) {
        lastMissAt = t;
        toast(MISS_LINES[Math.floor(Math.random() * MISS_LINES.length)]);
      }
    }
    requestLock();
  }
});

window.addEventListener('pointerleave', () => {
  dragging = false;
  pointerDownAt = null;
});
window.addEventListener('keydown', (e) => {
  if (/^[wasd]$/i.test(e.key)) { keys.add(e.key.toLowerCase()); e.preventDefault(); }
});
window.addEventListener('keyup', (e) => { keys.delete(e.key.toLowerCase()); });
window.addEventListener('blur', () => keys.clear());

// 键盘推进：空格 / 回车继续，1~3 选择选项
window.addEventListener('keydown', (e) => {
  if (pour.active) {
    if (e.repeat) return;
    if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); pour.press(); }
    return;
  }
  if (e.repeat || dlg.hidden) return;

  if (!nextBtn.hidden && (e.key === 'Enter' || e.key === ' ' || e.code === 'Space')) {
    e.preventDefault();
    nextBtn.click();
    return;
  }

  if (choicesEl.children.length && /^[1-9]$/.test(e.key)) {
    const idx = Number(e.key) - 1;
    const btn = choicesEl.children[idx];
    if (btn) {
      e.preventDefault();
      btn.click();
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (pour.active && (e.key === ' ' || e.code === 'Space')) {
    e.preventDefault();
    pour.release();
  }
});

/* ---------- 界面 ---------- */

const dlg = document.getElementById('dialog');
const speakerEl = document.getElementById('speaker');
const lineEl = document.getElementById('line');
const choicesEl = document.getElementById('choices');
const nextBtn = document.getElementById('next');
const toastEl = document.getElementById('toast');
const hudEl = document.getElementById('hud');

let typingTimer = null;
let toastTimer = null;

const CN = ['零', '一', '二', '三', '四', '五'];

function renderHud(s) {
  const keys = ['silver', 'fame', 'suspicion'];
  const labels = { silver: 'val-silver', fame: 'val-fame', suspicion: 'val-suspicion' };
  const bars = { silver: 'bar-silver', fame: 'bar-fame', suspicion: 'bar-suspicion' };
  keys.forEach((k) => {
    document.getElementById(labels[k]).textContent = CN[Math.min(s[k], 5)];
    document.getElementById(bars[k]).style.setProperty('--fill', `${Math.min(s[k] / 4, 1) * 100}%`);
  });
  document.getElementById('val-served').textContent = CN[Math.min(s.served || 0, 5)];
  document.getElementById('bar-served').style.setProperty('--fill', `${Math.min((s.served || 0) / 3, 1) * 100}%`);
}

function say(speaker, text) {
  return new Promise((resolve) => {
    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
    dlg.hidden = false;
    choicesEl.innerHTML = '';
    nextBtn.hidden = false;
    nextBtn.textContent = '继续';
    speakerEl.textContent = speaker || '';

    lineEl.textContent = '';
    let i = 0;
    const full = text;
    typingTimer = setInterval(() => {
      i += 1;
      lineEl.textContent = full.slice(0, i);
      if (i >= full.length) { clearInterval(typingTimer); typingTimer = null; }
    }, 24);

    nextBtn.onclick = () => {
      if (typingTimer) {
        clearInterval(typingTimer);
        typingTimer = null;
        lineEl.textContent = full;
        return;
      }
      resolve();
    };
  });
}

function choose(options) {
  return new Promise((resolve) => {
    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
    nextBtn.hidden = true;
    choicesEl.innerHTML = '';
    options.forEach((opt, idx) => {
      const b = document.createElement('button');
      b.textContent = opt.label;
      b.onclick = () => {
        choicesEl.innerHTML = '';
        resolve(idx);
      };
      choicesEl.appendChild(b);
    });
  });
}

function hidePanel() {
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  dlg.hidden = true;
  choicesEl.innerHTML = '';
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  toastEl.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => { toastEl.hidden = true; }, 500);
  }, 1500);
}

/* 开场：先穿越，再由白光接进 3D 长街，最后穿门落到阿七的位置 */
function intro() {
  return playRift().then(() => {
    arrival = playTransition({ camera, endPosition: BASE_POS, endLook: BASE_LOOK });
    return arrival.promise;
  }).then(() => {
    arrival = null;
    camPos.copy(BASE_POS);
    camLook.copy(BASE_LOOK);
    hudEl.classList.add('on');
  });
}

/* 结尾不再弹二维结算卡：画面自己淡下去，剩下交给下一队 */
const fadeEl = document.getElementById('fade');

const ui = {
  intro,
  say,
  choose,
  hidePanel,
  toast,
  hud: renderHud,
  focusOn: focus,
  showRelic: (id) => world.showRelic(id),
  showHint: (t) => { hintEl.textContent = t; hintEl.classList.remove('gone'); },
  hideHint: () => { hintEl.classList.add('gone'); },
  fade: (on = true) => { fadeEl.style.opacity = on ? '1' : '0'; },
};

const story = createStory(ui, {
  focus,
  knock() {
    shake = 1;
    flash = 1;
  },
  pour(id) {
    if (world.pourTea(id)) sfxPour();
  },
  /* 斟酒特写：点桌 → 推镜 → 交给 pour 模块判定 → 拉回 */
  pourWine(id, opts) {
    const a = world.pourAnchor(id);
    if (!a) return Promise.resolve({ hit: true, level: 0, target: 0, spilled: false, taken: false });
    world.setCupVisible(id, false);
    sfxPour();
    return pour.start(a.pos, a.dir, opts || {}).finally(() => world.setCupVisible(id, true));
  },
  pourTarget: () => pour.rollTarget(),
});

/* ---------- 声音 ---------- */

let audioCtx = null;
let rainGain = null;
let audioStarted = false;
let muted = false;

function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const len = audioCtx.sampleRate * 3;
    const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2 + white * 0.25;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;

    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 160;

    rainGain = audioCtx.createGain();
    rainGain.gain.value = 0.0;

    src.connect(hp).connect(lp).connect(rainGain).connect(audioCtx.destination);
    src.start();

    const t = audioCtx.currentTime;
    rainGain.gain.linearRampToValueAtTime(0.085, t + 2.5);
  } catch (err) {
    // 音频不可用时保持静默
  }
}

document.getElementById('sound').onclick = (e) => {
  e.stopPropagation();
  startAudio();
  muted = !muted;
  e.currentTarget.textContent = muted ? '风雪 · 关' : '风雪 · 开';
  if (rainGain && audioCtx) {
    rainGain.gain.linearRampToValueAtTime(muted ? 0.0 : 0.085, audioCtx.currentTime + 0.4);
  }
};

function sfxPour() {
  if (!audioCtx || muted) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;

  const len = Math.floor(ctx.sampleRate * 0.9);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.9;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1500;
  bp.Q.value = 1.1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.028, now + 0.14);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(now);

  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(980, now + 0.5);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0, now + 0.5);
  og.gain.linearRampToValueAtTime(0.011, now + 0.53);
  og.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
  o.connect(og).connect(ctx.destination);
  o.start(now + 0.5);
  o.stop(now + 0.8);
}

/* ---------- 循环 ---------- */

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const lookOffset = new THREE.Vector3();
const move = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, 'YXZ');

let lastTime = performance.now();
let elapsed = 0;

function tick() {
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  elapsed += dt;
  const t = elapsed;

  if (!story.busy && !activeFocus && !pour.active) {
    move.set(0, 0, 0);
    if (keys.has('w')) move.z -= 1;
    if (keys.has('s')) move.z += 1;
    if (keys.has('a')) move.x -= 1;
    if (keys.has('d')) move.x += 1;
    if (move.lengthSq()) {
      move.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(dt * 3.2);
      player.position.copy(world.resolvePlayerMove(player.position, move, player.radius, player));
    }
  }

  world.update(dt);
  pour.update(dt);

  // 过场期间只让镜头沿 3D 路径运动，场景里的雪、灯、客人仍在实时更新
  if (arrival) {
    arrival.update(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
    return;
  }

  // 视角不再回中，纯惯性平滑
  yaw += (targetYaw - yaw) * 0.14;
  pitch += (targetPitch - pitch) * 0.14;

  const px = locked ? 0 : (pointerX - 0.5) * 2;
  const py = locked ? 0 : (pointerY - 0.5) * 2;

  lookOffset.copy(BASE_LOOK).sub(BASE_POS);
  euler.set(pitch, yaw, 0);
  lookOffset.applyEuler(euler);

  if (activeFocus) {
    const hs = focusMap[activeFocus];
    tmpPos.set(hs.focusPos.x, hs.focusPos.y, hs.focusPos.z);
    tmpLook.set(hs.focusTarget.x, hs.focusTarget.y, hs.focusTarget.z);
  } else {
    tmpPos.copy(BASE_POS);
    tmpPos.x += player.position.x - 0.8;
    tmpPos.z += player.position.z - 7.0;
    tmpPos.y = player.position.y + player.eyeHeight;
    tmpLook.copy(tmpPos).add(lookOffset);
  }

  tmpPos.x += px * 0.16 + Math.sin(t * 0.42) * 0.012;
  tmpPos.y += -py * 0.07 + Math.sin(t * 0.61) * 0.008;
  tmpLook.x += px * 0.22;
  tmpLook.y += -py * 0.1;

  /* 斟酒特写：按 cine.k 把大堂机位混到碗前 */
  const ck = Math.max(0, Math.min(1, pour.cine.k));
  if (ck > 0.001) {
    tmpPos.lerp(pour.cine.pos, ck);
    tmpLook.lerp(pour.cine.look, ck);
  }

  const k = 1 - Math.exp(-(5.5 + ck * 16) * dt);
  camPos.lerp(tmpPos, k);
  camLook.lerp(tmpLook, k);

  if (shake > 0.001) {
    shake *= Math.exp(-3.2 * dt);
    camPos.x += (Math.random() - 0.5) * 0.03 * shake;
    camPos.y += (Math.random() - 0.5) * 0.03 * shake;
  }

  camera.position.copy(camPos);
  camera.lookAt(camLook);

  // 锁定状态下：对话/斟酒一占用就松开鼠标；否则每帧从屏幕中心拾取，驱动准星与分色标签
  if (locked && story.busy) {
    document.exitPointerLock();
  } else if (locked) {
    const centerId = pickHotspot(window.innerWidth / 2, window.innerHeight / 2);
    if (centerId !== hoveredId) {
      hoveredId = centerId;
      const hs = centerId ? focusMap[centerId] : null;
      reticleEl.className = centerId ? `on ${hs && hs.kind ? hs.kind : ''}` : '';
      reticleLabel.textContent = hs ? hs.label : '';
    }
  }

  if (flash > 0.001) {
    flash *= Math.exp(-2.4 * dt);
    world.candleLight.intensity += flash * 3;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error(event.reason);
  story.fail('世界线在此处断开');
});

renderHud(story.state);
tick();
story.open().catch((error) => {
  console.error(error);
  story.fail('世界线在开场时断开');
});
