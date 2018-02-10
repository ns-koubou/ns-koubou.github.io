---
layout: post
title: 電車でGO! PLUG & PLAYの中身の話
tags: 電車でGO!PnP sunxi
---

2018/02/08に発売されたタイトーの「[電車でGO! PLUG & PLAY](http://denshadego.net/PP/)」についてです。

以降は製品名を「電車でGO!PnP」と略します。

<!--more-->

## お約束ですが

ここに書いてある情報の利用は自己責任でお願いします。

## 基本スペック

ニンテンドークラシックミニシリーズと似た構成です。

- SoC: [Allwinner R16](http://www.allwinnertech.com/index.php?c=product&a=index&id=51) (4-core ARMv7)
- RAM: Samsung K4B2G1646F-BYMA (256MB)
- eMMC: Samsung KLM8G1GEME-B0410 (8GB)
- PMU(Power Management Unit): X-POWER AXP223
- HDMI Transmitter: EPMI EP952

## UARTの場所

USB端子の近くにあるスルーホールに出ています。

![UARTのパッド]({{ site.baseurl }}/assets/posts/2018-02-11/pnp_pinout.jpg)

UARTの速度は115200bps、ロジックレベルは3.3Vです。

## 起動ログ

Allwinner系ではおなじみの、Sunxi/LegacyなU-BootとLinuxの組み合わせです。

なぜかDropbearが起動しますが、テスト用ROMの名残なのか？

```text
[      0.195]

U-Boot 2011.09-rc1-00000-g1a06ae1-dirty (Dec 21 2017 - 09:50:25) Allwinner Technology

[      0.204]version: 1.1.0
[      0.207]uboot commit : 1a06ae104576dd40c33c89daef7d39e713f183e0

ready
normal dc exist, limit to dc
no key input
dram_para_set start
dram_para_set end
In:    Out:   Err:   Net:   Warning: failed to set MAC address


   Verifying Checksum ... OK
OK
OK
Uncompressing Linux... done, booting the kernel.
Starting logging: OK
Populating /dev using udev: done
read-only file system detected...done
Starting network...
No persistent location to store SSH host keys. New keys will be
generated at each boot. Are you sure this is what you want to do?
Starting dropbear sshd: OK
mali: starting driver
automatic mode: 720p mode selected
OK
```

## USBデバイスを接続する

5V電源を別途基板へ供給した上で、USBホストケーブル経由でUSBデバイスを接続すると認識します。

無改造でUSBデバイスを接続したい場合は、スマートフォン向けの充電しながらUSBホストが使えるケーブルを使うと良いでしょう。

### USBメモリを使った技

なぜこのような話をするかというと、電車でGO!PnPにはUSBメモリを使ったバックドアが存在するためです。

USBメモリに特定の名前のファイルが入っていると、以下の動作をさせることができます。

- セーブデータのバックアップ・復元
- 任意のシェルスクリプトの実行
- ゲームデータのインストール

## eMMCのパーティション構成

|番号|内容|
|:---:|---|
|1|セーブデータ (ext4)|
|2|`magic.bin` (FAT16)|
|3|拡張パーティション|
|5|U-Boot環境変数|
|6|`uImage` (FAT12)|
|7|ルートファイルシステム (ext4)|
|8|ゼロフィル|
|9|ゼロフィル|
|10|ゼロフィル|

なお、eMMCに用意されているブートパーティションは使用していないようです。

## FELモードへの入り方

十字ボタンの左を押しながら起動させることで、FELモードへ入れます。

このままではDRAMは有効化されないので、`sunxi-spl.bin`などを使って有効化してやってください。

## 最後に

スタッフロールを見ると、ハードウェアの開発にAllwinnerの日本総代理店である株式会社瑞起が関わっていることが分かります。

このあたりが、ニンテンドークラシックミニシリーズと似たハードウェア構成の理由かもしれません。
