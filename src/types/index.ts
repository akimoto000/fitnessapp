// ユーザー
export interface User {
  id: string;
  email: string;
  display_name: string;
  selected_avatar: AvatarType;
  created_at: string;
  updated_at: string;
}

// AIアバタートレーナー
export type AvatarType = 'yuki' | 'sakura' | 'ryu' | 'miku' | 'ken' | 'ai7';

export interface Avatar {
  id: AvatarType;
  name: string;
  personality: string;
  phrases: {
    start: string[];
    setComplete: string[];
    personalBest: string[];
    workoutComplete: string[];
  };
}

// 種目
export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment?: string;
  is_custom: boolean;
  user_id?: string;
}

export type MuscleGroup = 
  | 'chest'      // 胸
  | 'back'       // 背中
  | 'shoulders'  // 肩
  | 'arms'       // 腕
  | 'legs'       // 脚
  | 'core'       // 体幹
  | 'full_body'; // 全身

// ワークアウトセッション
export interface Workout {
  id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  notes?: string;
}

// セット記録
export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;       // kg
  reps: number;
  is_warmup: boolean;
  notes?: string;
  created_at: string;
}

// 自己ベスト
export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  estimated_1rm: number;
  achieved_at: string;
}

// 音声入力解析結果
export interface VoiceInputResult {
  exercise?: string;
  weight?: number;
  reps?: number;
  command?: 'same' | 'plus' | 'minus';
  modifier?: number;
}
