import * as THREE from '../vendor/three.module.js';
import { buildWorld } from './world.js';
import { createStory } from './story.js';

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

/* ---------- 镜头 ---------- */

const BASE_POS = new THREE.Vector3(0.8, 1.62, 7.0);
const BASE_LOOK = new THREE.Vector3(1.1, 1.42, -3.8);

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

const MISS_LINES = ['这一处，只有潮气和油烟。', '茶客们各说各的，没人理你。', '你只是个端茶的。', '帘子后头，什么也没有。'];
let lastMissAt = 0;

window.addEventListener('pointermove', (e) => {
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
  pointerDownAt = { x: e.clientX, y: e.clientY };
  dragging = false;
  startAudio();
});

window.addEventListener('pointerup', (e) => {
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
  // 点到了东西、但不是可交互物件：给一句反馈，别让人以为页面死了
  if (pickAnyObject(e.clientX, e.clientY)) {
    const t = performance.now();
    if (t - lastMissAt > 2200) {
      lastMissAt = t;
      toast(MISS_LINES[Math.floor(Math.random() * MISS_LINES.length)]);
    }
  }
});

window.addEventListener('pointerleave', () => {
  dragging = false;
  pointerDownAt = null;
});

// 键盘推进：空格 / 回车继续，1~3 选择选项
window.addEventListener('keydown', (e) => {
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
  document.getElementById('bar-served').style.setProperty('--fill', `${Math.min((s.served || 0) / 4, 1) * 100}%`);
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

function intro() {
  return new Promise((resolve) => {
    const el = document.getElementById('intro');
    setTimeout(() => {
      el.classList.add('out');
      hudEl.classList.add('on');
      setTimeout(() => {
        el.hidden = true;
        resolve();
      }, 1500);
    }, 2600);
  });
}

function end(payload) {
  const el = document.getElementById('ending');
  document.getElementById('ending-title').textContent = payload.title;
  document.getElementById('ending-text').textContent = payload.text;
  const s = story.state;
  document.getElementById('ending-stats').innerHTML =
    `<span>赏钱<b>${CN[Math.min(s.silver, 5)]}</b></span>` +
    `<span>名声<b>${CN[Math.min(s.fame, 5)]}</b></span>` +
    `<span>疑心<b>${CN[Math.min(s.suspicion, 5)]}</b></span>` +
    `<span>留下<b>${payload.item}</b></span>`;
  el.querySelector('.ending-note').textContent = payload.hook;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('on'));
}

document.getElementById('again').onclick = () => location.reload();

const ui = {
  intro,
  say,
  choose,
  hidePanel,
  toast,
  hud: renderHud,
  end,
  focusOn: focus,
  showRelic: (id) => world.showRelic(id),
  showHint: (t) => { hintEl.textContent = t; hintEl.classList.remove('gone'); },
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
const euler = new THREE.Euler(0, 0, 0, 'YXZ');

let lastTime = performance.now();
let elapsed = 0;

function tick() {
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  elapsed += dt;
  const t = elapsed;

  world.update(dt);

  // 拖拽后保留视角，极慢回中
  targetYaw *= 0.999;
  targetPitch *= 0.999;
  yaw += (targetYaw - yaw) * 0.12;
  pitch += (targetPitch - pitch) * 0.12;

  const px = (pointerX - 0.5) * 2;
  const py = (pointerY - 0.5) * 2;

  lookOffset.copy(BASE_LOOK).sub(BASE_POS);
  euler.set(pitch, yaw, 0);
  lookOffset.applyEuler(euler);

  if (activeFocus) {
    const hs = focusMap[activeFocus];
    tmpPos.set(hs.focusPos.x, hs.focusPos.y, hs.focusPos.z);
    tmpLook.set(hs.focusTarget.x, hs.focusTarget.y, hs.focusTarget.z);
  } else {
    tmpPos.copy(BASE_POS);
    tmpLook.copy(BASE_POS).add(lookOffset);
  }

  tmpPos.x += px * 0.16 + Math.sin(t * 0.42) * 0.012;
  tmpPos.y += -py * 0.07 + Math.sin(t * 0.61) * 0.008;
  tmpLook.x += px * 0.22;
  tmpLook.y += -py * 0.1;

  const k = 1 - Math.exp(-5.5 * dt);
  camPos.lerp(tmpPos, k);
  camLook.lerp(tmpLook, k);

  if (shake > 0.001) {
    shake *= Math.exp(-3.2 * dt);
    camPos.x += (Math.random() - 0.5) * 0.03 * shake;
    camPos.y += (Math.random() - 0.5) * 0.03 * shake;
  }

  camera.position.copy(camPos);
  camera.lookAt(camLook);

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

renderHud(story.state);
tick();
story.open();
