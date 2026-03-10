export type AvatarType = 'yuki' | 'sakura' | 'ryu' | 'miku' | 'ken' | 'ai7';

export type AvatarMessageTrigger =
  | 'workoutStart'
  | 'setComplete'
  | 'personalBest'
  | 'workoutComplete'
  | 'restStart'
  | 'heavyLift';

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'abs'
  | 'cardio';

export type SetType = 'warmup' | 'normal' | 'drop' | 'failure';

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_trainer: AvatarType;
  weight_kg: number | null;
  height_cm: number | null;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseRow {
  id: string;
  name: string;
  category: ExerciseCategory;
  is_custom: boolean;
  user_id: string | null;
  created_at: string;
}

export interface WorkoutRow {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
}

export interface SetRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  set_type: SetType;
  created_at: string;
}

export interface PersonalRecordRow {
  id: string;
  user_id: string;
  exercise_id: string;
  max_weight_kg: number | null;
  max_reps: number | null;
  estimated_1rm: number | null;
  achieved_at: string;
}

export interface WorkoutSummary {
  id: string;
  started_at: string;
  completed_at: string | null;
  exerciseCount: number;
  totalVolume: number;
}

export interface WorkoutSetDetail extends SetRow {
  exercise_name: string;
  exercise_category: ExerciseCategory;
}

export interface WorkoutDetail extends WorkoutSummary {
  sets: WorkoutSetDetail[];
}

export interface ExerciseWeightHistoryPoint {
  date: string;
  maxWeight: number;
}

export interface CategoryVolume {
  category: ExerciseCategory;
  totalVolume: number;
}

export interface CreateSetInput {
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  set_type?: SetType;
}

export interface UpsertPersonalRecordInput {
  user_id: string;
  exercise_id: string;
  max_weight_kg: number;
  max_reps: number;
  estimated_1rm: number;
}

export interface ProfileUpdateInput {
  display_name?: string | null;
  avatar_trainer?: AvatarType;
  weight_kg?: number | null;
  height_cm?: number | null;
  unit?: string;
}
