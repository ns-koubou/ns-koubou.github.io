---
layout: post
title: ファミコンミニでDOOMを動かそう
tags: ファミコンミニ DOOM
---

## DOOOOOOOOOOM！

ハードウェアがハックされて好きなソフトウェアが動かせるようになると、必ずといっていいほど良く使われるゲームがあります。
それが、[**DOOM**](https://ja.wikipedia.org/wiki/DOOM)です。
DOOMは1993年に発売された、現在で言うところのFPSにあたるゲームです。2016年にはリブートタイトルが発売されました。

<!--more-->

また、このゲームの特徴としてゲームエンジンの[ソースが公開されている](https://github.com/id-Software/DOOM)という点があります。
擬似3Dのソフトウェアレンダラが含まれたゲームエンジンなので、移植にはもってこいというわけです。
今でも公開されたソースを使用して様々な改良エンジン（ソースポート）が作られています。

ファミコンミニでLinuxが動作したとき、「Linuxが動くんならDOOMが動くのは当たり前だな！」とか思っていたので、いつかDOOMを動作させるという目標は立ててました。
そして、ファミコンミニで動く自前ビルドのLinuxを使用していますが、DOOMを動作させることができました。

## 必要なもの

やりたいことは、Linuxのフレームバッファを描画先にできるDOOMエンジンを動作させることなので、以下のようになります。

- HDMIを復活させたファミコンミニのカーネル
- ARM Linuxをターゲットにしているビルド環境
- [SDL v1.2系](https://www.libsdl.org/download-1.2.php)
- [lsdldoom](http://jesshaas.com/lsdldoom/)
- DOOMのIWAD（ゲームデータ）、製品版を持っていないのであれば[シェアウェア版](https://doomwiki.org/wiki/DOOM1.WAD)を使う

## ビルドしよう

SDLのビルド済みバイナリをlsdldoomで使う際のパス通しの作業が面倒なので、ここでは簡単に行うためにRaspbianをQEMUで動かした環境を使います。
[QEMUのユーザモード](https://wiki.debian.org/QemuUserEmulation)を使えば、実用的な速度でARM Linuxのビルド環境を使うことができます（クロスコンパイラが最速なのは変わりませんが）

以降、特記していない限りはRaspbianをQEMUのユーザモードで動かしている環境上での作業です。

### SDLのビルドとインストール

SDLをダウンロードしてインストールします。
キーボード入力を殺しておかないと起動しないので、そのための[パッチ](https://gist.github.com/nvsofts/d4629af107791f9d6cc855037a001b6e)を当ててインストールします。
`./configure`のオプションは、

- フレームバッファ(fbcon)のサポートのみに絞る
- 最終的には静的リンクしたバイナリを作りたいので、`.so`をビルドしない

の意味があります。

```bash
$ cd SDL-1.2.15
$ patch -p0 < sdl-fbvideo.patch
$ ./configure --without-x --disable-directfb --disable-shared --disable-sdl-dlopen
$ make
$ sudo make install
```

### lsdldoomのビルド

lsdldoomをダウンロードしてビルドします。
これもそのままでは色深度の判定がおかしくなってしまうので、[パッチ](https://gist.github.com/nvsofts/d4629af107791f9d6cc855037a001b6e)を当ててビルドします。

```bash
$ cd lsdldoom-1.5
$ patch -p0 < lsdldoom-video.patch
$ ./configure --disable-dependency-tracking --disable-cpu-opt LDFLAGS=-static
$ make
```

## ファミコンミニのLinuxへ持っていく

lsdmdoomからは、以下のファイルを持っていけば動くはずです。

- `src/lsdldoom`
- `data/boomlump.wad`

さらに、DOOMのIWADも必要になるので一緒に持っていきます。

## 動かす

ファミコンミニのLinuxで動かします。
SDLのマウスサポートを殺すために、環境変数を設定した上で起動します。

```console
$ SDL_NOMOUSE=1 ./lsdldoom -width 1280 -height 720
```

起動させると、以下のツイートの動画のように動くはずです。

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">ファミコンミニでDOOM動作！色深度がおかしいのも直した <a href="https://t.co/mg95wSHjh0">pic.twitter.com/mg95wSHjh0</a></p>&mdash; NV(*´｀*) (@nvsofts) <a href="https://twitter.com/nvsofts/status/799275892052606976">November 17, 2016</a></blockquote>

## 最後に

まだコントローラによる操作やサウンドが死んでいますが、これでやっと気持ちよく寝られそうです。
