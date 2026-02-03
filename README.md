# 💪 Fitness App - 筋トレ管理アプリ

AIアバタートレーナーと音声入力で、筋トレ記録をもっと楽しく、もっと簡単に。

## 🚀 セットアップ

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npx expo start
```

## 📱 実行方法

- **iOS シミュレータ:** `npm run ios`
- **Android エミュレータ:** `npm run android`
- **Web ブラウザ:** `npm run web`
- **Expo Go アプリ:** QRコードをスキャン

## 🏗️ プロジェクト構成

```
fitnessapp/
├── src/
│   ├── components/     # 再利用可能なUIコンポーネント
│   ├── screens/        # 画面コンポーネント
│   ├── navigation/     # ナビゲーション設定
│   ├── store/          # Zustand ストア
│   ├── services/       # API・Supabase連携
│   ├── types/          # TypeScript型定義
│   ├── utils/          # ユーティリティ関数
│   └── assets/avatars/ # AIアバター画像
├── docs/               # 仕様書・ドキュメント
└── assets/             # アプリアイコン・スプラッシュ画像
```

## ✨ 主な機能

- 🎤 **音声入力** - 「ベンチプレス 60キロ 10回」で自動記録
- 🤖 **AIアバタートレーナー** - 6キャラクターがあなたを応援
- 📊 **進捗グラフ** - 成長を可視化
- ⏱️ **休憩タイマー** - セット間の休憩を管理
- 📅 **カレンダー表示** - トレーニング履歴を一覧

## 🛠️ 技術スタック

- **Frontend:** React Native + Expo
- **Backend:** Supabase (認証・DB・ストレージ)
- **State:** Zustand
- **Navigation:** React Navigation

## 📄 ドキュメント

詳細な仕様書は `docs/fitness-app-analysis.md` を参照

---

Made with 💪 by アッキー & ニト君
