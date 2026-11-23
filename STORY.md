# 《回煞》3D 剧情与交互文字

这是游戏直接读取的文稿。在此文件搜索画面上的原句，修改后保存并刷新游戏即可。每段上方有一行灰底英文编号，请保留编号，直接修改下面的正文。正文可以换行、分段。〔1〕、〔2〕代表游戏填入的名字或数量，可以调整位置。相同的共用按钮和地点名称只收一次。

常用入口　[片头](#雨夜驾驶片头) · [村口与正厅](#村口老宅正厅与走廊) · [井边](#雨庭旧井) · [记忆与证词](#学校医院事故现场与证词) · [四个结局](#下山与结局) · [引导](#当前目标按需提示与推理)

## 雨夜驾驶片头

`drive-intro.playdrive`

我妈去世十年了。

昨天，邮局送来一封她写的信。

「明儿，十四回来吃饭。」

`drive-intro.playdrive.2`

“这信还能延迟这么长时间吗，可恶的邮局。”我这样想着。

雨时不时模糊我的车窗，让我心情甚是烦躁。

这次回老家的主要目的，就是想再看看那个熟悉的地方，顺便我也要取一些老物件留作纪念.....

`drive-intro.playdrive.3`

收音机突然没声了。

失神之间，我好像看到前面站着一个.......人？

`drive-intro.playdrive.4`

不知道昏迷了多久，再抬头，眼前是村口值班室的灯。

`drive-intro.playdrive.5`

继续

`drive.hit`

？？？？？？？？？

`drive.brake`

刹车踩下去，方向盘猛地偏了一下。

`drive.black`

.......

## 村口、老宅正厅与走廊

`housemap.portrait_back.title`

相框背字

`housemap.portrait_back.text`

相框背面有一行圆珠笔字，写着拍照的年月。下面还有一串电话号码，最后两位划掉改过。

是妈的字。


那块黑布是我离家时盖上去的。

`housemap.path.title`

门外石路

`housemap.path.maplabel`

石路

`housemap.stone_court.title`

门后石坪

`housemap.porch.title`

老宅门廊

`housemap.lane.title`

村口旧路

`housemap.wiper_print.title`

雨刷边的红印

`housemap.wiper_print.location`

村口

`housemap.wiper_print.text`

雨刷底下有两个红印，挨得很近。雨水流到印子底下，带出了一点红。

`housemap.car_envelope.title`

随身来信

`housemap.car_envelope.text`

外面的信封写着我现在的地址。投递章是七月十三，单号末四位 0317。里面那个小信封上写着「李明收」，是妈的字。翻过来，背面还有家里的老门牌：槐树巷十四号。

「明儿，十四回来吃饭。妈要是出去买菜了，钥匙在你周叔那儿。」

没写哪一年。

`housemap.forwarding_slip.title`

外封和底单上的号码

`housemap.forwarding_slip.text`

我从口袋里抽出外面那层信封，把条码挨着底单放好。两行号码从头到尾都一样，末尾是 0317。周叔十二号寄的，十三号到了我手里。

`post.slipTitle`

周师傅的寄件联

`post.slipText`

收寄日期　七月十二日
寄件人　周福生
收件人　李明

条码下面的号码以 0317 结尾。寄件人名字旁边填了一个手机号。

`post.compare`

拿外封来对单号

`post.saveContact`

问周叔能不能留个电话

`post.contactTitle`

周叔的手机号

`post.contactText`

「叔，我以后回来，打这个电话能找着您吗？」

「能。晚上也打这个，值班室那部有时候没人接。」

我照着底单输进手机，存成「周叔」。

`post.backToSlip`

再看看底单

`post.askOldKey`

问信里说的那把钥匙

`post.oldKeyTitle`

妈留给我的钥匙

`post.oldKeyText`

「叔，我妈信里说，她要是去买菜，钥匙就在您这儿。」

「是啊。她怕你拿错，在钥匙上拴了根黄毛线。我一开抽屉，你自己就能找着。」

「那把您还留着？」

「那把早还你爸了。现在这把是春天留给木工开门的。」

`housemap.clerk.title`

值夜的周师傅

`housemap.clerk.text`

老周眯着眼看了我一会儿。「小明？你怎么淋成这样？过来，屋檐底下说。」

`housemap.duty_book.title`

值班室换牌登记簿

`housemap.duty_book.text`

换牌登记　　旧门牌 → 新门牌
槐树巷四号　　东街九号
槐树巷十四号　东街六号
槐树巷四十号　东街十六号

簿子右边是领用人签名和日期。〔1〕

`housemap.key_board.title`

值班室里的钥匙架

`housemap.key_board.text`

老周身后的木架上挂着三把门钥匙，铜牌上是东街的新门牌号。

`housemap.front_gate.title`

李家老宅前门

`housemap.front_gate.text`

门上的搪瓷牌还是旧的：槐树巷十四号。锁眼就在拉手下面。

`housemap.letter.title`

门边的全家福

`housemap.letter.text`

一张褪色的过年照片。左边的小桌上点着马灯，右边是贴了春联的木门。我坐在正中间，妈扶着我的胳膊，爸笑得露出了牙。

`housemap.altar.title`

守夜灯

`housemap.altar.text`

煤油灯的提把烫手。我小时候把红鞋带绕在上面，妈一直没拆。

灯芯剪过了，灯肚里还有油。提起来，红鞋带刚好套住手腕。

`housemap.uniform_collar.title`

校服领口的姓名布

`housemap.uniform_collar.text`

「李明　初二」。白布上是我自己的字，月字旁扎破了个小洞。住宿那天才想起来要写名字，妈在楼下等我。〔1〕

`housemap.uniform_cuff.title`

左袖的三对揿扣

`housemap.uniform_cuff.location`

旧校服

`housemap.uniform_cuff.text`

左袖有三对揿扣。我一路解到手肘，才看清整条袖缝都剪开过，毛边用蓝线包好了。我上学时这袖子还是缝死的。

`housemap.clerk_holdall.title`

棺木里的布兜

`housemap.clerk_holdall.location`

村口值班室

`housemap.clerk_holdall.text`

「周叔，正厅那口棺是给我妈打的？」

「你爸给自己备的。你妈的骨灰还是我陪他去接的。」

「里面放的什么，您知道吗？」

「从医院回来那天我开车送他。他把衣裳搁棺里，说第二天再洗。后来我也没问。」

`housemap.clerk_cuff.title`

母亲的输液袖

`housemap.clerk_cuff.text`

我把袖子搭到窗台上。老周看了一眼就伸出左手，在自己手背上点了点。「她在县医院挂水，胳膊冷，穿外套又得叫护士过来。就喊我去买了几个揿扣。」

他把最靠手肘的那颗按上，按了两下才扣住。「还是这个最紧。那阵子我在床边，老帮她扣这个。」

`housemap.bend_photo.title`

石桥上学车的旧照

`housemap.bend_photo.text`

爸的手已经松开了。我那时候还在喊：「你扶好了啊！」妈在桥头按了快门。照片左边拍进半根缺角的石柱，背面印着「县照相馆」。右下角有一道旧折痕。

`housemap.coffin.title`

棺上的红绳

`housemap.coffin.text`

三根红绳从棺沿牵到走廊。靠过道这边，盖缝里夹着一角蓝布，上面有两道白杠。

`housemap.portrait.title`

蒙布相框

`housemap.portrait.text`

黑布只在上沿搭着，布角被攥得发白。可以揭开它，也可以先看看别处。

`housemap.wall_marks.title`

墙上身高线

`housemap.wall_marks.text`

布带还在。上头两个扣眼，一边挂一颗钉子。妈嫌铅笔印一洗就掉，每量完一次，就用黑线缝一道。最高那道旁边写着「明」。

有一年我偷偷踮起脚。妈还在穿针，看也没看我，拿鞋尖碰了碰我悬着的脚后跟。

`housemap.height_stitch.title`

布背那道红线

`housemap.height_stitch.location`

量身高的布带

`housemap.height_stitch.text`

翻过来，最高那道黑线下面还有一道短红线，针脚歪歪扭扭。这个是我缝的。我头一回比妈高，让她也靠墙站一站。

「鞋也得脱。」我说。她抬起脚，把两只布鞋一前一后甩到我脚边：「行。你可把书放平啊。」

`housemap.lock.title`

归门字轮

`housemap.lock.text`

门上嵌着三枚铜轮，每枚都有「雨、门、人、灯」四个字。红绳接在铜轮背面，门闩落在你这一侧。

`housemap.threshold.title`

雨停后的门槛

`housemap.threshold.text`

雨已经停了。石路通向一座小院。

右手边的厨房里，还亮着一盏灯。母亲留下的门没有锁，院门却仍由一根铜索扣着。

## 雨庭、厨房与山路

`courtyardmap.yard.title`

雨庭

`courtyardmap.kitchen.title`

厨房

`courtyardmap.road.title`

院外山路

`courtyardmap.road.maplabel`

山路

`courtyardmap.paper_mask.title`

灶间门边的纸脸

`courtyardmap.paper_mask.text`

这张纸脸是我糊的。那会儿不会拿笔画圆，就找了个汽水瓶盖，蘸红颜料给它印脸蛋。

`courtyardmap.mask_strap.title`

纸脸背后的格子布带

`courtyardmap.mask_strap.text`

红格子布从耳朵边两个孔穿过去，右边留着个活扣。爸以前逗我，往脸上一扣，两只眼睛全让布带挡住了。我还得踮起脚替他往上提一提。

`courtyardmap.mask_transfer.title`

两处叠在一起的红印

`courtyardmap.mask_transfer.location`

村口与雨庭

`courtyardmap.mask_transfer.text`

雨刷边上那两个圆，一深一浅。纸脸右边的脸蛋也是这样。那年瓶盖印歪了，我往下挪了一点，又盖了一次。

`mask.sampleAction`

用手记的纸角按一下

`mask.sampleTitle`

纸角上的红印

`mask.sampleText`

我把手记末页的纸角压在玻璃上。揭开一看，两个印都沾过来了，一深一浅。我晾了一会儿才合上本子。

`mask.glassAfter`

玻璃上还剩一圈淡红。纸上那份夹在手记最后一页。

`mask.openSample`

翻到留着红印的那一页

`mask.photoAction`

拍一张纸脸的正面

`mask.photoTitle`

纸脸的正面照

`mask.photoText`

我把纸脸转向门口的灯，用手机拍了正面。照片里，折进去的鼻梁和两边的红脸蛋都看得清。

`mask.openPhoto`

看拍下来的正面照

`mask.compareHere`

我翻到带红印的那一页，把纸角托在纸脸旁边。

`mask.comparePhoto`

我翻开手记，又在手机上找出灶门口拍的照片。

`mask.left`

看画面左边的脸蛋

`mask.right`

看画面右边的脸蛋

`mask.leftOnly`

左边只盖了一下。纸角上那个浅印，挪到哪儿都多出来一截。

`mask.rightMatch`

右边。第一下盖得重，补的那一下往下偏了点。纸角上的两个印也是这么挨着的。

`mask.faceAlt`

正面朝向我的纸脸，左脸一个圆印，右脸一深一浅两印相叠

`mask.sampleAlt`

从玻璃上按下来的红印，一个完整的深圆，旁边叠着一个偏低的浅圆

### 雨庭旧井

`courtyardmap.yard_well.title`

雨庭旧井

`courtyardmap.yard_well.text`

桶在井沿底下晃。磕一下，停一停，又磕一下。提梁卡在一块凸出来的石头上。

湿绳上粘着四条黄纸，最上面一条已经耷拉下来了。

`well.seat.title`

灶门口的矮凳

`well.seat.inspect`

矮凳靠里搁着，凳面上有几道菜刀印。

`well.seat.sit`

坐下，往井边看

`well.seat.view`

从这儿看得见摇把。井沿挡着，桶底下有什么就看不见了。

`well.seat.quiet`

木桶搁在井栏上，这下坐着也能看见了。那两下磕碰声也停了。

`well.seat.returnView`

我坐在门里，隔着院子看井栏。

`well.scrap.look`

凑近看井沿上的红纸

`well.scrap.title`

井沿上的一角裙纸

`well.scrap.text`

一截红纸贴在井沿上，一头已经垂进井里。纸上的金花只剩半朵，下面压着一道黑边。翘起来的一角露着白纸背。

`well.scrap.back`

再看看井桶

`well.seat.remember`

想想爸捞球那天

`well.seat.look`

再看看井边

`well.seat.memoryTitle`

等在灶门口

`well.seat.memory`

那天我坐在这儿，两只脚都够不着地。我问了两遍：「爸，捞到了没？」

第二回他才腾出手，把瘪球举过井沿，举得老高。「看见了吧？别跑过来啊，我这儿还得收桶。」

`well.seat.rise`

站起来

`well.seat.back`

回到灶门口

`well.grip.title`

辘轳上的旧球皮

`well.grip.closed`

摇把上的红胶皮

`well.grip.inspect`

一截红胶皮包着铁摇把，两头用麻线缠紧了。我摸到一个鼓包。旁边翘着个边，指甲刚好能伸进去。

`well.grip.turn`

把松起的胶皮翻过来

`well.grip.tuck`

把胶皮掖回麻线底下

`well.grip.tucked`

我顺着胶皮抹了一下，铁摇把硌手的地方刚好被它包住。

`well.grip.memory`

翻过来有个气嘴，边上是爸贴的歪补丁。这是我小时候那只皮球。

那回球掉到井里，我正要趴下去看，爸一把拽住我后领：「去灶门口等着。」他捞上来时球已经瘪了。后来没见他扔，原来包在这儿。

`well.grip.loose`

铁摇把能转了。湿绳还在往下滑，桶底隔一会儿就碰一下石头。井栏上架着两根搁桶的木条，间距正好。

`well.grip.park`

摇起木桶，搁到木条上

`well.grip.parked`

桶底压实了两根木条。我松开摇把等了一会儿，井里再没传来那两下响。

`well.grip.after`

提梁已经从石沿下脱出来了。绳上的黄纸也没了。桶在水面上方来回晃，井架右边的摇把够得着。

`well.grip.replay`

重玩井边追逐

`well.grip.photoInside`

翻开的胶皮内侧，黑气嘴旁边粘着一块歪补丁。

`well.grip.photoOutside`

红胶皮包住了摇把，麻线绑在两头。

`well.grip.hint`

要收好井桶，到井架右侧握住包着红胶皮的摇把。

`courtyardmap.kitchen_note.title`

量水秤的铭牌

`courtyardmap.kitchen_note.text`

秤脚下钉着块铜牌，上面冲了「校准　四升」四个字。左边是放铜砣的凹槽，右边的秤盘正好托得住桶底。

### 量水桌

`courtyardmap.water_station.title`

三升五升量水秤

`courtyardmap.water_station.text`

桌上是两只提桶，桶底分别打着「三升」「五升」。桌子左边是水缸，右边的槽通下水。压了压秤盘，下面的抽屉也动了一下。

### 秤桌抽屉里的信

`courtyardmap.medicine_letter.title`

夹着饭钱的家书

`family.packet`

写着我名字的信封

`family.outside`

秤桌抽屉里躺着一叠纸。信封上写着「铁道车辆班　李明」，右下角还有三个小字：「小俞捎」。封口只折了一下。信封底下压着半张粉红色的单子。

`family.inBag`

跟村口那封分开放着。这封写的是我上学时的班，底下还夹着一张粉红色的单子。

`family.emptyTitle`

秤桌的空抽屉

`family.empty`

抽屉里空了。写着班级的那封信和底下的单子都在我包里。

`family.read`

抽出信纸

`family.checkStub`

展开下面那张单子

`family.printedStub`

县医院　门诊预约
病人留存联

`family.stubTitle`

母亲的复诊预约凭条

`family.stub`

县医院门诊　预约凭条
开单日期：二〇一四年八月二十日
复诊时间：九月二十四日　上午九点

背面是妈的字：「旧病历放在菜篮里，别空手去。」

`family.take`

把信和单子一起收好

`family.viewPostcard`

翻手记，看寄回家的照片

`family.returnLetter`

接着读妈的信

`family.turnOver`

拿开两张十块，翻过信纸

`family.turnFront`

翻回妈写的那面

`family.replyTitle`

写在信背面的回话

`family.replyInk`

妈，饭票我已经买了。二十还你。
蓝的那件扎脖子。你找找灰的，在我床头。
明

`family.replyText`

这几行蓝圆珠笔字是我写的。星期五小俞回家，我把信和钱一起递给他。他手里拎着一袋脏衣服，腾不出手，叫我塞进他书包前面的小兜。

`family.sendPhoto`

拍下信背，发给小俞

`family.sentTitle`

发给小俞的照片

`family.sentLocation`

手机 · 小俞

`family.sentText`

我拍了张照发给小俞：「刚在家里翻出来的。想不到吧，我妈连这都留着。」

`family.putPhoneAway`

收起手机

`family.busAnswer`

车快到县城，小俞回了条语音：「你回村了？怎么没叫我？」

我按住话筒：「明早有空吗？我把车留村口了，陪我去开一下。」

「行。七点半我到你楼下。」

`family.replace`

把信和单子放回抽屉

`family.fold`

把纸折好

`family.back`

回到背包

`family.busCarried`

车刚起步，包从膝头滑下去。我捞起来，把写着班级的信封往里塞了塞。封口还折着。

`family.busRead`

我上车掏零钱，顺手摸到了那封信。妈留的两张十块还夹在里面。我把信塞回包里，用手机付了车费。

`family.recallAction`

想想厨房那张预约条

`family.recall`

妈拿起一摞硬币，让我把回程的钱收好。我想起从秤桌里翻出来的粉红凭条，上面印的正是上午九点。她那天特意等护士把时间填好，才拉我去赶车。

`family.toTin`

再看看糖盒

`family.compareAction`

对一下候诊时说的时间

`family.compareTitle`

约在九点的复诊

`family.compare`

妈问能不能约九点的时候，我正低着头数车钱，没听见护士怎么答。当时这张凭条还是我帮她折起来的。

我顺着旧折痕把纸摊平。九点。给她约上了。

`courtyardmap.medicine_letter.text`

两张旧十块对折在信纸里。纸薄，背面的蓝字透了过来。大一那年，小俞周末回村，谁家有东西要捎到学校，都去找他。

`family.motherInk`

明，小俞把钱给我了。药钱我留好了，这二十你拿去买饭票。你那件蓝秋衣还没干，下礼拜再给你带。
宿舍那张相片收到了。你爸拿去给你姑看了。
妈　九月二十一

`courtyardmap.yard_gate.title`

通往归路的院门

`courtyardmap.yard_gate.text`

一根旧铜索从厨房桌下穿过檐廊，接在院门门闩上。门外是一条没有灯的山路。

### 山路接驳站

`courtyardmap.bus_notice.title`

路口的接驳通知

`courtyardmap.bus_notice.location`

归路

`courtyardmap.bus_notice.text`

临时接驳通知

山路塌方，末班车改走石桥。本站只停往县城方向的车。夜间候车，请把反光牌转向石桥。

`courtyardmap.stop_signal.title`

候车棚的反光信号杆

`courtyardmap.stop_signal.text`

杆上装着一块能转向的反光牌。司机在弯道看见亮面，就知道这里有人等车。

`courtyardmap.road_exit.title`

山路接驳站

`courtyardmap.road_exit.text`

护栏在候车棚前留了个缺口。往左看，刚好能看见石桥那头来车。

## 西厢、储物间与守夜用品

`westroom.west_room.title`

父母卧房

`westroom.workshop.title`

柜后修理间

`westroom.site.west_room`

西厢卧房

`westroom.wardrobe`

靠墙的大衣柜

`westroom.wardrobe.2`

柜脚下有两条滑轨，顺着墙一直通到床尾。把手上缠着一截旧毛巾。

`westroom.wedding_photo`

银婚合影

`westroom.wedding_photo.2`

两个人挤在照相馆的小凳上。相框底下的小牌上印着「2011.06　结婚二十五周年」。背面写着他俩的名字。

`westroom.wedding_chest`

床尾的樟木箱

`westroom.wedding_chest.2`

母亲收衣裳的箱子。四位数字锁旁压着半张红双喜。小时候她叫我来拿棉被，教过我一遍：「转到我跟你爸结婚那年。」

`westroom.brass_weight`

拆开的旧台秤

`westroom.brass_weight.2`

父亲把坏秤拆了一半。布包里有一枚磨亮的铜砣，底面打着「灶间」两个冲印字。

`westroom.matchbox`

铁皮火柴盒

`westroom.matchbox.2`

火柴装在密封铁盒里。揭开盖，硫磺头还是干的。

`westroom.rice_bowl`

灶上的铁锅

`westroom.rice_bowl.2`

锅里搁着只蓝边碗，碗沿缺了一小块。以前吃饭，妈用的就是这只。

`westroom.leak_basin`

接漏的搪瓷盆

`westroom.leak_basin.2`

屋梁漏水。每滴一下，盆就响一声。盆沿上搭着块抹布。以前妈睡不着，就把它垫在盆底。

`westroom.west-sign`

西 厢

`westroom.wedding-date`

结婚二十五周年　2011年6月

`westroom.chest-lock`

囍

## 阁楼与地下储水间

`storeys.attic.title`

阁楼

`storeys.cellar.title`

地下储水间

`storeys.title`

楼梯

`storeys.addsite.workshop`

修理间

`storeys.text`

地下室的铁门

`storeys.text.2`

门缝底下往外渗水。掉了漆的门牌上还能认出「储水间」三个字。

`storeys.text.3`

梁上的晾篮

`storeys.text.4`

梁上吊着一篮纸元宝，篮底摸着还是干的。绳头缠在墙钉上，伸手就够得着。

`storeys.text.5`

排水沟的滤网

`storeys.text.6`

树叶和旧棉纱糊住滤网。泵的吸水管就接在下面。

`storeys.text.7`

手压抽水泵

`storeys.text.8`

地窖里积了水，水槽也看不见底。墙边那台手摇泵的出水管一直伸到窗外。我试了下，手柄还能动。

`storeys.text.9`

水槽里的铜钥匙

`storeys.text.10`

水退了。白瓷槽底躺着把钥匙，柄上压着一朵梅花。

## 学校、医院、事故现场与证词

`memorymap.school.title`

录取那年

`memorymap.hospital.title`

病历之前

`memorymap.crash.title`

雨夜归途

`memorymap.calls.title`

通话记录

`memorymap.calls.lines`

今夜

`memorymap.calls.lines.2`

21:12

`memorymap.calls.lines.3`

呼出 → 旧宅

`memorymap.calls.lines.4`

未接通

`memorymap.calls.text`

旧宅　呼出　21:12　未接通

`memorymap.recording.title`

本地录音资料

`memorymap.recording.lines`

本地录音

`memorymap.recording.lines.2`

母亲

`memorymap.recording.lines.3`

2016.07.14

`memorymap.recording.lines.4`

录音文字

`memorymap.recording.lines.5`

开到石桥就给家响一声。

`memorymap.recording.lines.6`

我好下面。

`memorymap.recording.lines.7`

……老李，按哪儿停啊？

`memorymap.recording.text`

屏幕停在本地录音：「母亲，二〇一六年七月十四日。」

「明，下回开到石桥就给家响一声，我好下面。上次你说快到了，我把面都煮烂了。……老李，按哪儿停啊？」

### 学校文书

`memorymap.school_notice.title`

录取通知

`memorymap.school_notice.title.2`

正面 · 录取专业与日期

`school.college`

省铁路职业学院

`memorymap.school_notice.lines`

李明　铁道车辆专业

`memorymap.school_notice.lines.2`

二〇一四年七月十日

`memorymap.school_notice.text`

二〇一四年七月十日。省铁路职业学院寄给我的录取通知，专业是铁道车辆。

`memorymap.school_notice.title.3`

背面 · 写给自己的话

`memorymap.school_notice.lines.3`

九月一日到校。

`memorymap.school_notice.lines.4`

六点四十，第一班车。

`memorymap.school_notice.lines.5`

一张票。

`memorymap.school_notice.text.2`

背面是我查的车次：「九月一日到校。六点四十，第一班车。一张票。」我用拇指擦了擦，铅笔字还会蹭掉。

`memorymap.school_draft.title`

撕开的志愿草表

`memorymap.school_draft.title.2`

正面 · 第一志愿

`memorymap.school_draft.lines`

毕业班志愿填报草表

`memorymap.school_draft.lines.2`

考生姓名　李明

`memorymap.school_draft.lines.3`

第一志愿

`memorymap.school_draft.lines.4`

省铁路职业学院

`memorymap.school_draft.lines.5`

铁道车辆

`memorymap.school_draft.text`

第一志愿：省铁路职业学院，铁道车辆。「车」字的末笔拖得长，是我的铅笔字。格子外面挤着一行蓝字：「县里的机修班也招人。」是爸那支总漏墨的圆珠笔。

`memorymap.school_draft.title.3`

背面 · 旧胶带印

`memorymap.school_draft.text.2`

背面有一道发黄的胶印，两头都沾着纸毛。我把指腹搁上去，想起自己在教室门口问同桌借胶带。爸撕了草表，我把两半揣进书包，第二天还得照着抄学校代码。

交正式表那天，班主任指着第一栏问：「院校代码核过了？」我从书包里摸出粘好的草表，把那几位数挨个对了一遍。

`postcard.title`

寄回家的明信片

`postcard.photoTitle`

正面 · 宿舍楼

`postcard.photo`

照片拍的是我们宿舍楼。我拿蓝笔在二楼画了个圈，正好套住我们那扇窗。

`postcard.backTitle`

背面 · 寄给爸妈

`postcard.postmark`

2014.09.02

`postcard.address`

槐树巷十四号

`postcard.to`

爸、妈收

`postcard.greeting`

爸，妈：

`postcard.window`

我把住的那间圈出来了。

`postcard.bedding`

爸捆被子的绳别找了，

`postcard.line`

我留着晾毛巾。

`postcard.from`

明

`postcard.caption`

省铁路职业学院　学生宿舍

`postcard.postage`

中国邮政　80分

`postcard.quote`

邮戳：二〇一四年九月二日。

`postcard.message`

邮戳：二〇一四年九月二日。寄往槐树巷十四号。卡片底边印着「省铁路职业学院　学生宿舍」。

爸，妈：
我把住的那间圈出来了。爸捆被子的绳别找了，我留着晾毛巾。
明

### 医院文书

`hospital.year`

二〇一四年

`memorymap.hospital_record.title`

初诊病历

`memorymap.hospital_record.title.2`

正面 · 初诊日期

`memorymap.hospital_record.lines`

二〇一二年

`memorymap.hospital_record.lines.2`

八月二十三日

`memorymap.hospital_record.text`

初诊日期：二〇一二年八月二十三日。

`memorymap.hospital_record.title.3`

背面 · 后续记录

`memorymap.hospital_record.lines.3`

后续记录

`memorymap.hospital_record.lines.4`

反复检查

`memorymap.hospital_record.lines.5`

长期用药

`memorymap.hospital_record.text.2`

后续栏里是反复检查与长期用药的记录。那时候，你还没有铁路职院签发录取通知，更没有离家。

`memorymap.hospital_plan.title`

复诊安排

`memorymap.hospital_plan.title.2`

正面 · 日期与本人签字

`memorymap.hospital_plan.lines`

八月二十日

`memorymap.hospital_plan.lines.2`

患者本人签字

`memorymap.hospital_plan.signature`

母

`memorymap.hospital_plan.text`

二〇一四年八月二十日。

患者签字是母亲的名字。

`memorymap.hospital_plan.title.3`

背面 · 复诊与代取药安排

`memorymap.hospital_plan.lines.3`

九月起本人按月复诊。

`memorymap.hospital_plan.lines.4`

代取药联系人：

`memorymap.hospital_plan.lines.5`

周福生（邻居）。

`memorymap.hospital_plan.lines.6`

联系电话见挂号页。

`memorymap.hospital_plan.text.2`

「九月起本人按月复诊。代取药联系人：周福生（邻居）。联系电话见挂号页。」

周字写小了些，刚好挤进联系人那一格。

`memorymap.school.title.2`

李明最后去了哪所学校

`memorymap.school.choices`

我收了录取通知，后来还是去了县里的机修班。

`memorymap.school.choices.2`

我去了铁路职院报到。临走前，爸帮我捆了被子。

`memorymap.school.choices.3`

九月那张明信片是爸从学校寄给我的。

`memorymap.notice.title`

收到录取通知

`memorymap.notice.quote`

二〇一四年七月十日。

`memorymap.receipt.title`

我从学校寄出明信片

`memorymap.rules.title`

毕业班的交表通知

`memorymap.rules.quote`

「交表前核对院校、专业代码。草表自己留。」

`memorymap.school.conclusion`

那床被子比我的包还宽。出门前爸叫我把膝盖压上去，他在底下绕绳，两头各留了一个提手。到了宿舍，我跟对铺借了把剪刀，剪开一头。剩下那截刚够从床头拉到床尾。

`school.legacyConclusion`

爸撕过我的草表。后来他在回执背面给我留了言，说去学校的车钱放在缝纫机的抽屉里。

`memorymap.hospital.title.2`

初诊与复诊记录能确认什么

`memorymap.hospital.choices`

初诊在二〇一四年，复诊安排由你代签

`memorymap.hospital.choices.2`

二〇一二年初诊；二〇一四年母亲签复诊，邻居可代取药

`memorymap.hospital.choices.3`

初诊在二〇一二年，但复诊安排没有患者签字

`memorymap.diagnosis.title`

初诊记录

`memorymap.plan.title`

母亲签字安排复诊

`memorymap.plan.quote`

二〇一四年八月二十日。…患者签字是母亲的名字。

`memorymap.clock.title`

候诊室的钟面

`memorymap.clock.quote`

墙钟指着四点二十。

`memorymap.hospital.conclusion`

初诊写着二〇一二年，复诊安排写着二〇一四年。我离家上学前，妈已经在看病。九月的复诊她自己签了字，代取药那一栏填的是邻居老周。

`memorymap.crash.title.2`

手机与交接单记录了什么

`memorymap.crash.choices`

手机保存的是二〇一六年录音，今夜呼出未接，交接单记录仍有呼吸

`memorymap.crash.choices.2`

母亲今夜二十一时十二分打来电话，接着发生了事故

`memorymap.crash.choices.3`

交接单宣告死亡，手机录音是在本次事故后收到的

`memorymap.handover.title`

今夜的救护交接

`memorymap.handover.quote`

二〇二六年七月十四日，二十一时十八分。

`memorymap.call.title`

给旧宅拨出的电话

`memorymap.voice.title`

手机保存的母亲语音

`memorymap.voice.quote`

屏幕停在本地录音：「母亲，二〇一六年七月十四日。」

`memorymap.crash.conclusion`

都十年了，「旧宅」还在我的通讯录里。妈说过，到石桥响一声她就下面。今晚九点十二，是我拨过去的。

六分钟后，救护的人在单子上写了我的名字。底下那句「呼名睁眼一次」，我一点印象也没有。

`memorymap.text`

回到厨房的门

`memorymap.text.2`

门后仍是那间亮着灯的厨房。可以先回去，也可以继续观察。

`memorymap.school`

课桌上的录取通知

`memorymap.school.2`

前排课桌上的两半草表

`memorymap.school.3`

课桌上的宿舍明信片

`memorymap.school.5`

黑板上的交表通知

`memorymap.school.6`

「交表前核对院校、专业代码。草表自己留。」

黑板上列了六个组号。收到哪一组，班长就擦掉一个。

`memorymap.hospital`

初诊日期：二〇一二年八月二十三日。

后续栏里是反复检查与长期用药的记录。那时候，你还没有收到录取通知，更没有离家。

`memorymap.hospital.2`

母亲签过字的复诊安排

`memorymap.hospital.3`

二〇一四年八月二十日。

「九月起本人按月复诊。代取药联系人：周福生（邻居）。联系电话见挂号页。」

患者签字是母亲的名字。周字写小了些，刚好挤进联系人那一格。

`memorymap.hospital.4`

候诊室的钟

`memorymap.hospital.5`

墙钟指着四点二十。钟面没有日期。

「明，你帮我把糖盒递过来。」妈指了指隔壁椅子。我这才低头。

`memorymap.hospital.6`

候诊椅上的糖盒

`memorymap.hospital.7`

盒里有两摞一块钱的硬币，每摞五枚，中间隔着一片折起的糖纸。

我记得那天在窗口，护士问下个月约几点。妈问：「村里的头班车八点才进城。能给我留个九点的号吗？」

我伸手想把散钱一起收起来。她拦了我一下：「分开，右边是回去的。」

`memorymap.crash`

驾驶座窗边的安全带

`memorymap.crash.2`

车尾的牌照还能看清，末四位七三一六。是我的车。半截安全带搭在驾驶座的窗沿上，我顺着往里看，另一头还插在座位旁的卡扣里。带子从中间剪开了。

`memorymap.crash.3`

缺角的石桥栏柱

`memorymap.crash.4`

车灯照过来，桥柱顶上缺了一角。跟厨房相册里那张一个样。那天我骑到桥那头才回头。爸站在这根柱子旁边，正两手撑着膝盖喘气。

`memorymap.crash.5`

救护交接单

`memorymap.crash.6`

二〇二六年七月十四日，二十一时十八分。

地点：石桥弯道。伤者：李明（据驾驶证）。发现于驾驶位，有自主呼吸。呼名睁眼一次，未应答。

物品登记：驾驶证一本、手机一部（屏裂），同袋。接收人：________

`memorymap.crash.7`

物品袋里的手机

`memorymap.crash.8`

回到厨房的旧影

`memorymap.crash.9`

身后的雨幕里，厨房那盏灯仍在。可以先回去核对其他记录。

`memorymap.crash.10`

担架旁的声音

`memorymap.crash.11`

「李明？能听见我吗？」有人在叫我，离得很近。

我正想应，妈也叫了我一声：「明儿！」

`memorymap.memory_album.title`

柜边旧相册

`memorymap.memory_album.text`

相册有三处折角：录取那年、病历之前、雨夜归途。

你可以主动翻入一段记忆，也可以先把相册合上。

## 家中物件、供饭、守夜和棺锁

`chapter-ui.equipment.envelope`

出门前我把信揣在外套内袋。外面的牛皮纸信封有一角折皱了。

`chapter-ui.equipment.lunchbox`

两格饭盒

`chapter-ui.equipment.lunchbox.2`

下班时在食堂打的饭。底下一格是米饭，上面是豆角烧肉。我赶着开车，还没吃。

`chapter-ui.equipment.key`

钥匙

`chapter-ui.equipment.key.2`

值班室寄存的六号铜钥匙，开李家的前门。

`chapter-ui.equipment.heightstrip`

扣眼里沾着铁锈。布带卷起来，刚好能握在手里。

`chapter-ui.equipment.lamp`

提把上缠着红鞋带的煤油灯。

`chapter-ui.equipment.weight`

铜秤砣

`chapter-ui.equipment.weight.2`

底面打着「灶间」二字，能放回量水秤左侧的凹槽。

`chapter-ui.equipment.matches`

火柴盒

`chapter-ui.equipment.matches.2`

从修理间取出的铁盒，里面的火柴还很干。

`chapter-ui.equipment.rice`

供饭

`chapter-ui.equipment.rice.2`

我从饭盒里盛出来的。蓝边碗靠拇指的地方有个豁口。

`chapter-ui.equipment.paper`

纸元宝

`chapter-ui.equipment.paper.2`

从阁楼晾篮里取下的一包纸元宝。

`chapter-ui.equipment.cellarkey`

地下室钥匙

`chapter-ui.equipment.cellarkey.2`

木牌上刻着小水桶，开修理间通往地下室的铁门。

`chapter-ui.equipment.coffinkey`

梅花铜钥匙

`chapter-ui.equipment.coffinkey.2`

在地下水槽找回的钥匙，柄上冲着一朵梅花。

`chapter-ui.equipment.familyletter`

写着班级的家书

`chapter-ui.equipment.familyletter.2`

从秤桌里收起的一封家书和一张预约凭条。

`chapter-ui.equipment.roadphoto`

石桥旧照

`chapter-ui.equipment.roadphoto.2`

李明第一次自己骑过石桥时，母亲在桥头拍下的相片。

`chapter-ui.equipment.uniform`

棺里叠着的蓝校服，衣领内侧缝着李明的名字。

`chapter-ui.household`

返回

`chapter-ui.household.2`

柜后的门洞

`chapter-ui.household.3`

柜子已经挪到轨道尽头，里面是父亲的修理间。

`chapter-ui.household.4`

往床头推

`chapter-ui.household.5`

柜子抵住了墙

`chapter-ui.household.6`

这头的轨道到头了。另一边有一段发亮的滑轨。

`chapter-ui.household.7`

换一边试试

`chapter-ui.household.8`

沿滑轨推向床尾

`chapter-ui.household.9`

打开的樟木箱

`chapter-ui.household.10`

箱底只剩一小截麻绳。

`chapter-ui.household.11`

衣服底下压着把钥匙，木牌上刻着储水间的小水桶。

`chapter-ui.household.12`

拿走地下室钥匙

`chapter-ui.unlock`

锁扣没松。锁旁的双喜已经磨白了。

`chapter-ui.household.13`

拨开锁扣

`chapter-ui.household.14`

四位年份

`chapter-ui.household.15`

结婚年份

`chapter-ui.household.16`

松开绳结，放下晾篮

`chapter-ui.household.17`

放下的晾篮

`chapter-ui.household.18`

篮底剩下一段扎纸用的棉线。

`chapter-ui.household.19`

掀开盖布，里面躺着一包干燥的纸元宝。

`chapter-ui.household.20`

拿走纸元宝

`chapter-ui.household.21`

铁门敞着。楼梯一直向下，墙上有积水退过的印子。

`chapter-ui.household.22`

木牌上的水桶对上了。钥匙转得动。

`chapter-ui.household.23`

铁门锁着。家里的备用钥匙一直由母亲收在卧房。

`chapter-ui.household.24`

打开地下室

`chapter-ui.household.25`

滤网露了出来，水现在能流到泵里。

`chapter-ui.household.26`

提起棉纱，清掉树叶

`chapter-ui.household.27`

管口滴着水，瓷槽已经见底。

`chapter-ui.household.28`

压动手柄

`chapter-ui.household.29`

泵打不上水

`chapter-ui.household.30`

手柄压下去没什么阻力。顺着管子看过去，水槽那头的滤网全堵死了。

`chapter-ui.household.31`

水槽见底了

`chapter-ui.household.32`

最后一股水从墙外流走。槽底磕了一声，有件铜东西露了出来。

`chapter-ui.household.33`

白瓷上只剩一小块锈印。

`chapter-ui.household.34`

拿走梅花铜钥匙

`chapter-ui.household.35`

抹布摊在盆底，滴下来的水把布洇深了一块。

`chapter-ui.household.36`

把抹布搭回盆沿

`chapter-ui.household.37`

把抹布垫进盆底

`chapter-ui.household.38`

竹条上留着圈碗印。蓝边碗已经端到正厅去了。

`chapter-ui.household.39`

碗已经端在手上。锅底只剩一圈水垢。

`chapter-ui.household.40`

竹箅子上的空碗

`chapter-ui.household.41`



我把饭盒的搭扣掰开。小时候供饭上有块肉，我偷吃过一次。第二年妈切了两块，等着我呢。

`chapter-ui.household.42`

从饭盒里盛半碗白饭

`chapter-ui.household.43`

盛饭，再夹一块烧肉

`chapter-ui.household.44`

先留着空碗

`chapter-ui.household.45`

盛好的供饭

`chapter-ui.household.46`

肉放在了饭尖上，汤汁顺着饭粒慢慢往下渗。

`chapter-ui.household.47`

半碗白饭盛好了。

`chapter-ui.household.48`

敞着的饭盒搁在灶沿上。

`chapter-ui.household.49`

收好饭盒，端走供饭

`chapter-ui.household.50`

先放在锅里

`chapter-ui.household.51`

原来放东西的地方已经空了。

`chapter-ui.household.52`

拿走〔1〕

`chapter-ui.household.53`

摆饭

`chapter-ui.household.54`

点香

`chapter-ui.household.55`

烧纸

`chapter-ui.household.56`

妈那双筷子还搁在供桌上。以前每年十四，爸从厨房端饭，她点香，我蹲在盆边替他们烧纸。我今天带了晚饭，能给她盛一碗。

`chapter-ui.household.57`

蓝边碗里盛着白饭，肉放在了饭尖上。

`chapter-ui.household.58`

半碗白饭摆在妈那双筷子旁边。

`chapter-ui.household.59`

炉里还有三根没点的香。

`chapter-ui.household.60`

炉里的三炷香都点着了。

`chapter-ui.household.61`

盆里剩下一层新灰，还看得出纸元宝的折角。

`chapter-ui.household.rice`

晚饭带来了。灶间的锅里，妈以前总搁着一只碗。

`chapter-ui.household.matches`

父亲修东西时，总在工作台上放一盒火柴。

`chapter-ui.household.paper`

母亲怕纸返潮，一直把它搁在阁楼梁下。楼梯在父母卧房里。

`chapter-ui.household.62`

手停了下来

`chapter-ui.household.63`

桌上空着，香炉前还有个碗印。

`chapter-ui.household.64`

搪瓷盆旁的香还没点，先把手上的纸收好。

`chapter-ui.household.65`

再看供桌

`chapter-ui.household.66`

手里少了东西

`chapter-ui.household.67`

正厅守夜

`vigil.candle`

借供烛点香

`vigil.matches`

用火柴点香

`vigil.supper`

我把筷子往碗边挪了一点。「妈，吃饭了。」

我在桌边站了一会儿，等盆里最后一点火星灭了才走。

`coffin.seamTitle`

棺盖夹着的蓝布

`coffin.touch`

轻轻拉一下布角

`coffin.caught`

布角上有两道白杠。我捏住往外抽了一点，盖底下跟着响了一声。我松了手，再拉怕要扯破。

`coffin.lookAgain`

看看棺盖

`coffin.moveCords`

把盖上的三根红绳拨到地上

`chapter-ui.household.68`

棺盖底下

`chapter-ui.household.69`

棺底的黄布兜敞着口。伸手进去，底下只剩一层粗布。

`chapter-ui.household.70`

棺底搁着一个黄布兜，提手倒向两边。里面露出一件蓝外套，两道白条一直通到袖口。衣领折在下面。

`chapter-ui.household.71`

再看旧校服

`chapter-ui.household.72`

拿起校服，翻开衣领

`chapter-ui.household.73`

棺锁还扣着

`chapter-ui.household.74`

盖边扣着把铜锁，锁孔是梅花形的。爸以前把备用钥匙都挂在地下室水槽边。

`chapter-ui.household.75`

松动的棺盖

`chapter-ui.household.76`

我拿出在水槽里捡的钥匙，齿正好对得上。

`chapter-ui.household.77`

盖边只剩一个旧搭扣，用手就能掀开。

`chapter-ui.household.78`

推开棺盖

`chapter-ui.household.79`

门闩那头的绳子已经掉了，剩下这头还搭在盖板上。一角蓝布压在底下。

## 背包、村口对话、实物调查、过场与四种结局

`main.explorationmap.onread`

回到地图

`main.inputguide`

WASD 或方向键移动，鼠标转头。连按两次 W 并按住第二下疾跑，也可以按住 Shift。空格跳跃。

靠近物品，按 E 或用鼠标左键查看。再按 E 或点击空白处返回。B 打开背包，H 查看提示，J 打开手记，M 查看地图，Esc 暂停。

触屏：左下方向键移动，连点两次「前」并按住可跑，点「跳」跨障碍；拖动画面转头，点物品调查。

`main.updateloadstatus`

部分场景资源未载入：〔1〕。画面可能不完整，请检查本地文件。

`main.updateloadstatus.2`

进度会自动保存 · 可随时暂停

`main.updateloadstatus.3`

此浏览器暂不支持保存，可在当前页面游玩

`main.updatestatus`

松开手掌 [F]

`main.updatestatus.2`

拢住灯火 [F]

`main.updatestatus.3`

继续〔1〕

`main.updatestatus.4`

继续余温

`main.updatestatus.5`

继续归门

`main.updatestatus.6`

开始游戏

`main.updatestatus.7`

序

`main.updatestatus.8`

村 口

`main.updatestatus.9`

继续村口进度

`main.updatestatus.10`

忆

`main.updatestatus.11`

贰

`main.updatestatus.12`

壹

`main.updatestatus.13`

余 温

`main.updatestatus.14`

归 门

`main.titlesettings`

游玩设置

`main.titlesettings.2`

先把视角和声音调到舒服的程度。设置即时生效。

`main.titlesettings.3`

返回标题

`main.titlesettings.4`

回煞 · 游玩设置

`main.open`

旧宅 · 观察记录

`main.progresssignature`

”已加入道具

`main.progresssignature.2`

手记已更新：“

`main.pocketletter`

回到背包

`main.pocketletter.2`

收好来信

`main.showbridgephoto`

收好照片

### 旧校服的袖口和内袋

`main.inspectuniform`

右边内袋比左边沉。

`main.inspectuniform.2`

右边内袋里只剩一点纸屑。

`main.inspectuniform.3`

翻回衣领

`main.inspectuniform.4`

收好校服

`main.inspectuniform.5`

摸一摸右边内袋

`main.inspectuniform.6`

展开左袖

`main.lookatheightstrip`

我把布卷摊在手上。几道黑线都朝着我，最上面那道的旁边，还露了一小截红线头。

`main.lookatheightstrip.2`

翻看布背

`main.lookatheightstrip.3`

翻回正面

`main.lookatheightstrip.4`

卷起来

`main.backpack`

半碗白饭上搁着一块烧肉。蓝边碗的缺口在拇指旁边。

`main.backpack.2`

白饭已经分出半碗，饭格里露出一小块不锈钢底。另一格的豆角还浸在肉汤里。

`main.backpack.3`

返回探索

`main.backpack.4`

随身背包

`main.backpack.5`

背包

`main.backpack.6`

包里暂时没有东西。

`main.backpack.7`

收起背包

`main.backpack.8`

随身物品

`main.presentrecord.text`

李家这一行还空着。

`main.presentrecord.text.2`

东街六号那一行，是我刚签的名字。

`main.presentrecord.text.3`

铜索已经脱开，门闩缩回了门板上。

`main.journal`

随身手记

`main.journal.2`

需要一点提示

`main.journal.3`

只收录你亲眼见到的内容

`main.readrecord`

打开手记

`main.showmap.exitlabel`

继续探索

`main.album`

最后一页夹好那张学车照了。桥柱缺的那一角，跟今晚在车灯里看见的一样。

`main.album.2`

录取通知和复诊单各占一页。最后一页只剩四个相角，右下角翘起，露出一小块颜色浅些的纸。

`main.album.3`

把石桥旧照放进相角

`main.album.4`

翻看空着的最后一页

`main.album.5`

翻入记忆 · 〔1〕

`main.album.6`

合上相册，继续观察

`main.album.7`

回煞 · 厨房相册

`main.album.8`

父亲在石桥边松开自行车后座

`main.entermemory`

我刚收起的校服里，有一边口袋沉甸甸的。

`main.entermemory.2`

我记得这张。妈给我洗校服那天，我怕她把照片一起洗了，一路跑回家去掏口袋。

`main.entermemory.3`

缺了一张照片

`main.entermemory.4`

回到相册

`main.guidance`

查看提示

`main.guidance.2`

解谜答案 · 按需查看

`main.guidance.3`

探索提示 · 按需查看

`main.inspectionlabel.water`

回到量水桌

`main.inspectionlabel.portrait`

回到相框

`main.inspectionlabel.phone`

回到手机

`main.inspectionlabel.document`

回到纸张

`main.inspectionlabel`

回到字轮

`main.updateobjectreading`

放大阅读

`main.updateobjectreading.2`

整理这段记忆

`main.updatedocument`

转回正面

`main.updatedocument.2`

翻到背面

`main.updatedocument.3`

拖动错开的半张纸，对齐撕口后松手，也可以用下方按钮合上。

`main.updatedocument.4`

〔1〕 · 〔2〕。可以主动阅读，或翻到另一面。

`main.updatedocument.5`

已记入手记

`main.updatedocument.6`

尚未记下

`main.updatedocument.7`

等纸张转到眼前，再阅读这一面。可以拖动纸张调整角度。

`main.updatephone`

分别查看通话与本地录音资料，再把当前页记入手记。

`main.updatephone.2`

〔1〕〔2〕。切换页面不会自动记入或提交推理。

`main.updatephone.3`

 · 已记入手记

`main.updatephone.4`

 · 尚未记下

`main.crash_phone.title`

手机 · 〔1〕

`main.updateportrait`

黑布搭在上沿。可以先揭开，再拿近看看。

`main.updateportrait.2`

背面的字迹转到了眼前。可以主动阅读并记入手记。

`main.updateportrait.3`

正面是母亲的旧照片。按住画面拖动，或翻到背面查看。

`main.updatelock`

当前：〔1〕

`main.updatelock.2`

〔1〕轮，当前〔2〕，按动转过一格

`main.updatelock.3`

左

`main.updatelock.4`

中

`main.updatelock.5`

右

`main.lock`

门闩已松开

`main.lock.2`

三根红绳垂下来。门外透进雨后的天光。

`main.lock.3`

回到门前

`main.lock.4`

贴近一照，闩底露出个铜丝圈。我小时候踮着脚，刚好够得着它。

`main.lock.5`

每次转动一格。可以回查已读字迹，再压下门闩。

`main.updatewater`

 / 3 升

`main.updatewater.2`

 / 5 升

`main.updatewater.3`

倒入三升桶

`main.updatewater.4`

倒入五升桶

`main.water`

秤盘已经压平，桌下的抽屉打开了。退回桌前，可以低头查看家书。

`main.water.2`

选一只桶再操作。上秤用五升桶。

### 量水操作与反馈

`main.wateraction`

已选〔1〕升桶。

`main.wateraction.2`

五

`main.wateraction.3`

三

`main.wateraction.4`

已从水缸添满选中的桶。

`main.wateraction.5`

这个桶已经满了。

`main.wateraction.6`

水倒进了槽里，桶空了。

`main.wateraction.7`

这个桶已经是空的。

`main.wateraction.8`

向另一桶倒入 〔1〕 升水。

`main.wateraction.9`

倒不进去：选中的桶是空的，或另一桶已经满了。

`main.wateraction.10`

称量中……

### 下山与结局

`main.busending`

上车时我摸了摸内袋。妈叫我回来吃饭的信在，塞着两张十块钱的那封还在灶间抽屉里。我问司机明天还跑不跑石桥。

「跑。还是这个点。」我记下时间，往后排走。

`main.busending.2`

司机把车停在候车棚跟前，开了前门。「去县城？」我点点头，上车找了个靠窗的位子。

车开上石桥时，我回头看了一眼。村口值班室的灯还亮着。

`main.busending.3`

车一颠，布带掉在过道上。旁边的阿姨弯腰替我捡起来。「尺啊？」

「小时候量个子用的。」她指着那两道线问，是不是还有个妹妹。我摇头：「矮一点的那个，是我妈。」

`main.busending.4`

布卷从外套口袋里滑出来一截。我往里塞了塞，把口袋上的扣子扣好。

`main.busending.5`

到了县城，我给周叔发了条短信：「钥匙还在我这儿。明早我回去取车，给您放窗口？」

「我七点就交班了，给接班的老郑就行。」第二天取车，我去窗口找了老郑，看他在登记簿上划掉了我的名字。

`main.busending.6`

结局 · 归路

`main.ending`

我捏了两下。那只手还握着我。

「车上还有别人吗？」

我张了张嘴，第二回才出了声：「就我一个。」

结局 · 破茧

`main.ending.2`

妈把锅里最后几根面拨进我碗里。「这回软硬行吗？」

我嘴里含着面，点了点头。门外还有人在喊我的名字。妈把醋瓶推到我手边。

结局 · 回煞

`main.ending.3`

我往锅里添了水，划根火柴点着引火纸，把饭盒架在竹箅子上。等菜热透了，我就着饭盒吃。第一口着急，烫了舌头。

`main.ending.4`

我搬过灶边的小板凳，把饭盒搁在膝盖上。豆角还有一点咸汤，我拿勺子把汤拌进饭里。

`main.ending.5`

盆里的水快满了。我搁下筷子，把水泼到门外，进屋接着吃。

`main.ending.6`

搪瓷盆又响了。我端着饭坐到门槛上，里头总算轻一点。

`main.ending.7`



结局 · 余温

`main.ending.8`

我先点着灶膛，把饭盒放上竹箅子。

`main.ending.9`

我把晚饭吃了，把空饭盒扣在手边。

`main.ending.10`

搓到最后一颗扣子，锅里的盒盖开始响。我一只手提着湿袖口，一只手垫着布，把晚饭端了出来。

`main.ending.11`

搓到最后一颗扣子，肥皂滑进了盆底。我伸手摸出来，把袖口晾到了门口的竹竿上。

`main.ending.12`

校服的左袖还摊在我腿上。水池边有块用薄了的肥皂，我接了半盆水，把那三颗扣子解开，只把袖口浸进去。



`main.ending.13`

我踩下踏板。爸松了手，在后头跟了两步就跑不动了。我回过头来，妈才把相机举稳。

「这回拍到没有？」她拿指甲拨了一下过片轮，笑我：「哪有人骑车还顾着看镜头的。」桥那头喊我名字的人又等了一会儿。我扶正车把，骑回去替她拿相机套。

结局 · 回煞

`main.ending.stay`

余温

`main.ending.wake`

破茧

`main.ending.remember`

回煞

`main.ending.14`

留在现场回看

`main.ending.15`

回煞 · 你的选择

### 村口登记和值班室对话

`clerk.returnKey`

把六号钥匙还给周叔

`clerk.borrowKey`

再借一下六号钥匙

`clerk.returned`

我把钥匙放在窗台上。老周在我签名旁边写了个「还」，把它挂回六号钩。「这下木工来了能拿。你要用再找我。」

`clerk.borrowed`

老周摘下六号钥匙，把本子转过来。我在下一行又签了一次名。

`clerk.keyLogged`

东街六号　李明　已还

`clerk.onHook`

六号钥匙挂回了中间的钩子，铜牌朝外。

`clerk.talk`

找周师傅

`clerk.busThanks`

到了县城，我给周叔发了条短信：「叔，我到了。谢谢您把信寄给我。」

`workorder.bringKey`

第二天回村取车，我顺路把六号钥匙还到窗口。接班的人翻到昨天那页，让我在名字后面写了个「还」。

`workorder.title`

东街六号的修屋回执

`workorder.face`

东街六号　值班室留存联
走廊西墙返潮，拆旧护墙板，更换底下两根木条。
住户签字：李明　　三月二十八日

是我春天签的字，电话留的也是我现在的手机号。底边有一行新添的铅笔字：「下周二上午，钥匙到村口取。」

`workorder.read`

看窗口那张修屋回执

`workorder.tag`

东街六号　修屋回执
走廊西墙　下周二

`workorder.noteTag`

拆墙前先取布带
李明

`workorder.add`

给木工夹张便条

`workorder.remove`

把自己夹的便条抽走

`workorder.note`

回执上夹着我写的便条：「师傅，走廊墙上要是还挂着一条布带，麻烦先摘下来。换好板照旧挂回去。谢谢。李明」

`workorder.bus`

周二快到中午，老周发来一张照片。走廊那面墙换了新板，我那条布带也挂回去了。我给他回了句：「看见了，谢谢叔。」

`door.prompt`

E / 点击　〔1〕

`door.shut`

关门

`door.open`

开门

`clerk.noAddress`

「钥匙都在我这儿。你家从前是几号？新牌子我还没认全。」

`clerk.sayAddress`

报家里的旧门牌：槐树巷十四号

`clerk.showLetter`

把旧门牌指给老周看

`clerk.envelopeShown`

我把内封翻过来，指给他看。老周顺着我的手指念：「槐树巷十四号。」他把登记簿转了半圈，推到我面前。

`clerk.toWindow`

接过信，继续说

`clerk.repeatRoad`

「您再想想，真没别人？」

老周摇摇头。「从我这扇窗，只看得见停车那一截。弯道让树挡住了。」

`clerk.readSlip`

再看一眼寄件底单

`clerk.askRoad`

问刚才路上的人

`clerk.road`

「周叔，桥上刚才站着个人。您听见刹车声了吗？」

「没听见。」他把搪瓷杯放下。「我往外看的时候，你车已经停这儿了。你碰着没有？」

「我没事。我怕碰着人了。」

`clerk.checkBridge`

请周叔找人看看桥上

`clerk.bridgeCallTitle`

周叔打给接驳车司机的电话

`clerk.bridgeCall`

老周拿起桌上的听筒，拨了个号码。「老吴，车发了没？那正好。过石桥的时候帮我看一眼，有人说桥上站着个人。」

他挂了电话。「他马上发车。你要碰见一辆挂县城牌子的中巴，就是他的。」

`clerk.bridgePending`

「老吴还没回话。他要是开着车，就先别催了。」

`clerk.bridgeFollowUp`

问接驳车司机有回话没有

`clerk.bridgeArrived`

「这个点他该到候车棚了。去问开中巴的师傅，他刚好走石桥。」

`clerk.bridgeReported`

把司机看见的事告诉周叔

`clerk.bridgeReply`

「周叔，我来的时候在桥上急刹了一脚，以为碰着人了。刚问过司机，他过桥的时候没瞧见人。」

「那就好。你要是还怕，车就搁我这儿，明天再来开。」

`clerk.bridgeReplyAfterCall`

「周叔，我见着老吴了。他说他过桥的时候没看见人。」

老周点点头。「你那车放一晚没事。我明早交班的时候跟人说一声。」

`bus.bridgeAsk`

问司机过桥时看见了什么

`bus.bridgeTitle`

司机过石桥时看见的事

`bus.bridgeAsked`

「师傅，周叔给您打过电话。我就是问桥上那个人的。」

`bus.bridgeDirect`

「师傅，问您个事。您刚过石桥的时候，看见桥上有人吗？」

`bus.bridgeAnswer`

「我在桥头让了辆面包车。等它开过去，两边栏杆我都看得见。桥上没人。」

「我是早些时候过的桥。」

司机摇摇头。「那会儿我还没到。」

`bus.backToDoor`

回到车门口

`bus.collectCar`

我给朋友发了条语音：「明早能陪我再来趟村口吗？车还停在那儿。我今天不敢开了。」

`main.inspectvillage`

老周认出我来，把窗子又推开了些。「小明？过来，檐底下雨小。」

`main.inspectvillage.2`

「槐树巷十四号。现在挂的都是新牌子了，我把本子给你。」

`main.inspectvillage.3`

「找到了？报个号，我给你拿。」

`main.inspectvillage.4`

老周把登记簿收回窗里。「木工下周二才来。你慢慢收拾，走的时候把门带上。」

`main.inspectvillage.5`

老周把椅子转向窗口。「怎么，又落了什么？」

`clerk.workshop.ask`

问西厢那只大衣柜

`clerk.workshop.answer`

「叔，西厢那个柜子是谁推过去的？」

「你爸。屋里有锯子、有刨子，他怕你进去玩。底下装了轨道，你一个人就推得动。」

`main.inspectvillage.6`

这封信是谁寄的？

`main.inspectvillage.7`

柜子后面的信

`main.inspectvillage.8`

「叔，我昨天收到一封信。里面是我妈以前写给我的。您知道是谁寄的吗？」

「我寄的。柜子后头漏雨，挪开才看见。上头写的李明收，我就给你套了个大信封。」

「您还有我的地址？」

「春天你给我寄修屋回执，信封我还留着，照着抄的。喏，这是寄信的底单。」

`main.inspectvillage.9`

接过寄件底单

`main.inspectvillage.10`

还给周师傅

`main.inspectvillage.11`

告辞

`main.inspectvillage.12`

不用找了

`main.inspectvillage.13`

再问一句

`main.inspectvillage.14`

向周师傅领钥匙

`main.inspectvillage.15`

正厅那口棺是谁的？

`main.inspectvillage.16`

给周师傅看左袖

`main.inspectvillage.17`

拿出内袋里的信

`main.inspectvillage.18`

翻看登记簿

`main.inspectvillage.19`

中间的挂钩空了，九号和十六号还挂着。六号钥匙在我身上。

`main.inspectvillage.20`

拿到六号钥匙

`main.inspectvillage.21`

我在东街六号后面签了名。老周从架子上摘下钥匙：「插到底，再往回退一点。这锁年头长了。」

`main.inspectvillage.22`

收好钥匙

`main.inspectvillage.23`

钥匙牌对不上

`main.inspectvillage.24`

老周的手停在挂钩上。「这户不姓李。你再看一眼十四号那行？」

`main.inspectvillage.25`

重看登记簿

`main.inspectvillage.26`

再选一把

`main.inspectvillage.27`



老周把笔递给我：「你家现在是东街几号？」

`main.inspectvillage.28`

东街 〔1〕 号

`main.inspectvillage.29`



门脚多了道粉笔印。下周二木工要来拆墙板，我得看看那条量身高的布带还在不在。

`main.inspectvillage.30`

用六号钥匙开门

`main.inspectvillage.31`

返回路上

`main.inspectvillage.32`

前门已经打开。

`main.inspectvillage.33`

门还锁着。

### 井绳、布带和现场调查

`main.inspect`

背后的脚步近了。快离开院子。

`main.inspect.2`

松手

`main.inspect.3`

再拉一次井绳

`main.inspect.4`

把绳往井心带，拉开卡住的提梁

`main.inspect.5`

松手离开

`main.inspect.6`

布带取下来了。两颗钉子中间的木头颜色浅些。

`main.inspect.7`

把布带挂回去

`main.inspect.8`

继续带在身上

`main.inspect.text`



后门那头叮地响了一下。我把兜里的钥匙攥住，又听见一声。像是灶间传过来的。

`main.inspect.9`

从钉子上摘下，卷好带走

`main.inspect.10`

留在墙上

`main.inspect.11`

挂到门边的木钉上

`main.inspect.12`

翻看背面

`main.inspect.13`

比一比两处红印

`main.inspect.14`

再看一眼

`main.inspect.15`

量水秤

`main.inspect.16`

铜砣底下的圆榫和左盘的凹槽一样大。

`main.inspect.17`

左盘空着，指针顶死在一边。装铜砣的凹槽上沾着木屑。爸修东西的工作台在西厢。

`main.inspect.18`

装上铜砣

`main.inspect.19`

先不决定，继续观察

`main.inspect.20`

肩上突然一松。车窗边那个人说：「带子剪开了。慢点，先别动。」

`main.inspect.21`

我想睁眼，眼前晃过去一片白光。

`main.inspect.22`

车门外的人

`main.inspect.23`

有人握住我的手。「李明，听得到就捏我两下。」

`main.inspect.24`

捏他的手两下，醒来

`main.inspect.25`

再听母亲那边

`main.inspect.26`

石桥上的母亲

`main.inspect.27`

灶间的母亲

`main.inspect.28`

桥头的雨停了。妈眯着一只眼举起相机：「刚才那张怕是虚了，你再骑一趟。」爸弯着腰，手还扶在后座上。

`main.inspect.29`

筷子磕在锅沿上。妈一手捞着面，一手朝我摊开：「碗呢？快端过来，面该坨了。」那只缺了口的碗就在我手边。

`main.inspect.30`

踩下踏板，留在桥上

`main.inspect.31`

端起碗，留在灶间

`main.inspect.32`

回想灶间

`main.inspect.33`

回想石桥

`main.inspect.34`

再听车门外的人

`main.inspect.35`

听车门外的人说完

`main.inspect.36`

听母亲说完

`main.inspect.37`

离开秤桌

`main.inspect.38`

今晚留下，把晚饭热一热

`main.inspect.39`

今晚留下，在灶间吃晚饭

`main.inspect.40`

牌子已经转好。接驳车停在前面的站牌旁。

`main.inspect.41`

车来了

`main.inspect.42`

司机闪了两下灯，在前面的站牌旁停下。

`main.inspect.43`

去站牌

`main.inspect.44`

弯道那边没有回应

`main.inspect.45`

牌子朝着老宅。回去看路口的接驳通知，确认来车方向。

`main.inspect.46`

再转一次

`main.inspect.47`

转向老宅

`main.inspect.48`

转向石桥

`main.inspect.49`

车停稳了。司机拉开门，问你是不是去县城。

`main.inspect.50`

站牌旁还没有车。路口有张接驳通知，候车棚里有一根信号杆。

`main.inspect.51`

再看看旧宅

`main.inspect.52`

坐车下山

`main.inspect.53`

去候车棚

`main.inspect.54`

用供烛重新点灯

`main.inspect.55`

端起守夜灯

`main.inspect.56`

留在供桌上

`main.inspect.57`

走过门槛

`main.pause`

暂停

`main.pause.2`

查看地图

`main.pause.3`

回煞 · 暂停

`main.pause.4`

浏览器未允许保存。当前页面内可以继续，关闭页面后进度可能丢失。

`main.leavedrive`

下车

`main.leavedrive.2`

开始探索

`main.leavedrive.3`

回煞 · 村口

`main.text`

重新回家

`main.text.2`

重新开始会清除观察、字轮、量水、记忆推理和结局进度。

`main.text.3`

保留进度

`main.text.4`

确认重新开始

`main.text.5`

开始新的归门

`main.text.6`

门闩又落了回去。可以继续调整字轮，或回查字迹。

`main.text.7`

门闩松开了。你可以继续观察，也可以穿过门去。

`main.text.8`

黑布被提起来了。照片背后的话还要翻过去才看得见。

### 井边追逐的反馈

`main.words.run`

跑！右边亮门灯的是灶间。

`main.words.caught`

我摔在门槛上。院子里只剩雨声。

`main.words.safe`

我站住喘了口气。身后那阵急脚步也停了。

`well.seat.safeQuiet`

我贴着门边听了听。脚步声停在外头。

`main.onscaleevent`

对准四升。桌下的抽屉开了。

`main.onscaleevent.2`

指针偏〔1〕，当前 〔2〕 升。

`main.onscaleevent.3`

轻

`main.onscaleevent.4`

重

`main.headline.onframe`

甩开井里的东西

`main.text.9`

旧宅未能载入。请通过 StartGame.bat 启动，并检查浏览器是否支持 WebGL。〔1〕

`main.text.10`

载入失败

## 当前目标、按需提示与推理

`story.symbols`

雨

`story.symbols.2`

门

`story.symbols.3`

人

`story.symbols.4`

灯

`story.conclusionfor`



看到那两摞车钱，我才想起在窗口是妈自己问的：「能给我留个九点的号吗？」

`story.conclusionfor.2`



爸那行蓝字挤在格子外面。我填的第一志愿是铁道车辆。录取通知上也是这四个字。

`story.deduce.message`

先选出两份记录，再试着解释它们。

`story.deduce.message.2`

需要两份不同的已读记录。草稿仍保留着。

`story.deduce.message.3`

这两份记录与判断还不能相互支持。留意日期、签字和原文；可以保留草稿，回去再看。

`story.deduce.message.4`

时间线里有缺少明确日期的片段，暂时不能据此确定先后。可以先把它放回旁边。草稿还在。

`story.deduce.message.5`

「〔1〕」还有没有读过的一面。翻看并核对日期、签字与原话；草稿仍保留着。

`story.deduce.message.6`

手机还有没有记下的页面。把通话记录与本地录音资料分别阅读，再回到这份草稿。

`story.deduce.message.7`

先把能确定时间的原文片段放上时间线，按从早到晚排列。选好解释后还要主动提交。

`story.deduce.message.8`

时间线的先后还对不上。回看原文里的年份、日期和时刻。

`story.deduce.message.9`

文件保存的旧语音与今夜拨出的电话也要分开。

`story.deduce.message.10`

草稿仍保留着。

`story.deduce.message.11`

时间已经排好，但当前判断与两份原文还不能相互支持。留意日期、签字和原话，不把猜想当成已经发生的事实。

`story.arrivaltask.intro`

开车回村，查清是谁寄了这封信。

`story.arrivaltask.letter`

去村口亮灯的窗口拿钥匙。想先看看妈的信，按 B 打开背包。

`story.arrivaltask.ledger`

去路边亮灯的值班室，找周师傅问钥匙。他手边有换牌登记簿。

`story.arrivaltask.keys`

在值班窗口报出李家的新门牌，找周师傅领钥匙。

`story.arrivaltask.gate`

路尽头挂着「十四号」的就是家门。横木可以跳过，也可以绕过去。

`story.headline.intro`

回村

`story.headline.letter`

去村口值班室拿钥匙

`story.headline.ledger`

找值班员

`story.headline.keys`

取备用钥匙

`story.headline.gate`

打开家门

`story.headline`

决定要不要回应车外的人

`story.headline.2`

已核对 · 可继续调查或回厨房

`story.headline.school`

看看当年从哪儿寄过信回家

`story.headline.hospital`

查清母亲何时开始看病

`story.headline.crash`

查清今晚石桥上发生的事

`story.headline.3`

纸元宝已收好

`story.headline.4`

取回晾篮里的纸元宝

`story.headline.5`

回正厅查看棺锁

`story.headline.6`

找回水槽里的钥匙

`story.headline.7`

排走储水间的积水

`story.headline.8`

找回修秤用的铜砣

`story.headline.9`

找出修理间的入口

`story.headline.10`

把旧照放回相册，或下山

`story.headline.11`

查查旧校服，或下山

`story.headline.12`

查清雨夜的事，或下山

`story.headline.13`

查清棺里放着什么，或下山

`story.headline.14`

看看井边晃动的提绳

`story.headline.15`

找回灶间的秤砣

`story.headline.16`

打开量水桌的抽屉

`story.headline.17`

找回量身高的布带

`story.headline.18`

去灶间看看是什么在响

`story.headline.19`

穿过雨庭

`story.headline.20`

打开老宅后门

`story.objective`

回煞 · 你留在石桥上，陪母亲拍完了那张照片

`story.objective.2`

回煞 · 你留在灶间，接过了母亲煮的面

`story.objective.3`

已经作出去向选择 · 可以继续回看，或从暂停回到厨房

`story.objective.4`

走到担架前，听听是谁在叫你

`story.objective.5`

这段记忆已核对 · 可以继续观察，或从门边 / 暂停回到厨房

`story.objective.leave`

归路 · 你已走出旧宅，可以继续回看

`story.objective.stay`

余温 · 今晚留下是你的选择，可以继续回看

`story.objective.wake`

破茧 · 你回应了救护灯，可以继续回看

`story.objective.remember`

回煞 · 你选择留在记忆，可以继续回看

`story.objective.6`

把石桥旧照带到厨房，放进相册最后一页的空相角。

`story.objective.7`

按 B 打开背包，看看旧校服较沉的右边内袋。

`story.objective.8`

正厅的棺盖已经开了。查看棺里的衣领。

`story.objective.9`

回正厅看看棺盖，扣锁在靠过道的一侧。

`story.objective.10`

西厢樟木箱保管着地下室的钥匙。穿过修理间，去地下储水间找棺锁钥匙。

`story.objective.11`

去正厅看看棺盖边夹着的蓝布。想先给母亲摆饭，可以去灶间盛饭，或从供桌借火点香。

`story.objective.12`

接驳车停在山路尽头。去站牌旁上车，或回厨房翻相册。

`story.objective.13`

沿护栏走到候车棚。按接驳通知，把反光牌转向来车方向。

`story.objective.14`

要查车祸，翻厨房柜边的相册，里面有三段记忆。要下山，出院门看路口的接驳通知。

`story.objective.15`

量水秤压平了 · 查看打开的抽屉，院门也已松开

`story.objective.16`

带铜砣回厨房，装在量水秤上。

`story.objective.17`

雨庭西侧是父母的卧房。衣柜脚下有滑轨，柜后是修秤的地方。

`story.objective.18`

去厨房量水桌，用三升、五升桶量出四升水，再把五升桶放上秤。

`story.objective.19`

去右边亮着门灯的厨房。也可以先看院子里的井。

`story.objective.20`

后门已开。穿过走廊进雨庭，往右手亮灯的厨房走。

`story.objective.21`

灯芯灭了。回供桌借烛火，或用门上的字轮开门。

`story.objective.22`

端灯走到走廊尽头。经过左手破窗时按 F 护火，到门前调查门闩。

`story.objective.23`

查看门边架上的全家福，把照片里的灯、人和门与字轮对照。

`story.objective.24`

进正厅，绕过棺木，去左侧供桌端灯。走廊尽头的后门锁着。

`story.memorytask.school`

去左侧课桌看录取通知

`story.memorytask.school.2`

去右侧课桌看明信片

`story.memorytask.hospital`

去右前方桌上看初诊病历

`story.memorytask.hospital.2`

去左侧轮椅旁看复诊安排

`story.memorytask.crash`

去担架旁的红箱子上拿手机

`story.memorytask.crash.2`

看红箱子右侧的救护交接单

`story.memorytask`

，分别记下通话记录和录音资料。

`story.memorytask.2`

，点「阅读」记下日期。

`story.memorytask.3`

，翻面并分别点「阅读」。

`story.memorytask.4`

，记下时间。

`story.memorytask.5`

按 J 打开手记，点「整理」：选两份记录，按日期排序，再提交判断。

`story.guidance.attic`

纸元宝已收好。从楼梯回卧房，去正厅守夜。

`story.guidance.attic.2`

晾篮放下来了，靠近取走纸元宝。

`story.guidance.attic.3`

看梁下的晾篮。顺着绳子找到墙钉，把篮子放低。

`story.guidance.cellar`

铜钥匙已经拿到，沿楼梯回去。

`story.guidance.cellar.2`

瓷槽的水退了。靠近槽沿，看看底部露出来的钥匙。

`story.guidance.cellar.3`

滤网通了，到对面压动抽水泵。

`story.guidance.cellar.4`

先沿吸水管找到瓷槽，清掉堵在滤网上的东西。

`story.guidance.workshop`

工作台上有一枚灶间铜砣。带它回厨房修秤。

`story.guidance.workshop.2`

工作台另一头的铁盒里有火柴。

`story.guidance.workshop.3`

用带水桶牌的钥匙打开修理间里的铁门。

`story.guidance.workshop.4`

铁门通地下室，钥匙在父母卧房的樟木箱里。

`story.guidance.west_room`

看大衣柜脚下的滑轨，推开它就能进修理间。

`story.guidance.west_room.2`

床头有银婚合照。用结婚那年的四位数字开樟木箱。

`story.guidance.west_room.3`

从樟木箱里取出带木牌的地下室钥匙。

`story.guidance.west_room.4`

从卧房门上的「阁楼」牌子往上走。

`story.guidance.text`

打开桌下抽屉看家书。想查当晚的事就翻厨房柜边的相册。要下山就出院门看通知，到候车棚把反光牌转向来车，再去尽头上车。

`story.guidance.text.2`

门闩已经松开。沿走廊走到门外的石路，再走入雨庭。右手边的厨房还亮着一盏灯。

`story.guidance`

从正厅绕过棺木，往里走。量身高的布带挂在走廊右手边的木墙上。

`story.guidance.2`

入口右手边的小木架上有一张全家福。看看是谁站在中间，两侧各有什么。

`story.guidance.3`

沿地上的红绳去走廊尽头，把门上三个字轮和照片对照。

`story.guidance.4`

看全家福里从左到右的排列，再回来转轮。也可以从供桌端灯照门闩。

`story.guidance.next`

对照已读字迹

`story.guidance.5`

全家福左边是灯，中间是人，右边是门。

`story.guidance.6`

先看门边架上的全家福。

`story.guidance.text.3`



转轮之后还要主动压下门闩；读完字迹不会自动开门。

`story.guidance.next.2`

直接查看字轮答案

`story.guidance.text.4`

从左到右调成「灯 · 人 · 门」，再压下门闩。

每轮依次经过雨、门、人、灯。如果三轮都还停在雨字，左轮转三格，中轮转两格，右轮转一格。

`story.waterguidance.text`

靠近厨房靠里的量水桌，看看桶身刻度和写着四升的秤盘。添满、倒空、两桶互倒都可以反复尝试。

`story.waterguidance.text.2`

先去右手边的厨房。量水桌靠右，秤脚下钉着铭牌，两个提桶上都刻着容量。

`story.waterguidance.next`

想一想量水办法

`story.waterguidance.text.3`

三升和五升的差是两升。先把五升桶倒进空的三升桶，就能在大桶里留下两升。

试着把这两升留在小桶里：下一次添满大桶时，小桶还差多少才满？

`story.waterguidance.next.2`

直接查看量水做法

`story.waterguidance.text.4`

从两桶空着开始：

添满五升桶 → 倒入三升桶，余二升。
倒空三升桶 → 把余下二升倒入小桶。
再添满五升桶 → 倒入小桶，补上它缺的一升。

五升桶里现在恰好四升。把它放上秤盘。

`story.memoryguidance.text`

三段记忆已经核对。继续走向路尽头的红蓝救护灯，靠近后主动决定是否回应。也可以先回厨房。

`story.memoryguidance.text.2`



可以继续观察，或从门边、暂停菜单回到厨房。

`story.memoryguidance.school`

左侧课桌上是录取通知。右侧课桌上有张宿舍照片，翻过来能看到寄信地址和邮戳。

`story.memoryguidance.hospital`

右前方桌上有初诊病历，左侧轮椅旁有复诊安排。核对日期、签字和背面的安排。想知道母亲怎么去县城，可以看看墙钟下的候诊椅。

`story.memoryguidance.crash`

担架旁有个红箱子。左手边的物品袋里装着手机和驾驶证，右手边夹着交接单。手机上可以翻通话记录和旧录音。

`story.memoryguidance.next`

再想一想原文

`story.memoryguidance.text.3`

选两份不同的已读原文，把有明确日期的片段从早到晚放上时间线，再选择解释。没有具体日期的描述或猜想，可以先留在旁边。选好后仍需主动提交。

`story.memoryguidance.next.2`

直接查看这段推理做法

`story.memoryguidance.text.4`

对照「〔1〕」和「〔2〕」，从早到晚排列：

〔3〕

再选择解释：

〔4〕

没有观察过的记录仍须回到场景中调查，提示不会替你加入手记、排列时间线或完成推理。

## 靠近物件时的提示

`interaction.showprompt`

看盒里的两摞零钱

`interaction.showprompt.2`

掀开候诊椅上的糖盒

`interaction.showprompt.3`

挂布带的两颗钉子

`interaction.showprompt.4`

锅里的竹箅子

`interaction.showprompt.covered`

掀开灶上的锅盖

`interaction.showprompt.empty`

看看锅里的空碗

`interaction.showprompt.served`

端起盛好的供饭

`interaction.showprompt.5`

棺底的黄布兜

`interaction.showprompt.6`

布兜里的蓝外套

`interaction.showprompt.7`

母亲的旧相框

`interaction.showprompt.8`

供桌上的守夜灯

`interaction.showprompt.9`

供桌上的烛火

`interaction.showprompt.10`

E / 点击 · 〔1〕〔2〕

`interaction.showprompt.11`

 · 已观察

## 地图、地点与进度

`explorationmap.status`

归门字轮已解开

`explorationmap.status.2`

归门字轮尚未解开

`explorationmap.status.3`

量水秤已压平

`explorationmap.status.4`

量水秤尚未压平

`explorationmap.status.5`

院门铜索已松开

`explorationmap.status.6`

院门被铜索扣着

`explorationmap.status.7`

相框背字已读

`explorationmap.status.8`

相框已揭布，可以继续翻看

`explorationmap.status.9`

相框仍蒙着黑布

`explorationmap.status.10`

这段记忆已核对

`explorationmap.status.11`

这段记忆尚未核对

`explorationmap.status.text`

已走过这里

`explorationmap.show`

探索地图

`explorationmap.show.2`

只记下走过的地方和已经观察过的器物。颜色表示已知事项，不代表房间已经搜完。

`explorationmap.show.3`

旧宅 · 随走随记

`explorationmap.render`

已走过的空间

`explorationmap.render.2`

还没有画下路线。走进一个房间后再看看。

`explorationmap.render.3`

走过

`explorationmap.render.4`

已知事项待处理

`explorationmap.render.5`

已知事项已处理

`explorationmap.render.6`

还没有收录这里的原文。

`explorationmap.floor`

〔1〕已走路线；房间与器物记录见下方

`explorationmap.floor.2`

老宅

`explorationmap.floor.3`

你的位置与朝向

`explorationmap.floor.4`

厨房的返回位置

`explorationmap.floor.5`

查看范围

`explorationmap.floor.6`

地图查看范围

`explorationmap.floor.7`

完整已走路线

## 记忆手记

`memoryjournal.appendlinks`

整理记忆

`memoryjournal.appendlinks.2`

回看判断

`memoryjournal.appendlinks.3`

整理

`memoryjournal.show`

继续观察

`memoryjournal.show.2`

回查手记

`memoryjournal.show.3`

回到厨房

`memoryjournal.show.4`

已经核对的记忆

`memoryjournal.show.5`

这两份记录能确认什么？对照已读原文，按日期排列，再选择与原文相符的判断。错误尝试不会清空草稿。

`memoryjournal.show.6`

提交推理

`memoryjournal.show.7`

只用你亲眼见到的记录

`memoryjournal.show.8`

这段记忆的证物或问题有改动。请看看草稿里还缺什么，再选一次判断。

`memoryjournal.show.9`

第二份原文

`memoryjournal.show.10`

第一份原文

`memoryjournal.show.11`

选择一份已读记录

`memoryjournal.show.12`

尚未选择原文。可以先保留草稿，回现场观察。

`memoryjournal.show.13`

与原文相符的判断

`memoryjournal.show.14`

选择一个判断

`memoryjournal.show.15`

把两份摘记放入草稿

`memoryjournal.show.16`

已放入原文。还要排列时间线、选择解释，再主动提交。

## 记忆时间线

`memorytimeline.refresh`

把时间放回原处

`memorytimeline.refresh.2`

从当前两份原文中取出片段，按从早到晚排列。没有明确日期的描述可以留在旁边。换原文时会保留现有时间线草稿。

`memorytimeline.refresh.3`

你排列的时间线

`memorytimeline.refresh.4`

来自：〔1〕

`memorytimeline.refresh.5`

这个片段的来源不在当前两份选证里。

`memorytimeline.refresh.6`

已把「〔1〕」移到第 〔2〕 位。还要主动提交推理。

`memorytimeline.refresh.7`

上移

`memorytimeline.refresh.8`

下移

`memorytimeline.refresh.9`

放回旁边

`memorytimeline.refresh.10`

已把「〔1〕」放回旁边。

`memorytimeline.refresh.11`

时间线还是空的，先从下面的原文片段中挑选。

`memorytimeline.refresh.12`

当前原文里未放入的片段

`memorytimeline.refresh.13`

放入时间线

`memorytimeline.refresh.14`

已把「〔1〕」放到时间线末尾。

`memorytimeline.refresh.15`

当前原文的片段已放入，或还需要换一份原文。可以调整顺序，再提交解释。

`memorytimeline.refresh.16`

先在上方选择已读原文，能核对的片段才会出现在这里。

## 证物与摘记

`evidencejournal.location`

走廊

`evidencejournal.location.2`

正厅

`evidencejournal.updatebutton`

移出摘记

`evidencejournal.updatebutton.2`

放入摘记

`evidencejournal.updatebutton.3`

摘记已满，先移除其中一份再放入新记录

`evidencejournal.comparison`

在原文或手记中选择“放入摘记”，就能在操作机关时回看。

`evidencejournal.comparison.2`

可以选两份原文放在一起对照。摘记也会留在字轮和量水桌旁；选取不代表推理已完成。

`evidencejournal.comparison.3`

移除

`evidencejournal.comparison.4`

移除摘记：〔1〕

`evidencejournal.sync`

随手摘记 · 〔1〕 / 2

`evidencejournal.append`

两份原文对照

`evidencejournal.append.2`

摘记最多保留两份。要换一份，先移除已有摘记。

`evidencejournal.append.3`

尚未记下观察。看向旧宅中的器物，靠近后调查。

`evidencejournal.append.4`

翻看哪一处

`evidencejournal.append.5`

〔1〕 · 〔2〕 份

`evidencejournal.append.6`

全部记录

`evidencejournal.append.7`

老宅与雨庭

## 村路与值班室布景

`villagelane.wagon-registration`

槐 A·7316

`villagelane.old-number`

槐树巷
十四号

`villagelane.landslide-sign`

前方塌方　封路

`villagelane.open-ledger`

旧牌　新牌
换牌登记

`villagelane.key-sign`

住 户 钥 匙

`villagelane.lane-repair-contact`

旧宅修缮
领钥匙请到值班室

## 正厅场景题字

`housescene.hall-sign`

归　门

`housescene.path-sign`

归
路

`housescene.letter`

春节留影

## 雨庭与灶间场景题字

`courtyard.kitchen-sign`

灶　间

`courtyard.yard-gate-sign`

归　路

`courtyard.road-end-sign`

接驳车　上客处

`courtyard.bus-notice`

塌方接驳
来车方向：石桥

`courtyard.stop-name`

石桥接驳站

`courtyard.bus-destination`

县城接驳

`courtyard.buildmask`

纸面具

`courtyard.buildwater`

五升

`courtyard.buildwater.2`

三升

`courtyard.tank-sign`

添水

`courtyard.sink-sign`

倒水

`courtyard.scale-inscription`

校准　四升

`courtyard.scale-dial-key`

轻　四　重

`courtyard.unmailed-letter`

铁道车辆班　李明
小俞捎

## 记忆现场的字迹

`memoryscenes.memory-album-label`

相 册
录取 · 复诊 · 归途

`memoryscenes.school-board-writing`

毕业班　志愿填报
交表前核对院校、专业代码。草表自己留。

`memoryscenes.clinic-window-sign`

挂号　·　复诊

`memoryscenes.tin-lid-print`

什 锦 糖

`memoryscenes.licence`

驾驶证

`memoryscenes.handover-sheet`

院前救护记录
21:18　李 明

## 手机屏幕

`phone.draw`

本机资料

`phone.draw.2`

旧手机

`phone.draw.3`

打开一页，查看日期与原文。

`phone.draw.4`

录音资料

## 文书的印字

`document.drawdraft`

二〇一四届

`document.drawdraft.2`

县里的机修班也招人。

## 游玩设置

`settings.music`

配乐音量

`settings.rain`

雨声音量

`settings.append`

 倍

`settings.append.2`

开启声音

`settings.append.3`

关闭声音

`settings.append.4`

设置会保留，重新开始游戏也不会清除。

`settings.append.5`

浏览器未允许保存设置；本页内仍然生效。

`settings.append.6`

画面亮度

`settings.append.7`

声音音量

`settings.append.8`

鼠标视角灵敏度

`settings.append.9`

触屏视角灵敏度

`settings.append.10`

反转上下视角

`settings.append.11`

点击场景后锁定鼠标

`settings.append.12`

关闭鼠标锁定后，按住鼠标左键拖动视角。触屏拖动使用独立灵敏度。

`settings.append.13`

恢复默认设置

## 标题、片头、探索界面与机关面板

`index.world.aria`

旧宅三维场景

`index.div`

中 式 民 俗 悬 疑

`index.span`

归门 / 余温

`index.p`

七月十四 · 李家老宅

`index.game-name`

回

`index.span.2`

煞

`index.p.2`

我妈去世那年，这盏灯就收起来了。

`index.begin`

正在准备旧宅…

`index.replay-drive`

重看片头

`index.load-status`

正在载入场景与器物

`index.span.3`

家书

`index.p.3`

明，十四回来吃饭。

`index.p.4`

走廊漏风，端灯记得拢着手。

`index.small`

里面的小信封写着「李明收」。

`index.small.2`

外面那层，投递章是昨天的。

`index.span.4`

归门 · 余温

`index.span.5`

建议戴耳机游玩

`index.drive.aria`

七月十四，雨夜进村

`index.span.6`

七月十四　·　槐树巷

`index.skip-drive`

跳过片头

`index.well-film.aria`

雨庭旧井过场

`index.skip-well`

跳过过场

`index.hud.aria`

探索界面

`index.backpack`

背包

`index.hints`

查看提示

`index.map`

地图

`index.journal`

手记

`index.pause`

暂停

`index.prompt`

调查

`index.shield-flame`

拢住灯火

`index.p.5`

双击 W 疾跑

`index.p.6`

 空格跳跃

`index.p.7`

 E / 左键调查

`index.p.8`

 E 返回

`index.touch-pad.aria`

移动方向

`index.button.aria`

向前

`index.button`

前

`index.button.aria.2`

向左

`index.button.aria.3`

向后

`index.button.2`

后

`index.button.aria.4`

向右

`index.touch-jump`

跳

`index.span.7`

看向铜轮，按从左到右的顺序转动

`index.div.aria`

转动实体字轮

`index.button.3`

转动左轮

`index.button.4`

转动中轮

`index.button.5`

转动右轮

`index.lock-status`

可以对照已读字迹，再尝试压下门闩。

`index.lock-hang`

照着活扣，挑起门闩

`index.lock-attempt`

压下门闩

`index.lock-records`

回查手记

`index.lock-hint`

需要提示

`index.lock-leave`

退回门前

`index.water-leave.aria`

退出量水秤

`index.p.9`

目标：五升桶里留下四升水

`index.div.aria.2`

选择水桶

`index.strong`

三升桶

`index.level-small`

0 / 3 升

`index.strong.2`

五升桶

`index.level-large`

0 / 5 升

`index.water-fill`

添满

`index.water-empty`

倒空

`index.water-weigh`

放上秤盘

`index.water-records`

手记

`index.span.8`

揭开黑布 · 拿近 · 翻到背面

`index.portrait-reveal`

揭开黑布

`index.portrait-read`

阅读背字

`index.portrait-leave`

放回原处

`index.span.9`

查看页面 · 核对日期 · 记下原文

`index.button.6`

通话记录

`index.button.7`

本地录音资料

`index.phone-read`

阅读并记下当前页

`index.document-title`

旧纸张

`index.span.10`

拿近 · 翻面 · 阅读原文

`index.document-join`

沿撕口合上两半

`index.document-read`

阅读并记下这一面

`index.reader-close`

返回

## 值班员胸牌

`clerk.clerk-badge`

周 福 生

## 相框背面题字

`portrait.portrait-back-inscription`

九八年正月初二
照相馆  68213̶6̶
                  48
