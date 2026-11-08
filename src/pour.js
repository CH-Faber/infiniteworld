import * as THREE from '../vendor/three.module.js';

const BOWL = {
  bottom: 0.011,
  top: 0.0475,
  profile: [
    [0.000, 0.000], [0.015, 0.000], [0.019, 0.004], [0.022, 0.009],
    [0.035, 0.018], [0.043, 0.032], [0.046, 0.047], [0.045, 0.052],
    [0.042, 0.052], [0.040, 0.047], [0.037, 0.032], [0.030, 0.019],
    [0.023, 0.011], [0.000, 0.010],
  ],
  outer: [
    [0.015, 0.000], [0.019, 0.004], [0.022, 0.009], [0.035, 0.018],
    [0.043, 0.032], [0.046, 0.047], [0.045, 0.052],
  ],
  inner: [
    [0.023, 0.011], [0.030, 0.019], [0.037, 0.032],
    [0.040, 0.047], [0.042, 0.052],
  ],
};

const TIME = { enter: 0.85, stop: 0.48, judge: 0.78, exit: 0.80 };
const TILT = { idle: 0.12, pour: 0.95, handover: 0.32 };
const JUG_IDLE = new THREE.Vector3(0.115, 0.150, -0.018);
const JUG_POUR = new THREE.Vector3(0.115, 0.125, -0.018);
const SPOUT_TIP = new THREE.Vector3(-0.095, 0.055, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const SPHERE = new THREE.SphereGeometry(1, 12, 8);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clamp01 = (v) => clamp(v, 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (v) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const damp = (value, target, speed, dt) => target + (value - target) * Math.exp(-speed * dt);

function radiusAt(table, y) {
  if (y <= table[0][1]) return table[0][0];
  for (let i = 1; i < table.length; i++) {
    if (y <= table[i][1]) {
      const a = table[i - 1];
      const b = table[i];
      return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1]));
    }
  }
  return table[table.length - 1][0];
}

function levelToY(level) {
  return lerp(BOWL.bottom, BOWL.top, clamp01(level));
}

function mesh(parent, geometry, material, position) {
  const m = new THREE.Mesh(geometry, material);
  if (position) m.position.copy(position);
  parent.add(m);
  return m;
}

function ellipsoid(parent, material, position, scale) {
  const m = mesh(parent, SPHERE, material, position);
  m.scale.copy(scale);
  return m;
}

function bone(parent, a, b, radius, material) {
  const delta = new THREE.Vector3().subVectors(b, a);
  const m = mesh(
    parent,
    new THREE.CapsuleGeometry(radius, delta.length(), 3, 8),
    material
  );
  m.position.copy(a).addScaledVector(delta, 0.5);
  m.quaternion.setFromUnitVectors(Y_AXIS, delta.normalize());
  return m;
}

function limb(parent, a, b, rA, rB, material) {
  const delta = new THREE.Vector3().subVectors(b, a);
  const m = mesh(
    parent,
    new THREE.CylinderGeometry(rB, rA, delta.length(), 12, 1, false),
    material
  );
  m.position.copy(a).addScaledVector(delta, 0.5);
  m.quaternion.setFromUnitVectors(Y_AXIS, delta.normalize());
  return m;
}

function makeGripHand(skin, sleeve, cuff, nail, friend = false) {
  const hand = new THREE.Group();
  ellipsoid(
    hand, skin,
    new THREE.Vector3(0.074, 0.004, 0.015),
    new THREE.Vector3(0.019, 0.027, 0.013)
  );

  for (let i = 0; i < 3; i++) {
    const y = 0.019 - i * 0.014;
    const a = new THREE.Vector3(0.075, y, 0.021);
    const b = new THREE.Vector3(0.059, y - 0.002, 0.026);
    const c = new THREE.Vector3(0.047, y - 0.004, 0.012);
    bone(hand, a, b, 0.0043, skin);
    bone(hand, b, c, 0.0037, skin);
    ellipsoid(hand, skin, b, new THREE.Vector3(0.0046, 0.0046, 0.0046));
    ellipsoid(hand, nail, c, new THREE.Vector3(0.0032, 0.0021, 0.0018));
  }

  bone(
    hand,
    new THREE.Vector3(0.076, 0.022, 0.015),
    new THREE.Vector3(0.058, 0.031, 0.017),
    0.0050,
    skin
  );
  bone(
    hand,
    new THREE.Vector3(0.058, 0.031, 0.017),
    new THREE.Vector3(0.044, 0.020, 0.009),
    0.0043,
    skin
  );

  const wristA = new THREE.Vector3(0.087, -0.004, 0.016);
  const wristB = new THREE.Vector3(0.116, -0.014, 0.022);
  limb(hand, wristA, wristB, 0.013, 0.014, skin);
  const sleeveEnd = friend
    ? new THREE.Vector3(0.205, 0.105, -0.035)
    : new THREE.Vector3(0.220, -0.085, 0.045);
  limb(hand, wristB, sleeveEnd, 0.022, 0.037, sleeve);
  const cuffMesh = mesh(hand, new THREE.CylinderGeometry(0.024, 0.024, 0.012, 12), cuff);
  const cuffAxis = new THREE.Vector3().subVectors(sleeveEnd, wristB).normalize();
  cuffMesh.quaternion.setFromUnitVectors(Y_AXIS, cuffAxis);
  cuffMesh.position.copy(wristB).addScaledVector(cuffAxis, 0.006);
  return hand;
}

function makeShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(0,0,0,0.60)');
  gradient.addColorStop(0.45, 'rgba(0,0,0,0.28)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function buildModels(rig) {
  const bowlMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.42,
    clearcoat: 0.25,
    clearcoatRoughness: 0.36,
    side: THREE.DoubleSide,
  });
  const bowlGeometry = new THREE.LatheGeometry(
    BOWL.profile.map(([r, y]) => new THREE.Vector2(r, y)),
    40
  );
  const positions = bowlGeometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const low = new THREE.Color(0x3f6257);
  const high = new THREE.Color(0x8faf9d);
  const color = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    color.copy(low).lerp(high, smooth(positions.getY(i) / 0.052));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  bowlGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  mesh(rig, bowlGeometry, bowlMaterial);

  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xa8c5b2, roughness: 0.30 });
  const rim = mesh(rig, new THREE.TorusGeometry(0.0438, 0.0015, 6, 40), rimMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.0508;
  const foot = mesh(
    rig,
    new THREE.CylinderGeometry(0.016, 0.018, 0.004, 24),
    new THREE.MeshStandardMaterial({ color: 0x527568, roughness: 0.46 })
  );
  foot.position.y = 0.002;

  const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xd9b369 });
  const targetRing = mesh(rig, new THREE.TorusGeometry(1, 0.012, 5, 48), targetMaterial);
  targetRing.rotation.x = Math.PI / 2;
  targetRing.renderOrder = 2;

  const wineSideMaterial = new THREE.MeshStandardMaterial({
    color: 0x83400f,
    roughness: 0.26,
    side: THREE.DoubleSide,
  });
  const wineMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb8772c,
    roughness: 0.23,
    clearcoat: 0.25,
    clearcoatRoughness: 0.22,
    specularIntensity: 0.35,
    side: THREE.DoubleSide,
  });
  const wineSide = mesh(
    rig,
    new THREE.CylinderGeometry(1, 0.55, 1, 40, 1, true),
    wineSideMaterial
  );
  const surface = mesh(rig, new THREE.CircleGeometry(1, 48), wineMaterial);
  surface.rotation.x = -Math.PI / 2;
  surface.renderOrder = 1;
  const meniscus = mesh(
    rig,
    new THREE.RingGeometry(0.91, 1, 48),
    new THREE.MeshBasicMaterial({ color: 0xf0bd66, side: THREE.DoubleSide })
  );
  meniscus.rotation.x = -Math.PI / 2;
  meniscus.renderOrder = 2;

  const rippleMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd88c,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ripples = [0, 1].map(() => {
    const ring = mesh(rig, new THREE.RingGeometry(0.93, 1, 32), rippleMaterial.clone());
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = 3;
    return ring;
  });

  const overflow = mesh(
    rig,
    new THREE.TorusGeometry(0.044, 0.0014, 5, 40),
    new THREE.MeshBasicMaterial({ color: 0xd89538 })
  );
  overflow.rotation.x = Math.PI / 2;
  overflow.position.y = 0.0502;
  const puddle = mesh(
    rig,
    new THREE.CircleGeometry(0.047, 11),
    new THREE.MeshBasicMaterial({
      color: 0x6f360e,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    })
  );
  puddle.rotation.x = -Math.PI / 2;
  puddle.rotation.z = 0.35;
  puddle.scale.set(1.35, 0.72, 1);
  puddle.position.set(0.018, 0.0003, 0.020);

  const contact = mesh(
    rig,
    new THREE.PlaneGeometry(0.145, 0.145),
    new THREE.MeshBasicMaterial({
      map: makeShadowTexture(),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = -0.0005;

  const jug = new THREE.Group();
  rig.add(jug);
  const clay = new THREE.MeshPhysicalMaterial({
    color: 0x4c2e22,
    roughness: 0.58,
    clearcoat: 0.12,
    clearcoatRoughness: 0.46,
  });
  const brass = new THREE.MeshStandardMaterial({ color: 0x9b7744, roughness: 0.38, metalness: 0.45 });
  const bodyProfile = [
    [0.000, -0.052], [0.022, -0.052], [0.030, -0.045], [0.035, -0.025],
    [0.036, 0.002], [0.032, 0.024], [0.023, 0.040], [0.014, 0.047],
    [0.014, 0.056], [0.018, 0.059], [0.000, 0.059],
  ];
  mesh(
    jug,
    new THREE.LatheGeometry(bodyProfile.map(([r, y]) => new THREE.Vector2(r, y)), 28),
    clay
  );
  const lid = mesh(jug, new THREE.CylinderGeometry(0.019, 0.017, 0.005, 24), clay);
  lid.position.y = 0.060;
  ellipsoid(
    jug, clay,
    new THREE.Vector3(0, 0.065, 0),
    new THREE.Vector3(0.018, 0.008, 0.018)
  );
  ellipsoid(
    jug, brass,
    new THREE.Vector3(0, 0.075, 0),
    new THREE.Vector3(0.0055, 0.0065, 0.0055)
  );
  const neckBand = mesh(jug, new THREE.TorusGeometry(0.0152, 0.0011, 5, 24), brass);
  neckBand.rotation.x = Math.PI / 2;
  neckBand.position.y = 0.053;

  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.026, 0.002, 0),
    new THREE.Vector3(-0.050, 0.025, 0),
    new THREE.Vector3(-0.080, 0.050, 0),
    SPOUT_TIP.clone(),
  ]);
  mesh(jug, new THREE.TubeGeometry(spoutCurve, 18, 0.0052, 8, false), clay);
  const mouth = mesh(jug, new THREE.CylinderGeometry(0.0055, 0.0055, 0.0015, 12), brass);
  mouth.position.copy(SPOUT_TIP);
  mouth.quaternion.setFromUnitVectors(Y_AXIS, new THREE.Vector3(-0.95, 0.31, 0).normalize());

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.026, 0.026, 0),
    new THREE.Vector3(0.058, 0.031, 0),
    new THREE.Vector3(0.072, 0.007, 0),
    new THREE.Vector3(0.062, -0.027, 0),
    new THREE.Vector3(0.029, -0.034, 0),
  ]);
  mesh(jug, new THREE.TubeGeometry(handleCurve, 22, 0.0050, 8, false), clay);

  const nail = new THREE.MeshStandardMaterial({ color: 0xd8b79a, roughness: 0.55 });
  const player = makeGripHand(
    new THREE.MeshStandardMaterial({ color: 0xb98a68, roughness: 0.72 }),
    new THREE.MeshStandardMaterial({ color: 0x35434a, roughness: 0.96 }),
    new THREE.MeshStandardMaterial({ color: 0x202a30, roughness: 0.96 }),
    nail
  );
  jug.add(player);
  const friend = makeGripHand(
    new THREE.MeshStandardMaterial({ color: 0xc49a78, roughness: 0.74 }),
    new THREE.MeshStandardMaterial({ color: 0xa39c89, roughness: 0.98 }),
    new THREE.MeshStandardMaterial({ color: 0x6f6a5d, roughness: 0.96 }),
    nail,
    true
  );
  jug.add(friend);

  const streamMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0a34d,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  });
  const stream = mesh(
    rig,
    new THREE.CylinderGeometry(0.0022, 0.0030, 1, 8, 1, true),
    streamMaterial
  );
  stream.renderOrder = 5;
  const streamCore = mesh(
    rig,
    new THREE.CylinderGeometry(0.0007, 0.0010, 1, 6, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffdf9b,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    })
  );
  streamCore.renderOrder = 6;
  const droplets = [0, 1, 2, 3].map(() => {
    const drop = ellipsoid(
      rig,
      new THREE.MeshBasicMaterial({ color: 0xf2bd64 }),
      new THREE.Vector3(),
      new THREE.Vector3(0.0015, 0.0015, 0.0015)
    );
    drop.renderOrder = 6;
    return drop;
  });

  const key = new THREE.SpotLight(0xffd09a, 0, 1.4, 0.78, 0.85, 1.5);
  key.position.set(0.08, 0.34, 0.24);
  key.target.position.set(0, 0.035, 0);
  rig.add(key, key.target);
  const rimLight = new THREE.PointLight(0xa9c6d5, 0, 1.0, 2);
  rimLight.position.set(-0.20, 0.22, -0.20);
  rig.add(rimLight);
  const fill = new THREE.PointLight(0xffe0b5, 0, 0.9, 2);
  fill.position.set(0.12, 0.14, 0.28);
  rig.add(fill);

  return {
    jug, player, friend, targetRing, targetMaterial,
    wineSide, surface, meniscus, ripples, overflow, puddle,
    stream, streamCore, droplets, key, rimLight, fill,
  };
}

export function createPour(scene) {
  const rig = new THREE.Group();
  rig.visible = false;
  scene.add(rig);
  const model = buildModels(rig);

  const state = {
    phase: 'idle',
    level: 0,
    vel: 0,
    hold: 0,
    pouring: false,
    target: 0.7,
    tol: 0.10,
    hit: null,
    taken: false,
    t: 0,
    phaseT: 0,
    settle: 0,
    takeT: 0,
    takeFrom: 0,
  };
  const cine = { pos: new THREE.Vector3(), look: new THREE.Vector3(), k: 0 };
  const viewDir = new THREE.Vector3(0, 0, 1);
  const sideDir = new THREE.Vector3(1, 0, 0);
  const spoutTip = new THREE.Vector3();
  const landPoint = new THREE.Vector3();
  const streamDelta = new THREE.Vector3();

  let runOpts = {};
  let resolveRun = null;
  let held = false;
  let hasPressed = false;
  let stopRequested = false;
  let stopTimer = 0;
  let streamOn = false;
  let tilt = TILT.idle;
  let flowGate = 0;

  function rollTarget() {
    return 0.5 + Math.floor(Math.random() * 4) / 10;
  }

  function normalizeTarget(value) {
    return Number.isFinite(value) ? clamp(value, 0.5, 0.8) : rollTarget();
  }

  function place(anchorPos, dir) {
    viewDir.copy(dir).setY(0);
    if (viewDir.lengthSq() < 1e-8) viewDir.set(0, 0, 1);
    viewDir.normalize();
    sideDir.set(viewDir.z, 0, -viewDir.x);
    rig.position.copy(anchorPos);
    // 桌面锚点比实际桌面低数毫米，抬高后可避开桌面与文书。
    rig.position.y += 0.009;
    rig.rotation.y = Math.atan2(viewDir.x, viewDir.z);

    cine.pos.copy(rig.position)
      .addScaledVector(viewDir, 0.300)
      .addScaledVector(sideDir, 0.190);
    cine.pos.y += 0.275;
    cine.look.copy(rig.position).addScaledVector(sideDir, 0.045);
    cine.look.y += 0.090;
  }

  function reset(target) {
    Object.assign(state, {
      level: 0,
      vel: 0,
      hold: 0,
      pouring: false,
      target: normalizeTarget(target),
      hit: null,
      taken: false,
      t: 0,
      phaseT: 0,
      settle: 0,
      takeT: 0,
      takeFrom: 0,
    });
    held = false;
    hasPressed = false;
    stopRequested = false;
    stopTimer = 0;
    streamOn = false;
    tilt = TILT.idle;
    flowGate = 0;
    cine.k = 0;
    model.jug.position.copy(JUG_IDLE);
    model.jug.rotation.set(-0.08, 0, TILT.idle);
    model.friend.position.set(0, 0.006, 0.012);
    model.friend.rotation.set(0, 0, 0);
    render();
  }

  function judge() {
    if (state.phase !== 'pour') return;
    state.phase = 'judge';
    state.phaseT = 0;
    state.hit = state.taken || Math.abs(state.level - state.target) <= state.tol;
    state.pouring = false;
    state.vel = 0;
    streamOn = false;
    stopTimer = 0;
  }

  function takeover() {
    if (state.phase !== 'pour' || state.taken) return false;
    state.taken = true;
    state.takeT = 0;
    state.takeFrom = state.level;
    state.pouring = false;
    state.vel = 0;
    held = false;
    stopRequested = false;
    stopTimer = 0;
    streamOn = false;
    if (typeof runOpts.onTakeover === 'function') runOpts.onTakeover();
    return true;
  }

  function stepPour(dt) {
    if (state.taken) {
      state.takeT += dt;
      const friendPours = state.takeT >= 0.62 && state.takeT < 2.12;
      tilt = damp(tilt, friendPours ? TILT.pour : TILT.handover, 9, dt);
      flowGate = smooth((tilt - 0.32) / 0.55);
      const fill = smooth((state.takeT - 0.70) / 1.35);
      state.level = lerp(state.takeFrom, 0.985, fill);
      streamOn = friendPours && flowGate > 0.04;
      state.pouring = streamOn;
      state.vel = streamOn ? (0.985 - state.takeFrom) / 1.35 : 0;
      if (state.takeT >= 2.55) judge();
      return;
    }

    tilt = damp(tilt, held && !stopRequested ? TILT.pour : TILT.idle, 11, dt);
    flowGate = smooth((tilt - 0.32) / 0.55);
    streamOn = held && !stopRequested && flowGate > 0.04;
    if (held && !stopRequested) state.hold += dt;
    const rate = 0.18 + 0.16 * smooth(state.hold / 1.8);
    if (streamOn) state.level = clamp(state.level + rate * flowGate * dt, 0, 1.08);
    state.vel = streamOn ? rate * flowGate : 0;
    state.pouring = streamOn;

    if (runOpts.handover && state.level >= 0.30) {
      takeover();
      return;
    }
    if (stopRequested) {
      stopTimer += dt;
      state.settle = stopTimer;
      if (stopTimer >= TIME.stop) judge();
    }
  }

  function finish() {
    const result = {
      hit: state.hit === true,
      level: state.level,
      target: state.target,
      taken: state.taken,
      spilled: state.taken ? false : state.hit !== true,
    };
    state.phase = 'idle';
    state.phaseT = 0;
    state.pouring = false;
    state.vel = 0;
    streamOn = false;
    cine.k = 0;
    rig.visible = false;
    const done = resolveRun;
    resolveRun = null;
    if (done) done(result);
  }

  function step(dt) {
    state.t += dt;
    state.phaseT += dt;

    if (state.phase === 'in') {
      tilt = damp(tilt, TILT.idle, 10, dt);
      cine.k = smooth(state.phaseT / TIME.enter);
      if (state.phaseT >= TIME.enter) {
        state.phase = 'pour';
        state.phaseT = 0;
        cine.k = 1;
      }
    } else if (state.phase === 'pour') {
      cine.k = 1;
      stepPour(dt);
    } else if (state.phase === 'judge') {
      tilt = damp(tilt, TILT.idle, 10, dt);
      if (state.phaseT >= TIME.judge) {
        state.phase = 'out';
        state.phaseT = 0;
      }
    } else if (state.phase === 'out') {
      tilt = damp(tilt, TILT.idle, 10, dt);
      cine.k = 1 - smooth(state.phaseT / TIME.exit);
      if (state.phaseT >= TIME.exit) finish();
    }
  }

  function alignStream(object, from, to) {
    streamDelta.subVectors(to, from);
    const length = streamDelta.length();
    object.position.copy(from).addScaledVector(streamDelta, 0.5);
    object.quaternion.setFromUnitVectors(Y_AXIS, streamDelta.normalize());
    object.scale.set(1, Math.max(0.001, length), 1);
  }

  function render() {
    const entering = state.phase === 'in' ? smooth(state.phaseT / 0.68) : 1;
    const leaving = state.phase === 'out' ? smooth(state.phaseT / TIME.exit) : 0;
    const tiltK = clamp01((tilt - TILT.idle) / (TILT.pour - TILT.idle));
    model.jug.visible = state.phase !== 'idle';
    model.jug.position.lerpVectors(JUG_IDLE, JUG_POUR, tiltK);
    model.jug.position.x += (1 - entering) * 0.15 + leaving * 0.18;
    model.jug.position.y += (1 - entering) * 0.09 + leaving * 0.11;
    if (state.phase === 'pour') model.jug.position.y += Math.sin(state.t * 2.2) * 0.0006;
    model.jug.rotation.set(-0.08, 0, tilt);
    model.jug.updateMatrix();
    spoutTip.copy(SPOUT_TIP).applyMatrix4(model.jug.matrix);

    model.friend.visible = state.taken && state.phase !== 'idle';
    if (model.friend.visible) {
      const arrive = smooth(state.takeT / 0.55);
      model.friend.position.set(
        (1 - arrive) * -0.10 - leaving * 0.08,
        0.006 + (1 - arrive) * 0.11 + leaving * 0.09,
        0.012 - (1 - arrive) * 0.04
      );
      model.friend.rotation.z = (1 - arrive) * -0.42;
    }

    const y = levelToY(state.level);
    const radius = Math.max(0.002, radiusAt(BOWL.inner, y) - 0.00035);
    const hasWine = state.level > 0.003;
    model.wineSide.visible = hasWine;
    model.surface.visible = hasWine;
    model.meniscus.visible = hasWine;
    if (hasWine) {
      const height = Math.max(0.0002, y - BOWL.bottom);
      model.wineSide.scale.set(radius, height, radius);
      model.wineSide.position.y = BOWL.bottom + height * 0.5;
      model.surface.scale.set(radius, radius, 1);
      model.surface.position.y = y;
      model.meniscus.scale.set(radius, radius, 1);
      model.meniscus.position.y = y + 0.00025;
    }

    const targetY = levelToY(state.target);
    const targetRadius = radiusAt(BOWL.outer, targetY) * 1.018;
    model.targetRing.position.y = targetY;
    model.targetRing.scale.setScalar(targetRadius);
    model.targetRing.visible = !state.taken;
    model.targetMaterial.color.setHex(
      state.phase === 'judge' ? (state.hit ? 0xffd98a : 0x93643d) : 0xd9b369
    );

    landPoint.set(0.004, y + 0.0007, 0.003);
    const flowing = streamOn && state.phase === 'pour';
    model.stream.visible = flowing;
    model.streamCore.visible = flowing;
    if (flowing) {
      alignStream(model.stream, spoutTip, landPoint);
      alignStream(model.streamCore, spoutTip, landPoint);
    }

    for (let i = 0; i < model.ripples.length; i++) {
      const ring = model.ripples[i];
      ring.visible = flowing && hasWine;
      if (ring.visible) {
        const cycle = (state.t * 1.8 + i * 0.5) % 1;
        const r = radius * (0.16 + cycle * 0.58);
        ring.scale.set(r, r, 1);
        ring.position.set(landPoint.x, y + 0.00045 + i * 0.0001, landPoint.z);
        ring.material.opacity = (1 - cycle) * 0.38;
      }
    }
    for (let i = 0; i < model.droplets.length; i++) {
      const drop = model.droplets[i];
      drop.visible = flowing;
      if (flowing) {
        const cycle = (state.t * 2.8 + i * 0.25) % 1;
        const angle = i * 2.35;
        const spread = cycle * 0.008;
        drop.position.set(
          landPoint.x + Math.cos(angle) * spread,
          landPoint.y + Math.sin(cycle * Math.PI) * 0.008,
          landPoint.z + Math.sin(angle) * spread
        );
      }
    }

    model.overflow.visible = state.level > 1;
    model.puddle.visible = state.level > 1;
    const lightGain = state.phase === 'idle' ? 0 : 0.15 + 0.85 * cine.k;
    model.key.intensity = 1.2 * lightGain;
    model.rimLight.intensity = 0.45 * lightGain;
    model.fill.intensity = 0.20 * lightGain;
  }

  function update(dt) {
    if (state.phase === 'idle' || !Number.isFinite(dt) || dt <= 0) return;
    const total = Math.min(dt, 2);
    const steps = Math.max(1, Math.ceil(total * 30));
    const slice = total / steps;
    for (let i = 0; i < steps && state.phase !== 'idle'; i++) step(slice);
    if (state.phase !== 'idle') render();
  }

  return {
    rig,
    cine,
    state,

    preview(anchorPos, dir) {
      runOpts = {};
      place(anchorPos, dir);
      state.phase = 'idle';
      reset(0.7);
      state.phase = 'idle';
      rig.visible = true;
      render();
    },

    start(anchorPos, dir, options = {}) {
      runOpts = options || {};
      place(anchorPos, dir);
      state.phase = 'in';
      reset(runOpts.target);
      state.phase = 'in';
      rig.visible = true;
      render();
      return new Promise((resolve) => { resolveRun = resolve; });
    },

    rollTarget,
    takeover,

    press() {
      if (state.taken || held || stopRequested || (state.phase !== 'in' && state.phase !== 'pour')) {
        return false;
      }
      held = true;
      hasPressed = true;
      return true;
    },

    release() {
      if (!hasPressed || state.taken || stopRequested || (state.phase !== 'in' && state.phase !== 'pour')) {
        return false;
      }
      held = false;
      stopRequested = true;
      stopTimer = 0;
      state.pouring = false;
      state.vel = 0;
      streamOn = false;
      return true;
    },

    update,
    get active() { return state.phase !== 'idle'; },
    get phase() { return state.phase; },
    get taken() { return state.taken; },
  };
}
