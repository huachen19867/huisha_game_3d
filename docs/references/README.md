# 3D 参考与来源

0.19.0 村口和西厢使用 Poly Haven CC0 模型与材质、Three.js 示例保留署名的人头扫描。运行时直接读取随仓库发布的美术资源。[来源、许可与使用处](../../assets/README.md) · [逐文件下载索引](../../assets/sources.json)

雨夜镜头移植自封存 2D 版的 [IntroScene](https://github.com/huachen19867/huisha_game_AI/blob/main/src/scenes/IntroScene.js)。跳跃复用 Three.js r160 示例中的着地判定、垂直速度与重力积分思路，村路保留本作的门扇碰撞和连续地面判定。[本地参考](games_fps-r160.html) · [上游原文](https://github.com/mrdoob/three.js/blob/r160/examples/games_fps.html) · [MIT 许可](../../vendor/THREE-LICENSE.txt)

雨庭的守夜纸人复用本地引擎及 Kenney 脚步声，灯扫过来的方位随玩家朝向变换。聚光灯目标、锥角和边缘衰减参照 Three.js r160 官方实现，渲染与玩法共用扫灯转角、半角和距离。[本地参考](SpotLight-r160.js) · [上游代码](https://github.com/mrdoob/three.js/blob/r160/src/lights/SpotLight.js)

守夜灯的油壶和玻璃罩使用工作区已有 Three.js r160 的旋转体几何。开工时下载同版官方实现，核对剖面半径、高度和旋转轴；游戏模型使用自行绘制的剖面。许可随本地引擎分发。[LatheGeometry 本地原文](LatheGeometry-r160.js) · [上游源码](https://github.com/mrdoob/three.js/blob/r160/src/geometries/LatheGeometry.js)

《借影》开工时从 Three.js r160 下载官方 ShapeGeometry 源文件，核对轮廓与孔洞的方向和三角化。皮偶的皮片由同版引擎拉出厚度，肘铆钉带动手和竹签一起转，静态部件按材质合并。轮廓、河景和文本为本作编写，沿用库内木材与 Kenney 轻木击、木地板脚步声。下载文件采用 Three.js MIT 许可。[本地源码](ShapeGeometry-r160.js) · [上游文件](https://github.com/mrdoob/three.js/blob/r160/src/geometries/ShapeGeometry.js) · [许可](../../vendor/THREE-LICENSE.txt)

老板已明确重新制作，旧 `src/3d` 原型只用于核对问题，不沿用其场景或玩法代码。保留可用原始木材，原件不动。下载 Three.js r160 官方模块构建、GLTFLoader 与 BufferGeometryUtils，许可随 `vendor/THREE-LICENSE.txt` 分发，模块导入路径改为本地 `.mjs`。中式家具与 PBR 资源来源见 `assets/README.md`，Poly Haven CC0 许可原文保存在本目录 `polyhaven-license.html`。

2026-11-16 下载官方同版本参考：[PointerLockControls](https://github.com/mrdoob/three.js/blob/r160/examples/jsm/controls/PointerLockControls.js)、[Raycaster](https://github.com/mrdoob/three.js/blob/r160/src/core/Raycaster.js)。本目录保存原文，仅用于核对相机左右轴、指针锁释放和遮挡射线，许可同 Three.js MIT。不把参考文件当作游戏模块加载。

复用 2D 阶段已经下载的 Ink 条件选项、Yarn Spinner 台词/选项分离和 W3C 模态对话框研究，沿用“观察与行动分开、已读记录才入手记、主动确认结局”的设计；没有引入额外叙事运行库或复制商业游戏素材。

0.9.0 的记忆时间线继续复用父工作区 `docs/references/WritingWithInk.md` 的条件选项资料和本目录 W3C APG 模态参考，不重复下载或引入 Ink 运行库。ThreeMemoryTimeline 用原生按钮完成放入、上下调整和移除，操作后恢复卡片按钮焦点，反馈沿用 role=status；原文片段仍以本项目记录为唯一来源。DOM 事件检查不代表原生模态、浏览器布局或设备操作验收。

0.10.0 的量水试称复用本地 Three.js r160 的基本几何、Group 和 MathUtils.lerp，沿用 ThreeDoorMechanism 已有的受控缓入缓出动画与减少动态效果处理；不引入物理引擎或重复下载模型。原有 Kenney 木碰撞反馈用于失败落秤，成功沿用机关释放声音。表盘是本项目几何，来源不变。

0.11.0 的实际窗洞和分段墙沿用本地 Three.js r160 的 BoxGeometry/PlaneGeometry/Group，复用已下载 `vendor/BufferGeometryUtils.mjs` 的 mergeGeometries 合并同材质静态墙段和窗条，许可同 Three.js MIT。没有重复下载引擎或新增库；窗洞验证继续用本目录 Raycaster 同版参考。玻璃为现有引擎的透明标准材质，没有透射后处理、反射探针或新的贴图资产。

0.12.0 的实体手机沿用现有 Three.js r160 的 Shape/ExtrudeGeometry/CanvasTexture 与 Raycaster UV 交点，近看沿用 ThreePortrait / ThreeHouseScene 的真实站位和横竖屏取景方法。阅读仍使用原生按钮/dialog 与既有 W3C APG 参考，页面开关与已知事实继续参考已下载 Ink 条件选项资料；没有重复下载框架或引入新的叙事/手机 UI 库。屏幕仅在换页时重画，文字来自本项目原事故记录，不新增第三方图像、品牌界面或语音。

0.13.0 的正反面纸张复用现有 ThreePortrait 的翻面/拖动、ThreeHouseScene 的取景/归位和 Three.js r160 PlaneGeometry/CanvasTexture/FrontSide/BackSide。曲面顶点沿用现有相框布的顶点调整方法，背面反转 UV 以保持字迹方向，不引入新运行库；阅读和已知事实继续沿用已下载 W3C/Ink 资料。文字取自本项目学校原文，不下载伪造文书或扫描照片。

0.14.0 的医院纸张直接复用现有 ThreeDocument 和 Three.js Euler 的朝向保存/恢复，按记忆空间建模，不复制另一套纸张控制器。事实核对继续沿用已下载 Ink 的条件选项与“已观察事实/可执行行动”分离方法，不新增叙事库或第三方医疗表单图片；所有文字仍来自本项目原病历/复诊记录。未重复下载已有项目或素材。

0.15.0 的近看内原文复用原生 details、已下载 W3C 模态/焦点资料、本项目 ThreeEvidenceJournal 的摘记按钮与原记忆入口。共享主入口函数和机关样式，不下载另一套阅读器，不引入运行依赖。主动放大仍使用原 dialog，测试沿用现有 jsdom；DOM 事件不代表浏览器原生开合、焦点或布局证据。

2026-11-16 为界面事件验证安装 [jsdom 26.1.0](https://github.com/jsdom/jsdom/tree/26.1.0)，MIT。源码与 LICENSE.txt 位于工作区开发依赖 node_modules/jsdom，npm 的 39 份包及完整性摘要通过 package-lock.json 锁定，来源为 registry.npmjs.org；不把 node_modules 或 jsdom 加入游戏运行模块。`tools/verify_ui.mjs` 复用它的 DOM 与事件实现，渲染边界和 dialog 开合另行模拟，不能据此宣称浏览器默认行为、布局或 WebGL 已验收。

2026-11-17 的手记对照与机关旁摘记复用已下载的 W3C 对话框研究、原生 details/select 控件及现有 jsdom。没有重新下载相同参考、引入界面框架或新运行依赖；新模块只呈现真实已读原文，不生成替代线索。

0.5.0 的视角设置继续参考本目录已下载的 Three.js r160 PointerLockControls 的 pointerSpeed 和俯仰限制。新增声音从 [Kenney 官方](https://kenney.nl/assets/impact-sounds) 下载 CC0 Impact Sounds 1.0，原包留本地 `assets/audio/.source/`，实际使用的九份文件、原许可和来源校验随游戏分发，见 `assets/audio/README.md`。没有引入音频框架或商业游戏素材。

0.6.0 的相框复用现有 Three.js 分组变换、射线与相机投影、已下载参考和现有近看生命周期，不引入新的三维引擎。图片通过 imagegen 技能的内置 image_gen 路径生成并复制入库；完整生产提示词见 `assets/art/mother-portrait.source.json`，原始输出保留在 Codex generated_images 目录，不借用商业游戏人物照片。

0.7.0 下载同版本官方 [InstancedMesh](https://github.com/mrdoob/three.js/blob/r160/src/objects/InstancedMesh.js) 到 `InstancedMesh-r160.js`，许可同 Three.js MIT，仅用来核对矩阵更新、包围球和实例缓冲释放。raw.githubusercontent.com 直取遇 EOF，随后通过 GitHub 连接器读取同一公开文件保存。归门绳段实际使用已有本地 Three.js 的 InstancedMesh，厨房固定铜索使用已有 TubeGeometry；不加载参考文件或引入物理引擎。静止绳段不重复上传矩阵，场景释放时同时释放实例缓冲。

0.8.0 复用父工作区已下载的 [W3C APG Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)，原文复制到本目录 `apg-dialog-modal-pattern.html`（SHA-256：14ce04000352a8d8ee6cf2ec4419e1cf28a8d6648736a1cf6653d38bc24099e3），原件保留，不重复下载。地图继续用现有原生 dialog 管理开合/焦点，SVG 只显示路线图，下方 HTML 按钮提供同样的已读原文入口；范围选择用原生 select。直接复用本项目 walkable 和记录元数据，不新增地图框架。
