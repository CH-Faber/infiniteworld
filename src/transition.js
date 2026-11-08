/* 开场过场：上一世界 → 武侠客栈（听雨楼）
 *
 * 四拍：上一世残影 → 世界线撕开 → 坠进阿七这具身体 → 睁眼进楼。
 * 只读平台存档取文案（prev_world / exit_hook / level），不改任何玩法状态；
 * 没有平台桥时安静降级为默认文案，本地直开也能看。
 */

const SERIF = '"Songti SC","Source Han Serif SC","Noto Serif SC","SimSun","STSong",serif';
const INK = '#05070a';

const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeIn = (x) => x * x * x;
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mix = (a, b, t) => a + (b - a) * t;
/* 固定伪随机：同一条粒子每一帧位置稳定，不闪 */
const hash = (n) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

function readSave() {
  try {
    if (typeof WL !== 'undefined' && WL && typeof WL.readSave === 'function') {
      const s = WL.readSave();
      if (s && typeof s === 'object') return s;
    }
  } catch (e) { /* 没有平台桥 */ }
  return {};
}

/* 逐字排，解决 canvas 下 letter-spacing 不统一的问题 */
function spaced(ctx, text, cx, y, font, color, spacing) {
  const chars = Array.from(String(text));
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  let total = 0;
  for (const ch of chars) total += ctx.measureText(ch).width + spacing;
  total -= spacing;
  let x = cx - total / 2;
  for (const ch of chars) {
    ctx.fillText(ch, Math.round(x), y);
    x += ctx.measureText(ch).width + spacing;
  }
  ctx.restore();
}

function wrap(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const ch of para) {
      if (line && ctx.measureText(line + ch).width > maxW) {
        out.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    out.push(line);
  }
  return out;
}

export function playTransition() {
  return new Promise((resolve) => {
    const canvas = document.getElementById('transit');
    if (!canvas) { resolve(); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); resolve(); return; }

    const save = readSave();
    let prevWorld = String(save.prev_world || '').trim();
    let hook = String(save.exit_hook || '').trim();
    const level = Number(save.level);

    /* 存档可能是进页面之后才送到的，到了就换文案 */
    const onSaveReady = (e) => {
      const s = (e && e.detail) || {};
      if (s.prev_world) prevWorld = String(s.prev_world).trim();
      if (s.exit_hook) hook = String(s.exit_hook).trim();
    };
    window.addEventListener('iw-save-ready', onSaveReady);

    let w = 0, h = 0, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    /* 雪：一个共用粒子池，前段慢飘，后段当坠落线 */
    const snow = [];
    for (let i = 0; i < 150; i++) {
      snow.push({
        x: hash(i + 1),
        y: hash(i + 91),
        z: 0.25 + hash(i + 173) * 0.75,
        r: 0.6 + hash(i + 233) * 1.6,
        ph: hash(i + 307) * 6.283,
      });
    }

    const T = {
      line: 0.10,      /* 世界线亮起 */
      text: 0.70,      /* 上一世文案 */
      collapse: 2.70,  /* 残影被抽走 */
      sweep: 3.10,     /* 白闪 */
      fall: 3.35,      /* 坠落 */
      land: 6.10,      /* 落地睁眼 */
      end: 8.30,
    };

    let t = 0;
    let last = performance.now();
    let speed = 1;
    let skipAt = -1;
    let done = false;
    let raf = 0;

    function onSkip() {
      if (done || skipAt >= 0) return;
      skipAt = t;
    }
    function onKey(e) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') onSkip();
    }
    window.addEventListener('pointerdown', onSkip, true);
    window.addEventListener('keydown', onKey);

    function finish() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointerdown', onSkip, true);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', resize);
      window.removeEventListener('iw-save-ready', onSaveReady);
      canvas.remove();
      resolve();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const unit = Math.min(w, h) / 900;

      /* ================= 一 · 上一世 ================= */
      const aIn = easeOut(seg(t, T.line, T.text + 0.5));
      const aOut = 1 - easeInOut(seg(t, T.collapse - 0.30, T.sweep));
      const aA = aIn * aOut;

      if (aA > 0.002) {
        const haze = ctx.createRadialGradient(cx, h * 0.48, 10, cx, h * 0.48, Math.max(w, h) * 0.55);
        haze.addColorStop(0, `rgba(96,132,158,${0.13 * aA})`);
        haze.addColorStop(0.55, `rgba(58,86,108,${0.05 * aA})`);
        haze.addColorStop(1, 'rgba(5,7,10,0)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, w, h);
      }

      /* 世界线：一根竖着的细线，线上有光点往下走；文案区断开，别切句子 */
      const lineA = easeOut(seg(t, T.line, T.line + 0.9)) * (1 - seg(t, T.collapse, T.sweep));
      if (lineA > 0.002) {
        const gapA = h * 0.215;
        const gapB = h * 0.60;
        const spans = [[h * 0.06, gapA], [gapB, h * 0.94]];
        for (const [y0, y1] of spans) {
          const g = ctx.createLinearGradient(0, y0, 0, y1);
          g.addColorStop(0, 'rgba(170,205,225,0)');
          g.addColorStop(0.5, `rgba(200,228,244,${0.5 * lineA})`);
          g.addColorStop(1, 'rgba(170,205,225,0)');
          ctx.fillStyle = g;
          ctx.fillRect(cx - 0.5, y0, 1, y1 - y0);

          const glow = ctx.createLinearGradient(0, y0, 0, y1);
          glow.addColorStop(0, 'rgba(120,170,200,0)');
          glow.addColorStop(0.5, `rgba(120,170,200,${0.09 * lineA})`);
          glow.addColorStop(1, 'rgba(120,170,200,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(cx - 24 * unit, y0, 48 * unit, y1 - y0);
        }

        const py = h * 0.08 + ((t * 0.15) % 1) * (h * 0.84);
        if (py < gapA - 20 * unit || py > gapB + 20 * unit) {
          const pg = ctx.createRadialGradient(cx, py, 0, cx, py, 16 * unit);
          pg.addColorStop(0, `rgba(226,244,255,${0.5 * lineA})`);
          pg.addColorStop(1, 'rgba(150,200,225,0)');
          ctx.fillStyle = pg;
          ctx.beginPath();
          ctx.arc(cx, py, 16 * unit, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* 冷雪慢飘 */
      if (aA > 0.002) {
        for (let i = 0; i < snow.length; i += 2) {
          const p = snow[i];
          const y = ((p.y + t * 0.02 * p.z) % 1) * h;
          const x = p.x * w + Math.sin(t * 0.4 + p.ph) * 8 * unit;
          ctx.fillStyle = `rgba(214,234,246,${(0.05 + 0.09 * p.z) * aA})`;
          ctx.beginPath();
          ctx.arc(x, y, p.r * unit, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* 文案：上一世的名字 + 上一关留下的最后一句话 */
      if (aA > 0.002) {
        const tIn = easeOut(seg(t, T.text, T.text + 0.9));
        const drop = easeIn(seg(t, T.collapse, T.sweep)); /* 被抽走时往下沉 */

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        spaced(
          ctx,
          prevWorld ? `上一世 · ${prevWorld}` : '上一座世界',
          cx,
          h * 0.268 + drop * 26,
          `14px ${SERIF}`,
          `rgba(186,214,230,${0.60 * aA * tIn})`,
          5 * unit
        );

        ctx.font = `31px ${SERIF}`;
        const lines = wrap(ctx, hook || '你从那里走出来的时候，身后什么也没留下。', Math.min(w * 0.68, 780));
        const lh = 54;
        const top = h * 0.46 - ((lines.length - 1) * lh) / 2;
        for (let i = 0; i < lines.length; i++) {
          const la = easeOut(seg(t, T.text + 0.30 + i * 0.18, T.text + 1.05 + i * 0.18));
          if (la <= 0) continue;
          spaced(
            ctx,
            lines[i],
            cx,
            top + i * lh + (1 - la) * 10 + drop * 40,
            `31px ${SERIF}`,
            `rgba(228,234,236,${0.9 * la * aA})`,
            2 * unit
          );
        }
      }

      /* 残影被抽向中心线 */
      const col = seg(t, T.collapse, T.sweep);
      if (col > 0 && col < 1) {
        const k = 1 - easeIn(col);
        for (let i = 0; i < 26; i++) {
          const y = h * (0.12 + hash(i + 11) * 0.76);
          const half = (hash(i + 41) * 0.42 + 0.12) * w * k;
          const a = 0.30 * Math.sin(Math.PI * col) * (0.35 + hash(i + 71) * 0.65);
          ctx.strokeStyle = `rgba(198,226,242,${a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx - half, y);
          ctx.lineTo(cx + half, y);
          ctx.stroke();
        }
      }

      /* ================= 二 · 世界线撕开 ================= */
      const sweep = seg(t, T.sweep, T.sweep + 0.55);
      if (sweep > 0 && sweep < 1) {
        ctx.fillStyle = `rgba(244,249,255,${0.92 * Math.sin(Math.PI * sweep)})`;
        ctx.fillRect(0, 0, w, h);
      }

      /* ================= 三 · 坠进这具身体 ================= */
      const fall = seg(t, T.fall, T.land);
      if (fall > 0 && t < T.land) {
        const speedK = easeIn(seg(t, T.fall, T.fall + 1.5));
        const warm = seg(t, T.fall + 0.5, T.land);

        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, `rgb(${Math.round(mix(7, 16, fall))},${Math.round(mix(11, 11, fall))},${Math.round(mix(17, 10, fall))})`);
        bg.addColorStop(0.58, `rgb(${Math.round(mix(13, 26, fall))},${Math.round(mix(19, 17, fall))},${Math.round(mix(26, 15, fall))})`);
        bg.addColorStop(1, `rgb(${Math.round(mix(10, 44, fall))},${Math.round(mix(15, 24, fall))},${Math.round(mix(23, 18, fall))})`);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        /* 底下那盏灯的热气，从下往上漫 */
        const warmGlow = ctx.createRadialGradient(cx, h * 1.02, h * 0.05, cx, h * 1.02, h * 0.95);
        warmGlow.addColorStop(0, `rgba(255,150,74,${0.30 * fall})`);
        warmGlow.addColorStop(0.45, `rgba(196,104,52,${0.11 * fall})`);
        warmGlow.addColorStop(1, 'rgba(120,60,30,0)');
        ctx.fillStyle = warmGlow;
        ctx.fillRect(0, 0, w, h);

        /* 雪变成速度线：往上跑，越近越长 */
        for (let i = 0; i < snow.length; i++) {
          const p = snow[i];
          const sp = 0.7 + p.z * 2.4;
          let y = (p.y * 1.4 - (t - T.fall) * sp * 0.55) % 1.4;
          if (y < 0) y += 1.4;
          y = (y - 0.2) * h;
          const x = p.x * w + Math.sin(t * 0.5 + p.ph) * 10 * unit;
          const len = 5 + 78 * speedK * p.z * unit;
          const wm = warm * p.z;
          const a = (0.10 + 0.30 * p.z) * (0.35 + 0.65 * speedK);
          ctx.strokeStyle = `rgba(${Math.round(mix(200, 255, wm))},${Math.round(mix(228, 212, wm))},${Math.round(mix(242, 168, wm))},${a})`;
          ctx.lineWidth = p.r;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 5 * unit * speedK, y + len);
          ctx.stroke();
        }

        /* 楼里的灯：越落越近 */
        const spots = [
          [0.385, 0.60, 78],
          [0.615, 0.53, 64],
          [0.50, 0.395, 40],
        ];
        for (let i = 0; i < spots.length; i++) {
          const k = easeOut(seg(t, T.fall + 0.85 + i * 0.16, T.land));
          if (k <= 0) continue;
          const r = spots[i][2] * (0.55 + 1.7 * k) * unit;
          const gx = w * spots[i][0];
          const gy = h * spots[i][1] + (1 - k) * 70 * unit;
          const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
          rg.addColorStop(0, `rgba(255,208,152,${0.26 * k})`);
          rg.addColorStop(0.45, `rgba(255,166,98,${0.11 * k})`);
          rg.addColorStop(1, 'rgba(255,150,80,0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(gx, gy, r, 0, Math.PI * 2);
          ctx.fill();
        }

        /* 阿七的背影：只露到大堂灯下的肩头，人不大，才像对面 */
        const fig = easeOut(seg(t, T.fall + 0.65, T.land - 0.05));
        if (fig > 0.002) {
          const s = h * 0.52 * mix(0.82, 1.0, fig);
          ctx.save();
          ctx.globalAlpha = Math.min(1, fig * 1.6);
          ctx.translate(cx, h * 0.80 + (1 - fig) * h * 0.14);

          /* 灯从下往上打，先垫一层暖边 */
          const under = ctx.createRadialGradient(0, 0.26 * s, 0, 0, 0.26 * s, 0.62 * s);
          under.addColorStop(0, `rgba(255,164,96,${0.22 * fig})`);
          under.addColorStop(1, 'rgba(255,140,70,0)');
          ctx.fillStyle = under;
          ctx.beginPath();
          ctx.arc(0, 0.26 * s, 0.62 * s, 0, Math.PI * 2);
          ctx.fill();

          const body = ctx.createLinearGradient(0, -0.12 * s, 0, 0.36 * s);
          body.addColorStop(0, '#0a0b0e');
          body.addColorStop(1, '#040507');
          ctx.fillStyle = body;

          /* 肩与背 */
          ctx.beginPath();
          ctx.moveTo(-0.34 * s, 0.38 * s);
          ctx.quadraticCurveTo(-0.31 * s, 0.02 * s, -0.13 * s, -0.05 * s);
          ctx.lineTo(0.13 * s, -0.05 * s);
          ctx.quadraticCurveTo(0.31 * s, 0.02 * s, 0.34 * s, 0.38 * s);
          ctx.closePath();
          ctx.fill();

          /* 脖子 */
          ctx.fillRect(-0.05 * s, -0.14 * s, 0.1 * s, 0.11 * s);

          /* 头 */
          ctx.beginPath();
          ctx.ellipse(0, -0.195 * s, 0.082 * s, 0.096 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          /* 发髻 */
          ctx.beginPath();
          ctx.arc(0, -0.285 * s, 0.043 * s, 0, Math.PI * 2);
          ctx.fill();

          /* 肩上搭的抹布：只留一道垂下来的边 */
          ctx.beginPath();
          ctx.moveTo(-0.175 * s, -0.03 * s);
          ctx.quadraticCurveTo(-0.235 * s, 0.10 * s, -0.215 * s, 0.23 * s);
          ctx.quadraticCurveTo(-0.175 * s, 0.12 * s, -0.145 * s, 0.02 * s);
          ctx.closePath();
          ctx.fillStyle = '#0d1014';
          ctx.fill();
          ctx.strokeStyle = `rgba(255,186,122,${0.12 * fig})`;
          ctx.lineWidth = Math.max(1, 1 * unit);
          ctx.stroke();

          /* 轮廓光：只勾灯照到的下沿 */
          const rim = 0.5 * fig;
          ctx.strokeStyle = `rgba(255,190,128,${rim})`;
          ctx.lineWidth = Math.max(1, 1.4 * unit);
          ctx.beginPath();
          ctx.ellipse(0, -0.195 * s, 0.082 * s, 0.096 * s, 0, Math.PI * 0.10, Math.PI * 0.90);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-0.34 * s, 0.38 * s);
          ctx.quadraticCurveTo(-0.31 * s, 0.02 * s, -0.13 * s, -0.05 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0.13 * s, -0.05 * s);
          ctx.quadraticCurveTo(0.31 * s, 0.02 * s, 0.34 * s, 0.38 * s);
          ctx.stroke();
          ctx.restore();
        }

        /* 落地前的白光，交给下一拍接住 */
        const pre = Math.pow(seg(t, T.land - 0.30, T.land), 1.5);
        if (pre > 0) {
          ctx.fillStyle = `rgba(250,247,240,${0.94 * pre})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      /* ================= 四 · 睁眼，进楼 ================= */
      if (t >= T.land) {
        const rv = easeInOut(seg(t, T.land, T.land + 1.95));
        ctx.fillStyle = `rgba(4,5,7,${1 - rv})`;
        ctx.fillRect(0, 0, w, h);

        const fl = 1 - seg(t, T.land, T.land + 0.6);
        if (fl > 0) {
          ctx.fillStyle = `rgba(250,246,238,${0.9 * fl})`;
          ctx.fillRect(0, 0, w, h);
        }

        const ta = easeOut(seg(t, T.land + 0.40, T.land + 1.25)) * (1 - seg(t, T.land + 1.78, T.end));
        if (ta > 0.002) {
          const band = ctx.createLinearGradient(0, h * 0.28, 0, h * 0.72);
          band.addColorStop(0, 'rgba(4,4,6,0)');
          band.addColorStop(0.5, `rgba(4,4,6,${0.34 * ta})`);
          band.addColorStop(1, 'rgba(4,4,6,0)');
          ctx.fillStyle = band;
          ctx.fillRect(0, h * 0.28, w, h * 0.44);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rise = (1 - easeOut(seg(t, T.land + 0.40, T.land + 1.25))) * 12;
          spaced(ctx, '武侠客栈', cx, h * 0.455 + rise, `58px ${SERIF}`, `rgba(243,230,207,${0.96 * ta})`, 14 * unit);

          const sub = level > 0 && level <= 10 ? `听雨楼 · 第${CN[level]}关` : '听雨楼';
          spaced(ctx, sub, cx, h * 0.535 + rise, `13px ${SERIF}`, `rgba(233,185,120,${0.62 * ta})`, 6 * unit);
        }
      }

      /* 跳过提示 */
      if (t < T.land) {
        const ha = 0.30 * easeOut(seg(t, 1.1, 2.1));
        if (ha > 0.002) {
          ctx.textAlign = 'right';
          ctx.textBaseline = 'alphabetic';
          ctx.font = `12px ${SERIF}`;
          ctx.fillStyle = `rgba(208,220,228,${ha})`;
          ctx.fillText('点击跳过', w - 40, h - 38);
        }
      }
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (skipAt >= 0) {
        if (t < T.land) t = T.land;
        speed = 2.6;
      }
      t += dt * speed;

      draw();

      if (t >= T.end) { finish(); return; }
      raf = requestAnimationFrame(frame);
    }

    draw();
    raf = requestAnimationFrame(frame);
  });
}
