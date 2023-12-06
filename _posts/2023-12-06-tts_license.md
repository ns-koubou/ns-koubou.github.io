---
layout: post
title: 有料系音声合成ソフトのライセンス認証について
tags: 音声合成 ライセンス
---

この記事は、[ぼすきー Advent Calendar 2023](https://adventar.org/calendars/8776)の6日目の参加記事です。

<!--more-->

## 注意

**このページを読んでも、割る方法は書いてないのであしからず**

## はじめに

本記事では、以下のソフトについて扱います。

- AITalk 4、およびそれ以前を採用したAITalk系ソフト
  - VOICEROID（+/+ EX/2を含む）
  - ギャラ子Talk
  - 音街ウナTalk Ex
  - ガイノイドTalk
- CeVIO系ソフト（VoiSona系を除く）
  - CeVIO CS
  - CeVIO AI
- Dreamtonics社製ソフト
  - Synthesizer V
  - VOICEPEAK
- VOCALOIDシリーズ

## AITalk系

### AITalk IIまで

以下のソフトが該当します。

- VOICEROID
- VOICEROID+（琴葉 茜・葵を除く）

これらは、インストール時にシリアル番号のチェックがあるだけで、初回起動時のアクティベーションは必要ありません。
そのため、LinuxでWineを使って動作した、との報告がある程には様々な環境で動作します（当然ですが自己責任で）

## AITalk 3

以下のソフトが該当します。

- VOICEROID+ 琴葉 茜・葵
- VOICEROID+ EXシリーズ
- ギャラ子Talk
- 音街ウナTalk Ex

これらのソフトは、[Thales Sentinel LDK](https://cpl.thalesgroup.com/ja/software-monetization/license-development-kit-ldk)によるDRMがかかっており、アクティベーションが必要になっています。
また、動作モードが「SL AdminMode」になっており、専用のランタイムとドライバを必要とします。

ランタイムとドライバは、ソフトのインストール時に自動的に導入されますが、古いバージョンが同梱されている場合があります。
古いバージョンのランタイムで導入されるドライバを最近のWindowsで使用すると、ブルースクリーンになることが報告されています。

この問題は、先に最新版のランタイムをインストールしておくことで防ぐことができます。
ダウンロードは[Thalesのサポートページ](https://supportportal.thalesgroup.com/csm?id=kb_search&spa=1&query=Sentinel%20HASP%2FLDK%20Windows%20GUI%20Run-time%20Installer)から行えます。

なお、初登場がVOICEROID+ EXシリーズではない、以下の話者に関しては旧バージョンをインストールすることも可能です。

- 月読アイ
- 月読ショウタ
- 鷹の爪 吉田くん
- 民安ともえ
- 結月ゆかり
- 東北ずん子

旧バージョンをインストールした場合「AITalk IIまで」の内容に準じますが、当然ながら機能も制限されます。

## AITalk 4

以下のソフトが該当します。

- VOICEROID2
- ガイノイドTalk

これらのソフトも、Thales Sentinel LDKが使用されていますが、動作モードが「SL UserMode」になっており、問題が起きにくくなっています。

## CeVIO系

CeVIO CS / AIともに、事前の作業なしに使用するPCを変えることができます。
新しいPCで認証した際にライセンスの移行手続きを求められるので、了承するだけで完了します。

ただし、PCの変更は**24時間に1回**になります（参考：[公式FAQ](https://cevio.jp/guide/cevio_ai/faq/)）

オフライン起動を悪用した事例が多かったのか、CeVIO AIのバージョン8.5.2.0でオフライン起動時に機能制限が加わるようになりました。

## Dreamtonics社製ソフト

最初からMac / Linux版が存在するため、システムを選ぶようなDRMはかかっていません。
そのため、現時点では問題なく使用することができます。

## VOCALOIDシリーズ

VOCALOID4まで使われていた「Activate4（VOCALOID4 Activator）」と、VOCALOID5以降にも対応した「VOCALOID Authorizer」では若干の機能差があります。

主な機能の差は、V4までのライブラリの認証を行う際の、紐づけるデバイスを以下から選択できるか、です。

- システムドライブ
- 指定したNIC

|            | 紐づけデバイス | V4まで | V5/V6 |
|------------|---------------:|:------:|:-----:|
| Activate4  |         選択可 |   〇   |   ×   |
| Authorizer |       選択不可 |   〇   |   〇  |

## ディアクティベーション

本記事で扱っているソフトの中で、ディアクティベーション（認証解除）操作があるソフトは以下の通りです。

- Dreamtonics社製ソフト
- VOCALOIDシリーズ

間違われることがありますが、VOICEROIDシリーズにはディアクティベーションという概念は存在しません。

## Thales Sentinel LDKについてもう少し

AdminMode・UserMode関係なしに、アクティベーションした状態からいきなり無効になる、という事案が確認されています。
この場合、基本的には諦めてもう一度アクティベーションするしかありません。

ランタイムをインストールしていると、`http://localhost:1947/` に「Sentinel Admin Control Center」と呼ばれる専用の管理画面がサービスするようになります。
ここでは、アクティベーションされているライセンスの一覧などを確認することができます。

この管理画面は、初期状態では全てのネットワークインターフェースに対して見せる設定になっています。
そのため、気になる人は「Configuration」→「Network」→「Network Visibility」をNone (Local Access Only)に設定しておくと良いと思います。

![ネットワーク設定画面](/assets/posts/2023-12-06/sentinel.png)
