---
layout: post
title: cartreaderで快適ROM吸い出し
tags: 電子工作 SFC
---

手持ちのレトロゲーム機用ののカートリッジに含まれているゲームデータを吸い出してみたいと思ったことはないでしょうか。
今回はArduino Mega 2560を使って動作するROM吸い出し機であるcartreaderの紹介です。

<!--more-->

## cartreaderの概要

[cartreader](https://github.com/sanni/cartreader)はsanni氏の作成したArduino Mega 2560で動作するROM吸い出し機で、以下の特徴があります。

- SFC(SNES)のROM吸い出し
- N64のROM吸い出し
- N64のコントローラパックの吸い出し
- GB/GBAのROM吸い出し
- セーブデータの読み書き
- フラッシュROMへの書き込み

SFCについては大容量カートリッジや特殊チップを搭載したカートリッジにも対応しており、ExHiRomやSuperFX、またSA-1などに対応しています。

## 必要な部品

必要な部品はWikiの[PCB Needed Parts](https://github.com/sanni/cartreader/wiki/PCB-Needed-Parts)のページにまとまっていますが、AliExpressやeBayのページへのリンクなので日本国内で作成する際には不便です。
そのため、以下に部品一覧と入手できる場所を示します。
なお、ネジなどの必ずしも組み立てるにあたって必要でないものに関してはここでは扱いません。

|部品名|個数|入手場所|
|--|:--:|:--:|
|チップタンタルコンデンサ(22uF, 3216)|1|[aitendo](http://www.aitendo.com/product/9963)|
|ピンソケット(1x4, 足長)|1|[aitendo](http://www.aitendo.com/product/7088)|
|AMS1117(3.3V)|1|[aitendo](http://www.aitendo.com/product/2442)|
|microUSBコネクタ|1|[aitendo](http://www.aitendo.com/product/11707)|
|OLED(128x64)|1|[aitendo](http://www.aitendo.com/product/14958)|
|SDカードモジュール|1|[aitendo](http://www.aitendo.com/product/10175)|
|スライドスイッチ(SK12D07)|5|[aitendo](http://www.aitendo.com/product/10420)|
|チップポリスイッチ(0.5A)|1|[aitendo](http://www.aitendo.com/product/11459)（ギリギリ半田付けできる）<br>または秋月の[ポリスイッチ](http://akizukidenshi.com/catalog/c/cplsw1/)や[SMDヒューズ](http://akizukidenshi.com/catalog/c/csmdfuse/)から代用品を選ぶ|
|PICマイコン(12F629, SOIC)|1|[秋月電子](http://akizukidenshi.com/catalog/g/gI-02111/)|
|フルカラーLED(**アノードコモン**)|1|[マルツ](http://www.marutsu.co.jp/pc/i/253956/)|
|チップコンデンサ(0.1uF, 2012)|1|千石電商|
|チップ抵抗(10kΩ, 2012)|2|千石電商
|チップ抵抗(1kΩ, 2012)|1|千石電商
|チップ抵抗(220Ω, 2012)|3|千石電商
|Arduino Mega 2560(互換品)|1|[Amazon](https://www.amazon.co.jp/dp/B013QV2AX4/)|
|クロックジェネレータ(オプション)|1|[AliExpress](https://www.aliexpress.com/item/2045-Si5351A-Clock-Generator-Breakout-8KHz-to-160MHz-module-Adafruit/32460964240.html) or [Adafruit](https://learn.adafruit.com/adafruit-si5351-clock-generator-breakout/overview)|
|カートリッジスロット(SFC, N64, GB/GBA)|各1|ジャンク等から部品取り（使いたいスロットのみでOK）|
|ピンヘッダ(1x40)|1|どこか|
|ピンソケット(1x7)|1|どこか|
|ピンソケット(2x8)|1|どこか|
|タクトスイッチ|2|どこか|

基板内を流れるのは最高でも5V程度と考えられるので、コンデンサの耐圧は10V程度で良いかと思われます。

## 基板の発注

cartreaderの基板のガーバーデータは[公開されています](https://github.com/sanni/cartreader/tree/master/pcb)。
`cartreader.zip`がメイン基板、`adapter.zip`がアダプタ基板のファイルです。

基板の発注先にはElecrowが挙げられており、手順は[Wikiにあります](https://github.com/sanni/cartreader/wiki/PCB-How-to-order-printed-circuit-boards)。

## 部品の取り付け

基板の組み立てガイドは[Wikiにあります](https://github.com/sanni/cartreader/wiki/PCB-Build-guide)が、ここでも解説しておきます。

![Step1]({{ site.baseurl }}/assets/posts/2017-03-07/build_step1.jpg)

表面実装部品を取り付けます。フラックスを使うと良い感じにはんだ付けできます。

![Step2]({{ site.baseurl }}/assets/posts/2017-03-07/build_step2.jpg)

ピンヘッダを取り付けます。

![Step3]({{ site.baseurl }}/assets/posts/2017-03-07/build_step3.jpg)

ピンソケットとスイッチを取り付けます。

![Step4]({{ site.baseurl }}/assets/posts/2017-03-07/build_step4.jpg)

SFC・N64のカートリッジスロットとスイッチを取り付けます。カートリッジスロットの干渉する部分は切り落とすかテープ等で絶縁します（特にSFCのスロットは注意）

![Step5]({{ site.baseurl }}/assets/posts/2017-03-07/build_step5.jpg)

フルカラーLEDを取り付けます。
さらに、OLEDのピンアサインを見て基板上の対応する箇所をはんだを盛ってショートさせます。

![Step6]({{ site.baseurl }}/assets/posts/2017-03-07/build_step6.jpg)

OLED本体とOLED用のピンソケットを取り付けます。

これ以降の手順はバックプレート等の取り付けの手順になるので省略します。

最後に、Arduino Mega 2560とSDカードモジュールを取り付けるのを忘れないでください。

## ファームの書き込み

GitHubからcartreaderのリポジトリ(`https://github.com/sanni/cartreader.git`)をcloneしてきて、`Cart_Reader/Cart_Reader.ino`をArduino IDEで開きます。
ターゲットをArduino Mega 2560に設定し、シリアルポートを正しく設定した上でビルドと書き込みを行ってください。
正常に書き込まれると、OLEDにロゴが表示されるはずです。

注意点として、この記事で紹介したArduino Mega 2560の互換ボードはUSB-シリアル変換チップとしてCH340Gが使用されているため、対応するドライバを導入しておく必要があります。

## SDカードの準備

FAT32でフォーマットしたSDカードに、cartreaderのリポジトリの`sd`ディレクトリの中身をコピーします。
`sd`ディレクトリにはGBAやN64向けのカートリッジデータベース等が入っています。

コピーが完了したら、SDカードをcartreaderのSDカードスロットへ挿入します。

## 使い方

基本操作は以下の通りです。

- 左ボタンを1回押し: メニューの選択項目を一つ進める
- 左ボタンを素早く2回押し: メニューの選択項目を一つ戻す
- 右ボタンを1回押し: 決定

メニューから吸い出したいカートリッジの種類を選び「Read Rom」でゲームデータ、「Read Save」でセーブデータを読み出してSDカードへ格納します。
もし、チェックサムの不一致やROMヘッダが破損しているとの表示が出た場合には、カートリッジの接点をアルコール等でクリーニングしてみてください。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">こういう風に使うわけです <a href="https://t.co/lLR8Ucg7kT">pic.twitter.com/lLR8Ucg7kT</a></p>&mdash; NV(*´ω｀*) (@nvsofts) <a href="https://twitter.com/nvsofts/status/838007904951132161">2017年3月4日</a></blockquote>

## スイッチの役割

cartreaderには電源スイッチの他に4つのスイッチが付いていますが、これらのスイッチの役割は以下の通りです。

- `CLK1`: 3.072MHzのクロック供給のON/OFF
- `CLK0`: 21.477272MHzのクロック供給のON/OFF
- `EEP`: N64のEEPROM/コントローラパック用のプルアップ抵抗のON/OFF
- `3V/5V`: 電圧の切り替え(3.3V/5V)

SDカードの認識が不安定な場合は、`3V/5V`スイッチを切り替えると安定したりするようです（自己責任で）

**2017/03/08追記: cartreaderで使われているSDカードモジュールはロジックレベルの変換を行わないためにこのような問題が生じるようです。ロジックレベルを変換するような回路が組み込まれたSDカードモジュールを使用するように改造すると良さそうです。**

## 最後に

割と容易にSFC/N64/GB/GBAの吸い出し環境を用意できるcartreaderですが、残念ながらFCには対応していません。
おそらく、FCはROMがグラフィック部分のCHR ROMとプログラム部分のPRG ROMの二本立てになっている点（ピンアサインを見るとわかる）や、
SFC以上に多くの種類がある特殊チップ（マッパー）の存在が原因と個人的には思っています。
