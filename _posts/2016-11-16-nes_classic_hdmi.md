---
layout: post
title: 自前ビルドしたファミコンミニ向けLinuxカーネルでHDMI出力を復活させる
tags: ファミコンミニ sunxi
---

## 時代は自前ビルド

ファミコンミニで、自前ビルドのLinuxがとうとう[動作しました](http://blog.urandom.team/post/my-linux-kernel-on-nesclassic/)。

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">ファミコンミニで自前ビルドのLinux動いた (My Linux kernel on NES Classic) <a href="https://t.co/00EZZgMx7A">pic.twitter.com/00EZZgMx7A</a></p>&mdash; op (@6f70) <a href="https://twitter.com/6f70/status/797939754528444416">November 13, 2016</a></blockquote>

Linuxカーネルのビルドは面倒な作業が予想されたので先延ばしにしてたわけですが（負け惜しみ風）、一応動作する方法が公開されたので良しとします。

とりあえず、自前ビルドを手元で追試してみましたが、正常に動作するカーネルが得られました。

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">ファミコンミニのLinux動かす記事の追試してみた（<a href="https://t.co/LbBWgdAwsk">https://t.co/LbBWgdAwsk</a>）、動いたでい！ <a href="https://t.co/Z6O3EDlQOE">pic.twitter.com/Z6O3EDlQOE</a></p>&mdash; NV(*´ω｀*) (@nvsofts) <a href="https://twitter.com/nvsofts/status/798569114126073856">November 15, 2016</a></blockquote>

## 動くカーネルを得るための技

動くカーネルを得るためのカーネルコンフィグは判明していますが、問題はinitramfsです。
デフォルトのカーネルコンフィグではinitramfsがgzipで圧縮されていることを期待しますが、ファミコンミニの元々のinitramfsはlzopで圧縮されています（展開したことある人ならわかるでしょうけど）
そのため、initramfsをgzipで圧縮し直すかカーネルコンフィグの設定(`CONFIG_HAVE_KERNEL_LZO`)をいじらないと展開に失敗し、kernel panicを起こしてしまいます。

この記事を読んでいる人はおそらくinitramfsは書き換え前提だと思うので、ここでは展開したinitramfsを再びgzipにするためのコマンドを書いておきます。
一時的にファイルをroot所有に見せるためにfakerootコマンドを併用して、

```bash
$ cd path/to/initramfs/
$ find . | fakeroot cpio -o -H newc | gzip > initramfs.img.gz
```

とするといい感じにinitramfsをcpioで固めた後にgzipで圧縮したファイルができあがります。
cpioコマンドの`-H newc`を忘れるとフォーマットが変わるのでカーネルが読めないファイルができます。要注意。

## HDMIを復活させる

HDMIを復活させるには、カーネルコンフィグをいじってフレームバッファを有効化する必要があります。

まず、カーネルコンフィグ(`.config`)を以下のように設定します。
このへんは[linux-sunxi.orgに書いてあること](http://linux-sunxi.org/Display)とほぼ一緒です。

```text
CONFIG_FB_SUNXI=y
CONFIG_FB_CONSOLE_SUNXI=y
CONFIG_LCD_SUNXI=y
CONFIG_FRAMEBUFFER_CONSOLE=y
CONFIG_FRAMEBUFFER_CONSOLE_DETECT_PRIMARY=y
CONFIG_FONTS=y
CONFIG_FONT_8x8=y
CONFIG_FONT_8x16=y
```

なお、ファミコンミニで使われているHDMIトランスミッタ(EP952)のドライバは勝手にビルドされます（Makefile参照）

設定をしたらカーネルをビルドします。その後、initramfs等と結合してAndroid形式のブートイメージを作成しますが、その際に使う`bootimg.cfg`に変更を加えます。

```text
(snip)
cmdline = ~~~ console=tty0 console=ttyS0,115200 ~~~
```

元々あった`console=`の前に、`console=tty0`を追加します（この変更は必要ないかもしれません）

こうして作成したイメージで起動させるとHDMIの信号が出力されるようになり、また`/dev/fb0`からフレームバッファとして触れるようになっているはずです。
フレームバッファが正常に動作しているかを確かめるには[このプログラム](https://gist.github.com/rafalrusin/1482697)がよさそうです。

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">ファミコンミニのHDMI、改めて拾ってきたサンプルプログラムでフレームバッファが動作していることを確認 <a href="https://t.co/p7a8DjH4ak">pic.twitter.com/p7a8DjH4ak</a></p>&mdash; NV(*´ω｀*) (@nvsofts) <a href="https://twitter.com/nvsofts/status/798894189383553024">November 16, 2016</a></blockquote>

## 最後に

出来る限り思い出しながら書いていますが、書き足りない部分があったらすいません。
