# HANDOFF · 给接手的队友

一句话：**听雨楼（3D 大堂）→ 就地推镜 → 斟酒特写**，一关到底，名字叫「武侠客栈」。设计定稿在 [PLAN.md](PLAN.md)，这里只讲**现在做到哪、怎么跑、哪里会绊人**。

---

## 一、现在什么状态

| 层 | 内容 | 状态 |
| --- | --- | --- |
| 一 · 文案标签 | 开场承接 `exit_hook`、天气改雪、品牌改名 | ✅ 已进主干 |
| 二 · 场景 | 三桌改刀客/捕快/故人、分开坐、三套推镜 | ⬜ 未开始 |
| 三 · 特写 | 3D 斟酒（碗、壶、液面、刻度、蓄力判定、代理的手） | 🟡 独立模块跑通了，**还没接进大堂** |
| 四 · 交接 | `WL.readSave/completeLevel/failLevel`、`global-items.json`、`check.mjs` | ⬜ 只有读档完成 |

**能玩的东西**：`pour-demo.html` 这一页，单开就能摸手感。

---

## 二、怎么跑（重要：双击打不开）

页面用的是 ES module，`file://` 会被 CORS 拦掉，**必须走本地服务器**：

```
cd infiniteworld
node tools/serve.mjs
```

- 斟酒试验台：<http://127.0.0.1:8123/pour-demo.html>
- 主项目（听雨楼大堂）：<http://127.0.0.1:8123/>
- 旧的 2D 原型：<http://127.0.0.1:8123/levels/wuxia-inn/index.html>

---

## 三、代码地图

```
src/pour.js        斟酒特写模块（本队新写，独立、无平台依赖）
  ├─ CUP / TUNE     碗的尺寸、手感参数（都在文件顶上）
  ├─ createPour(scene)  → { start, preview, press, release, update, cine, state, rig }
  ├─ start(anchor, dir) 开始一次，返回 Promise<{hit, level, target}>
  ├─ cine.k         0=大堂视角 1=特写，相机插值权重交给调用方
  └─ 内部状态机     idle → in(推镜) → pour(蓄力) → judge(判定) → out(拉回)

pour-demo.html     单开的手感试验台（开发页，进 ZIP 前可删）
src/story.js       听雨楼剧情与四桌交互
src/world.js       3D 场景（含雪、灯、人物、斟茶动作）
src/main.js        相机与循环
```

### 手感参数（`src/pour.js` 顶部 `TUNE`）

| 参数 | 现在 | 管什么 |
| --- | --- | --- |
| `rateBase` / `rateGain` / `ratePow` | 0.085 / 0.40 / 1.6 | 蓄力曲线，按住越久越快 |
| `inertia` / `decay` | 0.22 / 0.80 | 松手后还冲多远、多快停 |
| `tolBase` | 0.10 | 容差带宽窄＝难度 |
| `targetMin` / `targetMax` | 0.55 / 0.80 | 客人报几分的范围 |
| `inTime` / `outTime` | 0.9 / 0.95 | 推镜、拉回的时间 |

### 调试用地址

`pour-demo.html` 支持几个 hash，方便直接跳到某个状态截图：

- `#pour` 推到特写并倒在半途
- `#fill` 倒完松手、等判定
- `#close` 只推镜不倒
- `#auto` 自动开始

---

## 四、下一步（按顺序）

1. **接进大堂**：三桌各给一个 `anchor`（碗底世界坐标）和一个 `dir`（玩家所在方向），点桌 → `start()` → `await` → 按 `hit` 走结果台词 → 拉回柜台，老板娘说一句。
2. **三套推镜**：三桌位置分开后，`cine` 只需要换 anchor，其余复用。
3. **他的接手**：第三杯倒到三成，插一段他的手入画按住你的手，然后把壶拿走、倒满（这一杯不判）。
4. **交接**：`WL.completeLevel(CONFIG, save, {acquiredItemIds, exitHook})`，配 `global-items.json`（我们只声明一把刀：`team23_knife`，`attack +1`、`passive`）。
5. **打包**：`node tools/check.mjs <zip> global-items.json` 全绿再交。

---

## 五、踩过的坑（别重踩）

| 坑 | 现象 | 原因与处置 |
| --- | --- | --- |
| 杯子用玻璃材质 | 整个画面是黑的，只在角落看到壶 | `transmission` + 半透明 + 暗场景 ≈ 隐形；换不透明陶碗 |
| 液面圆盘缩放 | 屏幕中间一大片光锥 | 圆盘已绕 X 转 90°，缩放必须写 `scale.set(r, r, 1)`，不能用 `(r, 1, r)` |
| 相机固定 FOV | 窄窗口下像贴在壶上 | 按宽高比自动放宽 `fov`（`fitCamera`） |
| 推镜期间点击无效 | 以为页面卡死 | 按下提前发生在 `in` 阶段，已加缓冲，`pour` 一开始就生效 |
| `file://` 双击 | 白屏 / 黑屏 | 必须起 HTTP 服务器 |
| 相机比碗低 | 看不见液面 | 特写机位抬高到约 35°，否则液面被碗沿遮住 |

---

## 六、协作约定

- 远端 `git@github.com:CH-Faber/infiniteworld.git`，`main` 直推；改之前先 `git fetch`，别覆盖别人正在改的部分。
- `pour-demo.html`、`PLAN.md`、本文件都是开发资料，**投稿 ZIP 里不要带**（只放运行产物：`index.html`、`src/`、`vendor/`、`assets/`）。
- 素材红线：不许商业 IP、不许商业歌曲；现有贴图均为程序化生成或自有素材。
- 禁止 `alert` / `confirm` / 顶层跳转，`check.mjs` 会扫。
