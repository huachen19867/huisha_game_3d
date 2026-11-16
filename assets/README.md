# 3D 美术与许可

本版不使用旧原型的场景照片、家具照片或棋盘底贴片。圈椅、条案、木柜、学校课桌/椅与轮椅为实际 glTF 网格，带 1K PBR 贴图，随包离线分发。原始来源元数据保存于每个模型目录的 `source.json`，几何和贴图未修改；导入时调整尺寸、位置与朝向。

| 目录 / 文件 | 来源 | 作者 | 许可与用途 |
| --- | --- | --- | --- |
| models/chinese_armchair | [Poly Haven](https://polyhaven.com/a/chinese_armchair) | Kirill Sannikov | CC0，中式圈椅 |
| models/chinese_console_table | [Poly Haven](https://polyhaven.com/a/chinese_console_table) | Kirill Sannikov | CC0，中式供桌条案 |
| models/chinese_cabinet | [Poly Haven](https://polyhaven.com/a/chinese_cabinet) | Kirill Sannikov | CC0，中式木柜 |
| models/SchoolDesk_01 | [Poly Haven](https://polyhaven.com/a/SchoolDesk_01) | 见来源页 | CC0，学校记忆中的真实课桌 |
| models/SchoolChair_01 | [Poly Haven](https://polyhaven.com/a/SchoolChair_01) | 见来源页 | CC0，与课桌配套的学校椅子 |
| models/wheelchair_01 | [Poly Haven](https://polyhaven.com/a/wheelchair_01) | 见来源页 | CC0，医院记忆中的真实轮椅 |
| materials/wood-* | [Dark Wooden Planks](https://polyhaven.com/a/dark_wooden_planks) | 见来源页 | CC0，颜色/法线/粗糙度 |
| materials/plaster-* | [Damaged Plaster](https://polyhaven.com/a/damaged_plaster) | 见来源页 | CC0，颜色/法线/粗糙度 |
| art/木墙.png、art/木梁.png | 老板已有的原始源美术 `美术/` | 原项目素材 | 沿用原项目授权，用于木墙与梁柱；原件保留 |

Poly Haven 对其资产的 [CC0 许可说明](https://polyhaven.com/license) 已下载至 `docs/references/polyhaven-license.html`。Three.js / GLTFLoader / BufferGeometryUtils 为 r160 MIT，见 `vendor/THREE-LICENSE.txt`；后两者仅将 import 路径改为本地 `.mjs`，不走 CDN。

棺体、香炉、烛台、门窗、字轮与线索铭牌为本项目编写的真实几何结构与局部文字材质。文字牌是附在器物上的平面，不代替整个三维房间。环境声、脚步与机关声由 Web Audio 生成。

2026-11-16 记忆扩展从 Poly Haven 官方 files API 下载 SchoolDesk_01、SchoolChair_01、wheelchair_01 的 1K glTF、二进制和各三张贴图，新增 15 份原始文件。`sources.json` 记录全部 36 份下载文件的 URL、MD5 和本地路径，检查脚本读取原始字节核对。三个目录的 source.json 保留当次完整 files API 返回。事故现场的护栏、路面、手机和救护物件为自建几何，不使用未经授权的车辆照片或收费模型。
