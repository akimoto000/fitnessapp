import { Exercise, MuscleGroup } from '../types';

// プリセットエクササイズデータベース
export const PRESET_EXERCISES: Exercise[] = [
  // 胸 (Chest)
  { id: 'bench_press', name: 'ベンチプレス', muscle_group: 'chest', equipment: 'バーベル', is_custom: false },
  { id: 'incline_bench_press', name: 'インクラインベンチプレス', muscle_group: 'chest', equipment: 'バーベル', is_custom: false },
  { id: 'dumbbell_bench_press', name: 'ダンベルベンチプレス', muscle_group: 'chest', equipment: 'ダンベル', is_custom: false },
  { id: 'dumbbell_fly', name: 'ダンベルフライ', muscle_group: 'chest', equipment: 'ダンベル', is_custom: false },
  { id: 'chest_press_machine', name: 'チェストプレス（マシン）', muscle_group: 'chest', equipment: 'マシン', is_custom: false },
  { id: 'cable_crossover', name: 'ケーブルクロスオーバー', muscle_group: 'chest', equipment: 'ケーブル', is_custom: false },
  { id: 'push_up', name: 'プッシュアップ', muscle_group: 'chest', equipment: '自重', is_custom: false },
  { id: 'dip_chest', name: 'ディップス（胸）', muscle_group: 'chest', equipment: '自重', is_custom: false },

  // 背中 (Back)
  { id: 'deadlift', name: 'デッドリフト', muscle_group: 'back', equipment: 'バーベル', is_custom: false },
  { id: 'lat_pulldown', name: 'ラットプルダウン', muscle_group: 'back', equipment: 'マシン', is_custom: false },
  { id: 'barbell_row', name: 'バーベルロウ', muscle_group: 'back', equipment: 'バーベル', is_custom: false },
  { id: 'dumbbell_row', name: 'ダンベルロウ', muscle_group: 'back', equipment: 'ダンベル', is_custom: false },
  { id: 'seated_row', name: 'シーテッドロウ', muscle_group: 'back', equipment: 'マシン', is_custom: false },
  { id: 'chin_up', name: 'チンアップ', muscle_group: 'back', equipment: '自重', is_custom: false },
  { id: 'pull_up', name: 'プルアップ', muscle_group: 'back', equipment: '自重', is_custom: false },
  { id: 'face_pull', name: 'フェイスプル', muscle_group: 'back', equipment: 'ケーブル', is_custom: false },

  // 肩 (Shoulders)
  { id: 'overhead_press', name: 'オーバーヘッドプレス', muscle_group: 'shoulders', equipment: 'バーベル', is_custom: false },
  { id: 'dumbbell_shoulder_press', name: 'ダンベルショルダープレス', muscle_group: 'shoulders', equipment: 'ダンベル', is_custom: false },
  { id: 'side_lateral_raise', name: 'サイドレイズ', muscle_group: 'shoulders', equipment: 'ダンベル', is_custom: false },
  { id: 'front_raise', name: 'フロントレイズ', muscle_group: 'shoulders', equipment: 'ダンベル', is_custom: false },
  { id: 'rear_delt_fly', name: 'リアレイズ', muscle_group: 'shoulders', equipment: 'ダンベル', is_custom: false },
  { id: 'arnold_press', name: 'アーノルドプレス', muscle_group: 'shoulders', equipment: 'ダンベル', is_custom: false },

  // 腕 (Arms)
  { id: 'barbell_curl', name: 'バーベルカール', muscle_group: 'arms', equipment: 'バーベル', is_custom: false },
  { id: 'dumbbell_curl', name: 'ダンベルカール', muscle_group: 'arms', equipment: 'ダンベル', is_custom: false },
  { id: 'hammer_curl', name: 'ハンマーカール', muscle_group: 'arms', equipment: 'ダンベル', is_custom: false },
  { id: 'tricep_pushdown', name: 'トライセップスプッシュダウン', muscle_group: 'arms', equipment: 'ケーブル', is_custom: false },
  { id: 'skull_crusher', name: 'スカルクラッシャー', muscle_group: 'arms', equipment: 'バーベル', is_custom: false },
  { id: 'overhead_tricep_extension', name: 'オーバーヘッドトライセップス', muscle_group: 'arms', equipment: 'ダンベル', is_custom: false },
  { id: 'concentration_curl', name: 'コンセントレーションカール', muscle_group: 'arms', equipment: 'ダンベル', is_custom: false },

  // 脚 (Legs)
  { id: 'squat', name: 'スクワット', muscle_group: 'legs', equipment: 'バーベル', is_custom: false },
  { id: 'leg_press', name: 'レッグプレス', muscle_group: 'legs', equipment: 'マシン', is_custom: false },
  { id: 'leg_extension', name: 'レッグエクステンション', muscle_group: 'legs', equipment: 'マシン', is_custom: false },
  { id: 'leg_curl', name: 'レッグカール', muscle_group: 'legs', equipment: 'マシン', is_custom: false },
  { id: 'romanian_deadlift', name: 'ルーマニアンデッドリフト', muscle_group: 'legs', equipment: 'バーベル', is_custom: false },
  { id: 'lunge', name: 'ランジ', muscle_group: 'legs', equipment: 'ダンベル', is_custom: false },
  { id: 'calf_raise', name: 'カーフレイズ', muscle_group: 'legs', equipment: 'マシン', is_custom: false },
  { id: 'hip_thrust', name: 'ヒップスラスト', muscle_group: 'legs', equipment: 'バーベル', is_custom: false },
  { id: 'bulgarian_split_squat', name: 'ブルガリアンスクワット', muscle_group: 'legs', equipment: 'ダンベル', is_custom: false },

  // 体幹 (Core)
  { id: 'plank', name: 'プランク', muscle_group: 'core', equipment: '自重', is_custom: false },
  { id: 'crunch', name: 'クランチ', muscle_group: 'core', equipment: '自重', is_custom: false },
  { id: 'leg_raise', name: 'レッグレイズ', muscle_group: 'core', equipment: '自重', is_custom: false },
  { id: 'russian_twist', name: 'ロシアンツイスト', muscle_group: 'core', equipment: '自重', is_custom: false },
  { id: 'ab_roller', name: 'アブローラー', muscle_group: 'core', equipment: '器具', is_custom: false },
  { id: 'cable_crunch', name: 'ケーブルクランチ', muscle_group: 'core', equipment: 'ケーブル', is_custom: false },
];

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  legs: '脚',
  core: '体幹',
  full_body: '全身',
};

export const getExercisesByMuscleGroup = (group: MuscleGroup): Exercise[] => {
  return PRESET_EXERCISES.filter((e) => e.muscle_group === group);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return PRESET_EXERCISES.find((e) => e.id === id);
};
