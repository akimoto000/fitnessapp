import { AvatarMessageTrigger, AvatarType, ExerciseCategory } from '../types';

export interface AvatarMessageConfig {
  name: string;
  emoji: string;
  messages: Record<AvatarMessageTrigger, string[]>;
}

export const AVATAR_ORDER: AvatarType[] = ['yuki', 'sakura', 'ryu', 'miku', 'ken', 'ai7'];

export const AVATAR_MESSAGES: Record<AvatarType, AvatarMessageConfig> = {
  yuki: {
    name: 'ユウキ',
    emoji: '💪',
    messages: {
      workoutStart: ['よっしゃ、今日も全力でいこう！', '準備OK！ここから強くなる時間だ！', '気合い十分だな。最高の1日にしよう！'],
      setComplete: ['ナイスセット！その調子だ！', 'いいぞ、フォームも安定してる！', '今の1本が成長につながるぞ！'],
      personalBest: ['自己ベスト更新！本当にすごい！', 'やったな！努力が数字で証明された！', '限界突破だ！この勢いでいこう！'],
      workoutComplete: ['完了！今日の自分に勝ったな！', '最高の締めだ。しっかり回復しよう！', 'お疲れさま！また次も更新しよう！'],
      restStart: ['いい追い込みだった。少し休もう！', 'ここで回復！次のセットに備えろ！', '水分補給も忘れるなよ！'],
      heavyLift: ['集中！この1セットで決めろ！', '重いぞ、気合い入れていけ！', 'フォーム意識！いくぞ！'],
    },
  },
  sakura: {
    name: 'サクラ',
    emoji: '🌸',
    messages: {
      workoutStart: ['今日も一緒に頑張りましょうね。', 'ゆっくり深呼吸して、始めましょう。', 'あなたのペースで大丈夫ですよ。'],
      setComplete: ['とても良いセットでした。', '丁寧にできていますね。', 'その積み重ねが力になりますよ。'],
      personalBest: ['自己ベスト更新、おめでとうございます！', '努力が結果に出ましたね、素敵です。', '本当にすごいです。誇ってくださいね。'],
      workoutComplete: ['今日もお疲れさまでした。', 'しっかり休んで体をいたわってください。', 'また次回も応援しています。'],
      restStart: ['よく頑張りました。少し呼吸を整えましょう。', 'ここでしっかり休めば、次もきっと良い動きになります。', 'お水を飲んで、体を落ち着かせてくださいね。'],
      heavyLift: ['集中していきましょう。この1セットが大事です。', '重さがありますね。落ち着いて丁寧にいきましょう。', 'フォームを意識して、一緒に乗り越えましょう。'],
    },
  },
  ryu: {
    name: 'リュウ',
    emoji: '🐉',
    messages: {
      workoutStart: ['集中しろ。ここからが本番だ。', '準備はいいか。限界を更新するぞ。', '妥協は不要だ。一本ずつ仕留めろ。'],
      setComplete: ['悪くない。次はさらに上げる。', 'その1セットに意味を持たせろ。', '止まるな。積み上げを続けろ。'],
      personalBest: ['自己ベスト更新だ。見事だ。', '成長を証明したな。次も越えろ。', '強くなった。だがここが終点ではない。'],
      workoutComplete: ['任務完了。回復も鍛錬のうちだ。', '今日の勝利を明日に繋げろ。', 'よくやった。次の目標を定めろ。'],
      restStart: ['休め。次で仕留めるための時間だ。', '呼吸を整えろ。回復も戦略のうちだ。', '水分を入れて、次の一撃に備えろ。'],
      heavyLift: ['集中を切らすな。このセットが勝負だ。', '重い。だからこそ価値がある。押し切れ。', 'フォームを崩すな。強く、正確にいけ。'],
    },
  },
  miku: {
    name: 'ミク',
    emoji: '⚡',
    messages: {
      workoutStart: ['スタート！今日も楽しくいこー！', 'テンション上げていくよー！', 'ファイト！一緒に頑張ろう！'],
      setComplete: ['やったー！めっちゃいい感じ！', 'ナイス！キレが出てるよ！', 'その調子その調子、最高！'],
      personalBest: ['えっすごい！自己ベストだよ！', 'やばい！かっこよすぎる！', '更新おめでとう！拍手ーー！'],
      workoutComplete: ['お疲れさま！今日も大優勝！', '最後までよく頑張ったね！', 'ナイスワークアウト！次もいこう！'],
      restStart: ['ナイス！ちょっと休んで次にいこー！', 'ここで回復タイム！深呼吸しよっ！', 'お水飲んでリフレッシュだよー！'],
      heavyLift: ['きたきた、重いセット！全集中でいこ！', '気合いMAX！この1本、かましてこー！', 'フォーム意識でバチッと決めよう！'],
    },
  },
  ken: {
    name: 'ケン',
    emoji: '🔬',
    messages: {
      workoutStart: ['本日のセッションを開始します。', '前回比での向上を狙っていきましょう。', 'フォーム品質を維持して進めましょう。'],
      setComplete: ['良い出力です。再現性があります。', '記録上、安定したセットでした。', '負荷と回数のバランスが優秀です。'],
      personalBest: ['自己ベスト更新を確認。素晴らしい結果です。', '統計的に有意な進歩です。', 'パフォーマンス曲線が明確に上昇しています。'],
      workoutComplete: ['セッション完了。データを保存しました。', '回復を優先して次回効率を高めましょう。', '良いトレーニングでした。継続が鍵です。'],
      restStart: ['休息フェーズです。回復を優先しましょう。', '心拍を整えて、次セットの出力を準備します。', '水分補給を行い、パフォーマンス低下を防ぎましょう。'],
      heavyLift: ['高重量セットです。集中を最大化してください。', '負荷上昇を確認。フォーム精度を優先します。', 'このセットが重要です。動作を丁寧に再現しましょう。'],
    },
  },
  ai7: {
    name: 'AI-7',
    emoji: '🤖',
    messages: {
      workoutStart: ['ワークアウト プロトコル 開始。', 'システム 起動。トレーニング モード移行。', '本日 ノ ミッション ヲ 実行シマス。'],
      setComplete: ['セット完了。状態 良好。', '入力データ 受信。継続 推奨。', 'パフォーマンス 許容範囲内。次へ進行。'],
      personalBest: ['自己記録 更新ヲ 確認。', '高出力 達成。評価: Excellent。', '進化係数 上昇。非常ニ 優秀デス。'],
      workoutComplete: ['プロトコル 終了。お疲れサマデシタ。', 'データ保存 完了。休息フェーズへ移行。', '本日ノ 目標 達成率: 高。'],
      restStart: ['休息フェーズ 開始。回復処理 ヲ 優先シマス。', '呼吸ト 水分補給 ヲ 推奨。次セットへ備エマス。', '出力回復 中。コンディション整備 ヲ 実行シテクダサイ。'],
      heavyLift: ['高負荷セット 検出。集中レベル ヲ 最大化。', '重要セット 接近。フォーム維持 ヲ 最優先。', '重力条件 上昇。気合い出力 ヲ 要求シマス。'],
    },
  },
};

export const getAvatarConfig = (avatar: AvatarType): AvatarMessageConfig => AVATAR_MESSAGES[avatar];

export const getRandomAvatarMessage = (
  avatar: AvatarType,
  trigger: AvatarMessageTrigger,
): string => {
  const options = AVATAR_MESSAGES[avatar].messages[trigger];
  return options[Math.floor(Math.random() * options.length)];
};

export const getAvatarName = (avatar: AvatarType): string => AVATAR_MESSAGES[avatar].name;

export const getAvatarEmoji = (avatar: AvatarType): string => AVATAR_MESSAGES[avatar].emoji;

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: '胸',
  back: '背中',
  legs: '脚',
  shoulders: '肩',
  arms: '腕',
  abs: '腹',
  cardio: '有酸素',
};
