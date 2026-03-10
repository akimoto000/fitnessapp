-- ============================================================
-- fitnessapp データベーススキーマ
-- Supabase SQL Editorに貼り付けて「Run」を押してください
-- ============================================================

-- 1. ユーザープロファイル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_trainer TEXT DEFAULT 'yuki',
  weight_kg DECIMAL,
  height_cm DECIMAL,
  unit TEXT DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 種目マスタ（プリセット + カスタム）
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- chest/back/legs/shoulders/arms/abs/cardio
  is_custom BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- カスタム種目の場合のみ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ワークアウトセッション
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- 4. セット記録
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  set_number INT NOT NULL,
  weight_kg DECIMAL,
  reps INT,
  set_type TEXT DEFAULT 'normal', -- warmup/normal/drop/failure
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 自己ベスト記録
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  max_weight_kg DECIMAL,
  max_reps INT,
  estimated_1rm DECIMAL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- ============================================================
-- Row Level Security（セキュリティ設定）
-- 自分のデータしか見えない・触れないようにする
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- profiles: 自分のプロファイルのみ
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- exercises: プリセット種目は全員が見える、カスタムは自分のみ
CREATE POLICY "exercises_read" ON exercises
  FOR SELECT USING (is_custom = false OR auth.uid() = user_id);
CREATE POLICY "exercises_insert" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercises_update" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exercises_delete" ON exercises
  FOR DELETE USING (auth.uid() = user_id);

-- workouts: 自分のワークアウトのみ
CREATE POLICY "workouts_own" ON workouts
  FOR ALL USING (auth.uid() = user_id);

-- sets: 自分のセットのみ
CREATE POLICY "sets_own" ON sets
  FOR ALL USING (
    workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
  );

-- personal_records: 自分のレコードのみ
CREATE POLICY "personal_records_own" ON personal_records
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- プリセット種目データ（初期データ）
-- ============================================================

INSERT INTO exercises (name, category, is_custom) VALUES
  -- 胸
  ('ベンチプレス', 'chest', false),
  ('インクラインベンチプレス', 'chest', false),
  ('ダンベルフライ', 'chest', false),
  ('ディップス', 'chest', false),
  ('プッシュアップ', 'chest', false),
  -- 背中
  ('デッドリフト', 'back', false),
  ('懸垂（チンニング）', 'back', false),
  ('ラットプルダウン', 'back', false),
  ('シーテッドロウ', 'back', false),
  ('ベントオーバーロウ', 'back', false),
  -- 脚
  ('スクワット', 'legs', false),
  ('レッグプレス', 'legs', false),
  ('ランジ', 'legs', false),
  ('レッグカール', 'legs', false),
  ('カーフレイズ', 'legs', false),
  -- 肩
  ('ショルダープレス', 'shoulders', false),
  ('サイドレイズ', 'shoulders', false),
  ('フロントレイズ', 'shoulders', false),
  ('フェイスプル', 'shoulders', false),
  -- 腕
  ('バーベルカール', 'arms', false),
  ('ダンベルカール', 'arms', false),
  ('トライセプスプッシュダウン', 'arms', false),
  ('ライイングトライセプスエクステンション', 'arms', false),
  -- 腹
  ('クランチ', 'abs', false),
  ('プランク', 'abs', false),
  ('レッグレイズ', 'abs', false),
  -- 有酸素
  ('ランニング', 'cardio', false),
  ('自転車', 'cardio', false),
  ('ローイングマシン', 'cardio', false);
