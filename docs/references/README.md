# 3D 参考与来源

老板已明确重新制作，旧 `src/3d` 原型只用于核对问题，不沿用其场景或玩法代码。保留可用原始木材，原件不动。下载 Three.js r160 官方模块构建、GLTFLoader 与 BufferGeometryUtils，许可随 `vendor/THREE-LICENSE.txt` 分发，模块导入路径改为本地 `.mjs`。中式家具与 PBR 资源来源见 `assets/README.md`，Poly Haven CC0 许可原文保存在本目录 `polyhaven-license.html`。

2026-11-16 下载官方同版本参考：[PointerLockControls](https://github.com/mrdoob/three.js/blob/r160/examples/jsm/controls/PointerLockControls.js)、[Raycaster](https://github.com/mrdoob/three.js/blob/r160/src/core/Raycaster.js)。本目录保存原文，仅用于核对相机左右轴、指针锁释放和遮挡射线，许可同 Three.js MIT。不把参考文件当作游戏模块加载。

复用 2D 阶段已经下载的 Ink 条件选项、Yarn Spinner 台词/选项分离和 W3C 模态对话框研究，沿用“观察与行动分开、已读记录才入手记、主动确认结局”的设计；没有引入额外叙事运行库或复制商业游戏素材。

0.9.0 的记忆时间线继续复用父工作区 `docs/references/WritingWithInk.md` 的条件选项资料和本目录 W3C APG 模态参考，不重复下载或引入 Ink 运行库。ThreeMemoryTimeline 用原生按钮完成放入、上下调整和移除，操作后恢复卡片按钮焦点，反馈沿用 role=status；原文片段仍以本项目记录为唯一来源。DOM 事件检查不代表原生模态、浏览器布局或设备操作验收。

0.10.0 的量水试称复用本地 Three.js r160 的基本几何、Group 和 MathUtils.lerp，沿用 ThreeDoorMechanism 已有的受控缓入缓出动画与减少动态效果处理；不引入物理引擎或重复下载模型。原有 Kenney 木碰撞反馈用于失败落秤，成功沿用机关释放声音。表盘是本项目几何，来源不变。

2026-11-16 为界面事件验证安装 [jsdom 26.1.0](https://github.com/jsdom/jsdom/tree/26.1.0)，MIT。源码与 LICENSE.txt 位于工作区开发依赖 node_modules/jsdom，npm 的 39 份包及完整性摘要通过 package-lock.json 锁定，来源为 registry.npmjs.org；不把 node_modules 或 jsdom 加入游戏运行模块。`tools/verify_ui.mjs` 复用它的 DOM 与事件实现，渲染边界和 dialog 开合另行模拟，不能据此宣称浏览器默认行为、布局或 WebGL 已验收。

2026-11-17 的手记对照与机关旁摘记复用已下载的 W3C 对话框研究、原生 details/select 控件及现有 jsdom。没有重新下载相同参考、引入界面框架或新运行依赖；新模块只呈现真实已读原文，不生成替代线索。

0.5.0 的视角设置继续参考本目录已下载的 Three.js r160 PointerLockControls 的 pointerSpeed 和俯仰限制。新增声音从 [Kenney 官方](https://kenney.nl/assets/impact-sounds) 下载 CC0 Impact Sounds 1.0，原包留本地 `assets/audio/.source/`，实际使用的九份文件、原许可和来源校验随游戏分发，见 `assets/audio/README.md`。没有引入音频框架或商业游戏素材。

0.6.0 的相框复用现有 Three.js 分组变换、射线与相机投影、已下载参考和现有近看生命周期，不引入新的三维引擎。图片通过 imagegen 技能的内置 image_gen 路径生成并复制入库；完整生产提示词见 `assets/art/mother-portrait.source.json`，原始输出保留在 Codex generated_images 目录，不借用商业游戏人物照片。

0.7.0 下载同版本官方 [InstancedMesh](https://github.com/mrdoob/three.js/blob/r160/src/objects/InstancedMesh.js) 到 `InstancedMesh-r160.js`，许可同 Three.js MIT，仅用来核对矩阵更新、包围球和实例缓冲释放。raw.githubusercontent.com 直取遇 EOF，随后通过 GitHub 连接器读取同一公开文件保存。归门绳段实际使用已有本地 Three.js 的 InstancedMesh，厨房固定铜索使用已有 TubeGeometry；不加载参考文件或引入物理引擎。静止绳段不重复上传矩阵，场景释放时同时释放实例缓冲。

0.8.0 复用父工作区已下载的 [W3C APG Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)，原文复制到本目录 `apg-dialog-modal-pattern.html`（SHA-256：14ce04000352a8d8ee6cf2ec4419e1cf28a8d6648736a1cf6653d38bc24099e3），原件保留，不重复下载。地图继续用现有原生 dialog 管理开合/焦点，SVG 只显示路线图，下方 HTML 按钮提供同样的已读原文入口；范围选择用原生 select。直接复用本项目 walkable 和记录元数据，不新增地图框架。
