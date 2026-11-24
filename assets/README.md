# 3D 美术与许可

## 0.22.14 村口旅行车

[车头近景](art/wagon-front.jpg)直接取自村口旅行车的游戏模型。前牌、固定螺钉、灯罩、反光碗、灯泡和转向灯都在车上。前牌和交班条从同一条游戏文字取号码。行车片头使用同一辆车重新渲染。[场景](../src/3d/ThreeVillageLane.js)

## 0.22.13 旧红盖头与枣红开衫

[旧红盖头](art/red-bridal-veil.webp)由内置 ImageGen 为本作生成，透明 WebP，768 × 1152。提示词要求正面拍摄手糊的冥婚纸新娘头部，暗红纸盖头斜压一只眼，露出墨眼、折纸鼻梁和褪色脸印，两侧垂片沿边印金色凤纹。模型用正面投影保留眼神和折痕，侧后重新取样素红纸，裙纸沿用原双凤纹样。桥头、车窗和井沿共用模型，截图取自游戏与实际编码影片。[井口](../docs/well-emergence.jpg) · [车窗](../docs/rain-drive.jpg)

[枣红开衫](art/west-cardigan.webp)由内置 ImageGen 参照本作[银婚照](art/silver-wedding.jpg)生成。折在箱里时，最上一层取衣襟和扣子局部；摊在床上和近看时使用整件衣服的透明轮廓。

## 0.22.12 井沿裙纸

[纸角近景](art/well-skirt-paper.jpg)取自游戏里的井沿。红纸正面取样自纸新娘原有的嫁衣纹样，翻卷处用纸脸纹理中没有墨迹的一小块做纸背。纸面沿石沿弯折，井口内侧的一头垂下去。[原有纹样与署名](#0229-纸扎新娘)

## 0.22.9 纸扎新娘

[纸脸](art/bride-paper-face.webp)与[凤冠、嫁衣纹样](art/bride-crown-and-robe.webp)由内置 ImageGen 为本项目生成。纸脸用折纸鼻梁、压低的墨线眼和一道褪色的朱唇。第二张图的上部是镂空金纸凤冠，下部是折过的双凤裙纸。两图保留透明边缘。模型分别取样，给凤冠保留镂空，裙纸沿衣身和两节袖筒环绕，折出侧后的披帛。[井边纸扎模型](../src/3d/ThreeWellChase.js)

桥上、车窗前和井里的纸扎共用这套几何和贴图。行车影片按原来的时长与帧率重拍；雨刷刮过哪一片玻璃，就从那里开始重新积水。井里的攀爬和追逐直接使用场景相机。[重拍影片](cinematics/rain-drive.mp4) · [玻璃和雨刷](../src/drive-glass.mjs)

## 0.22.8 玻璃与手记上的红印

[红印纹理](art/cheek-impression.svg) 是按原有纸脸右颊上两次瓶盖印的大小和错位重新绘制的透明纹理。深印、浅印和颜料的缺口共用同一张图。在车外看玻璃时印子反向，把纸压上去再揭开，纸面上的方向和纸脸一致。手机正面照使用既有 [纸脸正面](art/paper-mask-front.webp)。

## 0.22.6 石桥接驳车

中巴车身、候车处站牌、驾驶位、司机衣服和值班室座机使用本项目几何模型。司机头部复用 Lee Perry-Smith / Infinite-Realities 的头部扫描与原贴图，调整尺寸、朝向及衣领位置。与值班员共享已载入的资源。[原始署名](models/night-clerk/LeePerrySmith_License.txt) · [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)

## 0.22.5 雨夜行车片头

[雨夜行车](cinematics/rain-drive.mp4) 是本项目逐帧渲染的四十秒短片，1280 × 720，24 帧/秒，H.264。镜头使用游戏里的旅行车、路旁村屋、桥边的纸扎人和值班室。驾驶位叠加既有挡风玻璃图中的仪表台与后视镜，贴窗的一瞬使用已有的纸脸近景。画面单独编码，游戏按影片播放位置从 [STORY.md](../STORY.md#雨夜驾驶片头) 取字幕，并播放收音机、雨刷和刹车声。

本地启动游戏后，可用 [渲染脚本](../tools/render_drive.mjs) 从 [行车场景](../src/drive-scene.mjs) 和 [驾驶室前景](../src/drive-glass.mjs) 重制影片。脚本需要 Playwright、Chromium 及带 libopenh264 编码器的 FFmpeg。

0.20.4 的纸面具由内置 ImageGen 生成。[正面](art/paper-mask-front.webp)和[背面](art/paper-mask-back.webp)各为 702 × 768 WebP，保留透明轮廓。正面用于车窗、庭院和近看，背面用于翻面与近看。

正面提示要求正视的手糊民间纸面具、米黄色旧纸、窄眼洞、略歪的红嘴、观者左脸一个红圆印而右脸两个叠印、柔和自然光、独立透明背景。背面以上述图为参照，要求同一纸壳翻转后的凹面、素纸纤维、窄眼洞、一条褪色的红奶白格子系带及侧面留出的活扣。

0.20.2 的石桥学车照由内置 ImageGen 生成。提示词指定阴天的乡间石桥、左前方缺角桥柱、穿两道白条蓝校服学车的孩子，以及刚刚松开后座的父亲。游戏内袋与相册共用同一份 900 × 600 JPEG。[道具照片](art/bridge-bicycle.jpg)

## 0.20.0 阁楼与地下储水间

藤篮、旧木箱、搪瓷锅、软管卷、带护笼的壁灯和锈铁架来自 Poly Haven，按 CC0 分发。游戏使用本地 1K glTF，按场景比例放置，壁灯取其中一种装配件。完整文件可查下载 URL 和 MD5。[藤篮](https://polyhaven.com/a/wicker_basket_01) · [木箱](https://polyhaven.com/a/wooden_crate_01) · [软管](https://polyhaven.com/a/garden_hose_wall_mounted_01) · [壁灯](https://polyhaven.com/a/industrial_caged_sconce) · [铁架](https://polyhaven.com/a/worn_metal_rack) · [搪瓷锅](https://polyhaven.com/a/pot_enamel_01) · [下载清单](sources.json)

## 0.19.0 村口与西厢

Poly Haven 的六组 glTF 为旧铁床、台钳、木提灯、倒木、灌木与蕨类。砖墙、瓦面、提花被面与牛仔工作服使用 1K 颜色、法线、粗糙度。资源按 CC0 分发，游戏调整尺寸、方向、单株选择和材质颜色。下载原始路径、URL 和摘要在 [sources.json](sources.json)。[铁床](https://polyhaven.com/a/old_bed_frame) · [台钳](https://polyhaven.com/a/bench_vice_01) · [提灯](https://polyhaven.com/a/wooden_lantern_01) · [倒木](https://polyhaven.com/a/dead_tree_trunk_02) · [灌木](https://polyhaven.com/a/shrub_02) · [蕨](https://polyhaven.com/a/fern_02) · [砖](https://polyhaven.com/a/brick_wall_001) · [灰瓦](https://polyhaven.com/a/grey_roof_tiles) · [织物](https://polyhaven.com/a/quatrefoil_jacquard_fabric) · [牛仔布](https://polyhaven.com/a/denim_fabric)

值班员头部使用 Infinite, 3D Head Scan by Lee Perry-Smith，原作者 Lee Perry-Smith / Infinite-Realities，来源为 Three.js 示例的 LeePerrySmith.glb 和 Map-COL.jpg。按 CC BY 3.0 Unported 署名，游戏调整尺寸、方向、颜色采样和材质，并搭配自制工作服、眼镜和帽子。[上游目录](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/LeePerrySmith) · [随包署名原文](models/night-clerk/LeePerrySmith_License.txt) · [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)

两张游戏道具照片由内置 ImageGen 生成，出图后按显示尺寸缩小，虚构人物。银婚照的提示词描述中国乡镇照相馆、深蓝外套与枣红开衫的中年夫妇、褪色彩印和无字底片；春节照指定马灯在左、全家居中、木门在右，采用家用胶片直闪。相框、年份和交互由游戏绘制。[银婚照](art/silver-wedding.jpg) · [春节全家福](art/family-new-year.jpg)

雨庭的分层砌井使用 Rock Face 03 的颜色、法线与粗糙度贴图，井中木桶使用 James Ray Cock 的 Wooden Bucket 01 实体模型，地面使用 Cobblestone Floor 05。夜空由 Greg Zaal 的 Moonless Golf 色调映射全景缩小为 2048×1024。四项资源均为 Poly Haven CC0，运行时从项目本地加载。原始下载校验与全景衍生文件摘要见 [资源清单](sources.json)。[井石](https://polyhaven.com/a/rock_face_03) · [木桶](https://polyhaven.com/a/wooden_bucket_01) · [地面](https://polyhaven.com/a/cobblestone_floor_05) · [夜空](https://polyhaven.com/a/moonless_golf)

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
| art/mother-portrait.png | 内置 image_gen 新生成 | 本项目虚构人物 | 用作实体相框的正面照片；完整提示词与 SHA-256 见同名 .source.json，不归入 Poly Haven/Kenney CC0 素材 |

Poly Haven 对其资产的 [CC0 许可说明](https://polyhaven.com/license) 已下载至 `docs/references/polyhaven-license.html`。Three.js / GLTFLoader / BufferGeometryUtils 为 r160 MIT，见 `vendor/THREE-LICENSE.txt`；后两者仅将 import 路径改为本地 `.mjs`，不走 CDN。

棺体、香炉、烛台、门窗、字轮与线索铭牌为本项目编写的真实几何结构与局部文字材质。文字牌是附在器物上的平面，不代替整个三维房间。脚步与木、金属碰撞使用 Kenney 的 CC0 音效；雨声、翻纸、倒水及界面提示由现有 Web Audio 系统合成。

0.11.0 的窗洞、墙体窗台、木格/金属窗框、玻璃与老宅侧院由 `ThreeWindowWall` / `ThreeHouseScene` 自建几何，继续使用原木材、灰墙和石材。未新增第三方图片/模型或改变 36 份下载原件；玻璃使用标准透明材质，不是房间照片或窗外风景贴片。

0.12.0 的手机由 ThreePhone 以倒角实体、独立屏幕、听筒和侧键组成，无品牌标识；屏幕文字从本项目通话/录音原文绘制，不使用手机照片或商业产品界面。录音资料显示文字转录，没有新下载的声音或生成配音；原素材来源索引不变。

0.13.0 两张学校纸张由 ThreeDocument 的轻微弯曲几何与分别受光的正反面组成，Canvas 纹理绘制本项目原文字迹、边线与折痕。签字栏以虚构记忆中的“父”落款表示，不引入现实姓名、学校标识、第三方证件图片或额外美术依赖。原课桌 glTF 与全部下载字节保持不变。

0.14.0 医院初诊病历和复诊安排沿用同一纸面几何，医疗表格使用灰绿纸/墨色，患者签字栏以虚构记忆中的“母”落款表示。未下载真实病历、医院标识或新增图片；原轮椅/门诊桌 glTF、原始许可与校验保持不变。

2026-11-16 记忆扩展从 Poly Haven 官方 files API 下载 SchoolDesk_01、SchoolChair_01、wheelchair_01 的 1K glTF、二进制和各三张贴图，新增 15 份原始文件。`sources.json` 记录全部 36 份下载文件的 URL、MD5 和本地路径，检查脚本读取原始字节核对。三个目录的 source.json 保留当次完整 files API 返回。事故现场的护栏、路面、手机和救护物件为自建几何，不使用未经授权的车辆照片或收费模型。

2026-11-17 从 [Kenney Impact Sounds 1.0](https://kenney.nl/assets/impact-sounds) 官方下载包导入九份原始 Ogg Vorbis 音效：木地板/硬地面脚步各三份，轻金属碰撞两份，轻木碰撞一份。位于 `audio/kenney-impact/`，合计约 57 KB，逐文件 SHA-256、包 SHA-256、官方入口和原包路径见 `audio/sources.json`；CC0 原文在 `audio/kenney-impact/License.txt`。没有修改或重新编码原文件。完整下载包和页面留在本地忽略的 `audio/.source/`，只随游戏分发实际使用的九份音效和许可。

0.6.0 新照片从 Codex 默认 generated_images 目录复制到项目，原始生成文件保留。已目视确认是单人正面旧照、没有文字、水印或相框，人物为虚构角色。木框、背板、角片、褶皱黑布与背字由项目实体几何构成；照片只贴在照片平面上，不替代三维物件或房间。没有覆盖老板已有的美术原件。
