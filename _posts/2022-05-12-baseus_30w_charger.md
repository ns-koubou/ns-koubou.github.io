---
layout: post
title: Baseus Super Si 30W PD充電器 CCCJG30CS レビュー
tags: レビュー 充電器
---

**（商品提供を受けて記事を作成しています、それ以上の対価は発生していません）**

Baseusの「[Super Si 30W PD充電器 CCCJG30CS](https://www.amazon.co.jp/dp/B09X1M4BN1)」をいただきました。

<!--more-->

## 外箱

いつも通りのBaseusといった外箱です。

![外箱]({{ site.baseurl }}/assets/posts/2022-05-12/package.jpg){: .width50}

これもいつも通りですが、真贋判定用のコードが書かれたシールが付いています。

![真贋判定用シール]({{ site.baseurl }}/assets/posts/2022-05-12/fake_checker.jpg){: .width75}

## 見た目と付属品

プラグは折り畳み式なので、かなり小さくなります（<del>オタクなので小さすぎるとなくしそうですが</del>）

![見た目]({{ site.baseurl }}/assets/posts/2022-05-12/product.jpg){: .width75}
![ポート部分]({{ site.baseurl }}/assets/posts/2022-05-12/port.jpg){: .width75}
![スペック表示]({{ site.baseurl }}/assets/posts/2022-05-12/spec.jpg){: .width75}

付属品は

- 説明書（英語、中国語）
- 保証カード
- Baseus製品恒例のシール

が付いています。

![付属品]({{ site.baseurl }}/assets/posts/2022-05-12/documents.jpg)

PSEマークは特定電気用品用で、

- 登録検査機関：テュフ ラインランド
- 販売事業者：株式会社神州

となっています。

また、登録検査機関における認証番号はJPTUV-13310のようです（詳細は[こちら](https://www.certipedia.com/certificates/03133108?locale=en)）

## テスト

ここからのテストには[AVHzY CT-3](https://www.amazon.co.jp/dp/B08MDDH385)を使用しています。

### 急速充電規格

TypeAで検出した際の結果がこちら。

![急速充電規格（TypeA）]({{ site.baseurl }}/assets/posts/2022-05-12/qc_usb_a.jpg){: .width50}

TypeCで検出した際の結果がこちら。

![急速充電規格（TypeC）]({{ site.baseurl }}/assets/posts/2022-05-12/qc_usb_c.jpg){: .width50}

どちらも、多くの急速充電規格に対応している結果になっています。
これを良いと思うか悪いと思うかは人次第だと思います。

### USB PD PDO

5/9/12/15/20Vと、PPSに対応しています。

![USB PD PDO]({{ site.baseurl }}/assets/posts/2022-05-12/pd_pdo.jpg){: .width50}

### 過電流保護

CT-3に付けている電子負荷モジュールを使って、USB PD：20Vにおける最大電力を調べてみます（<del>電流と電力をごっちゃにするなとか言わない</del>）

![過電流保護の調査結果]({{ site.baseurl }}/assets/posts/2022-05-12/ocp_graph.png)

結果、20Vでは35W後半あたりが引ける最大電力のようです。

なおPPSでは最大33Wとか引ける（11V/3A）ように見えますが、**引こうとするとリセットがかかってしまいます**（32Wとかでは大丈夫）
そのため、PPSできわどい使い方をする際は注意が必要です。

### 温度

USB PDで20Vをトリガーし、電子負荷で30Wを1時間引き続けたときの温度グラフです。測定はコンセントと製品との間にCT-3のサーミスタを挟む形で行っています。
途中変に温度が落ちてるところは動いてしまったせいだと思われます。

![温度グラフ]({{ site.baseurl }}/assets/posts/2022-05-12/temp_graph.png)

触れないほど熱くなることはありませんでしたが、無理をさせる（放熱が悪いところに押し込む、etc）のはよろしくないと思います。

## 感想

昔のiPhoneに標準で付いていたアダプタを代替するにはちょうどいい感じです。
USB PDのPPS以外は問題ない感じです。

最近の複数ポート備えた多くのアダプタに言えることですが、複数ポート使おうとした際に給電が一瞬リセットされてしまうのは用途によっては困るかもしれないです
（使用ポート数が少ないときに多くの電力を出せるようにするためには仕方ないのですが）
