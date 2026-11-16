# 回煞 3D · 归门

“不要再替我守灯。门闩在你那边。”

独立重新制作的第一人称民俗悬疑游戏。收到去世母亲的来信后，你回到雨夜旧宅。观察器物上的字迹，回查手记，转动三位铜锁，自己决定是否走出那扇门。

本仓库只维护 3D。原 [2D 版本](https://github.com/huachen19867/huisha_game_AI) 已停止研发并保留成果。旧 3D 原型的布局、界面、交互和拼装家具已被替换；本版使用本地 glTF 中式家具、木地板与灰墙 PBR 材质，不依赖在线 CDN。

## 运行

需要 Node.js 18 或更新版本。Windows 双击 `StartGame.bat`，或在项目目录运行 `npm start`，然后访问 <http://127.0.0.1:8133>。无需安装 npm 依赖。关闭终端即可停止本地服务。

请通过本地服务或静态托管运行，直接双击 HTML 会被浏览器阻止加载模块和材质。

WASD / 方向键移动，鼠标拖动或点击画面锁定视角，Shift 快走，E 调查，J 手记，Esc 暂停。触屏可使用左下方向键移动、拖动画面转头、点击调查提示。阅读时暂停移动，合上后继续；可在暂停中调整亮度和声音。

## 当前内容与验证

当前是第一章：正厅、走廊、三位字轮机关、开门后的主动去留和本章结尾。已读记录、机关状态、揭布状态及安全位置自动保存在当前浏览器，使用独立的 3D 存档键。猜锁和错误重试不扣资源。2D 的学校/医院记忆链、追逐和多结局未迁入。

运行 `npm run verify` 检查真实 Three.js 几何与射线、路线可达性、机关流程、存档和本地依赖。该检查不启动浏览器，不能证明真实 WebGL 画质、手机操作或最终游玩体验。此前浏览器启动被审批拦截，本轮未重试或绕过；画面与实机手感仍需试玩。

## 文件索引

入口为 `index.html`，界面与生命周期在 `src/main.mjs` / `src/style.css`；`src/3d/ThreeHouseScene.js` 搭建场景并加载模型，`ThreeHouseMap.js` 描述空间与线索，`ThreeControls.js` 负责移动碰撞，`ThreeInteraction.js` 负责视线调查，`ThreeStory.js` 管理机关与存档，`ThreeAudio.js` 合成环境声与反馈。`tools/serve.mjs` 提供本地静态服务。

设计范围见 [PLAN](docs/PLAN.md)，开发进度见 [DEV_LOG](DEV_LOG.md)，后续工作见 [ROADMAP](ROADMAP.md)，素材和参考来源见 [资源说明](assets/README.md) 与 [参考索引](docs/references/README.md)。
