import * as THREE from '../vendor/three.module.js';

/* ---------- 程序化材质 ---------- */

function canvasTex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function noise(ctx, w, h, amount) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function woodTex(base, dark, rx, ry) {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * w;
      const wid = 1 + Math.random() * 4;
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.16)' : 'rgba(255,225,190,0.05)';
      ctx.lineWidth = wid;
      ctx.beginPath();
      let y = 0;
      ctx.moveTo(x, y);
      while (y < h) {
        y += 16 + Math.random() * 24;
        ctx.lineTo(x + Math.sin(y * 0.02 + i) * 4, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = dark;
    for (let i = 0; i < 40; i++) {
      ctx.globalAlpha = 0.05 + Math.random() * 0.08;
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 6 + Math.random() * 30, 2 + Math.random() * 6, Math.random() * 3, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    noise(ctx, w, h, 16);
  }, rx, ry);
}

function floorTex() {
  return canvasTex(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#2a2118';
    ctx.fillRect(0, 0, w, h);
    const planks = 8;
    for (let i = 0; i < planks; i++) {
      const x = (i * w) / planks;
      const shade = 0.82 + Math.random() * 0.3;
      ctx.fillStyle = `rgba(${58 * shade | 0},${44 * shade | 0},${31 * shade | 0},1)`;
      ctx.fillRect(x, 0, w / planks - 2, h);
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, w / planks - 2, h);
      ctx.strokeStyle = 'rgba(255,210,160,0.045)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, 0, w / planks - 6, h);
      for (let g = 0; g < 14; g++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const gx = x + Math.random() * w / planks;
        ctx.moveTo(gx, 0);
        ctx.bezierCurveTo(gx + 12, h * 0.3, gx - 12, h * 0.7, gx, h);
        ctx.stroke();
      }
    }
    noise(ctx, w, h, 18);
  }, 5, 4);
}

function plasterTex() {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#6f6553';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,240,215,0.05)' : 'rgba(0,0,0,0.09)';
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 60, 8 + Math.random() * 50, Math.random() * 3, 0, 6.28);
      ctx.fill();
    }
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = 'rgba(30,22,14,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      let x = Math.random() * w, y = Math.random() * h;
      ctx.moveTo(x, y);
      for (let s = 0; s < 8; s++) {
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 60;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    noise(ctx, w, h, 22);
  }, 2, 1);
}

function paperTex() {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#c9b895';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = 'rgba(120,95,60,0.12)';
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 2 + Math.random() * 14, 1 + Math.random() * 5, 0, 0, 6.28);
      ctx.fill();
    }
    noise(ctx, w, h, 20);
  }, 1, 1);
}

function haloTexture() {
  return canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,170,90,0.85)');
    g.addColorStop(0.35, 'rgba(255,140,60,0.35)');
    g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/* ---------- 场景构建 ---------- */

export function buildWorld(scene, renderer) {
  const root = new THREE.Group();
  scene.add(root);

  scene.background = new THREE.Color(0x05070a);
  scene.fog = new THREE.FogExp2(0x05070a, 0.052);

  const wood = new THREE.MeshStandardMaterial({ map: woodTex('#4a3524', '#241809', 1, 1), roughness: 0.82, metalness: 0.04, color: 0xffffff });
  const woodDark = new THREE.MeshStandardMaterial({ map: woodTex('#33241a', '#140c07', 1, 1), roughness: 0.86, metalness: 0.03, color: 0xd8cfc4 });
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.62, metalness: 0.08, color: 0xbdb3a6 });
  const plaster = new THREE.MeshStandardMaterial({ map: plasterTex(), roughness: 0.94, metalness: 0 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x5a1f14, roughness: 0.9 });
  const darkSilhouette = new THREE.MeshStandardMaterial({ color: 0x120d09, roughness: 1, metalness: 0 });
  const paper = new THREE.MeshStandardMaterial({ map: paperTex(), roughness: 0.9, color: 0xe7d9b8 });

  const meshes = [];
  function box(w, h, d, mat, x, y, z, opts = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    root.add(m);
    meshes.push(m);
    return m;
  }

  /* 地面 · 墙体 */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 15), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0.4);
  floor.receiveShadow = true;
  root.add(floor);

  box(18, 4.6, 0.3, plaster, 0, 2.3, -5.3);      // 后墙
  box(0.3, 4.6, 15, plaster, -7.5, 2.3, 0.4);    // 左墙
  box(18, 0.3, 15, woodDark, 0, 4.6, 0.4);       // 顶

  // 右墙留窗洞：z -4.0 ~ -0.4，y 1.1 ~ 3.1
  box(0.3, 1.1, 15, plaster, 7.5, 0.55, 0.4);
  box(0.3, 1.5, 15, plaster, 7.5, 3.85, 0.4);
  box(0.3, 2.0, 6.6, plaster, 7.5, 2.1, 3.6);
  box(0.3, 2.0, 1.3, plaster, 7.5, 2.1, -4.65);

  // 窗外
  const loader = new THREE.TextureLoader();
  const viewTex = loader.load('assets/window_view.jpg');
  viewTex.colorSpace = THREE.SRGBColorSpace;
  const viewMat = new THREE.MeshBasicMaterial({ map: viewTex, color: 0x9fb0c4 });
  const viewPane = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 4.2), viewMat);
  viewPane.rotation.y = -Math.PI / 2;
  viewPane.position.set(8.6, 2.2, -2.2);
  root.add(viewPane);

  // 窗棂
  const latMat = woodDark;
  box(0.14, 0.14, 3.9, latMat, 7.28, 1.06, -2.2);
  box(0.14, 0.14, 3.9, latMat, 7.28, 3.14, -2.2);
  box(0.14, 2.2, 0.14, latMat, 7.28, 2.1, -4.06);
  box(0.14, 2.2, 0.14, latMat, 7.28, 2.1, -0.34);
  for (let i = 1; i <= 3; i++) {
    box(0.07, 2.0, 0.06, latMat, 7.28, 2.1, -4.0 + i * 0.92);
  }
  box(0.07, 0.06, 3.7, latMat, 7.28, 1.68, -2.2);
  box(0.07, 0.06, 3.7, latMat, 7.28, 2.52, -2.2);
  box(0.45, 0.12, 3.9, wood, 7.3, 1.02, -2.2);   // 窗台

  /* 柱 · 梁 */
  const colGeo = new THREE.CylinderGeometry(0.19, 0.22, 4.6, 12);
  [[-4.9, -3.4], [4.9, -3.4], [-4.9, 2.6], [4.9, 2.6]].forEach(([x, z]) => {
    const c = new THREE.Mesh(colGeo, woodDark);
    c.position.set(x, 2.3, z);
    c.castShadow = true; c.receiveShadow = true;
    root.add(c); meshes.push(c);
  });
  [-4.4, -1.2, 2.2].forEach((z) => box(17, 0.3, 0.34, woodDark, 0, 4.16, z));

  /* 长桌 · 长凳 */
  box(4.2, 0.12, 1.25, wood, 0, 0.86, -1.2);
  [[-1.95, -1.75], [1.95, -1.75], [-1.95, -0.65], [1.95, -0.65]].forEach(([x, z]) => {
    box(0.14, 0.8, 0.14, woodDark, x, 0.4, z);
  });
  [[-0.25], [-2.15]].forEach(([z]) => {
    box(3.9, 0.1, 0.4, wood, 0, 0.46, z);
    box(0.1, 0.42, 0.34, woodDark, -1.6, 0.21, z);
    box(0.1, 0.42, 0.34, woodDark, 1.6, 0.21, z);
  });

  // 桌上酒壶与碗
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.28, 12), new THREE.MeshStandardMaterial({ color: 0x4b4438, roughness: 0.5, metalness: 0.35 }));
  pot.position.set(-0.55, 1.06, -1.15); pot.castShadow = true; root.add(pot);
  const bowlGeo = new THREE.CylinderGeometry(0.1, 0.07, 0.07, 12);
  const bowlMat = new THREE.MeshStandardMaterial({ color: 0x8b8578, roughness: 0.45, metalness: 0.1 });
  [[-0.95, -1.35], [-0.15, -1.05]].forEach(([x, z]) => {
    const b = new THREE.Mesh(bowlGeo, bowlMat);
    b.position.set(x, 0.97, z); b.castShadow = true; root.add(b);
  });

  /* 烛台 */
  const candleMat = new THREE.MeshStandardMaterial({ color: 0x9a7a4f, roughness: 0.8 });
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.2, 8), candleMat);
  candle.position.set(1.05, 1.02, -1.2); candle.castShadow = true; root.add(candle);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb066 });
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), flameMat);
  flame.position.set(1.05, 1.15, -1.2); flame.scale.set(0.7, 1.5, 0.7); root.add(flame);

  /* 柜台 · 账本 */
  const counter = new THREE.Group();
  counter.position.set(4.95, 0, -0.85);
  root.add(counter);
  const cBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.02, 1.0), woodDark);
  cBody.position.y = 0.51; cBody.castShadow = true; cBody.receiveShadow = true; counter.add(cBody);
  const cTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.14), wood);
  cTop.position.y = 1.07; cTop.castShadow = true; cTop.receiveShadow = true; counter.add(cTop);
  // 抽屉面
  const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.04), wood);
  drawer.position.set(-0.6, 0.62, 0.51); counter.add(drawer);

  const ledger = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.055, 0.36), paper);
  ledger.position.set(-0.35, 1.15, 0.0);
  ledger.rotation.y = 0.16;
  ledger.castShadow = true;
  ledger.userData.hotspot = 'ledger';
  counter.add(ledger);
  // 夹在账本里的当票
  const ticket = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.27), paper);
  ticket.position.set(-0.12, 1.19, 0.03);
  ticket.rotation.set(-Math.PI / 2, 0.4, 0.2);
  ticket.userData.hotspot = 'ledger';
  counter.add(ticket);
  // 算盘
  const abacus = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.26), woodDark);
  abacus.position.set(0.55, 1.15, 0.02);
  abacus.castShadow = true;
  counter.add(abacus);

  /* 酒坛 */
  const jarMat = new THREE.MeshStandardMaterial({ color: 0x4a3b30, roughness: 0.75, metalness: 0.1 });
  const jarGeo = new THREE.CylinderGeometry(0.26, 0.2, 0.62, 14);
  [[-5.9, -0.6], [-5.35, 0.05], [-6.1, 0.7], [-5.6, -1.4], [-6.25, -0.15]].forEach(([x, z]) => {
    const j = new THREE.Mesh(jarGeo, jarMat);
    j.position.set(x, 0.31, z);
    j.rotation.y = Math.random() * 3;
    j.castShadow = true; j.receiveShadow = true;
    root.add(j); meshes.push(j);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12), paper);
    lid.position.set(x, 0.63, z); root.add(lid);
  });

  /* 说书台 · 屏风 · 人影 */
  box(3.0, 0.3, 1.6, wood, 0, 0.15, -4.25);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.9 });
  for (let i = -1; i <= 1; i++) {
    const p = box(1.0, 2.3, 0.06, screenMat, i * 1.0, 1.45, -4.95, { cast: false });
    p.rotation.y = i * 0.22;
  }

  const teller = new THREE.Group();
  teller.position.set(0, 0.3, -4.35);
  root.add(teller);
  const bodyGeo = new THREE.CylinderGeometry(0.17, 0.26, 0.92, 10);
  const torso = new THREE.Mesh(bodyGeo, darkSilhouette);
  torso.position.y = 0.82; torso.castShadow = true; teller.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 12), darkSilhouette);
  head.position.y = 1.4; head.castShadow = true; teller.add(head);
  const legGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.5, 8);
  [-0.08, 0.08].forEach((dx) => {
    const l = new THREE.Mesh(legGeo, darkSilhouette);
    l.position.set(dx, 0.25, 0); teller.add(l);
  });
  const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
  const arm = new THREE.Mesh(armGeo, darkSilhouette);
  arm.position.set(0.22, 0.95, 0.05);
  arm.rotation.z = -0.12; arm.rotation.x = 0.5;
  teller.add(arm);
  const fan = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.26), darkSilhouette);
  fan.position.set(0.32, 1.12, 0.24);
  fan.rotation.set(0.3, 0.2, 0.5);
  teller.add(fan);
  teller.traverse((o) => { o.userData.hotspot = 'teller'; });

  /* 门 · 门框刻痕 */
  const door = new THREE.Group();
  door.position.set(-4.3, 0, -5.12);
  root.add(door);
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.1), woodDark);
  doorPanel.position.y = 1.25; doorPanel.castShadow = true; door.add(doorPanel);
  const postGeo = new THREE.BoxGeometry(0.16, 2.75, 0.22);
  [-0.85, 0.85].forEach((x) => {
    const p = new THREE.Mesh(postGeo, wood);
    p.position.set(x, 1.375, 0.02); p.castShadow = true;
    p.userData.hotspot = 'door'; door.add(p);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 0.24), wood);
  lintel.position.set(0, 2.62, 0.02); lintel.userData.hotspot = 'door'; door.add(lintel);
  // 门板上的刻痕：三横一竖
  const grooveMat = new THREE.MeshStandardMaterial({ color: 0x150e07, roughness: 1 });
  [1.56, 1.50, 1.44].forEach((y) => {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.014, 0.02), grooveMat);
    g.position.set(-0.5, y, 0.062);
    g.userData.hotspot = 'door';
    door.add(g);
  });
  const gv = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.24, 0.02), grooveMat);
  gv.position.set(-0.5, 1.32, 0.062);
  gv.userData.hotspot = 'door';
  door.add(gv);
  // 门缝透进来的光
  const slit = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.05), new THREE.MeshBasicMaterial({ color: 0x7a8ea8, transparent: true, opacity: 0.5 }));
  slit.position.set(-4.3, 0.03, -5.0);
  root.add(slit);

  /* 挂轴 */
  const scrollTex = loader.load('assets/scroll.jpg');
  scrollTex.colorSpace = THREE.SRGBColorSpace;
  const scroll = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.9), new THREE.MeshStandardMaterial({ map: scrollTex, roughness: 0.92, color: 0xd9cbb2 }));
  scroll.position.set(-2.15, 2.35, -5.1);
  root.add(scroll);
  box(1.14, 0.07, 0.07, woodDark, -2.15, 3.33, -5.06, { cast: false });
  box(1.14, 0.07, 0.07, woodDark, -2.15, 1.38, -5.06, { cast: false });

  /* 灯笼 */
  const lanterns = [];
  const haloMap = haloTexture();
  function makeLantern(x, y, z, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    root.add(g);

    const shadeGeo = new THREE.SphereGeometry(0.26 * scale, 14, 12);
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0x8c2a12, emissive: 0xd0491a, emissiveIntensity: 1.5, roughness: 0.75 });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.scale.set(1, 1.18, 1);
    g.add(shade);

    const capMat = new THREE.MeshStandardMaterial({ color: 0x24180e, roughness: 0.8 });
    const capT = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * scale, 0.09 * scale, 0.05, 10), capMat);
    capT.position.y = 0.32 * scale; g.add(capT);
    const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * scale, 0.09 * scale, 0.05, 10), capMat);
    capB.position.y = -0.32 * scale; g.add(capB);

    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0x7d1d10, roughness: 0.9 }));
    tassel.position.y = -0.46 * scale; g.add(tassel);

    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), capMat);
    rope.position.y = 0.57 * scale; g.add(rope);

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloMap, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.75, depthWrite: false }));
    halo.scale.set(1.9 * scale, 1.9 * scale, 1);
    g.add(halo);

    const light = new THREE.PointLight(0xff9a4a, 5.5, 11, 1.9);
    light.position.y = 0;
    g.add(light);

    lanterns.push({ group: g, light, shadeMat, halo, base: 5.5, phase: Math.random() * 6.28 });
    return g;
  }
  makeLantern(0.4, 3.15, -1.2, 1.1);
  makeLantern(-4.4, 2.9, -3.9, 0.95);
  makeLantern(4.3, 2.95, -3.6, 0.9);
  makeLantern(-1.9, 3.2, 1.6, 0.8);

  /* 灯光 */
  const hemi = new THREE.HemisphereLight(0x33465e, 0x140d07, 0.32);
  scene.add(hemi);

  const spot = new THREE.SpotLight(0xffb070, 14, 16, 0.72, 0.75, 1.6);
  spot.position.set(0.4, 4.3, 0.4);
  spot.target.position.set(0.4, 0, -1.4);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0015;
  spot.shadow.camera.near = 0.5;
  spot.shadow.camera.far = 14;
  scene.add(spot, spot.target);

  const moon = new THREE.DirectionalLight(0x6f8db8, 0.85);
  moon.position.set(11, 6.5, -1);
  moon.target.position.set(0, 0.6, -1.6);
  scene.add(moon, moon.target);

  const candleLight = new THREE.PointLight(0xff8c3a, 2.2, 6, 2);
  candleLight.position.set(1.05, 1.2, -1.2);
  scene.add(candleLight);

  /* 浮尘 */
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(260 * 3);
  for (let i = 0; i < 260; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 13;
    dustPos[i * 3 + 1] = Math.random() * 4.2;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xffc78a, size: 0.022, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }));
  root.add(dust);

  /* 窗光雾面 */
  const haze = new THREE.Mesh(
    new THREE.PlaneGeometry(6.6, 3.6),
    new THREE.MeshBasicMaterial({ color: 0x4a6a92, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  haze.rotation.y = -Math.PI / 2;
  haze.position.set(7.0, 2.1, -2.2);
  root.add(haze);

  /* 交互热点 */
  const hotspots = [
    {
      id: 'ledger',
      label: '翻一翻账本',
      focusPos: new THREE.Vector3(2.9, 1.55, 1.5),
      focusTarget: new THREE.Vector3(4.9, 1.12, -0.85),
    },
    {
      id: 'teller',
      label: '听说书人唱下去',
      focusPos: new THREE.Vector3(0.2, 1.58, 0.2),
      focusTarget: new THREE.Vector3(0, 1.5, -4.3),
    },
    {
      id: 'door',
      label: '门框上有刻痕',
      focusPos: new THREE.Vector3(-1.9, 1.55, 0.6),
      focusTarget: new THREE.Vector3(-4.4, 1.3, -5.05),
    },
  ];

  // 把 group 上的 hotspot 传递给子网格
  root.traverse((o) => {
    if (o.isMesh && !o.userData.hotspot) {
      let p = o.parent, id = null;
      while (p) {
        if (p.userData.hotspot) { id = p.userData.hotspot; break; }
        if (p === root) break;
        p = p.parent;
      }
      if (id) o.userData.hotspot = id;
    }
  });

  const raycastables = [];
  root.traverse((o) => { if (o.isMesh) raycastables.push(o); });

  let t = 0;
  function update(dt) {
    t += dt;
    for (const l of lanterns) {
      const f = 0.85 + Math.sin(t * 2.3 + l.phase) * 0.1 + Math.sin(t * 7.1 + l.phase * 2) * 0.045;
      l.light.intensity = l.base * f;
      l.halo.material.opacity = 0.62 * f + 0.12;
      l.shadeMat.emissiveIntensity = 1.2 + f * 0.5;
    }
    candleLight.intensity = 2.0 + Math.sin(t * 9.3) * 0.28 + Math.sin(t * 3.1) * 0.18;
    flame.scale.set(0.68 + Math.sin(t * 11) * 0.05, 1.5 + Math.sin(t * 8) * 0.12, 0.68);

    const pos = dust.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + dt * 0.012;
      if (y > 4.2) y = 0.15;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.6 + i) * dt * 0.01);
    }
    pos.needsUpdate = true;
  }

  return { root, update, hotspots, raycastables, candleLight };
}
