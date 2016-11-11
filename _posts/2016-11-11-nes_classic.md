---
layout: post
title: ニンテンドークラシックミニ ファミリーコンピュータの中身の話
tags: NES sunxi
---

2016/11/10に発売された任天堂の「[ニンテンドークラシックミニ ファミリーコンピュータ](https://www.nintendo.co.jp/clv/)」についてです。

(以下、ファミコンミニと略します [GBAのやつ](https://www.nintendo.co.jp/n08/fsmj/)ではないので注意)

発売前に分解した人が出たりしたことで

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Unless you want to desolder flash memory from the motherboard, looks like it&#39;s impossible to add new games to NES Classic. <a href="https://t.co/jc99WSrNJj">pic.twitter.com/jc99WSrNJj</a></p>&mdash; Peter Brown (@PCBrown) <a href="https://twitter.com/PCBrown/status/793933537867022336">November 2, 2016</a></blockquote>

中身への関心が高まっていましたが、本記事ではもう少し詳しいところまで掘り下げたいと思います。

## まず最初に

ここに書いてある情報の利用は自己責任でお願いします。

## 基本スペック

- SoC: [Allwinner R16](http://www.allwinnertech.com/index.php?c=product&a=index&id=51) (4-core ARMv7)
- RAM: Nanya NT5CC128M16IP-DI (256MB)
- NAND: Macronix MX30LF4G18AC-TI (512MB)
- PMU(Power Management Unit): X-POWER AXP223
- HDMI Transmitter: EPMI EP952

ファミコンエミュレータのためだけにクアッドコアCPUを載せるとか若干オーバースペック感があります。

また、SoC単体ではHDMI出力ができないようなので別途HDMIを扱うためのICを積んでいます。

## UARTを探そう

使用されているOSSの表記から、U-Bootを使ってLinuxをブートさせていることはすぐに判明しました。
U-Bootが使われているとなると、まず最初にするべきことと言えばUARTのピン探しです。

基板表側(SoCのある側)の右下の方に謎のテストパッドの集合がありますが、ここにUARTが出ています。

![基板のUARTの位置]({{ site.baseurl }}/assets/posts/2016-11-11/uart.jpg)

UARTのテストパッドから配線で引き出し、USB-シリアル変換モジュールへと接続します。

手持ちの秋月の[FT232HLモジュール](http://akizukidenshi.com/catalog/g/gK-06503/)を使用しました。
信号レベルは3.3V、速度は115200bpsです。

## U-Bootとの初対面

ファミコンミニ側のUSB端子を接続すると、以下のような出力がされます。

```text
[      0.207]

U-Boot 2011.09-rc1 (Aug 30 2016 - 12:07:36) Allwinner Technology

[      0.215]version: 1.1.0
[      0.217]uboot commit : 2f04d11e4dfd9d5022e33833412462859727bdcc

ready
no battery, limit to dc
no key input
dram_para_set start
dram_para_set end
Using default environment

In:    Out:   Err:
```

この状態で電源スイッチを入れると、以下のような出力がされます。

```text
[      0.207]

U-Boot 2011.09-rc1 (Aug 30 2016 - 12:07:36) Allwinner Technology

[      0.215]version: 1.1.0
[      0.217]uboot commit : 2f04d11e4dfd9d5022e33833412462859727bdcc

ready
no battery, limit to dc
no key input
dram_para_set start
dram_para_set end
Using default environment

In:    Out:   Err:
Uncompressing Linux... done, booting the kernel.
```

そして電源スイッチを切ると、以下のような出力がされます。

```text
The system is going down NOW!
Sent SIGTERM to all processes
Sent SIGKILL to all processes
Requesting system poweroff
```

出力から、OSがLinuxであるということが確認できました。

### U-BootといえばCLIでしょ？

U-Bootが使われているとわかったのであれば、様々なコマンドが使えるCLIが使いたくなると思います。
しかしよくありがちなCtrl+C等を入力しても自動起動は止まってくれません。

どうやら、`'s'`キーをずっと入力した状態で電源スイッチを入れると自動起動が止まるようです。
実際に試してみると、長々とログが出た後にCLIに入ります。

```text
key_press
0x00000073
HELLO! BOOT0 is starting!
boot0 version : 4.2.0
boot0 commit : 2f04d11e4dfd9d5022e33833412462859727bdcc

(長いので省略)

--------fastboot partitions--------
mbr not exist
base bootcmd=sunxi_flash phy_read 43800000 30 20;boota 43800000
bootcmd set setargs_nand
key 0
cant find rcvy value
cant find fstbt value
no misc partition is found
to be run cmd=sunxi_flash phy_read 43800000 30 20;boota 43800000
WORK_MODE_BOOT
board_status_probe
[      0.580]key trigger
[      0.582]Hit any key to stop autoboot:  0
clover#
```

`sunxi`というのはAllwinner製のSoCのことを指しています。

## USBの役割

ファミコンミニのUSB端子のD+ピンとD-ピンはスマホの急速充電ケーブルのようにショートしておらず、SoCに接続されています。

これは、以下のようにデバイスとして認識させて合法的に500mAの電力を要求するため以外にも、FELモード(後述)の通信路としても使われます。

```text
[12789.267435] usb 3-13: New USB device found, idVendor=057e, idProduct=2042
[12789.267437] usb 3-13: New USB device strings: Mfr=1, Product=2, SerialNumber=3
[12789.267438] usb 3-13: Product: CLV-S-HVCY
[12789.267439] usb 3-13: Manufacturer: Nintendo Co., Ltd
```

ちなみに、`VID=0x057E`は任天堂です。

## FELモードへ入る

FELモードとはAllwinner製のSoCに搭載されているリカバリ等に使えるモードで、ファミコンミニでは3種類の入り方があります。

1. リセットボタンを押しながらUSBを接続
2. UARTに`'2'`を送信しながらUSBを接続
3. U-BootのCLIで`fastboot`コマンドを実行

このうち1.と2.については、DRAMの初期化が行われないため使い物にならない状態でFELモードに入ってしまいます。
残った3.はU-BootがDRAMを初期化してくれているので、問題なく操作が行えます。

FELモードに入ったSoCの操作は、[sunxi-tools](https://github.com/linux-sunxi/sunxi-tools)に含まれている`sunxi-fel`コマンドで行います。
試しに、SoCのバージョン情報を見てみます。

```bash
$ ./sunxi-fel ver
AWUSBFEX soc=00001667(A33) 00000001 ver=0001 44 08 scratchpad=00007e00 00000000 00000000
```

FELモードではメモリの読み書きも行えるので、自前でビルドしたU-Bootのバイナリ等を読ませて実行することもできます。

以下に`sunxi-fel`コマンドのヘルプを貼っておきますが、これを見るだけでいろいろできそうなことが分かるかと思います。

```text
Usage: ./sunxi-fel [options] command arguments... [command...]
        -v, --verbose                   Verbose logging
        -p, --progress                  "write" transfers show a progress bar
        -d, --dev bus:devnum            Use specific USB bus and device number

        spl file                        Load and execute U-Boot SPL
                If file additionally contains a main U-Boot binary
                (u-boot-sunxi-with-spl.bin), this command also transfers that
                to memory (default address from image), but won't execute it.

        uboot file-with-spl             like "spl", but actually starts U-Boot
                U-Boot execution will take place when the fel utility exits.
                This allows combining "uboot" with further "write" commands
                (to transfer other files needed for the boot).

        hex[dump] address length        Dumps memory region in hex
        dump address length             Binary memory dump
        exe[cute] address               Call function address
        reset64 address                 RMR request for AArch64 warm boot
        readl address                   Read 32-bit value from device memory
        writel address value            Write 32-bit value to device memory
        read address length file        Write memory contents into file
        write address file              Store file contents into memory
        write-with-progress addr file   "write" with progress bar
        write-with-gauge addr file      Output progress for "dialog --gauge"
        write-with-xgauge addr file     Extended gauge output (updates prompt)
        multi[write] # addr file ...    "write-with-progress" multiple files,
                                        sharing a common progress status
        multi[write]-with-gauge ...     like their "write-with-*" counterpart,
        multi[write]-with-xgauge ...      but following the 'multi' syntax:
                                          <#> addr file [addr file [...]]
        echo-gauge "some text"          Update prompt/caption for gauge output
        ver[sion]                       Show BROM version
        sid                             Retrieve and output 128-bit SID key
        clear address length            Clear memory
        fill address length value       Fill memory
```

FELモードを使ってNAND上のブートイメージを吸い出すことに成功していますが、これ以上は試していないです。

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="ja" dir="ltr">.<a href="https://twitter.com/naobsd">@naobsd</a> clover# でsunxi_flashコマンドを使ってカーネルイメージをDRAM上に展開した上で、fastbootに入って当該箇所を吸い出したら吸えました！ <a href="https://t.co/7tNYxN2bnj">pic.twitter.com/7tNYxN2bnj</a></p>&mdash; NV(*´ω｀*) (@nvsofts) <a href="https://twitter.com/nvsofts/status/797037505295986693">November 11, 2016</a></blockquote>

## コントローラとか

WiiリモコンのI<sup>2</sup>Cバスと互換があるようなので省略します。
そもそもこの記事を書いている時点ではコントローラは未分解です。

## 最後に

貴重な情報を提供してくれた、[@naobsd](https://twitter.com/naobsd)氏と[@emuonpsp](https://twitter.com/emuonpsp)氏に感謝します。

sunxi上でのLinux動作に関する情報はWikiとしてまとまっていて、[ファミコンミニのページ](http://linux-sunxi.org/Nintendo_NES_Classic_Edition)もあるようです。
