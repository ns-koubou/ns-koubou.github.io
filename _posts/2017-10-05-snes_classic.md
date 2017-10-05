---
layout: post
title: ニンテンドークラシックミニ スーパーファミコンの中身の話
tags: スーファミミニ sunxi
---

2017/10/05に発売された任天堂の「[ニンテンドークラシックミニ スーパーファミコン](https://www.nintendo.co.jp/clvs/)」についてです。

海外版が日本国内よりも早く発売されたためこの記事の存在価値が怪しいですが、一応日本国内版の情報ということで出します。

ハードウェアとしてはファミコンミニとほぼ同一なため、先に[ファミコンミニの中身の話](/blog/2016/11/11/nes_classic/)を読むことをおすすめします。

また、製品名が長いので以降はスーファミミニと略します。

<!--more-->

## お約束ですが

ここに書いてある情報の利用は自己責任でお願いします。

## 基本スペック

ファミコンミニと変わらずです。

- SoC: [Allwinner R16](http://www.allwinnertech.com/index.php?c=product&a=index&id=51) (4-core ARMv7)
- RAM: Nanya NT5CC128M16IP-DI (256MB)
- NAND: Macronix MX30LF4G18AC-TI (512MB)
- PMU(Power Management Unit): X-POWER AXP223
- HDMI Transmitter: EPMI EP952

スーパーFXチップ搭載のゲームが収録されているので、ファミコンミニに比べればCPUパワーは活用できていそうです。

## UARTの場所

ファミコンミニでは基板のB面（SoCが乗っている方）にありましたが、スーファミミニでは基板のA面（SoCが乗っていない方）にあります。

また、シルクにVCC/RX/TX/GNDの記載があり分かりやすくなっています。もしかして狙ってる？

![UARTのパッド]({{ site.baseurl }}/assets/posts/2017-10-05/uart.jpg)

UARTの速度は115200bps、ロジックレベルは3.3Vです。

## ブートローダについて

ファミコンミニと同じくU-Bootが採用されています。

以下に電源オン→電源オフと操作した際のログを貼っておきますが、ファミコンミニとほぼ同一の出力です。

```text
?[      0.213]

U-Boot 2011.09-rc1 (May 30 2017 - 18:02:19) Allwinner Technology

[      0.220]version: 1.1.0
[      0.223]uboot commit : bff4fb398219378ec62edc87d128f993eca55789

ready
no battery, limit to dc
no key input
dram_para_set start
dram_para_set end
Using default environment

In:    Out:   Err:
Uncompressing Linux... done, booting the kernel.
The system is going down NOW!
Sent SIGTERM to all processes
Sent SIGKILL to all processes
Requesting system poweroff
```

## FELモードへの入り方

ファミコンミニと同じく、

- リセットボタンを押しながら起動（DRAMは初期化されない）
- UART経由で`'s'`を流し込みながら起動した後、`fastboot`コマンドを実行（DRAMは初期化される）

が使用可能です。

## 自分でビルドしたLinux等を動かす

これも[ファミコンミニと同じ方法](https://blog.urandom.team/post/my-linux-kernel-on-nesclassic/)でビルドしたカーネルが動作します。ハードウェアがほぼ同一なので仕方ないですね。

一応、スーファミミニで使われているカーネルは少し違うようです（[任天堂関連のOSSソース公開ページ](https://www.nintendo.co.jp/support/oss/)を参照）

あと、おなじみのPC版DOOMを動かしてみました（[前にビルドしたもの](/blog/2016/11/17/doom_on_nes_classic/)を流用）

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">スーファミミニでDOOM（PC版）動かしました <a href="https://t.co/kn94myMcaw">pic.twitter.com/kn94myMcaw</a></p>&mdash; NV(*´ω｀*) (@nvsofts) <a href="https://twitter.com/nvsofts/status/915926911271837696?ref_src=twsrc%5Etfw">October 5, 2017</a></blockquote>

## まとめ

ファミコンミニとハードウェアとしてはほぼ同一なため、ファミコンミニのハック資産が活用できそうです。

余談ですが、ゲームを追加するハックをするのであれば追加するゲームとしてSFC版DOOMはどうでしょうか。乗ってるエミュもスーパーFXチップ対応してますし。
