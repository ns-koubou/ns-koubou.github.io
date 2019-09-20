---
layout: post
title: メガドライブミニの中身の話
tags: メガドラミニ sunxi
---

2019/09/19に発売されたセガの「[メガドライブミニ](https://sega.jp/mdmini/)」についてです。

以降は製品名を「メガドラミニ」と略します。

<!--more-->

## お約束ですが

ここに書いてある情報の利用は自己責任でお願いします。

## 基本スペック

ニンテンドークラシックミニシリーズと似ています。
「時代が求めた16bit」とのことですが、中身はきっちり32bitです（そういう話ではない）

SoCが日本でAllwinnerの総代理店をやっているZUIKIブランドになっています。

- SoC: [ZUIKI Z7213](https://www.zuiki.co.jp/products/z7213/) (4-core ARMv7)
- RAM: UniIC SCB15H2G160AF-13K (256MB)
- NAND: Samsung K9F4G08U0F-SCB0 (512MB)
- PMU(Power Management Unit): X-POWER AXP223
- HDMI Transmitter: EPMI EP952

## UARTの位置

かなり変わった配置になっています。3.3Vロジックです。

![UARTの位置]({{ site.baseurl }}/assets/posts/2019-09-20/uart.jpg)

## Z7213の正体

分解する前からAllwinner系だと想定していたので、試しにリセットボタンを押しながら電源を入れてみたところFELに入れました。

FELに入れると`sunxi-fel`コマンドを使ってSoCの種類を調べることができるので、試してみます。

```text
$ sunxi-fel version
AWUSBFEX soc=00001667(A33) 00000001 ver=0001 44 08 scratchpad=00007e00 00000000 00000000
```

結果を見る限り、Z7213はAllwinner A33系のSoCのようです。

ちなみに、A33はニンテンドークラシックミニシリーズでも使われているR16と同じシリーズです。

## rootログインを試みる

UARTに`s`を入力しながら電源を投入する技（ファミコンミニでもありましたね）でU-Bootコンソールに入り、`setenv init /bin/sh`とかした上で起動させることでシェルに入ります。

あとは`/etc/shadow`とかを見ていい感じにやることで、通常起動時に使えるrootパスワードをゲットできます（ここではパスワードは記載しません）

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">メガドラミニ、シリアルコンソールから真正面でrootで入れるようになりました <a href="https://t.co/D8PVZt3YXX">pic.twitter.com/D8PVZt3YXX</a></p>&mdash; NV(*´ω｀*)＠技術書典7け35D (@nvsofts) <a href="https://twitter.com/nvsofts/status/1174557310133211136?ref_src=twsrc%5Etfw">September 19, 2019</a></blockquote>

## fastboot

U-Bootコンソールで`fastboot`コマンドを実行することでfastbootに入れます。

ファミコンミニのときはFELに入りましたが、今回はAndroidなfastbootです。

ちゃんとしたバイナリで試したわけではないですが、`$ fastboot boot`とかで好きなイメージを起動させることができそうです。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">適当なファイルをfastboot bootで送り付けたら生イメージとしてブートを試みたぞ（不正命令例外は出てるのは仕方ない） <a href="https://t.co/zYgonkX1jh">pic.twitter.com/zYgonkX1jh</a></p>&mdash; NV(*´ω｀*)＠技術書典7け35D (@nvsofts) <a href="https://twitter.com/nvsofts/status/1174556947703402496?ref_src=twsrc%5Etfw">September 19, 2019</a></blockquote>

## PCとの接続

正面のUSBがまともに使えないっぽいので（きちんと調べたわけではない）
必然的にPCとの接続は電源として使っているUSBポートを使った方法になります。

幸い、カーネルにはAndroid USBガジェットが内蔵されているためRNDISを使ったネットワーク接続ができます。
なぜか電車でGO!PnPと同じくDropbearが立っているので、これを使ったSFTPなんかも可能です。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Android USBガジェットに含まれてるRNDISでメガドラミニに元々立ってるSSHサーバへ接続 <a href="https://t.co/m5m6iGxbgU">pic.twitter.com/m5m6iGxbgU</a></p>&mdash; NV(*´ω｀*)＠技術書典7け35D (@nvsofts) <a href="https://twitter.com/nvsofts/status/1174569257188745216?ref_src=twsrc%5Etfw">September 19, 2019</a></blockquote>

## まとめ

新しいSoCが出てきたように見えますが、実態としては今までと比べて大きく変わってないように見えます。

しかし、この手のゲーム機のAllwinnerの採用率の高さ・・・

関係した話というと、PCEミニも先日TGSで試遊してきたのですがメガドラミニと似ていました。
権利表示からもLinux系のOSが採用されていると見て良さそうでした。

まぁ楽かつ安く作れるんでしょうね、きっと。
