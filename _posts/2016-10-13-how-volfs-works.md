---
layout: post
title: Bash on Ubuntu on Windowsのファイルシステムってどうなってるの？
tags: WSL NTFS
---

Windows 10 Anniversary UpdateではWindows上でLinuxバイナリ版のBash等を動かす機能である、Bash on Windows on Ubuntuが追加されました。

Anniversary Updateの提供開始直後に「やっと来た！」とわくわくしながらアップデートして試した方も多いはずです。

この記事では、~~今更ながら~~Bash on Windows on Ubuntuのファイルシステムがどのように作られているかを解説します。

<!--more-->

#### Linuxバイナリを動かすためのサブシステム

「ファイルシステム関係ないやん！」って思った方もいると思いますが、簡単に説明する必要があると思うので説明します。

普段意識していないと思われますが、WindowsのNTカーネルはWin32APIを使ったアプリケーション以外を動かすための仕組みが存在します。
それがサブシステムと言われる仕組みで、かつてはOS/2やPOSIX準拠のアプリケーションを動かすために使用されました。

このサブシステムの仕組みを使って実装されたものにWindows Subsystem for Linux(WSL)があり、WSLを使用してBash on Ubuntu on Windowsは実現されています。
要するに、Bash on Ubuntu on Windowsの内部を知りたいのであればWSLを調べる必要があります。

詳しくは以下のページを参照すると良いでしょう。

[Windows Subsystem for Linux Overview](https://blogs.msdn.microsoft.com/wsl/2016/04/22/windows-subsystem-for-linux-overview/)

[Windows Subsystem for Linuxの中身を詳しく見る](http://ascii.jp/elem/000/001/246/1246548/)

[Windows Subsystem for Linux Internals](https://speakerdeck.com/ntddk/windows-subsystem-for-linux-internals)

#### WSLのファイルシステム

WSLのファイルシステムについては、MSDN公式のブログでは["WSL File System Support"](https://blogs.msdn.microsoft.com/wsl/2016/06/15/wsl-file-system-support/)という記事で触れられています。

以下の画像は、この記事から引用したWSLのファイルシステムの図です。

![WSLのファイルシステム]({{ site.baseurl }}/assets/posts/2016-10-13/wsl_filesystem.png)

WSL上で動作するbash等のアプリケーションがopen(2)などのシステムコールを呼び出すと、その呼び出しはLxcore.sysで処理されます。
Lxcore.sys内部ではパスに応じて適切なファイルシステムプラグインへと振り分け、システムコールを処理します。

ファイルシステムプラグインは、大きく分けて4つ存在します。

- VolFs

    /, /root, /homeなど、WSLで使用されるファイルの大半を格納している

- DrvFs

    /mnt/cをはじめとした、Windowsで認識されているドライブへのアクセスを提供

- TmpFs

    /devなど、一時的に利用されるファイルが格納されるインメモリファイルシステム

- ProcFs, SysFsなど

    Linuxの/procや/sysなどに相当する機能を提供

上記の通り、WSLで使用されるファイルは通常はVolFsに格納されます。

#### VolFsの正体

VolFsの正体は、`%USERPROFILE%\AppData\Local\lxss`以下のフォルダです。

通常このフォルダはエクスプローラ等からは見えなくなっていますが、ファイル名を指定して実行等で直接アクセスすると見ることができます。
「WindowsからもVolFsの中身を読み書きできるのでは？」と思う人も居るかもしれませんが、これは半分合っていて半分間違っています。

実はVolFsはWSL上で設定したパーミッションや所有者などのLinux特有の情報が保持しており、WSLを通さずにWindowsから直接VolFsの中身を書き換えるとWSLからファイルが見えなくなったりします
(["Filesystem problems: Consolidated"](https://github.com/Microsoft/BashOnWindows/issues/1051)を参照)

#### VolFsはどのようにLinux特有の情報を保持している？

ここまでで述べたとおり、VolFsはパーミッションや所有者などのLinux特有の情報を保持しているため、WSL以外で書き換えるとトラブルの元になります。
しかし、一体なぜそのようなことになるのでしょうか？

答えは、VolFsはLinux特有の情報を保持するためにNTFSの拡張属性を使用しているためです。
WSL以外で書き換えるとファイルに付加された拡張属性が消失してしまうため、ファイルが見えなくなってしまうのです。

NTFSの拡張属性は、追加のメタデータ等を保持するためによく使われる「代替データストリーム」とは異なるものです。
そのためdirコマンドで拡張属性の存在を確認することはできず、専用のツールが必要です。
WSLで使用されている拡張属性を見るためのツールとして、GitHub上に[lxsstat](https://github.com/0xbadfca11/lxsstat)と呼ばれるツールが公開されています。
このツールはLinuxのstat(1)コマンドと似たもので、引数にVolFsに含まれているファイルを渡すとそのファイルに含まれている拡張属性を読みだして表示してくれます。
例として、/etc/shadowの情報を見たときの出力は以下の通りです。

```markup
lxsstat C:\Users\NV\AppData\Local\lxss\rootfs\etc\shadow
  File: 'C:\Users\NV\AppData\Local\lxss\rootfs\etc\shadow'
  Size: 906             Blocks: 8          IO Block: 4096   regular file
Device: 0h/0d   Inode: 39406496739841858  Links: 1
Access: (0640/-rw-r-----)  Uid: (    0/--------)   Gid: (   42/--------)
Access: 2016-10-12 10:38:09.468924800 +0000
Modify: 2016-10-12 10:38:09.468924800 +0000
Change: 2016-10-12 10:38:09.474939300 +0000
```

#### NTFSの拡張属性について

NTFSの拡張属性を理解するためには、まず最初にNTFS上でどのようにしてファイルが格納されているかを知る必要があります。

NTFSにおいて、ファイルはファイルレコードとして格納されます。
これはUNIXにおけるiノードのようなもので、以下に示すヘッダが先頭に付加されています。

|オフセット|サイズ|OS|説明|
|---------:|:----:|:-|:---|
|0x00|4||マジックナンバー 'FILE'|
|0x04|2||アップデートシーケンスへのオフセット|
|0x06|2||アップデートシーケンスのサイズS(WORD単位)|
|0x08|8||$LogFileのシーケンス番号(LSN)|
|0x10|2||シーケンス番号|
|0x12|2||ハードリンクのカウント|
|0x14|2||最初の属性へのオフセット|
|0x16|2||フラグ|
|0x18|4||ファイルレコードの実際のサイズ|
|0x1C|4||ファイルレコードの確保済みサイズ|
|0x20|8||元となるファイルレコードへの参照|
|0x28|2||次の属性ID|
|0x2A|2|XP以降|4バイト境界へ合わせるためのパディング|
|0x2C|4|XP以降|MFTレコードにおける番号|
||2||アップデートシーケンス番号|
||2S-2||アップデートシーケンス配列|

このヘッダ以降には、ファイルについての各種属性が続いており、最後にエンドマーカとして0xFFFFFFFFが出現します。
つまり、ファイルレコードは以下のような構成になっています。

```markup
ヘッダ
属性1
属性2
...
エンドマーカ(0xFFFFFFFF)
```

属性は様々な種類があり、代表的なものとして以下のものがあります。

|属性タイプ|名前|説明|
|---------:|:---|:---|
|0x10|$STANDARD_INFORMATION|ファイルの作成日時など|
|0x30|$FILE_NAME|ファイル名|
|0x50|$SECURITY_DESCRIPTOR|セキュリティ記述子|
|0x80|$DATA|データ(データも属性!)|
|0xE0|$EA|**拡張属性**|

#### 実際に拡張属性を直接見てみる

Windows上で動作するGUIツールもありますが、ここではNTFS-3Gに含まれているntfscatコマンドを使用してWSL上のファイルに含まれている拡張属性を見てみます。
例として、`/etc/shadow`の拡張属性を見てみます。引数に`-a [属性の名前($は除く)]`を与えることで、特定の属性のみを見ることができます。

```command-line
$ sudo ntfscat -a EA /dev/sda3 /Users/NV/AppData/Local/lxss/rootfs/etc/shadow | hexdump -C
00000000  48 00 00 00 00 07 38 00  4c 58 41 54 54 52 42 00  |H.....8.LXATTRB.|
00000010  00 00 01 00 a0 81 00 00  00 00 00 00 2a 00 00 00  |............*...|
00000020  00 00 00 00 80 39 f3 1b  80 39 f3 1b a4 ff 4e 1c  |.....9...9....N.|
00000030  91 12 fe 57 00 00 00 00  91 12 fe 57 00 00 00 00  |...W.......W....|
00000040  91 12 fe 57 00 00 00 00                           |...W....|
00000048
```

このままではよく分からないですが、[lxsstatのヘッダファイル](https://github.com/0xbadfca11/lxsstat/blob/master/lxsstat.hpp)に`Lxss::LXATTRB`構造体として各フィールドの意味が記載されています。
以下に、構造体の前に付加されているのフィールドを含めた一覧表を書いておきます。なお、この表はWSL上のファイルに付加される拡張属性である`LXATTRB`を想定しています。

|オフセット|サイズ|フィールド名|説明|
|---------:|:----:|-----------:|:---|
|0x00|4||次の拡張属性へのオフセット|
|0x04|1||フラグ|
|0x05|1||拡張属性名の長さ(N=7)|
|0x06|2||拡張属性のデータの長さ(V=0x38)|
|0x08|7||拡張属性の名前(LXATTRB)|
|0x0F|1||パディング|
|0x10|4|unknown1|不明|
|0x14|4|st_mode|パーミッション|
|0x18|4|st_uid|UID|
|0x1C|4|st_gid|GID|
|0x20|4|st_rdev|デバイスファイルのメジャー/マイナー番号|
|0x24|4|atime_extra|最終アクセス時刻(小数点以下の部分)|
|0x28|4|mtime_extra|最終変更時刻(小数点以下の部分)|
|0x2C|4|ctime_extra|最終ステータス変更時刻(小数点以下の部分)|
|0x30|8|atime|最終アクセス時刻|
|0x38|8|mtime|最終変更時刻|
|0x40|8|ctime|最終ステータス変更時刻|

この表には無い、iノード番号等は別の情報から決定されるようです。

#### おわりに

Bash on Ubuntu on Windowsこと、Windows Subsystem for Linuxのファイルシステムについて解説しました。
久しぶりにこの手の記事書いたので変なところがあったらコメント等にお願いします。

~~ずっと放置してる壊れたNTFSパーティションどうしようかなぁ…~~
