# 英語音読トレーナー ― GAS API + GitHub Pages 構成 セットアップ手順

## なぜこの構成なのか(背景)

GASのWebアプリは二重のiframeの中で動くため、その中では音声認識(マイク)が使えません。
これはGoogleがユーザーのコードを隔離するためのセキュリティ仕様で、設定では回避できません。

そこで、役割を分けます。

- **GAS** … 例文データをJSONで返す「API」に徹する(画面は持たない)
- **GitHub Pages** … 画面(index.html)を置く。iframeの外なので音声認識が動く

一つのURL(GitHub PagesのURL)で完結し、例文はスプレッドシートから読み込む、
という両取りができます。

---

## 全体像

1. GAS側を「JSONを返すAPI」としてデプロイ → APIのURLを得る
2. GitHubにリポジトリを作り、index.html を置く
3. index.html にAPIのURLを1か所貼る
4. GitHub Pages を有効化 → 公開URLを得る
5. その公開URLをスマホ・PCで開く

所要時間は15〜20分ほど。GitHubアカウントが必要です(無料)。

---

## 手順1:GASをAPIとしてデプロイする

1. 例文スプレッドシートを開き、**拡張機能 → Apps Script**
2. `Code.gs` の中身を、添付の **`Code.gs`(API版)** にまるごと置き換えて保存
   - シート名が `Sheet1` でなければ、先頭の `SHEET_NAME` を実際の名前に変更
3. **デプロイ → 新しいデプロイ → 種類「ウェブアプリ」**
4. 設定をこうする(★重要):
   - 次のユーザーとして実行:**自分**
   - アクセスできるユーザー:**全員**
     ※ GitHub Pages(別ドメイン)から呼ぶため、ここは「全員」にする必要があります。
       返すのは例文だけで、スプレッドシートの編集権限は渡りません。
       ただし例文の中身は、URLを知る人なら誰でも読める状態になる点は理解しておいてください。
       (機微な内容を例文に入れない、という運用で対応)
5. デプロイし、承認を済ませ、発行された **ウェブアプリURL(末尾 /exec)** をコピー
   - ※ 前回同様、デプロイ権限のあるアカウントで実行してください

### 動作確認
コピーしたURLをブラウザのアドレスバーにそのまま貼って開くと、
例文がJSON(文字の羅列)で表示されれば成功です。

---

## 手順2:GitHubリポジトリを作る

1. https://github.com にログイン(なければ無料登録)
2. 右上「＋ → New repository」
3. 設定:
   - Repository name:任意(例 `ondoku-trainer`)
   - **Public** を選ぶ(GitHub Pagesの無料公開にはPublicが簡単)
   - 「Add a README file」にチェック
4. 「Create repository」

---

## 手順3:index.html を置く

1. 作ったリポジトリの画面で「Add file → Create new file」
2. ファイル名を **`index.html`** にする
3. 添付の **`index.html`(GitHub Pages版)** の中身をまるごと貼り付ける
4. 貼り付けたHTMLの上のほう、この行を探す:
   ```javascript
   var GAS_API_URL = "ここにGASのexec URLを貼る";
   ```
   ここを、手順1でコピーしたGASのURLに置き換える:
   ```javascript
   var GAS_API_URL = "https://script.google.com/macros/s/AKfy..../exec";
   ```
5. 下の「Commit changes」で保存

---

## 手順4:GitHub Pages を有効化する

1. リポジトリの「Settings」タブ
2. 左メニュー「Pages」
3. 「Build and deployment」→ Source を **Deploy from a branch**
4. Branch を **main**、フォルダ **/(root)** にして Save
5. 少し待つ(1〜2分)と、上部に公開URLが表示される
   例:`https://<ユーザー名>.github.io/ondoku-trainer/`

このURLがアプリの入り口です。

---

## 手順5:使う

- **PCのChrome**:URLを開くと「🎤 話す」ボタンが出て、音声認識・答え合わせが動きます。
- **iPhone**:音声認識は使えないため「🎤 話す」は自動で隠れ、クイズとして使えます。
  発音チェックはこれまで通りGoogle Meetの字幕で。
- スマホは「ホーム画面に追加」で1タップ起動に。

---

## これ以降の運用

- **例文を増やす/直す** → スプレッドシートに書くだけ。アプリを開き直せば反映。
- **画面の見た目を変える** → GitHubの index.html を編集(Pagesは自動で再公開)。
- GASのURLは一度貼れば変更不要(再デプロイでURLが変わった時だけ貼り直し)。

---

## 困ったとき

- **「設定が必要です」と出る** → index.html の `GAS_API_URL` にURLを貼り忘れ。
- **「APIに接続できませんでした」** → GASのアクセス設定が「全員」になっているか、URLが /exec で終わっているか確認。
- **JSONは出るのに画面が空** → スプレッドシートの列順(A=カテゴリ, B=英語, C=日本語)を確認。
- **音声が一瞬で切れる** → GitHub PagesのURL(https://…github.io/…)で開いているか確認。GASのURL(script.google.com)で直接開くと、それはiframe版なので音声は動きません。
