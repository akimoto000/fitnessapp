import { Avatar, AvatarType } from '../types';

export const AVATARS: Record<AvatarType, Avatar> = {
  yuki: {
    id: 'yuki',
    name: 'ユウキ',
    personality: '熱血コーチ',
    phrases: {
      start: ['よっしゃ！今日も燃えていこうぜ！', 'さぁ、限界を超える準備はできたか！'],
      setComplete: ['ナイス！その調子だ！', 'いいぞ！まだまだいけるだろ！'],
      personalBest: ['うおおお！自己ベスト更新！最高だぜ！', 'やったな！お前の努力が実を結んだぞ！'],
      workoutComplete: ['今日も最高のトレーニングだったぜ！', 'お疲れ！また一歩強くなったな！'],
    },
  },
  sakura: {
    id: 'sakura',
    name: 'サクラ',
    personality: '優しいトレーナー',
    phrases: {
      start: ['今日も一緒に頑張りましょうね♪', 'リラックスして、自分のペースでいきましょう'],
      setComplete: ['頑張ってますね♪ すごいです！', 'いい感じですよ〜！'],
      personalBest: ['わぁ！自己ベスト更新おめでとうございます！', '努力が報われましたね♪ 素敵です！'],
      workoutComplete: ['お疲れさまでした♪ 今日もよく頑張りました！', 'ゆっくり休んでくださいね'],
    },
  },
  ryu: {
    id: 'ryu',
    name: 'リュウ',
    personality: 'ストイック指導者',
    phrases: {
      start: ['集中しろ。今日の目標を達成するぞ。', '準備はいいか。始めるぞ。'],
      setComplete: ['まだいける。限界を超えろ。', '悪くない。次だ。'],
      personalBest: ['よくやった。これが本当のお前だ。', '成長したな。だが満足するな。'],
      workoutComplete: ['今日の自分を超えた。明日も続けろ。', '休息も鍛錬だ。しっかり休め。'],
    },
  },
  miku: {
    id: 'miku',
    name: 'ミク',
    personality: '元気系チアリーダー',
    phrases: {
      start: ['ファイトー！今日も全力でいくよ〜！', 'レッツゴー！一緒に楽しもう♪'],
      setComplete: ['すごーい！かっこいい！', 'やったね！あと少し頑張れ〜！'],
      personalBest: ['キャー！自己ベストだよ！天才！', 'すごすぎ〜！パチパチパチ！'],
      workoutComplete: ['お疲れさま〜！今日も最高だったね！', 'またね〜！次も応援してるよ♪'],
    },
  },
  ken: {
    id: 'ken',
    name: 'ケン',
    personality: '科学派コーチ',
    phrases: {
      start: ['データに基づいた効率的なトレーニングを始めましょう', '前回のパフォーマンスを分析しました。今日の目標を設定します'],
      setComplete: ['データ的に良い傾向です', 'フォームが安定していますね。継続しましょう'],
      personalBest: ['統計的に有意な成長が確認できました。素晴らしい', 'トレーニング効果が数値に表れていますね'],
      workoutComplete: ['本日のトレーニングデータを記録しました', '次回に向けて最適なリカバリーを計画しましょう'],
    },
  },
  ai7: {
    id: 'ai7',
    name: 'AI-7',
    personality: 'ロボット型',
    phrases: {
      start: ['ワークアウト プロトコル ヲ 開始シマス', 'システム 起動完了。トレーニング モード ニ 移行'],
      setComplete: ['セット 完了 ヲ 検知。継続 推奨。', 'パフォーマンス 良好。次 ノ セット ヲ 実行セヨ'],
      personalBest: ['自己記録 更新 ヲ 確認。目標達成率 100%超過', 'スゴイデス。人類 ノ 可能性 ヲ 観測'],
      workoutComplete: ['ワークアウト プロトコル 終了。お疲レサマデシタ', 'データ 保存完了。次回 ノ トレーニング マデ 休息 ヲ 推奨'],
    },
  },
};

export const getRandomPhrase = (
  avatarId: AvatarType,
  event: keyof Avatar['phrases']
): string => {
  const avatar = AVATARS[avatarId];
  const phrases = avatar.phrases[event];
  return phrases[Math.floor(Math.random() * phrases.length)];
};
