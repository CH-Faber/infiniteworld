import * as THREE from '../vendor/three.module.js';

/* 开场过场：从雪夜长街走进听雨楼。
 * 直接使用大堂的 Three.js 场景与相机，不另建 2D 画布。
 * 镜头：长街望匾 → 走近门楼 → 跨过门槛 → 落到阿七的位置。
 */

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x) => 1 - Math.pow(1 - x, 3);

function readSave() {
  try {
    if (typeof WL !== 'undefined' && WL && typeof WL.readSave === 'function') {
      const s = WL.readSave();
      if (s && typeof s === 'object') return s;
    }
  } catch (e) { /* 没有平台桥 */ }
  return {};
}

export function playTransition({ camera, endPosition, endLook }) {
  const save = readSave();
  const prevWorld = String(save.prev_world || '').trim();
  const level = Number(save.level);

  const overlay = document.createElement('div');
  overlay.id = 'arrival';
  overlay.innerHTML = `
    <div class="arrival-black"></div>
    <div class="arrival-letterbox" aria-hidden="true"></div>
    <div class="arrival-origin">
      <span>世界线在此交汇</span>
      <p></p>
    </div>
    <div class="arrival-title">
      <span>武侠客栈</span>
      <h1>听雨楼</h1>
      <p>${level > 0 && level <= 10 ? `第 ${level} 关 · 雪夜` : '雪夜 · 阿七'}</p>
    </div>
    <div class="arrival-enter">跨过这道门，你就是阿七</div>
    <div class="arrival-skip">点击 / 空格 · 进入客栈</div>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add('arriving');

  const black = overlay.querySelector('.arrival-black');
  const origin = overlay.querySelector('.arrival-origin');
  origin.querySelector('p').textContent = prevWorld ? `自「${prevWorld}」而来` : '自上一座世界而来';
  const title = overlay.querySelector('.arrival-title');
  const enter = overlay.querySelector('.arrival-enter');
  const skipHint = overlay.querySelector('.arrival-skip');

  /* 街道望匾的机位 */
  const streetPos = new THREE.Vector3(-0.45, 1.66, 18.4);
  const streetNear = new THREE.Vector3(0, 1.68, 15.2);
  const streetLook = new THREE.Vector3(0, 4.62, 8.1);

  /* 之后共用一条真正的空间曲线，连续穿过门洞，没有切镜 */
  const walkPath = new THREE.CatmullRomCurve3([
    streetNear.clone(),
    new THREE.Vector3(0, 1.66, 12.1),
    new THREE.Vector3(0.08, 1.64, 9.25),
    new THREE.Vector3(0.34, 1.62, 7.75),
    endPosition.clone(),
  ], false, 'catmullrom', 0.32);
  const lookPath = new THREE.CatmullRomCurve3([
    streetLook.clone(),
    new THREE.Vector3(0, 3.0, 6.4),
    new THREE.Vector3(0.5, 1.72, 1.2),
    new THREE.Vector3(0.95, 1.46, -2.5),
    endLook.clone(),
  ], false, 'catmullrom', 0.28);

  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const DURATION = 9.4;
  let time = 0;
  let done = false;
  let resolvePromise;
  const promise = new Promise((resolve) => { resolvePromise = resolve; });

  function setCamera(position, target, bob = 0) {
    camera.position.copy(position);
    camera.position.y += bob;
    camera.lookAt(target);
  }

  function finish() {
    if (done) return;
    done = true;
    window.removeEventListener('pointerdown', finish, true);
    window.removeEventListener('keydown', onKey, true);
    setCamera(endPosition, endLook);
    camera.fov = 56;
    camera.updateProjectionMatrix();
    overlay.classList.add('leaving');
    document.body.classList.remove('arriving');
    window.setTimeout(() => {
      overlay.remove();
      resolvePromise();
    }, 420);
  }

  function onKey(e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      finish();
    }
  }
  window.addEventListener('pointerdown', finish, true);
  window.addEventListener('keydown', onKey, true);

  function update(dt) {
    if (done) return;
    time = Math.min(DURATION, time + dt);

    /* 黑场睁眼；结尾不遮场景，保证镜头直接交给游戏 */
    black.style.opacity = String(1 - easeOut(seg(time, 0.05, 1.15)));

    if (time <= 2.6) {
      const k = easeInOut(seg(time, 0, 2.6));
      pos.lerpVectors(streetPos, streetNear, k);
      look.copy(streetLook);
      look.y += Math.sin(time * 0.65) * 0.025;
      setCamera(pos, look, Math.sin(time * 1.1) * 0.008);
    } else {
      const k = easeInOut(seg(time, 2.6, 8.85));
      walkPath.getPoint(k, pos);
      lookPath.getPoint(k, look);
      /* 进门时有很轻的步伐起伏，到阿七位置前完全停下 */
      const walking = Math.sin(seg(time, 2.6, 8.5) * Math.PI);
      const bob = Math.sin(time * 7.2) * 0.014 * walking;
      setCamera(pos, look, bob);
    }

    /* 走近匾额时轻轻收拢视野；跨门后恢复游戏相机 */
    const fov = 60 - easeInOut(seg(time, 0.5, 3.4)) * 4;
    camera.fov = fov;
    camera.updateProjectionMatrix();

    /* 两组字幕先后完整退场，任何时刻都不叠字 */
    const originAlpha = easeOut(seg(time, 0.55, 1.15)) * (1 - seg(time, 1.35, 1.80));
    origin.style.opacity = String(originAlpha);
    origin.style.transform = `translate(-50%, ${(1 - originAlpha) * 8}px)`;

    const titleAlpha = easeOut(seg(time, 2.05, 2.75)) * (1 - seg(time, 3.85, 4.55));
    title.style.opacity = String(titleAlpha);
    title.style.transform = `translate(-50%, ${(1 - easeOut(seg(time, 2.05, 2.85))) * 18}px)`;

    const enterAlpha = easeOut(seg(time, 5.55, 6.15)) * (1 - seg(time, 7.2, 8.0));
    enter.style.opacity = String(enterAlpha * 0.78);

    const hintAlpha = easeOut(seg(time, 1.4, 2.2)) * (1 - seg(time, 7.6, 8.6));
    skipHint.style.opacity = String(hintAlpha * 0.45);

    overlay.classList.toggle('inside', time > 5.0);
    if (time >= DURATION) finish();
  }

  update(0);
  return { promise, update, finish };
}
