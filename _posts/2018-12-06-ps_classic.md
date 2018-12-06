---
layout: post
title: PlayStation ClassicでDOOMを動かすまで
tags: PSミニ MediaTek DOOM
---

2018/12/03に発売されたSIEの「[PlayStation Classic](https://www.jp.playstation.com/psclassic/)」についてです。

以降は製品名を「PSミニ」と略します。

<!--more-->

## お約束ですが

ここに書いてある情報の利用は自己責任でお願いします。

## 基本スペック

ニンテンドークラシックミニシリーズとは違い、MediaTek製SoCを採用しています。

- SoC: [MediaTek MT8167A](https://www.mediatek.com/products/tablets/mt8167a) (4-core **ARMv8**)
- RAM: Samsung K4B4G1646D-BYMA x2 (合計1GB)
- eMMC: Samsung KLMAG1JETD-B041 (16GB)
- PMIC: MediaTek MT6392A
- USB Hub?: Realtek RTS5482

## 分解

SONY系ハードおなじみの「剥がすと保証は無効」のシールはなく、プラスドライバーのみで簡単に分解できます。

まぁ、保証とか投げ捨てる前提なので軽く動作確認した後に分解しました。

## 関係ありそうな箇所の説明

### UART

いかにもそれっぽいパッドがUARTです。

HDMI端子がある側から、3.3V、TxD、RxD、GNDとなっています。

ロジックレベルは**1.8V**です。3.3Vが出ているので勘違いしがちですが要注意です。

### eMMC

以下に、eMMCの主要なピンの場所を示します。

![eMMCの主要なピンの場所]({{ site.baseurl }}/assets/posts/2018-12-06/emmc_pinout.jpg)

ここで注意することは、D0ピンがビアを一切使わずに接続されています。
そのため、配線を保護しているレジストを削って接続するしかありません。

eMMCをPCに接続して読み書きしたい方は、以下のページをおすすめします。

[【番外編】PlayStation Classic の eMMC をダンプする](http://www.zopfco.de/entry/2018/12/05/131340)

### fastboot

基板の右下の方にある、大きなパッド同士をショートさせながらPCへ接続することでfastbootに入れます。

しかし、fastbootでできることは現時点で分かっている限りではほぼ無いに等しいです。

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">fastbootでgetvar all→bootで同じSoCのタブレットのboot.imgを流したときの挙動、bootコマンド対応してない？ <a href="https://t.co/PyUqqtz1tU">pic.twitter.com/PyUqqtz1tU</a></p>&mdash; NV (@nvsofts) <a href="https://twitter.com/nvsofts/status/1069641928247918600?ref_src=twsrc%5Etfw">December 3, 2018</a></blockquote>

fastboot入る直前に一瞬USB-シリアル変換（CDC-ACM）で認識しますが、これはMediaTek製SoCで用意されているファーム焼きモードに関係するようです。

この件については、以下のページが詳しいです。

[I have not read Playstation classic firmware yet but...](http://honeylab.hatenablog.jp/entry/2018/12/04/122008)

### 饒舌 (verbose) モード

裏面（SIDE B）にある特定のパッド同士をショートさせると、饒舌モード（と勝手に呼んでいます）に入ります。

このモードでは、通常表示されることのないsystemdの起動ログやログインプロンプトを見ることができます。

詳しい情報については、以下のページを参照してください。

[Playstation Classic alternate startup log and realtime message](http://honeylab.hatenablog.jp/entry/2018/12/05/011343)

## システムの構成

カーネルはAndroidカーネル（カスタム版Linux）、ユーザーランドはYoctoです。
SoC自体は64bitですが、システムとしては32bitで動いています。

eMMCのパーティション構成は以下の通りです。TEE（Trusted Execution Environment）があることに注目です。

```text
Disk /dev/loop0: 30535680 sectors, 14.6 GiB
Sector size (logical/physical): 512/512 bytes
Disk identifier (GUID): C907B807-D79F-48E2-9743-A7288A4540BA
Partition table holds up to 128 entries
Main partition table begins at sector 2 and ends at sector 33
First usable sector is 34, last usable sector is 30535646
Partitions will be aligned on 1024-sector boundaries
Total free space is 1085 sectors (542.5 KiB)

Number  Start (sector)    End (sector)  Size       Code  Name
   1            1024           17407   8.0 MiB     8300  BOOTIMG1
   2           17408           33791   8.0 MiB     8300  BOOTIMG2
   3           33792           34815   512.0 KiB   8300  SEC_RO
   4           34816           35839   512.0 KiB   8300  MISC
   5           35840           39935   2.0 MiB     8300  TEE1
   6           39936           44031   2.0 MiB     8300  TEE2
   7           44032          453631   200.0 MiB   8300  ROOTFS1
   8          453632          535551   40.0 MiB    8300  ROOTFS2
   9          535552        29895679   14.0 GiB    8300  GAADATA
  10        29895680        30535551   312.4 MiB   8300  USRDATA
```

ルートファイルシステムは[dm-verity](https://source.android.com/security/verifiedboot/dm-verity)のような正当性検証が行われていないため、書き換えし放題です。

ログイン可能にしたPSミニで、`ps`コマンドや`mount`コマンド等を実行した結果Gistにアップしています（容量が大きいので閲覧注意）

[PlayStation Classic various logs](https://gist.github.com/nvsofts/f73d913af099cc3094e5d264e42ad7ed)

ちなみにゲームデータはきちんと暗号化されており、鍵の一部は[TrustZone](https://developer.arm.com/technologies/trustzone)で保護されているようです。

## USBメモリを使ったアップデート機能

軽くeMMC内を調べていたときに存在自体は確認していたのですが、その後madmonkey氏が掘り下げて詳しい情報を出しています。

要約すると

- 接続されたUSBメモリの特定のボリュームラベル（SONY）とディレクトリをトリガーに、アップデートを試みる
- 対称鍵暗号で暗号化されているが、パスワードはeMMC内にある
- 任意のシェルスクリプトを動作させることができる

ということです。

詳しい情報はここには記載しませんが、調べれば出てきます。

## DOOMを動かす

PSミニではディスプレイサーバとしてWaylandが使われています。

[PrBoom+のSVN版](http://prboom-plus.sourceforge.net/history.html)がWaylandをサポートしているSDL 2.0に対応しているため、これを使うことにしました。

SDL 2.0のライブラリはPSミニに入っているため、PrBoom+をARM向けにビルドすることで動くはずです。

実際にやってみたところ、きちんと動きました。

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">PlayStation ClassicでDOOM（PC版）が動いた！ PrBoom+のSDL2版をWayland上で動作させてる <a href="https://t.co/lz6p6Gusph">pic.twitter.com/lz6p6Gusph</a></p>&mdash; NV (@nvsofts) <a href="https://twitter.com/nvsofts/status/1070546126187651073?ref_src=twsrc%5Etfw">December 6, 2018</a></blockquote>
<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="ja" dir="ltr">USBメモリから任意のシェルスクリプトを動かす技を使って自動実行させるようにしてみた、理論上は無改造本体でもOKなはず <a href="https://t.co/xxCYAro9d0">pic.twitter.com/xxCYAro9d0</a></p>&mdash; NV (@nvsofts) <a href="https://twitter.com/nvsofts/status/1070761406348189696?ref_src=twsrc%5Etfw">December 6, 2018</a></blockquote>

## 最後に

今回は

- BGA153のICのリボールとリワーク
- 顕微鏡下でのはんだ付け

など、勉強になったことも多かったです。

また、ハックに関する情報を公開している以下の方々へ感謝します。

- [emuonpsp (@emuonpsp) 氏](https://twitter.com/emuonpsp)
- [Takumi Sueda (@puhitaku) 氏](https://twitter.com/puhitaku)
- [きんのじ (@v9938) 氏](https://twitter.com/v9938)
- [ひろみつ (@bakueikozo) 氏](https://twitter.com/bakueikozo)
- Hakchi ResourcesのDiscordの関連チャンネルの方々

あと、カーネルのソース公開してくれませんかね・・・（なぜか[ここ](https://doc.dl.playstation.net/doc/psclassic-oss/)には無い）
