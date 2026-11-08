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
  }, 6, 4);
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
      ctx.strokeStyle = 'rgba(30,22,14,0.22)';
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

function screenTex() {
  return canvasTex(512, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#cbbb95';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 180; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,246,222,0.06)' : 'rgba(90,72,46,0.07)';
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 2 + Math.random() * 30, 1 + Math.random() * 7, Math.random() * 3, 0, 6.28);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(38,32,24,0.28)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.66);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.66 - Math.sin((x / w) * Math.PI * 1.6) * h * 0.13 - Math.sin(x * 0.021) * h * 0.03;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.95);
    ctx.lineTo(0, h * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(28,23,17,0.4)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.82);
    for (let x = 0; x <= w; x += 6) {
      const y = h * 0.82 - Math.abs(Math.sin((x / w) * Math.PI * 2.6)) * h * 0.06;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.97);
    ctx.lineTo(0, h * 0.97);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(252,240,208,0.5)';
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.16, w * 0.085, 0, 6.28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(48,36,22,0.55)';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    noise(ctx, w, h, 14);
  });
}

function stoneTex() {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#2b2c29';
    ctx.fillRect(0, 0, w, h);
    const rows = 6, cols = 5;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pw = w / cols, ph = h / rows;
        const off = r % 2 ? pw / 2 : 0;
        const x = c * pw + off, y = r * ph;
        const shade = 0.72 + Math.random() * 0.35;
        ctx.fillStyle = `rgba(${70 * shade | 0},${72 * shade | 0},${66 * shade | 0},1)`;
        ctx.fillRect(x + 2, y + 2, pw - 4, ph - 4);
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, pw - 4, ph - 4);
        if (Math.random() > 0.6) {
          ctx.fillStyle = 'rgba(70,88,52,0.12)';
          ctx.beginPath();
          ctx.ellipse(x + Math.random() * pw, y + Math.random() * ph, 10 + Math.random() * 30, 6 + Math.random() * 14, 0, 0, 6.28);
          ctx.fill();
        }
      }
    }
    noise(ctx, w, h, 22);
  }, 6, 5);
}

function streetTex() {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#15181c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 240; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(120,130,145,0.06)' : 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 4 + Math.random() * 22, 2 + Math.random() * 8, Math.random() * 3, 0, 6.28);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(140,160,180,0.08)';
    for (let i = 0; i < 18; i++) {
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      const x = Math.random() * w;
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 40, h);
      ctx.stroke();
    }
    noise(ctx, w, h, 14);
  }, 4, 6);
}

function roofTex() {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, w, h);
    const rows = 8, cols = 12;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const y = r * h / rows;
        const x = c * w / cols + (r % 2 ? w / cols / 2 : 0);
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(70,76,84,0.35)' : 'rgba(24,27,31,0.55)';
        ctx.beginPath();
        ctx.ellipse(x, y, w / cols * 0.48, h / rows * 0.46, 0, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    noise(ctx, w, h, 12);
  }, 3, 2);
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

function softTexture(inner) {
  return canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.5, inner.replace(/[\d.]+\)$/, '0.22)'));
    g.addColorStop(1, inner.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

function signTex(text, w, h, opt = {}) {
  return canvasTex(w, h, (ctx) => {
    const bg = opt.bg || '#1e1711';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    if (opt.border !== false) {
      ctx.strokeStyle = opt.borderColor || 'rgba(226,193,132,0.42)';
      ctx.lineWidth = Math.max(3, w * 0.014);
      ctx.strokeRect(ctx.lineWidth * 1.6, ctx.lineWidth * 1.6, w - ctx.lineWidth * 3.2, h - ctx.lineWidth * 3.2);
    }
    ctx.fillStyle = opt.fg || '#e6c88d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (opt.mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    if (opt.vertical) {
      const size = Math.min(w * 0.62, h / (text.length + 0.9));
      ctx.font = `${size}px "Songti SC","Source Han Serif SC","SimSun",serif`;
      const gap = h / (text.length + 1);
      for (let i = 0; i < text.length; i++) {
        ctx.fillText(text[i], w / 2, gap * (i + 1));
      }
    } else {
      const size = Math.min(h * 0.56, w / (text.length * 1.16));
      ctx.font = `${size}px "Songti SC","Source Han Serif SC","SimSun",serif`;
      const step = w / (text.length + 0.4);
      for (let i = 0; i < text.length; i++) {
        ctx.fillText(text[i], step * (i + 0.7), h / 2);
      }
    }
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, 'rgba(255,236,200,0.08)');
    grd.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    noise(ctx, w, h, 10);
  });
}

function portraitTex() {
  return canvasTex(256, 320, (ctx, w, h) => {
    ctx.fillStyle = '#c8b78f';
    ctx.fillRect(0, 0, w, h);
    noise(ctx, w, h, 20);
    ctx.strokeStyle = 'rgba(30,24,18,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.42, w * 0.26, h * 0.3, 0, 0, 6.28);
    ctx.stroke();
    // 五官：模糊的墨迹
    ctx.fillStyle = 'rgba(30,24,18,0.6)';
    ctx.beginPath(); ctx.ellipse(w * 0.4, h * 0.38, 8, 3.5, 0.2, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.6, h * 0.38, 8, 3.5, -0.2, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.4); ctx.lineTo(w * 0.47, h * 0.55); ctx.lineTo(w * 0.53, h * 0.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.64); ctx.quadraticCurveTo(w * 0.5, h * 0.68, w * 0.58, h * 0.63); ctx.stroke();
    ctx.strokeStyle = 'rgba(120,30,22,0.7)';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.16); ctx.lineTo(w * 0.28, h * 0.86); ctx.stroke();
    ctx.strokeStyle = 'rgba(48,36,22,0.5)';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, w - 12, h - 12);
  });
}

/* ---------- 场景构建 ---------- */

export function buildWorld(scene) {
  const root = new THREE.Group();
  scene.add(root);

  scene.background = new THREE.Color(0x06080c);
  scene.fog = new THREE.FogExp2(0x06080c, 0.038);

  const wood = new THREE.MeshStandardMaterial({ map: woodTex('#4d3927', '#241708', 1, 1), roughness: 0.84, metalness: 0.04 });
  const woodDark = new THREE.MeshStandardMaterial({ map: woodTex('#33241a', '#130b06', 1, 1), roughness: 0.88, metalness: 0.03, color: 0xd8cfc4 });
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.74, metalness: 0.04, color: 0xa39786 });
  const plaster = new THREE.MeshStandardMaterial({ map: plasterTex(), roughness: 0.95, color: 0xc9bfae });
  const plasterLight = new THREE.MeshStandardMaterial({ map: plasterTex(), roughness: 0.95, color: 0xdcd2bd });
  const stone = new THREE.MeshStandardMaterial({ map: stoneTex(), roughness: 0.72, metalness: 0.05, color: 0xb9b8ad });
  const streetMat = new THREE.MeshStandardMaterial({ map: streetTex(), roughness: 0.45, metalness: 0.22, color: 0xaab6c2 });
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex(), roughness: 0.7, metalness: 0.08, color: 0xa9b2bd, side: THREE.DoubleSide });
  const paper = new THREE.MeshStandardMaterial({ map: paperTex(), roughness: 0.9, color: 0xe7d9b8 });
  const screenMat = new THREE.MeshStandardMaterial({ map: screenTex(), color: 0xe2d4b2, roughness: 0.92, emissive: 0x2a2014, emissiveIntensity: 0.24 });
  const darkSil = new THREE.MeshStandardMaterial({ color: 0x120e0b, roughness: 1 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xbe9574, roughness: 0.95 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x17120e, roughness: 0.95 });
  const strawMat = new THREE.MeshStandardMaterial({ color: 0x8a7442, roughness: 0.92 });
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xc9c2b0, roughness: 0.42, metalness: 0.08 });
  const teaMat = new THREE.MeshBasicMaterial({ color: 0xb56c2a, transparent: true, opacity: 0.9 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0x8a6a32, roughness: 0.36, metalness: 0.7 });
  const clothRed = new THREE.MeshStandardMaterial({ color: 0x461a13, roughness: 1 });
  const peanutMat = new THREE.MeshStandardMaterial({ color: 0xb98452, roughness: 0.88 });
  const glowPaper = new THREE.MeshBasicMaterial({ color: 0xd9a35c, transparent: true, opacity: 0.5, side: THREE.DoubleSide });

  const meshes = [];
  function box(w, h, d, mat, x, y, z, parent = root, cast = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = true;
    parent.add(m);
    meshes.push(m);
    return m;
  }

  /* ---------- 大堂 ---------- */

  const hall = new THREE.Mesh(new THREE.PlaneGeometry(18.4, 12.8), floorMat);
  hall.rotation.x = -Math.PI / 2;
  hall.position.set(0, 0, 1.8);
  hall.receiveShadow = true;
  root.add(hall);

  // 两侧外墙 · 二层墙面
  box(0.32, 6.6, 12.8, plaster, -9.2, 3.3, 1.8, root, false);
  box(0.32, 6.6, 12.8, plaster, 9.2, 3.3, 1.8, root, false);
  // 后墙两翼
  box(2.7, 6.6, 0.32, plaster, -7.85, 3.3, -4.6, root, false);
  box(2.7, 6.6, 0.32, plaster, 7.85, 3.3, -4.6, root, false);
  // 后院开口上方的过梁墙
  box(13.0, 2.3, 0.32, plaster, 0, 5.45, -4.6, root, false);

  // 顶棚 · 梁
  box(18.4, 0.3, 12.8, woodDark, 0, 6.62, 1.8, root, false);
  [-3.4, 0.2, 4.0, 7.0].forEach((z) => box(18.0, 0.34, 0.3, woodDark, 0, 6.22, z, root, false));
  [-4.2, 0, 4.2].forEach((x) => box(0.26, 0.26, 12.4, woodDark, x, 6.12, 1.8, root, false));

  /* 墙面 · 墙裙 · 壁柱 · 挂画 */
  function scrollMat(text) {
    return new THREE.MeshStandardMaterial({
      map: signTex(text, 256, 768, { vertical: true, bg: '#c6b896', fg: '#2a2118', borderColor: 'rgba(78,58,38,0.45)' }),
      roughness: 0.95,
    });
  }
  function wallScroll(side, z, text, w = 0.5, h = 1.5, y = 2.6) {
    const x = side * 8.96;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), scrollMat(text));
    p.position.set(x, y, z);
    p.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    root.add(p);
    [y + h / 2 + 0.03, y - h / 2 - 0.03].forEach((ry) => {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, w + 0.16, 6), woodDark);
      rod.position.set(x, ry, z);
      rod.rotation.x = Math.PI / 2;
      root.add(rod);
    });
  }

  [-1, 1].forEach((side) => {
    box(0.09, 1.05, 12.6, woodDark, side * 9.0, 0.53, 1.8, root, false);
    box(0.11, 0.06, 12.6, wood, side * 8.99, 1.1, 1.8, root, false);
    for (let z = -3.7; z <= 7.4; z += 2.75) {
      box(0.18, 3.4, 0.18, woodDark, side * 8.97, 1.72, z, root, false);
    }
  });
  wallScroll(-1, 1.1, '听雨');
  wallScroll(-1, -2.5, '浊酒');
  wallScroll(1, -0.9, '且住');
  wallScroll(1, 5.4, '宾至');

  // 左墙兵器架
  [-2.15, -1.05].forEach((z) => box(0.12, 2.0, 0.12, woodDark, -8.78, 1.05, z, root, false));
  box(0.12, 0.12, 1.4, woodDark, -8.78, 1.9, -1.6, root, false);
  box(0.55, 0.1, 1.5, wood, -8.78, 0.55, -1.6, root, false);
  [-2.0, -1.6, -1.2].forEach((z, i) => {
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x8d949c, roughness: 0.34, metalness: 0.55 });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.92, 0.09), bladeMat);
    blade.position.set(-8.56, 1.32, z);
    blade.rotation.z = i === 1 ? 0.02 : -0.04 - i * 0.01;
    blade.castShadow = true;
    root.add(blade);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.2, 8), woodDark);
    grip.position.set(-8.56, 0.83, z);
    grip.rotation.z = blade.rotation.z;
    root.add(grip);
  });

  // 柜台后墙的货架与酒坛（抬高贴墙，避开老板娘的头）
  [2.2, 3.0].forEach((y) => box(0.46, 0.07, 3.1, wood, 8.94, y, 2.5, root, false));
  [-0.9, 0.2, 1.3].forEach((z) => {
    [2.27, 3.07].forEach((y) => {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.28, 10), new THREE.MeshStandardMaterial({ color: 0x4d3d30, roughness: 0.78 }));
      jar.position.set(8.94, y + 0.17, 2.5 + z);
      jar.castShadow = true;
      root.add(jar);
    });
  });
  const wineFlag = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.6), new THREE.MeshStandardMaterial({
    map: signTex('酒', 192, 512, { vertical: true, bg: '#5b1a12', fg: '#ecd8ad', borderColor: 'rgba(0,0,0,0.35)' }),
    roughness: 0.96, side: THREE.DoubleSide,
  }));
  wineFlag.position.set(8.72, 2.55, 4.55);
  wineFlag.rotation.y = -Math.PI / 2;
  root.add(wineFlag);
  box(0.05, 0.05, 0.6, woodDark, 8.72, 3.4, 4.55, root, false);


  /* 二楼回廊 */
  const windowGlows = [];
  [-1, 1].forEach((side) => {
    box(1.6, 0.16, 12.6, woodDark, side * 8.4, 3.28, 1.8, root, false);
    // 栏杆
    for (let z = -3.8; z <= 7.9; z += 1.25) {
      box(0.07, 0.92, 0.07, woodDark, side * 7.62, 3.82, z, root, false);
    }
    box(0.1, 0.09, 12.2, wood, side * 7.62, 4.26, 1.8, root, false);
    box(0.08, 0.06, 12.2, wood, side * 7.62, 3.72, 1.8, root, false);
    // 栏杆下的红帷
    box(0.06, 0.4, 12.1, clothRed, side * 7.6, 4.02, 1.8, root, false);
    // 窗
    for (let i = 0; i < 5; i++) {
      const z = -2.6 + i * 2.1;
      box(0.2, 1.7, 1.5, woodDark, side * 9.0, 4.5, z, root, false);
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 1.32), glowPaper.clone());
      pane.material.opacity = 0.3 + Math.random() * 0.22;
      pane.position.set(side * 8.88, 4.5, z);
      pane.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      root.add(pane);
      windowGlows.push(pane);
      // 窗棂
      box(0.05, 1.34, 0.055, woodDark, side * 8.84, 4.5, z, root, false);
      [4.16, 4.84].forEach((yy) => box(0.05, 0.045, 1.18, woodDark, side * 8.84, yy, z, root, false));
      if (i === 1 || i === 3) {
        const s = new THREE.Group();
        s.position.set(side * 8.9, 3.95, z + 0.1);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.24, 0.9, 7), darkSil);
        body.position.y = 0.45;
        s.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), darkSil);
        head.position.y = 1.02;
        s.add(head);
        root.add(s);
      }
    }
  });

  /* 楼梯：整块侧板 + 踏步，做成实心木梯 */
  {
    const steps = 8, run = 0.55, rise = 0.4;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    for (let i = 0; i < steps; i++) {
      shape.lineTo(i * run, (i + 1) * rise);
      shape.lineTo((i + 1) * run, (i + 1) * rise);
    }
    shape.lineTo(steps * run, 0);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.42, bevelEnabled: false });
    geo.translate(0, 0, -0.71);
    const stair = new THREE.Mesh(geo, woodDark);
    stair.position.set(-6.75, 0, 7.5);
    stair.rotation.y = Math.PI / 2;
    stair.castShadow = true;
    stair.receiveShadow = true;
    root.add(stair);
    meshes.push(stair);

    // 扶手：随坡度倾斜，立柱落在踏步上
    const slope = Math.atan2(steps * rise, steps * run);
    const railLen = Math.hypot(steps * run, steps * rise);
    [-1, 1].forEach((side) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, railLen), wood);
      rail.position.set(-6.75 + side * 0.66, steps * rise / 2 + 0.92, 7.5 - steps * run / 2);
      rail.rotation.x = slope;
      rail.castShadow = true;
      root.add(rail);
      for (let i = 0; i < steps; i += 2) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.9, 0.055), woodDark);
        post.position.set(-6.75 + side * 0.66, (i + 1) * rise + 0.46, 7.5 - (i + 0.5) * run);
        root.add(post);
      }
    });
  }

  /* ---------- 门楼 · 街 ---------- */

  [-3.6, 3.6, -8.1, 8.1].forEach((x) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 4.5, 10), woodDark);
    c.position.set(x, 2.25, 8.15);
    c.castShadow = true; c.receiveShadow = true;
    root.add(c); meshes.push(c);
  });
  box(18.6, 0.36, 0.5, woodDark, 0, 4.5, 8.15, root, false);
  // 檐
  const eave = box(19.4, 0.22, 4.4, roofMat, 0, 5.15, 9.9, root, false);
  eave.rotation.x = -0.1;
  box(19.0, 0.2, 0.28, woodDark, 0, 4.75, 8.2, root, false);

  // 匾额
  const plaqueTex = signTex('听雨楼', 1024, 384, { mirror: true });
  const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex, transparent: false });
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.12), plaqueMat);
  plaque.position.set(0, 5.12, 8.02);
  plaque.rotation.y = Math.PI;
  root.add(plaque);
  box(3.24, 1.34, 0.12, woodDark, 0, 5.12, 8.09, root, false);

  // 门槛 · 门枕石 · 卷起的门帘（门扇卸了，夜里敞着迎客）
  box(7.2, 0.16, 0.34, wood, 0, 0.08, 8.28, root, false);
  [-3.0, 3.0].forEach((x) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.6), stone);
    block.position.set(x, 0.21, 8.3);
    block.castShadow = true;
    root.add(block);
  });
  const curtain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 6.4, 10, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x5c2a1c, roughness: 1, side: THREE.DoubleSide })
  );
  curtain.rotation.z = Math.PI / 2;
  curtain.position.set(0, 4.2, 8.24);
  root.add(curtain);
  [4.15, 3.9].forEach((y) => {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 6.6, 6), brassMat);
    cord.rotation.z = Math.PI / 2;
    cord.position.set(0, y, 8.24);
    root.add(cord);
  });

  // 街面
  const street = new THREE.Mesh(new THREE.PlaneGeometry(34, 18), streetMat);
  street.rotation.x = -Math.PI / 2;
  street.position.set(0, -0.01, 17);
  street.receiveShadow = true;
  root.add(street);
  const porch = new THREE.Mesh(new THREE.PlaneGeometry(19.4, 1.6), floorMat);
  porch.rotation.x = -Math.PI / 2;
  porch.position.set(0, 0.005, 9.0);
  root.add(porch);

  // 街对面的铺面剪影
  const facadeMat = new THREE.MeshStandardMaterial({ color: 0x39404d, roughness: 0.95 });
  const facadeTrim = new THREE.MeshStandardMaterial({ color: 0x1b1f27, roughness: 0.95 });
  for (let i = -2; i <= 2; i++) {
    box(6.0, 5.2, 0.4, facadeMat, i * 7, 2.6, 21.5, root, false);
    box(6.0, 0.3, 1.6, roofMat, i * 7, 5.2, 20.9, root, false);
    box(6.2, 0.16, 0.9, facadeTrim, i * 7, 3.35, 21.1, root, false);
    box(0.16, 3.2, 0.5, facadeTrim, i * 7 + 2.6, 1.6, 21.2, root, false);
    for (let k = 0; k < 3; k++) {
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), glowPaper.clone());
      pane.material.opacity = 0.42 + Math.random() * 0.3;
      pane.position.set(i * 7 - 1.8 + k * 1.8, 2.2, 21.28);
      pane.rotation.y = Math.PI;
      root.add(pane);
    }
  }
  // 雪中行人
  [[-4.5, 12.5, 0.4], [3.2, 15.0, -0.2], [-9.0, 17.5, 0.9]].forEach(([x, z, r]) => {
    const p = new THREE.Group();
    p.position.set(x, 0, z);
    p.rotation.y = r;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.9, 6), darkSil);
    body.position.y = 0.75;
    p.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 7, 7), darkSil);
    head.position.y = 1.3;
    p.add(head);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.1, 10), strawMat);
    hat.position.y = 1.4;
    p.add(hat);
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.5, 6), darkSil);
    legs.position.y = 0.25;
    p.add(legs);
    root.add(p);
  });

  /* ---------- 柜台 ---------- */

  const counter = new THREE.Group();
  counter.position.set(8.0, 0, 2.5);
  counter.userData.hotspot = 'keeper';
  root.add(counter);
  box(1.05, 1.0, 2.9, woodDark, 0, 0.5, 0, counter);
  box(1.2, 0.09, 3.1, wood, 0, 1.04, 0, counter);
  box(0.86, 0.26, 0.36, wood, -0.1, 0.6, -1.0, counter);
  // 账本/算盘/抹布都挪到柜面远端，别挡着老板娘
  const ledger = box(0.44, 0.05, 0.34, paper, -0.08, 1.115, -1.15, counter);
  ledger.rotation.y = 0.2;
  const abacus = box(0.46, 0.05, 0.24, woodDark, 0.08, 1.11, -0.72, counter);
  abacus.rotation.y = -0.12;
  // 油灯（挪到柜台远端，别挡老板娘的脸）
  const lampBody = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 8), brassMat);
  lampBody.position.set(0.25, 1.16, -1.15);
  counter.add(lampBody);
  const lampFlame = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffb066 }));
  lampFlame.position.set(0.25, 1.26, -1.15);
  lampFlame.scale.set(0.7, 1.5, 0.7);
  counter.add(lampFlame);

  /* ---------- 人物构造 ---------- */

  const people = [];
  const robePalette = [0x38404c, 0x5d4a39, 0x7a6a4d, 0x43272a, 0x2f4438, 0x6b6152, 0x3a3630];

  const weaveTex = canvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#e6e1d8';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(130,118,100,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 4) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    noise(ctx, w, h, 5);
  }, 3, 3);

  const sashMat = new THREE.MeshStandardMaterial({ color: 0x1c1711, roughness: 0.92 });
  const lapelMat = new THREE.MeshStandardMaterial({ color: 0x3f3327, roughness: 0.94 });
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x1a1511, roughness: 0.96 });
  const beardMat = new THREE.MeshStandardMaterial({ color: 0x6b6052, roughness: 1 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1b140e });
  const lipMat = new THREE.MeshStandardMaterial({ color: 0x4a3129, roughness: 1 });
  const apronMat = new THREE.MeshStandardMaterial({ color: 0xb7ad9a, roughness: 0.97 });

  function hash01(a, b) {
    const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return v - Math.floor(v);
  }

  function personRobeMat(color) {
    return new THREE.MeshStandardMaterial({ color, map: weaveTex, roughness: 0.95, metalness: 0.02 });
  }

  function limbMesh(a, b, r, mat) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - r * 2), 3, 8), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return m;
  }

  function buildArm(side, shoulderPos, spec, robeMat) {
    const root = new THREE.Group();
    root.position.copy(shoulderPos);
    root.rotation.x = spec.x;
    root.rotation.z = side * spec.z;
    const upperLen = 0.26;
    const foreLen = 0.23;

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.top, spec.cuff, upperLen * 1.04, 12, 1, true),
      robeMat
    );
    sleeve.position.y = -upperLen / 2 + 0.02;
    sleeve.castShadow = true;
    root.add(sleeve);

    const elbow = new THREE.Group();
    elbow.position.y = -upperLen;
    elbow.rotation.x = spec.elbow;
    root.add(elbow);

    const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.034, foreLen, 10), robeMat);
    fore.position.y = -foreLen / 2;
    fore.castShadow = true;
    elbow.add(fore);

    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.wrist, spec.flare, 0.14, 12, 1, true),
      robeMat
    );
    cuff.position.y = -0.06;
    cuff.castShadow = true;
    elbow.add(cuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.034, 7, 6), skinMat);
    hand.position.y = -foreLen - 0.012;
    hand.scale.set(0.86, 1, 0.9);
    hand.castShadow = true;
    elbow.add(hand);

    return { root, elbow, baseX: spec.x, baseZ: side * spec.z };
  }

  function makePerson(o) {
    const g = new THREE.Group();
    g.position.set(o.x, o.y || 0, o.z);
    g.rotation.y = o.rot || 0;
    if (o.hotspot) g.userData.hotspot = o.hotspot;

    const s = o.scale || 1;
    g.scale.setScalar(s);

    const seated = o.seated !== false;
    const robeMat = personRobeMat(o.robe ?? 0x3d4654);
    const build = o.build || 'normal';
    const wideBuild = build === 'heavy' ? 1.08 : build === 'lean' ? 0.94 : 1;
    const sleeve = o.sleeve || 'normal';
    const h = hash01(o.x, o.z);

    // 坐姿向桌沿靠 14cm，避免手悬在胸前
    if (seated) {
      g.position.x += Math.sin(g.rotation.y) * 0.14;
      g.position.z += Math.cos(g.rotation.y) * 0.14;
    }

    const hipY = seated ? 0.49 : 0.88;
    const shoulderY = hipY + 0.47;

    // 袍身与下摆：一条连续剖面，肩线由剖面自然收出
    const hemLen = seated ? 0.30 : 0.64;
    const hemR = seated ? 0.235 : 0.250;
    const lower = seated
      ? [
          new THREE.Vector2(hemR, -hemLen),
          new THREE.Vector2(hemR * 0.96, -hemLen * 0.80),
          new THREE.Vector2(0.214, -hemLen * 0.56),
          new THREE.Vector2(0.190, -hemLen * 0.32),
          new THREE.Vector2(0.170, -hemLen * 0.12),
          new THREE.Vector2(0.152, 0.04),
        ]
      : [
          new THREE.Vector2(hemR, -hemLen),
          new THREE.Vector2(hemR * 0.96, -hemLen * 0.82),
          new THREE.Vector2(0.220, -hemLen * 0.60),
          new THREE.Vector2(0.195, -hemLen * 0.36),
          new THREE.Vector2(0.176, -hemLen * 0.16),
          new THREE.Vector2(0.158, -hemLen * 0.02),
        ];
    const robeGeo = new THREE.LatheGeometry(lower.concat([
      new THREE.Vector2(0.146, 0.17),
      new THREE.Vector2(0.160, 0.30),
      new THREE.Vector2(0.176, 0.40),
      new THREE.Vector2(0.186, 0.44),
      new THREE.Vector2(0.160, 0.475),
      new THREE.Vector2(0.100, 0.505),
      new THREE.Vector2(0.064, 0.53),
    ]), 20);
    const rp = robeGeo.attributes.position;
    for (let i = 0; i < rp.count; i++) {
      const x = rp.getX(i), y = rp.getY(i), z = rp.getZ(i);
      const r = Math.hypot(x, z);
      if (r < 1e-5) continue;
      const a = Math.atan2(z, x);
      const depth = Math.min(1, Math.max(0, -y / hemLen));
      const nr = r + Math.sin(a * 9 + h * 6.28) * 0.010 * depth;
      rp.setX(i, Math.cos(a) * nr);
      rp.setZ(i, Math.sin(a) * nr);
    }
    robeGeo.computeVertexNormals();
    const torso = new THREE.Mesh(robeGeo, robeMat);
    torso.position.y = hipY;
    torso.scale.set(wideBuild, 1, 0.78);
    torso.castShadow = true;
    torso.receiveShadow = true;
    g.add(torso);

    // 腰带、结与垂带
    const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.156, 0.161, 0.05, 16), sashMat);
    sash.position.y = hipY + 0.155;
    sash.scale.z = 0.80;
    g.add(sash);
    const knot = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.058, 0.03), sashMat);
    knot.position.set(0.10, hipY + 0.145, 0.098);
    knot.rotation.z = 0.3;
    g.add(knot);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.17, 0.012), sashMat);
    tail.position.set(0.115, hipY + 0.06, 0.102);
    tail.rotation.z = 0.12;
    g.add(tail);

    // 交领
    [-1, 1].forEach((side) => {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.19, 0.012), lapelMat);
      lapel.position.set(side * 0.036, hipY + 0.345, 0.127);
      lapel.rotation.z = side * 0.5;
      lapel.rotation.x = -0.08;
      g.add(lapel);
    });

    // 颈与头
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.058, 0.085, 8), skinMat);
    neck.position.y = hipY + 0.51;
    g.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.y = hipY + 0.545;
    g.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.107, 18, 14), skinMat);
    head.position.y = 0.135;
    head.scale.set(0.92, 1.04, 0.96);
    head.castShadow = true;
    headGroup.add(head);

    [-1, 1].forEach((side) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0105, 6, 6), eyeMat);
      eye.position.set(side * 0.036, 0.152, 0.093);
      headGroup.add(eye);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.009, 0.012), hairMat);
      brow.position.set(side * 0.037, 0.181, 0.094);
      brow.rotation.z = side * 0.14;
      headGroup.add(brow);

      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.021, 6, 6), skinMat);
      ear.position.set(side * 0.096, 0.135, 0.0);
      ear.scale.set(0.5, 0.95, 0.72);
      headGroup.add(ear);
    });

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.03, 6), skinMat);
    nose.position.set(0, 0.128, 0.104);
    nose.rotation.x = Math.PI / 2;
    headGroup.add(nose);

    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.008), lipMat);
    mouth.position.set(0, 0.088, 0.097);
    headGroup.add(mouth);

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.110, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.4),
      hairMat
    );
    hairCap.position.set(0, 0.137, 0);
    hairCap.scale.set(0.96, 1.06, 0.99);
    headGroup.add(hairCap);

    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.104, 14, 12), hairMat);
    hairBack.position.set(0, 0.128, -0.048);
    hairBack.scale.set(0.94, 0.96, 0.72);
    headGroup.add(hairBack);

    const hat = o.hat || 'bun';
    if (hat === 'cone') {
      const brim = new THREE.Mesh(new THREE.ConeGeometry(0.205, 0.07, 14), strawMat);
      brim.position.set(0, 0.245, 0.005);
      brim.rotation.x = -0.07;
      brim.castShadow = true;
      headGroup.add(brim);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), strawMat);
      top.position.set(0, 0.272, 0.005);
      headGroup.add(top);
    } else if (hat === 'cap') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.096, 12, 8), hairMat);
      dome.position.set(0, 0.235, 0);
      dome.scale.set(1.02, 0.72, 1.02);
      dome.castShadow = true;
      headGroup.add(dome);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.099, 0.101, 0.038, 12), hairMat);
      band.position.set(0, 0.203, 0);
      headGroup.add(band);
      [-1, 1].forEach((side) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.018, 0.05), hairMat);
        wing.position.set(side * 0.135, 0.215, -0.045);
        wing.rotation.z = side * -0.18;
        wing.rotation.y = side * 0.3;
        headGroup.add(wing);
      });
    } else if (hat === 'hood') {
      const hood = new THREE.Mesh(new THREE.ConeGeometry(0.155, 0.28, 10, 1, true), darkSil);
      hood.position.set(0, 0.235, -0.025);
      hood.rotation.x = -0.06;
      headGroup.add(hood);
    } else {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), hairMat);
      bun.position.set(0, 0.262, -0.028);
      headGroup.add(bun);
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.13, 6), brassMat);
      pin.position.set(0, 0.262, -0.028);
      pin.rotation.z = Math.PI / 2;
      headGroup.add(pin);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.071, 0.009, 5, 12), strawMat);
      band.position.set(0, 0.198, 0);
      band.rotation.x = Math.PI / 2;
      headGroup.add(band);
    }

    if (o.beard) {
      const beard = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.17, 7), beardMat);
      beard.position.set(0, 0.028, 0.062);
      beard.rotation.z = Math.PI;
      beard.rotation.x = 0.12;
      headGroup.add(beard);
      [-1, 1].forEach((side) => {
        const stache = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.008, 0.01), beardMat);
        stache.position.set(side * 0.018, 0.104, 0.098);
        stache.rotation.z = side * 0.22;
        headGroup.add(stache);
      });
    }

    // 双臂：肩—肘两段，袖口外张
    const sleeveSpec = sleeve === 'wide'
      ? { top: 0.072, cuff: 0.118, wrist: 0.085, flare: 0.135 }
      : sleeve === 'tight'
        ? { top: 0.055, cuff: 0.062, wrist: 0.05, flare: 0.062 }
        : { top: 0.062, cuff: 0.082, wrist: 0.062, flare: 0.09 };

    const pose = seated
      ? { x: -0.85, z: 0.10, elbow: -0.85 }
      : { x: -0.02, z: 0.13, elbow: -0.35 };

    const arms = [];
    [-1, 1].forEach((side) => {
      const arm = buildArm(side, new THREE.Vector3(side * 0.165 * wideBuild, shoulderY, 0.01), { ...sleeveSpec, ...pose }, robeMat);
      g.add(arm.root);
      arms.push(arm);
    });

    // 腿脚：坐姿大腿水平、小腿垂直；站姿藏在袍下
    if (seated) {
      [-1, 1].forEach((side) => {
        const hip = new THREE.Vector3(side * 0.075, hipY + 0.02, 0.015);
        const knee = new THREE.Vector3(side * 0.118, hipY - 0.055, 0.30);
        const ankle = new THREE.Vector3(side * 0.118, 0.095, 0.295);
        const thigh = limbMesh(hip, knee, 0.072, robeMat);
        const shin = limbMesh(knee, ankle, 0.054, robeMat);
        thigh.castShadow = true;
        shin.castShadow = true;
        g.add(thigh);
        g.add(shin);
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.075, 0.21), bootMat);
        boot.position.set(side * 0.118, 0.045, 0.365);
        boot.castShadow = true;
        g.add(boot);
      });
    } else {
      [-1, 1].forEach((side) => {
        const hip = new THREE.Vector3(side * 0.072, hipY, 0);
        const ankle = new THREE.Vector3(side * 0.085, 0.095, 0.015);
        const leg = limbMesh(hip, ankle, 0.058, robeMat);
        leg.castShadow = true;
        g.add(leg);
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.075, 0.20), bootMat);
        boot.position.set(side * 0.085, 0.045, 0.06);
        boot.castShadow = true;
        g.add(boot);
      });
    }

    if (o.apron) {
      const apron = new THREE.Mesh(
        new THREE.CylinderGeometry(0.20, 0.245, 0.46, 12, 1, true, -0.95, 1.9),
        apronMat
      );
      apron.position.y = hipY - 0.23;
      apron.scale.set(wideBuild, 1, 0.86);
      apron.castShadow = true;
      g.add(apron);
    }

    // 腰刀挂左胯
    if (o.sword) {
      const sword = new THREE.Group();
      sword.position.set(-0.20 * wideBuild, hipY + 0.06, -0.04);
      sword.rotation.z = -0.22;
      sword.rotation.x = 0.45;
      const sheath = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.72, 0.06), hairMat);
      sheath.position.y = -0.34;
      sheath.castShadow = true;
      sword.add(sheath);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.018, 0.065), brassMat);
      guard.position.y = 0.015;
      sword.add(guard);
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.16, 7), hairMat);
      grip.position.y = 0.10;
      sword.add(grip);
      const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), brassMat);
      pommel.position.y = 0.185;
      sword.add(pommel);
      g.add(sword);
    }

    if (o.hooded) {
      const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.30, 0.85, 10, 1, true), darkSil);
      cloak.position.y = seated ? 0.72 : 1.12;
      cloak.castShadow = true;
      g.add(cloak);
    }

    g.traverse((m) => {
      if (m.isMesh) m.receiveShadow = true;
    });
    root.add(g);
    people.push({
      group: g, arms, head: headGroup, chest: torso,
      phase: Math.random() * 6.283, seated, baseY: g.position.y,
    });
    return g;
  }

  /* ---------- 桌凳 ---------- */

  const pourTargets = {};
  const steamSpots = [];

  function makeCup(parent, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.042, 0.06, 10), porcelain);
    body.position.y = 0.03;
    body.castShadow = true;
    g.add(body);
    const fill = new THREE.Mesh(new THREE.CircleGeometry(0.042, 12), teaMat.clone());
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.058;
    fill.scale.set(0.15, 0.15, 1);
    fill.material.opacity = 0;
    g.add(fill);
    parent.add(g);
    return { group: g, fill };
  }

  function makeTeapot(parent, x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0.84, z);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 10), porcelain);
    body.position.y = 0.09;
    body.castShadow = true;
    g.add(body);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), porcelain);
    lid.position.y = 0.18;
    g.add(lid);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.16, 6), porcelain);
    spout.position.set(0.13, 0.12, 0);
    spout.rotation.z = -0.9;
    g.add(spout);
    parent.add(g);
    return g;
  }

  function makeTable(id, x, z, w = 1.7, d = 0.95, props = {}) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.userData.hotspot = id;
    root.add(g);
    box(w, 0.09, d, wood, 0, 0.8, 0, g);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      box(0.11, 0.8, 0.11, woodDark, sx * (w / 2 - 0.15), 0.4, sz * (d / 2 - 0.13), g, false);
    });
    // 长凳
    [-1, 1].forEach((side) => {
      box(w * 0.86, 0.08, 0.3, wood, 0, 0.45, side * (d / 2 + 0.34), g, false);
      [-1, 1].forEach((sx) => {
        box(0.09, 0.45, 0.09, woodDark, sx * w * 0.34, 0.22, side * (d / 2 + 0.34), g, false);
      });
    });
    makeTeapot(g, 0.12, 0.02);
    // 碟 · 筷 · 花生
    [[-0.34, 0.17], [0.34, -0.22]].forEach(([px, pz], i) => {
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.072, 0.018, 12), porcelain);
      dish.position.set(px, 0.846, pz);
      dish.castShadow = true;
      g.add(dish);
      if (i === 1) {
        for (let k = 0; k < 6; k++) {
          const nut = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 5), peanutMat);
          nut.position.set(px - 0.04 + (k % 3) * 0.038, 0.866, pz - 0.03 + (k % 2) * 0.055);
          g.add(nut);
        }
      } else {
        [0, 1].forEach((k) => {
          const stick = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.22), hairMat);
          stick.position.set(px + 0.1 + k * 0.018, 0.862, pz + 0.02);
          stick.rotation.y = 0.35;
          g.add(stick);
        });
      }
    });

    if (props.buns) {
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.09, 10), strawMat);
      basket.position.set(-0.42, 0.86, 0.12);
      basket.castShadow = true;
      g.add(basket);
      for (let i = 0; i < 3; i++) {
        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd8c9a8, roughness: 0.9 }));
        bun.position.set(-0.47 + i * 0.05, 0.93, 0.08 + (i % 2) * 0.05);
        g.add(bun);
      }
      steamSpots.push({ x, z: z + 0.12, y: 0.95, scale: 0.45, phase: Math.random() * 6.28 });
    }
    if (props.jars) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.26, 10), new THREE.MeshStandardMaterial({ color: 0x4a3b30, roughness: 0.75 }));
      jar.position.set(0.5, 0.93, 0.18);
      jar.castShadow = true;
      g.add(jar);
    }
    return g;
  }

  function seatGuest(table, localX, localZ, opts) {
    const world = table.position;
    return makePerson({
      x: world.x + localX,
      z: world.z + localZ,
      rot: opts.rot ?? 0,
      ...opts,
    });
  }

  /* ---------- 四桌主线 ---------- */

  // 捕快
  const tableA = makeTable('captain', 4.4, 4.6, 1.8, 1.0, { buns: true });
  makePerson({ x: 3.9, z: 3.58, rot: 0, robe: 0x232a34, hat: 'cap', beard: true, sword: true, build: 'heavy', hotspot: 'captain' });
  makePerson({ x: 5.1, z: 3.62, rot: 0, robe: 0x3a3a32, hat: 'cap', build: 'normal', hotspot: 'captain' });
  // 海捕文书
  const warrant = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), paper);
  warrant.rotation.set(-Math.PI / 2, 0, 0.3);
  warrant.position.set(-0.35, 0.848, -0.25);
  tableA.add(warrant);
  pourTargets.captain = makeCup(tableA, -0.36, 0.84, -0.26);

  // 揭榜人
  const tableB = makeTable('hunter', 4.6, -0.6, 1.7, 0.95, { jars: true });
  makePerson({ x: 4.2, z: -1.62, rot: 0, robe: 0x5d4a36, hat: 'cone', build: 'lean', sleeve: 'tight', hotspot: 'hunter' });
  makePerson({ x: 5.3, z: -1.58, rot: 0, robe: 0x4a4438, hat: 'bun', build: 'normal', hotspot: 'hunter' });
  const bounty = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.5), paper);
  bounty.rotation.set(-Math.PI / 2, 0, -0.18);
  bounty.position.set(0.35, 0.86, -0.4);
  tableB.add(bounty);
  const token = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 12), brassMat);
  token.position.set(0.55, 0.86, -0.35);
  tableB.add(token);
  pourTargets.hunter = makeCup(tableB, -0.4, 0.84, -0.24);

  // 师兄
  const tableC = makeTable('senior', -5.2, 3.4, 1.6, 0.95, { buns: true });
  makePerson({ x: -5.4, z: 2.42, rot: 0, robe: 0xb3ac9b, hat: 'bun', sword: false, build: 'lean', sleeve: 'wide', hotspot: 'senior' });
  // 裹布长剑横在桌上
  const wrapped = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.95, 8), new THREE.MeshStandardMaterial({ color: 0x9a9384, roughness: 0.95 }));
  wrapped.position.set(-0.15, 0.88, 0.05);
  wrapped.rotation.z = Math.PI / 2;
  wrapped.rotation.y = 0.12;
  tableC.add(wrapped);
  pourTargets.senior = makeCup(tableC, -0.18, 0.84, -0.26);

  // 老板娘
  const keeper = makePerson({ x: 8.72, z: 2.5, rot: -Math.PI / 2, robe: 0x5a2a22, hat: 'bun', seated: false, sleeve: 'wide', apron: true, hotspot: 'keeper' });
  pourTargets.keeper = makeCup(counter, 0.6, 1.085, 0.25);
  // 抹布（搭在柜台远端）
  const towel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.2), new THREE.MeshStandardMaterial({ color: 0x8e8778, roughness: 1 }));
  towel.position.set(8.62, 1.22, 1.45);
  towel.rotation.z = 0.24;
  root.add(towel);

  /* ---------- 旁桌 ---------- */

  const tableE = makeTable('tableE', -4.8, 6.3, 1.6, 0.95, { buns: true, jars: true });
  makePerson({ x: -5.3, z: 5.32, rot: 0, robe: 0x6b6152, hat: 'cap', beard: true, hotspot: 'tableE' });
  makePerson({ x: -4.2, z: 5.36, rot: 0, robe: 0x43514a, hat: 'bun', hotspot: 'tableE' });
  makePerson({ x: -4.8, z: 7.3, rot: Math.PI, robe: 0x3a3630, hat: 'cone', hotspot: 'tableE' });
  pourTargets.tableE = makeCup(tableE, -0.3, 0.84, -0.26);

  const tableF = makeTable('tableF', -2.1, -1.4, 1.6, 0.95, { jars: true });
  makePerson({ x: -2.5, z: -2.38, rot: 0, robe: 0x40382d, hat: 'bun', beard: true, hotspot: 'tableF' });
  makePerson({ x: -1.5, z: -2.34, rot: 0, robe: 0x513f30, hat: 'cone', hotspot: 'tableF' });
  pourTargets.tableF = makeCup(tableF, -0.4, 0.84, -0.26);

  const tableH = makeTable('tableH', 6.1, -2.7, 1.6, 0.95, { buns: true });
  makePerson({ x: 5.7, z: -3.68, rot: 0, robe: 0x4a4d43, hat: 'cone', hotspot: 'tableH' });
  makePerson({ x: 6.6, z: -3.64, rot: 0, robe: 0x6a5a48, hat: 'bun', hotspot: 'tableH' });
  pourTargets.tableH = makeCup(tableH, -0.3, 0.84, -0.26);

  // 趴在长凳上睡着的孩子
  const sleeper = new THREE.Group();
  sleeper.position.set(6.35, 0.5, -1.86);
  root.add(sleeper);
  const sb = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.52, 8), new THREE.MeshStandardMaterial({ color: 0x6b5b47, roughness: 0.95 }));
  sb.rotation.z = Math.PI / 2;
  sb.position.y = 0.05;
  sleeper.add(sb);
  const sh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 7), skinMat);
  sh.position.set(-0.29, 0.1, 0);
  sleeper.add(sh);
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.3), new THREE.MeshStandardMaterial({ color: 0x4a3a2e, roughness: 1 }));
  blanket.position.set(0.02, 0.15, 0);
  sleeper.add(blanket);

  // 后堂的散桌
  const tableI = makeTable('tableI', 1.9, -2.9, 1.7, 0.95, { jars: true });
  makePerson({ x: 1.42, z: -3.86, rot: 0, robe: 0x3f4740, hat: 'cone', hotspot: 'tableI' });
  makePerson({ x: 2.42, z: -3.82, rot: 0, robe: 0x554434, hat: 'bun', beard: true, hotspot: 'tableI' });
  pourTargets.tableI = makeCup(tableI, -0.35, 0.84, -0.26);

  // 靠门的散桌
  const tableJ = makeTable('tableJ', 6.55, 6.0, 1.6, 0.95, { buns: true });
  makePerson({ x: 6.1, z: 6.88, rot: Math.PI, robe: 0x464b52, hat: 'cap', hotspot: 'tableJ' });
  makePerson({ x: 7.0, z: 6.84, rot: Math.PI, robe: 0x5c4a3a, hat: 'bun', hotspot: 'tableJ' });
  pourTargets.tableJ = makeCup(tableJ, -0.3, 0.84, 0.26);


  /* ---------- 堂中杂物 ---------- */

  // 炭炉 · 铜壶
  const stove = new THREE.Group();
  stove.position.set(-2.85, 0, 4.5);
  root.add(stove);
  const stoveBody = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.52, 12), stone);
  stoveBody.position.y = 0.26;
  stoveBody.castShadow = true; stoveBody.receiveShadow = true;
  stove.add(stoveBody);
  const coal = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 12), new THREE.MeshBasicMaterial({ color: 0xff6a24 }));
  coal.position.y = 0.54;
  coal.scale.y = 0.35;
  stove.add(coal);
  const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), brassMat);
  kettle.position.y = 0.72;
  kettle.scale.set(1, 0.82, 1);
  kettle.castShadow = true;
  stove.add(kettle);
  const kettleSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.3, 6), brassMat);
  kettleSpout.position.set(0.22, 0.78, 0.05);
  kettleSpout.rotation.z = -1.15;
  stove.add(kettleSpout);
  steamSpots.push({ x: -2.85, z: 4.5, y: 1.0, scale: 0.7, phase: Math.random() * 6.28 });

  // 堂中的一张散桌
  const tableG = makeTable('tableG', 0.3, 1.2, 1.7, 0.95, { buns: true, jars: true });
  makePerson({ x: -0.2, z: 0.18, rot: 0, robe: 0x465046, hat: 'cone', hotspot: 'tableG' });
  makePerson({ x: 1.0, z: 0.22, rot: 0, robe: 0x5a4634, hat: 'bun', hotspot: 'tableG' });
  makePerson({ x: 0.3, z: 2.2, rot: Math.PI, robe: 0x3b3f37, hat: 'cap', hotspot: 'tableG' });
  pourTargets.tableG = makeCup(tableG, -0.35, 0.84, -0.26);

  // 靠墙的酒架
  const rack = new THREE.Group();
  rack.position.set(8.85, 0, -2.0);
  root.add(rack);
  box(0.16, 1.0, 2.2, woodDark, 0, 0.5, 0, rack, false);
  box(0.5, 0.06, 2.2, wood, -0.2, 0.5, 0, rack, false);
  for (let i = 0; i < 3; i++) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.3, 10), new THREE.MeshStandardMaterial({ color: 0x4a3b30, roughness: 0.75 }));
    jar.position.set(-0.28, 0.66, -0.7 + i * 0.7);
    rack.add(jar);
  }

  // 炭炉边暖手的酒客
  makePerson({ x: -1.7, z: 3.94, rot: -1.12, robe: 0x4b4438, hat: 'cone', seated: false });
  // 门口避雪的人（站在檐下，不挡正门）
  makePerson({ x: -5.4, z: 9.5, rot: 0.55, robe: 0x3f4349, hat: 'cone', seated: false });

  // 门边的伞桶
  const umbrella = new THREE.Group();
  umbrella.position.set(3.3, 0, 7.72);
  root.add(umbrella);
  const uPot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.5, 12), stone);
  uPot.position.y = 0.25;
  uPot.castShadow = true;
  umbrella.add(uPot);
  for (let i = 0; i < 4; i++) {
    const a = i * 1.9;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.35, 6), woodDark);
    stick.position.set(Math.cos(a) * 0.12, 0.72, Math.sin(a) * 0.12);
    stick.rotation.z = Math.cos(a) * 0.18;
    stick.rotation.x = Math.sin(a) * 0.18;
    umbrella.add(stick);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.86, 8), new THREE.MeshStandardMaterial({ color: 0x4a3626, roughness: 0.96 }));
    tip.position.set(Math.cos(a) * 0.13, 1.16, Math.sin(a) * 0.13);
    tip.rotation.z = Math.cos(a) * 0.13;
    tip.rotation.x = Math.sin(a) * 0.13;
    umbrella.add(tip);
  }


  /* ---------- 说书台 · 屏风 · 听客 ---------- */

  const stage = box(3.2, 0.3, 1.7, wood, -4.8, 0.15, -3.45, root);
  stage.userData.hotspot = 'teller';
  for (let i = -1; i <= 1; i++) {
    const p = box(1.06, 2.35, 0.06, screenMat, -4.8 + i * 1.05, 1.5, -4.36, root, false);
    p.rotation.y = i * 0.2;
    p.userData.hotspot = 'teller';
    // 每扇加木框，别让它看起来像一块发光的墙
    const frame = new THREE.Group();
    frame.position.set(-4.8 + i * 1.05, 1.5, -4.37);
    frame.rotation.y = i * 0.2;
    root.add(frame);
    box(1.14, 0.07, 0.08, woodDark, 0, 1.175, 0, frame, false);
    box(1.14, 0.07, 0.08, woodDark, 0, -1.175, 0, frame, false);
    [-0.53, 0.53].forEach((sx) => box(0.07, 2.35, 0.08, woodDark, sx, 0, 0, frame, false));
    box(1.1, 0.035, 0.06, woodDark, 0, 0.2, 0, frame, false);
  }
  box(3.4, 0.12, 0.12, woodDark, -4.8, 2.72, -4.36, root, false);
  const teller = makePerson({ x: -4.8, y: 0.3, z: -3.3, rot: 0, robe: 0x6d6354, hat: 'bun', seated: false, hotspot: 'teller' });
  // 折扇
  const fan = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.3), new THREE.MeshStandardMaterial({ color: 0xd8c9a8, roughness: 0.9 }));
  fan.position.set(-4.55, 1.42, -3.1);
  fan.rotation.set(0.2, 0.3, 0.5);
  fan.userData.hotspot = 'teller';
  root.add(fan);
  // 醒木小几
  box(0.5, 0.45, 0.36, woodDark, -5.55, 0.5, -3.15, root, false).userData.hotspot = 'teller';
  box(0.14, 0.06, 0.08, woodDark, -5.55, 0.76, -3.15, root, false).userData.hotspot = 'teller';
  // 听客
  [[-6.45, -1.5], [-3.35, -1.55]].forEach(([x, z], i) => {
    makePerson({ x, z, rot: Math.PI, robe: robePalette[i + 2], hat: i ? 'cone' : 'bun' });
    box(0.36, 0.45, 0.36, woodDark, x, 0.225, z, root, false);
  });

  /* ---------- 后院天井 ---------- */

  const yard = new THREE.Mesh(new THREE.PlaneGeometry(13, 8.6), stone);
  yard.rotation.x = -Math.PI / 2;
  yard.position.set(0, 0.004, -8.8);
  yard.receiveShadow = true;
  root.add(yard);
  box(0.3, 4.4, 8.6, plasterLight, -6.5, 2.2, -8.8, root, false);
  box(0.3, 4.4, 8.6, plasterLight, 6.5, 2.2, -8.8, root, false);
  box(13, 4.4, 0.3, plasterLight, 0, 2.2, -13.0, root, false);

  // 堂院之间的穿堂柱与檐口
  [-6.35, 6.35].forEach((x) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.5, 10), woodDark);
    c.position.set(x, 2.25, -4.55);
    c.castShadow = true; c.receiveShadow = true;
    root.add(c); meshes.push(c);
    box(0.7, 0.12, 0.7, wood, x, 4.46, -4.55, root, false);
  });
  box(13.4, 0.28, 0.34, woodDark, 0, 4.6, -4.55, root, false);
  const yardEave = box(13.8, 0.16, 1.8, roofMat, 0, 4.78, -5.3, root, false);
  yardEave.rotation.x = 0.12;

  // 院子两侧的檐廊
  [-1, 1].forEach((side) => {
    [-5.4, -8.2, -11.0].forEach((z) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.5, 8), woodDark);
      c.position.set(side * 5.0, 1.75, z);
      c.castShadow = true;
      root.add(c); meshes.push(c);
    });
    box(0.16, 0.18, 8.4, woodDark, side * 5.0, 3.45, -8.8, root, false);
    const lean = box(1.9, 0.12, 8.6, roofMat, side * 5.55, 3.82, -8.8, root, false);
    lean.rotation.z = side * 0.2;
  });

  // 后院花窗
  [[-3.2, -13.0], [3.2, -13.0]].forEach(([x, z]) => {
    box(1.4, 1.4, 0.08, woodDark, x, 2.4, z + 0.14, root, false);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 1.16), glowPaper.clone());
    pane.material.opacity = 0.22;
    pane.position.set(x, 2.4, z + 0.2);
    pane.rotation.y = Math.PI;
    root.add(pane);
  });
  // 后厨门洞
  box(2.0, 2.5, 0.12, woodDark, 0, 1.25, -12.83, root, false);
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), new THREE.MeshBasicMaterial({ color: 0x2a1c0f, transparent: true, opacity: 0.9 }));
  doorGlow.position.set(0, 1.15, -12.76);
  root.add(doorGlow);
  steamSpots.push({ x: 0, z: -12.4, y: 2.4, scale: 1.3, phase: 0 });

  // 井
  const well = new THREE.Group();
  well.position.set(-2.4, 0, -7.6);
  root.add(well);
  const curb = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.05, 0.5, 14, 1, true), stone);
  curb.position.y = 0.25;
  curb.material.side = THREE.DoubleSide;
  curb.castShadow = true; curb.receiveShadow = true;
  well.add(curb);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.92, 14), new THREE.MeshBasicMaterial({ color: 0x0a0d11 }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.18;
  well.add(water);
  box(0.14, 1.9, 0.14, woodDark, -1.3, 1.15, -7.6, root, false);
  box(0.14, 1.9, 0.14, woodDark, 1.3, 1.15, -7.6, root, false);
  box(2.9, 0.14, 0.14, woodDark, 0, 2.05, -7.6, root, false);
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.26, 10), woodDark);
  bucket.position.set(0.4, 1.5, -7.6);
  root.add(bucket);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 5), new THREE.MeshStandardMaterial({ color: 0x8a7442 }));
  rope.position.set(0.4, 1.9, -7.6);
  root.add(rope);

  // 老槐树
  const tree = new THREE.Group();
  tree.position.set(5.2, 0, -10.4);
  root.add(tree);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.34, 3.6, 8), new THREE.MeshStandardMaterial({ color: 0x35281b, roughness: 0.95 }));
  trunk.position.y = 1.8;
  trunk.castShadow = true; trunk.receiveShadow = true;
  tree.add(trunk);
  [[0.4, 3.2, 0.15, 0.6], [-0.4, 3.3, -0.2, -0.7], [0.1, 3.7, 0.5, 0.2], [-0.2, 3.9, -0.4, -0.4]].forEach(([x, y, z, rz]) => {
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 1.0, 6), new THREE.MeshStandardMaterial({ color: 0x35281b, roughness: 0.95 }));
    br.position.set(x, y, z);
    br.rotation.z = rz;
    tree.add(br);
  });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x47553b, roughness: 1, emissive: 0x0b1208, emissiveIntensity: 0.3 });
  [[0, 4.0, 0, 0.88], [0.7, 3.85, 0.35, 0.62], [-0.65, 3.8, -0.3, 0.6], [0.15, 4.45, -0.45, 0.55], [-0.2, 4.4, 0.45, 0.5]].forEach(([x, y, z, s]) => {
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), leafMat);
    l.position.set(x, y, z);
    l.scale.set(1.1, 0.85, 1.05);
    l.castShadow = true;
    tree.add(l);
  });

  // 酒坛堆
  const jarMat = new THREE.MeshStandardMaterial({ color: 0x4a3b30, roughness: 0.75, metalness: 0.1 });
  const jarGeo = new THREE.CylinderGeometry(0.26, 0.2, 0.62, 14);
  [[-4.9, -5.4], [-5.5, -6.0], [-5.2, -4.7], [5.2, -5.5], [5.6, -6.1]].forEach(([x, z], i) => {
    const j = new THREE.Mesh(jarGeo, jarMat);
    j.position.set(x, 0.31 + (i % 2 ? 0.28 : 0), z);
    j.rotation.y = Math.random() * 3;
    j.castShadow = true; j.receiveShadow = true;
    root.add(j);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12), paper);
    lid.position.set(x, 0.63 + (i % 2 ? 0.28 : 0), z);
    root.add(lid);
  });
  // 柴堆
  [[1.6, -12.3], [2.2, -12.2], [1.9, -12.0]].forEach(([x, z]) => {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 }));
    log.position.set(x, 0.12, z);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = Math.random() * 0.6;
    root.add(log);
  });

  /* ---------- 大堂与后院之间的栏栅 ---------- */

  function rail(x0, x1, z) {
    box(x1 - x0, 0.07, 0.1, wood, (x0 + x1) / 2, 0.92, z, root, false);
    box(x1 - x0, 0.05, 0.08, wood, (x0 + x1) / 2, 0.55, z, root, false);
    for (let x = x0 + 0.2; x <= x1 - 0.1; x += 0.9) {
      box(0.07, 0.95, 0.07, woodDark, x, 0.47, z, root, false);
    }
  }
  rail(-3.2, 1.2, -4.55);
  rail(3.4, 6.4, -4.55);
  box(2.2, 0.12, 0.42, wood, 2.3, 0.05, -4.6, root, false);

  /* ---------- 灯笼 ---------- */

  const lanterns = [];
  const haloMap = haloTexture();
  function makeLantern(x, y, z, scale = 1, withLight = false, intensity = 24) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    root.add(g);
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0x8c2a12, emissive: 0xd0491a, emissiveIntensity: 1.5, roughness: 0.75 });
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.26 * scale, 14, 12), shadeMat);
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
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloMap, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.72, depthWrite: false }));
    halo.scale.set(1.9 * scale, 1.9 * scale, 1);
    g.add(halo);
    let light = null;
    if (withLight) {
      light = new THREE.PointLight(0xff9a4a, intensity, 13, 1.8);
      light.position.y = 0;
      g.add(light);
    }
    lanterns.push({ group: g, light, shadeMat, halo, base: intensity, phase: Math.random() * 6.28 });
    return g;
  }

  makeLantern(0.6, 4.85, 2.0, 1.15, true, 32);
  makeLantern(-4.9, 3.5, 8.55, 0.9);
  makeLantern(4.9, 3.5, 8.55, 0.9);
  makeLantern(-1.8, 4.25, 4.2, 0.82);
  makeLantern(3.6, 4.4, 0.4, 0.78);
  makeLantern(-7.0, 4.35, 3.6, 0.8, true, 20);
  makeLantern(7.0, 4.35, 4.2, 0.8);
  makeLantern(-7.0, 4.35, -2.2, 0.8);
  makeLantern(5.2, 2.65, -8.8, 0.72, true, 14);
  makeLantern(-2.0, 2.1, -8.0, 0.72, true, 14);
  makeLantern(0, 3.35, -12.35, 0.75);
  makeLantern(-8.3, 3.4, 2.0, 0.7, true, 16);

  // 门外街边的两盏灯，把街道从黑里拉出来
  makeLantern(-3.4, 3.2, 9.4, 0.8, true, 16);
  makeLantern(3.4, 3.2, 9.4, 0.8, true, 16);
  const streetFill = new THREE.PointLight(0xffb072, 40, 30, 2);
  streetFill.position.set(0, 2.4, 12.0);
  scene.add(streetFill);
  const streetFill2 = new THREE.PointLight(0x8fa4c4, 18, 26, 2);
  streetFill2.position.set(-4, 4.2, 17.0);
  scene.add(streetFill2);

  // 湿石板上不额外贴反光片，避免出现“黑洞”

  /* 街道反光靠灯光，不再贴平面片 */


  /* ---------- 灯光 ---------- */

  scene.add(new THREE.HemisphereLight(0x43536b, 0x2b1c0d, 0.92));

  const spot = new THREE.SpotLight(0xffb070, 52, 18, 0.82, 0.74, 1.5);
  spot.position.set(0.6, 6.0, 2.0);
  spot.target.position.set(0.4, 0, -1.4);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0015;
  spot.shadow.camera.near = 0.5;
  spot.shadow.camera.far = 18;
  scene.add(spot, spot.target);

  const moon = new THREE.DirectionalLight(0x8297b4, 0.85);
  moon.position.set(6, 10, -16);
  moon.target.position.set(0, 0.6, -3);
  scene.add(moon, moon.target);

  const candleLight = new THREE.PointLight(0xff8c3a, 10, 8, 2);
  candleLight.position.set(8.25, 1.45, 1.35);
  scene.add(candleLight);

  const yardLight = new THREE.PointLight(0xa8bed8, 10, 16, 2);
  yardLight.position.set(0, 3.4, -8.0);
  scene.add(yardLight);

  const tableLight = new THREE.PointLight(0xffa860, 10, 8, 2);
  tableLight.position.set(4.2, 2.1, 4.2);
  scene.add(tableLight);

  const frontFill = new THREE.PointLight(0xffb277, 11, 11, 2);
  frontFill.position.set(0, 2.8, 6.4);
  scene.add(frontFill);

  const tableLightW = new THREE.PointLight(0xffa860, 6.5, 7, 2);
  tableLightW.position.set(-4.6, 2.2, 5.6);
  scene.add(tableLightW);

  const tableLightC = new THREE.PointLight(0xffa860, 6, 7, 2);
  tableLightC.position.set(-0.6, 2.0, -2.9);
  scene.add(tableLightC);

  /* ---------- 浮尘 · 雪 ---------- */

  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(280 * 3);
  for (let i = 0; i < 280; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 18;
    dustPos[i * 3 + 1] = Math.random() * 5.6;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 17;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xffc78a, size: 0.022, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }));
  root.add(dust);

  // 雪：街与后院（慢落、横飘；原来那套雨线改成了絮点）
  const flakes = [];
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) {
    const inYard = i < 360;
    const x = inYard ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 30;
    const z = inYard ? -4.8 - Math.random() * 8 : 9.2 + Math.random() * 13;
    flakes.push({
      x, z, y: Math.random() * 8,
      speed: 0.45 + Math.random() * 0.85,
      drift: Math.random() * 6.28,
      amp: 0.15 + Math.random() * 0.45,
      inYard,
    });
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snowFlakeTex = softTexture('rgba(240,246,255,0.95)');
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({
    map: snowFlakeTex, color: 0xe8f0fb, size: 0.075,
    transparent: true, opacity: 0.85, depthWrite: false, sizeAttenuation: true,
  }));
  snow.frustumCulled = false;
  root.add(snow);

  // 蒸汽
  const steamMap = softTexture('rgba(220,220,215,0.5)');
  const steams = [];
  function addSteam(x, y, z, scale) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamMap, transparent: true, opacity: 0, depthWrite: false }));
    s.position.set(x, y, z);
    s.scale.set(scale, scale, 1);
    s.userData = { baseX: x, baseZ: z, baseY: y, scale, phase: Math.random() * 6.28 };
    root.add(s);
    steams.push(s);
  }
  steamSpots.forEach((p) => {
    for (let i = 0; i < 3; i++) addSteam(p.x + (Math.random() - 0.5) * 0.15, p.y + i * 0.35, p.z, p.scale * (0.7 + Math.random() * 0.4));
  });

  /* ---------- 猫 ---------- */

  const cat = new THREE.Group();
  cat.position.set(0.9, 0, -4.1);
  root.add(cat);
  const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), darkSil);
  catBody.position.y = 0.58;
  catBody.scale.set(1.4, 0.72, 0.9);
  cat.add(catBody);
  const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), darkSil);
  catHead.position.set(0.2, 0.73, 0.03);
  cat.add(catHead);
  [-0.05, 0.05].forEach((dz) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 4), darkSil);
    ear.position.set(0.2, 0.84, 0.03 + dz);
    cat.add(ear);
  });
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.5, 6), darkSil);
  tail.position.set(-0.28, 0.56, 0.06);
  tail.rotation.z = 1.2;
  cat.add(tail);
  box(0.56, 0.42, 0.42, woodDark, 0.9, 0.21, -4.05, root, false);

  /* ---------- 上一队遗留物 ---------- */

  const relicGroup = new THREE.Group();
  counter.add(relicGroup);
  const relicCup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.05, 10), porcelain);
  relicCup.position.set(-0.2, 1.11, -0.85);
  relicCup.rotation.x = Math.PI;
  relicGroup.add(relicCup);
  const portraitMap = portraitTex();
  portraitMap.colorSpace = THREE.SRGBColorSpace;
  const relicPortrait = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.26), new THREE.MeshStandardMaterial({ map: portraitMap, roughness: 0.9, side: THREE.DoubleSide }));
  relicPortrait.rotation.set(-Math.PI / 2, 0, 0.2);
  relicPortrait.position.set(0.1, 1.11, -0.5);
  relicGroup.add(relicPortrait);
  const relicPlaque = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.2), new THREE.MeshStandardMaterial({ map: signTex('清', 128, 192, { mirror: true }), roughness: 0.9, side: THREE.DoubleSide }));
  relicPlaque.rotation.y = -Math.PI / 2;
  relicPlaque.position.set(0.36, 1.16, -0.2);
  relicGroup.add(relicPlaque);
  relicGroup.traverse((o) => { if (o.isMesh) o.visible = false; });
  const relicMap = { cup: relicCup, portrait: relicPortrait, plaque: relicPlaque };
  function showRelic(id) {
    if (relicMap[id]) relicMap[id].visible = true;
  }

  /* ---------- 人和物的小动作 ---------- */

  // 走堂的小二
  const waiter = makePerson({ x: 2.6, z: 5.4, rot: 0.4, robe: 0x565b54, hat: 'bun', seated: false });
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.3), wood);
  tray.position.set(0, 1.02, 0.3);
  tray.castShadow = true;
  waiter.add(tray);
  const waiterTeapot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.15, 8), porcelain);
  waiterTeapot.position.set(0.08, 1.13, 0.32);
  waiter.add(waiterTeapot);
  const wt = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.02), new THREE.MeshStandardMaterial({ color: 0xcfc7b4, roughness: 1 }));
  wt.position.set(-0.15, 1.3, 0.03);
  wt.rotation.z = 0.22;
  waiter.add(wt);

  const waiterPath = [
    [2.9, 3.4], [3.6, 2.2], [3.2, 0.4], [1.9, -1.4], [-0.9, -1.9], [-2.7, -0.5], [-2.9, 1.6], [-2.5, 3.1], [-1.2, 3.6], [1.1, 3.5],
  ];
  let waitSeg = 0, waitT = 0;

  // 端菜的小二（站在后厨门口）
  makePerson({ x: 1.8, z: -12.1, rot: Math.PI * 0.9, robe: 0x4d5148, hat: 'bun', seated: false });

  // 楼上倚着栏杆的客人
  makePerson({ x: 8.4, y: 3.28, z: 0.4, rot: -Math.PI / 2, robe: 0x2b2622, hat: 'bun', seated: false });
  makePerson({ x: -8.4, y: 3.28, z: 5.0, rot: Math.PI / 2, robe: 0x2f2a24, hat: 'cone', seated: false });

  /* ---------- 交互热点 ---------- */

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const hotspots = [
    { id: 'keeper', label: '给老板娘添茶', kind: 'wine', focusPos: V(5.4, 1.6, 3.4), focusTarget: V(8.55, 1.45, 2.5) },
    { id: 'captain', label: '给皂衣客上酒', kind: 'wine', focusPos: V(2.3, 1.6, 6.0), focusTarget: V(4.0, 1.34, 3.9) },
    { id: 'hunter', label: '给刀客上酒', kind: 'wine', focusPos: V(2.6, 1.6, 1.7), focusTarget: V(4.3, 1.3, -1.2) },
    { id: 'senior', label: '给白衣客上酒', kind: 'wine', focusPos: V(-3.0, 1.6, 4.7), focusTarget: V(-5.4, 1.32, 2.6) },
    { id: 'teller', label: '听说书人往下唱', kind: 'talk', focusPos: V(-2.4, 1.65, 0.5), focusTarget: V(-4.9, 1.55, -3.1) },
    { id: 'tableG', label: '给这桌添茶', kind: 'tea', focusPos: V(2.9, 1.6, 2.1), focusTarget: V(0.0, 1.18, 0.35) },
    { id: 'tableE', label: '给这桌添茶', kind: 'tea', focusPos: V(-2.6, 1.6, 6.7), focusTarget: V(-4.9, 1.16, 6.0) },
    { id: 'tableF', label: '给这桌添茶', kind: 'tea', focusPos: V(-0.1, 1.6, 0.5), focusTarget: V(-2.2, 1.16, -1.9) },
    { id: 'tableH', label: '给这桌添茶', kind: 'tea', focusPos: V(3.8, 1.6, -0.6), focusTarget: V(6.1, 1.18, -3.2) },
    { id: 'tableI', label: '给这桌添茶', kind: 'tea', focusPos: V(3.0, 1.6, -1.0), focusTarget: V(1.9, 1.18, -3.1) },
    { id: 'tableJ', label: '给这桌添茶', kind: 'tea', focusPos: V(4.3, 1.6, 5.3), focusTarget: V(6.5, 1.18, 6.0) },
  ];

  // 把 group 上的 hotspot 传给子网格
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

  /* 热点微光：上酒的金亮、添茶的温吞、说书的偏冷 */
  const GLOW_STYLE = {
    wine: { color: 0xffc36b, opacity: 0.5, scale: 1.0 },
    tea: { color: 0xd9c9a0, opacity: 0.3, scale: 0.8 },
    talk: { color: 0x9db4d0, opacity: 0.4, scale: 0.9 },
  };
  const KIND_BY_ID = { keeper: 'wine', captain: 'wine', hunter: 'wine', senior: 'wine', teller: 'talk', tableE: 'tea', tableF: 'tea', tableG: 'tea', tableH: 'tea', tableI: 'tea', tableJ: 'tea' };
  const glows = {};
  const glowAt = {
    keeper: [8.2, 1.5, 2.5],
    captain: [4.0, 1.16, 4.3],
    hunter: [4.3, 1.16, -1.1],
    senior: [-5.4, 1.16, 3.0],
    teller: [-4.8, 1.85, -3.3],
    tableE: [-4.8, 1.16, 5.9],
    tableF: [-2.1, 1.16, -1.5],
    tableG: [0.0, 1.16, 0.9],
    tableH: [6.1, 1.16, -2.6],
    tableI: [1.9, 1.16, -2.9],
    tableJ: [6.55, 1.16, 6.0],
  };
  Object.keys(glowAt).forEach((id, i) => {
    const [x, y, z] = glowAt[id];
    const style = GLOW_STYLE[KIND_BY_ID[id]] || GLOW_STYLE.tea;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloMap, color: style.color, blending: THREE.AdditiveBlending,
      transparent: true, opacity: style.opacity, depthWrite: false,
    }));
    s.position.set(x, y, z);
    s.scale.set(style.scale, style.scale, 1);
    s.userData.phase = i * 1.7;
    root.add(s);
    glows[id] = s;
  });

  function setGlow(id, on) {
    if (glows[id]) glows[id].visible = on;
  }

  /* ---------- 斟茶动画 ---------- */

  const pours = [];
  const teaStreamMat = new THREE.MeshBasicMaterial({ color: 0xd9a25c, transparent: true, opacity: 0.7 });
  const tmpVec = new THREE.Vector3();
  function pourTea(id) {
    const target = pourTargets[id];
    if (!target) return false;
    target.group.getWorldPosition(tmpVec);
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.013, 0.36, 6), teaStreamMat.clone());
    stream.position.set(tmpVec.x + 0.01, tmpVec.y + 0.23, tmpVec.z);
    root.add(stream);
    const steam = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamMap, transparent: true, opacity: 0, depthWrite: false }));
    steam.position.set(tmpVec.x, tmpVec.y + 0.12, tmpVec.z);
    steam.scale.set(0.4, 0.4, 1);
    root.add(steam);
    pours.push({ stream, steam, fill: target.fill, age: 0, life: 1.1 });
    return true;
  }

  /* ---------- 更新 ---------- */

  let t = 0;
  function update(dt) {
    t += dt;

    for (const l of lanterns) {
      const f = 0.86 + Math.sin(t * 2.3 + l.phase) * 0.1 + Math.sin(t * 7.1 + l.phase * 2) * 0.04;
      if (l.light) l.light.intensity = l.base * f;
      l.halo.material.opacity = 0.6 * f + 0.1;
      l.shadeMat.emissiveIntensity = 1.2 + f * 0.5;
    }
    candleLight.intensity = 5.5 + Math.sin(t * 9.3) * 0.9 + Math.sin(t * 3.1) * 0.5;
    lampFlame.scale.set(0.68 + Math.sin(t * 11) * 0.05, 1.5 + Math.sin(t * 8) * 0.12, 0.68);

    // 可交互处的微光
    for (const id in glows) {
      const g = glows[id];
      if (!g.visible) continue;
      const f = 0.4 + Math.sin(t * 1.4 + g.userData.phase) * 0.16;
      g.material.opacity = f;
      const sc = 0.84 + Math.sin(t * 1.4 + g.userData.phase) * 0.06;
      g.scale.set(sc, sc, 1);
    }

    // 窗纸忽明忽暗
    windowGlows.forEach((p, i) => {
      p.material.opacity = 0.28 + Math.abs(Math.sin(t * 0.7 + i * 1.3)) * 0.18;
    });

    // 人：呼吸、转头与手部微动
    for (const p of people) {
      p.group.rotation.z = Math.sin(t * 0.55 + p.phase) * 0.012;
      if (p.head) {
        p.head.rotation.y = Math.sin(t * 0.31 + p.phase) * 0.17 + Math.sin(t * 0.13 + p.phase * 2.1) * 0.06;
        p.head.rotation.x = Math.sin(t * 0.47 + p.phase * 1.7) * 0.03;
      }
      for (let i = 0; i < p.arms.length; i++) {
        const a = p.arms[i];
        const dir = i === 0 ? -1 : 1;
        a.root.rotation.x = a.baseX + Math.sin(t * 0.6 + p.phase + dir * 1.4) * 0.028;
        a.root.rotation.z = a.baseZ + Math.sin(t * 0.5 + p.phase + dir) * 0.012;
      }
      if (p.chest) p.chest.scale.y = 1 + Math.sin(t * 1.15 + p.phase) * 0.008;
      if (!p.seated) p.group.position.y = p.baseY + Math.sin(t * 1.3 + p.phase) * 0.008;
    }
    cat.rotation.y = Math.sin(t * 0.3) * 0.06;
    tail.rotation.z = 1.2 + Math.sin(t * 0.8) * 0.12;

    // 小二走堂
    waitT += dt * 0.7;
    if (waitT > 1) {
      waitT = 0;
      waitSeg = (waitSeg + 1) % waiterPath.length;
    }
    const from = waiterPath[waitSeg];
    const to = waiterPath[(waitSeg + 1) % waiterPath.length];
    const k = waitT;
    waiter.position.x = from[0] + (to[0] - from[0]) * k;
    waiter.position.z = from[1] + (to[1] - from[1]) * k;
    const ang = Math.atan2(to[0] - from[0], to[1] - from[1]);
    waiter.rotation.y = ang;
    waiter.position.y = Math.abs(Math.sin(t * 4)) * 0.02;

    // 雪
    const sp = snow.geometry.attributes.position;
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.y -= f.speed * dt;
      if (f.y < -0.2) {
        f.y = 8 + Math.random() * 2;
        f.x = (Math.random() - 0.5) * (f.inYard ? 12 : 30);
        f.z = f.inYard ? -4.8 - Math.random() * 8 : 9.2 + Math.random() * 13;
      }
      sp.setXYZ(i, f.x + Math.sin(t * 0.6 + f.drift) * f.amp, f.y, f.z);
    }
    sp.needsUpdate = true;

    // 蒸汽
    for (const s of steams) {
      const u = s.userData;
      const ph = (t * 0.32 + u.phase) % 1;
      s.position.y = u.baseY + ph * 1.4;
      s.position.x = u.baseX + Math.sin(t * 0.8 + u.phase) * 0.12;
      const fade = Math.sin(ph * Math.PI);
      s.material.opacity = fade * 0.22;
      const sc = u.scale * (0.7 + ph * 0.7);
      s.scale.set(sc, sc, 1);
    }

    // 斟茶
    for (let i = pours.length - 1; i >= 0; i--) {
      const p = pours[i];
      p.age += dt;
      const k = Math.min(p.age / p.life, 1);
      p.stream.material.opacity = (1 - k) * 0.7;
      p.stream.position.y += dt * 0.02;
      p.fill.scale.set(1, 1, 1);
      p.fill.material.opacity = Math.min(1, p.age * 1.6);
      p.steam.material.opacity = Math.max(0, 0.35 * (1 - k));
      p.steam.position.y += dt * 0.5;
      p.steam.scale.setScalar(0.4 + k * 0.5);
      if (p.age >= p.life) {
        root.remove(p.stream);
        root.remove(p.steam);
        p.stream.geometry.dispose();
        p.stream.material.dispose();
        p.steam.material.dispose();
        pours.splice(i, 1);
      }
    }

    // 浮尘
    const pos = dust.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + dt * 0.012;
      if (y > 5.6) y = 0.15;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.6 + i) * dt * 0.01);
    }
    pos.needsUpdate = true;
  }

  /* ---------- 斟酒锚点：碗底世界坐标 + 玩家所在一侧 ---------- */

  function pourAnchor(id) {
    const target = pourTargets[id];
    if (!target) return null;
    root.updateMatrixWorld(true);
    const pos = new THREE.Vector3();
    target.group.getWorldPosition(pos);
    const hs = hotspots.find((h) => h.id === id);
    const dir = new THREE.Vector3(0, 0, 1);
    if (hs) {
      dir.set(hs.focusPos.x - pos.x, 0, hs.focusPos.z - pos.z);
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
      dir.normalize();
    }
    return { pos, dir };
  }

  /* 特写时把桌上的旧碗藏起来，免得和新碗叠在一起 */
  function setCupVisible(id, visible) {
    const target = pourTargets[id];
    if (!target) return false;
    target.group.visible = visible;
    return true;
  }

  return {
    root, update, hotspots, raycastables, candleLight,
    showRelic, setGlow, pourTea, pourAnchor, setCupVisible,
  };
}
