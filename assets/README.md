# 3D 美术与许可

本版不使用旧原型的场景照片、家具照片或棋盘底贴片。圈椅、条案与木柜为实际 glTF 网格，带 1K PBR 贴图，随包离线分发。原始来源元数据保存于每个模型目录的 `source.json`，几何和贴图未修改；导入时调整尺寸、位置与朝向。

| 目录 / 文件 | 来源 | 作者 | 许可与用途 |
| --- | --- | --- | --- |
| models/chinese_armchair | [Poly Haven](https://polyhaven.com/a/chinese_armchair) | Kirill Sannikov | CC0，中式圈椅 |
| models/chinese_console_table | [Poly Haven](https://polyhaven.com/a/chinese_console_table) | Kirill Sannikov | CC0，中式供桌条案 |
| models/chinese_cabinet | [Poly Haven](https://polyhaven.com/a/chinese_cabinet) | Kirill Sannikov | CC0，中式木柜 |
| materials/wood-* | [Dark Wooden Planks](https://polyhaven.com/a/dark_wooden_planks) | 见来源页 | CC0，颜色/法线/粗糙度 |
| materials/plaster-* | [Damaged Plaster](https://polyhaven.com/a/damaged_plaster) | 见来源页 | CC0，颜色/法线/粗糙度 |
| art/木墙.png、art/木梁.png | 老板已有的原始源美术 `美术/` | 原项目素材 | 沿用原项目授权，用于木墙与梁柱；原件保留 |

Poly Haven 对其资产的 [CC0 许可说明](https://polyhaven.com/license) 已下载至 `docs/references/polyhaven-license.html`。Three.js / GLTFLoader / BufferGeometryUtils 为 r160 MIT，见 `vendor/THREE-LICENSE.txt`；后两者仅将 import 路径改为本地 `.mjs`，不走 CDN。

棺体、香炉、烛台、门窗、字轮与线索铭牌为本项目编写的真实几何结构与局部文字材质。文字牌是附在器物上的平面，不代替整个三维房间。环境声、脚步与机关声由 Web Audio 生成。
