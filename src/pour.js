import * as THREE from '../vendor/three.module.js';

/*
 * 斟酒特写：一只杯子、一把壶、一条刻度带。
 * 只管三件事——蓄力、松手、判定。相机怎么推由调用方决定（cine）。
 */

const CUP = { rTop: 0.046, rBot: 0.032, h: 0.052 };

const TUNE = {
  rateBase: 0.085,
  rateGain: 0.40,
  ratePow: 1.6,
  inertia: 0.22,
  decay: 0.80,
  tolBase: 0.10,
  targetMin: 0.55,
  targetMax: 0.80,
  inTime: 0.9,
  outTime: 0.95,
  settleNeed: 0.26,
};

function radiusAt(y) {
  const k = Math.max(0, Math.min(1, y / CUP.h));
  return CUP.rBot + (CUP.rTop - CUP.rBot) * k;
}

export function createPour(scene, opts = {}) {
  const tune = Object.assign({}, TUNE, opts.tune || {});

  const rig = new THREE.Group();
  rig.visible = false;
  scene.add(rig);

  /* ---------- 桌面垫 ---------- */
  const mat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.082, 0.082, 0.008, 28),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.92 })
  );
  mat.position.y = -0.006;
  mat.receiveShadow = true;
  rig.add(mat);

  /* ---------- 杯子 ---------- */
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xf2e8d4, roughness: 0.34, metalness: 0.04, side: THREE.DoubleSide,
  });
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(CUP.rTop, CUP.rBot, CUP.h, 32, 1, true),
    glassMat
  );
  cup.position.y = CUP.h / 2;
  rig.add(cup);

  const cupBottom = new THREE.Mesh(
    new THREE.CircleGeometry(CUP.rBot * 0.96, 32),
    new THREE.MeshStandardMaterial({ color: 0xe6dac2, roughness: 0.4, side: THREE.DoubleSide })
  );
  cupBottom.rotation.x = -Math.PI / 2;
  cupBottom.position.y = 0.004;
  rig.add(cupBottom);

  /* ---------- 酒液 ---------- */
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0xd9a45c, roughness: 0.26, metalness: 0.08,
  });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32), liquidMat);
  liquid.scale.set(0.001, 0.001, 0.001);
  rig.add(liquid);

  const surfaceMat = new THREE.MeshStandardMaterial({
    color: 0xc8862c, roughness: 0.22, metalness: 0.15,
    transparent: true, opacity: 0.9, side: THREE.DoubleSide,
  });
  const surface = new THREE.Mesh(new THREE.CircleGeometry(1, 32), surfaceMat);
  surface.rotation.x = -Math.PI / 2;
  surface.scale.set(0.001, 0.001, 0.001);
  rig.add(surface);

  /* ---------- 刻度带（容差范围） ---------- */
  const bandMat = new THREE.MeshBasicMaterial({
    color: 0xffcf8a, transparent: true, opacity: 0.0,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32, 1, true), bandMat);
  band.scale.set(0.001, 0.001, 0.001);
  rig.add(band);

  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffe6b8, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
  const markLine = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.0028, 32, 1, true), lineMat);
  markLine.scale.set(0.001, 1, 0.001);
  rig.add(markLine);

  /* ---------- 壶 ---------- */
  const jug = new THREE.Group();
  const jugBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.040, 0.048, 0.135, 20),
    new THREE.MeshStandardMaterial({ color: 0x5d4a36, roughness: 0.62, metalness: 0.22 })
  );
  jugBody.position.y = 0.068;
  jug.add(jugBody);
  const jugLid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.036, 0.022, 16),
    new THREE.MeshStandardMaterial({ color: 0x4a3a29, roughness: 0.6, metalness: 0.3 })
  );
  jugLid.position.y = 0.145;
  jug.add(jugLid);
  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.016, 0.10, 10),
    new THREE.MeshStandardMaterial({ color: 0x5d4a36, roughness: 0.62, metalness: 0.22 })
  );
  spout.position.set(0.050, 0.105, 0);
  spout.rotation.z = -0.95;
  jug.add(spout);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.038, 0.008, 8, 16, Math.PI * 1.2),
    new THREE.MeshStandardMaterial({ color: 0x5d4a36, roughness: 0.62, metalness: 0.22 })
  );
  handle.position.set(-0.05, 0.082, 0);
  handle.rotation.z = -1.1;
  jug.add(handle);
  /* 提壶的那只手：先给个能看的代理，后面再换真手 */
  const handMat = new THREE.MeshStandardMaterial({ color: 0xd9b48f, roughness: 0.75 });
  const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x3d3026, roughness: 0.96 });
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 12), handMat);
  palm.scale.set(1.15, 0.9, 0.75);
  palm.position.set(-0.052, 0.078, 0.012);
  jug.add(palm);
  const fingers = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 16, Math.PI * 1.1), handMat);
  fingers.position.set(-0.032, 0.088, 0.012);
  fingers.rotation.set(Math.PI / 2, 0, 0.4);
  jug.add(fingers);
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.062, 0.24, 12), sleeveMat);
  sleeve.position.set(-0.115, 0.045, 0.012);
  sleeve.rotation.z = -0.62;
  jug.add(sleeve);

  jug.scale.setScalar(0.34);
  rig.add(jug);

  /* ---------- 酒流 ---------- */
  const streamMat = new THREE.MeshBasicMaterial({ color: 0xe6b877, transparent: true, opacity: 0.0, depthWrite: false });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.006, 1, 8, 1, true), streamMat);
  stream.visible = false;
  rig.add(stream);

  /* ---------- 灯（特写补一盏，别让杯子瞎在黑影里） ---------- */
  const keyLight = new THREE.PointLight(0xffb877, 0, 2.4, 2);
  keyLight.position.set(0.22, 0.42, 0.30);
  rig.add(keyLight);
  const rimLight = new THREE.PointLight(0x87a6d8, 0, 2.0, 2);
  rimLight.position.set(-0.18, 0.2, -0.16);
  rig.add(rimLight);

  /* ---------- 状态 ---------- */
  const state = {
    phase: 'idle', // idle | in | pour | judge | out
    level: 0, vel: 0, hold: 0, pouring: false, settle: 0,
    target: 0.62, tol: tune.tolBase,
    hit: null, t: 0, phaseT: 0,
  };

  let resolveRun = null;
  let pendingPress = false;
  let viewDir = new THREE.Vector3(0, 0, 1);
  const anchor = new THREE.Vector3();

  const cine = {
    pos: new THREE.Vector3(),
    look: new THREE.Vector3(),
    k: 0, // 0 = 大堂视角, 1 = 特写
  };

  function place(anchorPos, dir) {
    anchor.copy(anchorPos);
    viewDir.copy(dir).setY(0).normalize();
    rig.position.copy(anchor);
    rig.rotation.y = Math.atan2(viewDir.x, viewDir.z);
    cine.pos.copy(anchor).addScaledVector(viewDir, 0.38).add(new THREE.Vector3(0, 0.275, 0));
    cine.look.copy(anchor).add(new THREE.Vector3(0, CUP.h * 0.42, 0));
  }

  function resetCup() {
    state.level = 0; state.vel = 0; state.hold = 0;
    state.pouring = false; state.settle = 0; state.hit = null;
    state.target = tune.targetMin + Math.random() * (tune.targetMax - tune.targetMin);
    state.tol = tune.tolBase;
    /*
     * 目标改成四舍五入到「分」：客人报「七分满」，杯上就有一条对应的线
     * 五成到八成之间挑一档
     */
    state.target = Math.round(state.target * 10) / 10;
    state.target = Math.max(0.5, Math.min(0.8, state.target));
  }

  function paintCup() {
    const lv = Math.max(0, Math.min(1, state.level));
    const h = Math.max(0.0001, lv * CUP.h * 0.96);
    const r = radiusAt(h * 0.4) * 0.94; /* 贴着碗壁走，别从底下漏出来 */
    liquid.scale.set(r, h, r);
    liquid.position.y = h / 2;

    const sr = radiusAt(h) * 0.97;
    surface.scale.set(sr, sr, 1); /* 盘面已绕 X 转 90°，缩放轴要跟着换 */
    surface.position.y = h + 0.0008;
    surface.visible = lv > 0.012;

    /* 刻度带：目标上下各一格容差 */
    const top = Math.min(1, state.target + state.tol) * CUP.h * 0.96;
    const bot = Math.max(0, state.target - state.tol) * CUP.h * 0.96;
    const bandH = Math.max(0.002, top - bot);
    const bandR = radiusAt(bot + bandH / 2) * 1.035;
    band.scale.set(bandR, bandH, bandR);
    band.position.y = bot + bandH / 2;
    bandMat.opacity = 0.16;

    const lineY = state.target * CUP.h * 0.96;
    const lineR = radiusAt(lineY) * 1.05;
    markLine.scale.set(lineR, 1, lineR);
    markLine.position.y = lineY;
    lineMat.opacity = 0.75;

    const near = 1 - Math.min(1, Math.abs(state.level - state.target) / 0.14);
    liquidMat.color.setRGB(0.58 + near * 0.16, 0.31 + near * 0.14, 0.08 + near * 0.06);
    keyLight.intensity = 0.45 + near * 0.3;
    rimLight.intensity = 0.3 + near * 0.2;
  }

  function paintJug() {
    /* 壶嘴高度跟着液面走，倒的时候倾，停的时候回正 */
    const pourA = state.pouring ? 1 : 0;
    jug.visible = true;
    const fill = state.level;
    jug.position.set(0.088, 0.106 + Math.sin(state.t * 3) * 0.0015, -0.026);
    jug.rotation.z = -0.05 - pourA * 0.62;
    jug.rotation.x = 0.12;

    const spoutWorld = new THREE.Vector3(0.062, 0.052, 0).multiplyScalar(jug.scale.x);
    spoutWorld.applyAxisAngle(new THREE.Vector3(0, 0, 1), jug.rotation.z);
    spoutWorld.add(jug.position);

    const topY = Math.max(0.02, state.level * CUP.h * 0.96);
    const dx = -(spoutWorld.x - 0);
    const dy = spoutWorld.y - topY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (state.pouring && len > 0.02) {
      stream.visible = true;
      stream.scale.set(1, len, 1);
      stream.position.set(spoutWorld.x / 2, (spoutWorld.y + topY) / 2, spoutWorld.z / 2);
      stream.rotation.z = Math.atan2(dx, dy);
      streamMat.opacity = 0.55;
    } else {
      stream.visible = false;
      streamMat.opacity = 0;
    }
    return fill;
  }

  function rateNow() {
    return tune.rateBase + tune.rateGain * Math.pow(state.hold, tune.ratePow);
  }

  function judgeNow() {
    const d = Math.abs(state.level - state.target);
    state.hit = d <= state.tol;
    state.phase = 'judge';
    state.phaseT = 0;
    if (state.hit) {
      liquidMat.color.setRGB(0.72, 0.9, 0.6);
    } else {
      liquidMat.color.setRGB(0.95, 0.45, 0.35);
    }
  }

  return {
    rig,
    cine,
    state,
    /** 不开始流程，只把空杯摆好（远景预览用） */
    preview(anchorPos, dir) {
      place(anchorPos, dir);
      resetCup();
      rig.visible = true;
      state.phase = 'idle';
      state.t = 0;
      state.phaseT = 0;
      cine.k = 0;
      paintCup();
      paintJug();
    },
    /** 开始一次：anchor 是杯子底部世界坐标，dir 是玩家所在方向 */
    start(anchorPos, dir) {
      place(anchorPos, dir);
      resetCup();
      rig.visible = true;
      state.phase = 'in';
      state.t = 0;
      state.phaseT = 0;
      cine.k = 0;
      paintCup();
      paintJug();
      return new Promise((resolve) => { resolveRun = resolve; });
    },
    press() {
      if (state.phase === 'in') { pendingPress = true; return false; }
      if (state.phase !== 'pour' || state.pouring) return false;
      state.pouring = true;
      state.hold = 0;
      state.vel = 0;
      return true;
    },
    release() {
      pendingPress = false;
      if (!state.pouring) return false;
      state.pouring = false;
      state.vel *= tune.inertia;
      state.settle = 0;
      return true;
    },
    update(dt) {
      if (state.phase === 'idle') return;
      state.t += dt;
      state.phaseT += dt;

      if (state.phase === 'in') {
        cine.k = Math.min(1, state.phaseT / tune.inTime);
        if (cine.k >= 1) {
          state.phase = 'pour';
          state.phaseT = 0;
          if (pendingPress) { pendingPress = false; state.pouring = true; state.hold = 0; state.vel = 0; }
        }
      } else if (state.phase === 'pour') {
        if (state.pouring) {
          state.hold += dt;
          const r = rateNow();
          state.level += r * dt;
          state.vel = r;
        } else {
          state.level += state.vel * dt;
          state.vel *= Math.pow(tune.decay, dt * 60);
          if (Math.abs(state.vel) < 0.004) state.vel = 0;
        }
        state.level = Math.max(0, Math.min(1.04, state.level));
        if (!state.pouring && state.level > 0.02 && Math.abs(state.vel) < 0.012) {
          state.settle += dt;
          if (state.settle > tune.settleNeed) judgeNow();
        } else {
          state.settle = 0;
        }
      } else if (state.phase === 'judge') {
        if (state.phaseT > 1.0) { state.phase = 'out'; state.phaseT = 0; }
      } else if (state.phase === 'out') {
        cine.k = Math.max(0, 1 - state.phaseT / tune.outTime);
        if (cine.k <= 0) {
          state.phase = 'idle';
          rig.visible = false;
          if (resolveRun) {
            const done = resolveRun;
            resolveRun = null;
            done({ hit: state.hit, level: state.level, target: state.target });
          }
          return;
        }
      }

      paintCup();
      paintJug();
    },
    get active() { return state.phase !== 'idle'; },
    get phase() { return state.phase; },
  };
}
