# 声音来源与运行

0.22 的四段配乐由 ThreeAudio 按拍调度。村路、正厅、记忆各有一段留有空拍的拨弦旋律；纸人露头时收声，开始追逐才进入低音短句。设置里的配乐、雨声各有独立音量，服从总音量与静音。

竖琴 D4 与低音提琴拨奏 D1 取自 Versilian Studios 的 VSCO 2 Community Edition。源文件为 Strings/Harp/KSHarp_D4_mf.wav 和 Strings/Solo Contrabass/Pizz/BKCtbss_Pizz_D1_v1_rr1.wav。本地合并声道，转为 24 kHz 16 位 PCM，统一峰值。声音随游戏分发。[固定版本](https://github.com/sgossner/VSCO-2-CE/tree/440300901dfe9275fd84e0b7763af1f8443ae62e) · [CC0 原文](vsco/LICENSE)

`kenney-impact/` 的九份 Ogg 文件直接提取自 Kenney 官方 Impact Sounds 1.0，使用 CC0-1.0。原包 `License.txt` 随游戏分发；`sources.json` 记录来源入口、下载端点、原包路径、SHA-256。完整包和下载页面在本地 `.source/` 保留并被 Git 忽略，不从临时签名 URL 运行游戏。

脚步使用三个变体轮换，木地板和硬地面由地图声区确定。铜轮使用两个轻金属变体，门闩/秤盘释放叠加轻木碰撞。声音仅在玩家进入游戏或主动取消静音后启动；样本加载复用同一任务，不阻塞进入、移动或机关。加载失败或设备不支持 Ogg 解码时回退到现有合成反馈；翻纸、倒水与雨声继续使用 Web Audio 合成。没有录音或麦克风权限。

`ThreeCourtyardMap.audioZones` 定义老宅外的地面与雨声过滤，`ThreeMemoryMap.MEMORIES[*].audio` 定义记忆空间的声音。老宅/厨房雨声较闷，庭院/山路较开阔，学校/医院记忆不继续播放室外雨声；切换用增益/滤波渐变。监听位置沿用真实玩家站位，不跟随机关近看相机。换记忆、暂停及大于两米的瞬时位移不产生脚步。

检查核对文件原始字节、Ogg/Vorbis 标识、运行请求路径、样本失败/释放和声区事件；Node 解码为替身，尚无设备试听、浏览器真实解码与空间听感验收结论。
