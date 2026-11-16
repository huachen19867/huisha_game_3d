# 3D 参考与来源

老板已明确重新制作，旧 `src/3d` 原型只用于核对问题，不沿用其场景或玩法代码。保留可用原始木材，原件不动。下载 Three.js r160 官方模块构建、GLTFLoader 与 BufferGeometryUtils，许可随 `vendor/THREE-LICENSE.txt` 分发，模块导入路径改为本地 `.mjs`。中式家具与 PBR 资源来源见 `assets/README.md`，Poly Haven CC0 许可原文保存在本目录 `polyhaven-license.html`。

2026-11-16 下载官方同版本参考：[PointerLockControls](https://github.com/mrdoob/three.js/blob/r160/examples/jsm/controls/PointerLockControls.js)、[Raycaster](https://github.com/mrdoob/three.js/blob/r160/src/core/Raycaster.js)。本目录保存原文，仅用于核对相机左右轴、指针锁释放和遮挡射线，许可同 Three.js MIT。不把参考文件当作游戏模块加载。

复用 2D 阶段已经下载的 Ink 条件选项、Yarn Spinner 台词/选项分离和 W3C 模态对话框研究，沿用“观察与行动分开、已读记录才入手记、主动确认结局”的设计；没有引入额外叙事运行库或复制商业游戏素材。
