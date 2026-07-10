# 授業向けidobata: 政治色除去と常設クラウド運用 設計書

作成日: 2026-07-10

## 目的

中学校の授業（総合的な学習の時間・学級会・道徳など）で、生徒がGIGA端末から匿名で意見を投稿し、AIが論点整理・まとめを生成する「授業中の意見集約の場」として idobata（いどばたビジョン）を運用できるようにする。

前提となる既存作業（コミット fe6b89d）:
- デフォルトサイト名は「みんなの対話の場」に中立化済み
- `docs/学校向けセットアップ.md` 作成済み（管理画面からのテーマ・サイト名設定手順）

## 利用シナリオ

1. 先生が管理画面（`/admin/`）にログインし、授業のテーマ（例:「どうすれば、クラスみんなが過ごしやすい教室にできるか？」）を登録する
2. 生徒がGIGA端末のブラウザでサイトURLを開き、アカウント登録なしでテーマの対話に参加する（ニックネーム任意・本名禁止）
3. AIチャットが生徒の意見を深掘りし、課題・解決策を抽出する
4. 論点整理・レポートが自動生成され、クラス全体の振り返りに使う
5. 授業終了後、先生がテーマをアーカイブまたは削除する

## スコープ

1. 生徒に見える範囲とLLM出力の政治色除去
2. 政治専用モジュールを除いた授業用デプロイ構成の作成
3. VPSへの本番デプロイ（HTTPS対応）
4. 匿名運用ルールと授業前チェックリストの文書化

## 非スコープ

- legacyルート（`/legacy`）配下のUI文言（VisualizationArea / AdminPanel / DataList の「政策ドラフト」表記）。生徒の導線に存在しないため触らない
- `policyGenerator.js` / `digestGenerator.js` のプロンプト。legacy画面からのみ起動され、授業では使わない
- policy-edit モジュール（マニフェスト改善提案）。デプロイ対象から除外するのみで、コードは削除しない（upstream追従を容易にするため）
- 生徒向け認証の追加。既存の匿名参加（localStorage内の自動生成ID）をそのまま使う

## 変更内容

### A. 文言・LLMプロンプトの中立化

| 対象 | 変更 |
|---|---|
| `frontend/src/pages/Themes.tsx:28` | 「全国から寄せられた多様な意見をもとに、重要な社会課題について議論するテーマを設定しています。」→「みんなから寄せられた意見をもとに、話し合うテーマを設定しています。」 |
| `idea-discussion/backend/workers/reportGenerator.js` | プロンプト内「市民からの意見」→「参加者からの意見」 |
| `idea-discussion/backend/workers/extractionWorker.js` | 課題・解決策抽出の良い例（行政サービスのオンライン化・市民フォーラム等の題材、86/102/158/161/174行目付近）を学校生活題材（例: 教室の過ごしやすさ、清掃活動、行事運営）の例示に差し替え。例示の構造（主語・状況・影響を明示する形式）は維持する |
| `idea-discussion/backend/controllers/chatController.js` | デフォルトシステムプロンプト（2箇所、350行目・365行目付近）に「中学生にもわかる平易な言葉で応答すること」を1項目追加。テーマ別カスタムプロンプトによる上書きは既存機能をそのまま使う |

確認済み: チャットのデフォルトプロンプト、`debateAnalysisGenerator.js`、`questionVisualReportGenerator.js` は政治的文言を含まないため変更不要。

### B. 授業用デプロイ構成

- **`docker-compose.classroom.yml`** を新規作成: `mongo` / `idea-backend` / `frontend` / `admin` / `python-service` / `nginx` の6サービスのみ。`policy-frontend` / `policy-backend` / `postgres-policy` を含めない。既存 `docker-compose.yml` は開発用としてそのまま残す
- **`nginx.classroom.conf`** を新規作成: 既存 `nginx.conf` をベースに `/policy/` と `/api/policy/` の location と対応する upstream を削除。`server_name` は実ドメイン。443のHTTPS block を有効化（Let's Encrypt証明書のパスを指定）し、80番はHTTPSへリダイレクト
- **`.env` 本番値**（`.env.template` から作成、gitにはコミットしない）:
  - `OPENROUTER_API_KEY`（対話・抽出・レポート生成）
  - `OPENAI_API_KEY`（python-service の埋め込み生成）
  - `JWT_SECRET`（`openssl rand -hex 32` で生成）
  - `IDEA_CORS_ORIGIN` / `VITE_FRONTEND_ALLOWED_HOSTS` / `VITE_ADMIN_FRONTEND_ALLOWED_HOSTS` を本番ドメインに
  - policy系・GitHub App系の変数は設定しない
- **HTTPS**: certbot（standalone または webroot）で Let's Encrypt 証明書を取得・自動更新。GIGA端末のフィルタリングは非HTTPSサイトを遮断することが多いためHTTPS必須とする

### C. インフラ要件

- Ubuntu 22.04以降のVPS、メモリ2GB以上（Node×2 + Python + MongoDB + nginx の6コンテナ構成のため）、docker compose v2
- 例: さくらのVPS 2Gプラン相当（月1,000円前後）。docker composeが動けばプロバイダは問わない
- 独自ドメイン1つ（サブドメイン可）をVPSのIPに向ける

### D. 管理者アカウントと初期設定

- 初回デプロイ時に管理者（先生）アカウントを作成する手順を文書化する（`idea-discussion/backend` の認証まわり: `authController.js` / `localAuthProvider.js` の初期ユーザー作成方法を実装時に確認し、シードスクリプトが無ければ作成用の一回限りのスクリプトを追加する）
- 管理画面からサイト名・「このサイトについて」を授業用に設定（既存機能）

### E. プライバシーと運用ルール（`docs/学校向けセットアップ.md` に追記）

- 生徒の参加はアカウント不要。ブラウザごとの自動生成ID（localStorage）で識別され、表示名は任意入力
- **本名・個人が特定できる情報の入力禁止**を授業ルールとして明記（ニックネームのみ可）
- サーバーに保存されるのは意見テキストと匿名IDのみ。児童の個人データ（氏名・学籍情報等）は保持しない
- 授業終了後のテーマ削除（関連データ含む）手順を記載
- 授業前チェックリスト: 前日までに学校ネットワークのGIGA端末から本番URLへの疎通確認（フィルタリング解除申請が必要な場合のリードタイムを考慮）、テーマ登録、管理画面ログイン確認、LLM APIキーの残高確認

## データフロー（授業時）

生徒端末（GIGA端末・ブラウザ）→ HTTPS → nginx → frontend / idea-backend → MongoDB（意見・匿名ID）
idea-backend → OpenRouter API（対話・抽出・レポート生成）、python-service → OpenAI API（埋め込み）

## エラー・障害時の扱い

- LLM APIが応答しない場合もチャット投稿自体は保存される（既存挙動）。授業では「投稿は残るので後で分析される」旨を先生向け文書に記載
- 授業中にサーバーが落ちた場合の代替（口頭・紙での継続）は運用側の判断とし、システム要件にはしない

## テスト・検証

1. ローカルで `docker-compose.classroom.yml` を起動し、E2E確認: テーマ作成 → 生徒画面から匿名投稿 → 課題・解決策の抽出 → 論点整理・レポート生成 → 生徒画面での表示
2. LLM出力の確認: 学校題材のテーマで抽出・レポートを生成し、政治的文言（政策・市民等）が出力されないこと、中学生に読める文体であることを目視確認
3. VPSデプロイ後に同じE2Eを本番URLで確認
4. 授業前に学校ネットワーク・GIGA端末実機からの疎通確認（チェックリストに含む）

## 成功基準

- 生徒がGIGA端末からURLを開くだけで（登録なしで）意見投稿できる
- 生徒に見えるすべての画面・AI生成物に政治的文言（政策・市民・マニフェスト等）が現れない
- 先生が管理画面からテーマの追加・削除とサイト設定の変更を自力でできる
- 月額ランニングコストがVPS代＋LLM API従量（授業1回あたり数十円規模）に収まる
