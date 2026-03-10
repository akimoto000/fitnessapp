import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User, createClient } from '@supabase/supabase-js';
import {
  AvatarType,
  CategoryVolume,
  CreateSetInput,
  ExerciseWeightHistoryPoint,
  ExerciseCategory,
  ExerciseRow,
  PersonalRecordRow,
  ProfileRow,
  ProfileUpdateInput,
  SetRow,
  UpsertPersonalRecordInput,
  WorkoutDetail,
  WorkoutRow,
  WorkoutSetDetail,
  WorkoutSummary,
} from '../types';

const FALLBACK_SUPABASE_URL = 'https://wvykwrsqlzqcssfydovr.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_HokSnX65p5Iu90YQv3wkUQ_jIm0Feko';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Check your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
  },
});

const AVATAR_VALUES: AvatarType[] = ['yuki', 'sakura', 'ryu', 'miku', 'ken', 'ai7'];
const CATEGORY_VALUES: ExerciseCategory[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];

type NumericLike = number | string | null;

const toNullableNumber = (value: NumericLike): number | null => {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNumber = (value: NumericLike): number => toNullableNumber(value) ?? 0;

const ensureAvatar = (value: string | null | undefined): AvatarType => {
  if (value && AVATAR_VALUES.includes(value as AvatarType)) {
    return value as AvatarType;
  }
  return 'yuki';
};

const ensureCategory = (value: string | null | undefined): ExerciseCategory => {
  if (value && CATEGORY_VALUES.includes(value as ExerciseCategory)) {
    return value as ExerciseCategory;
  }
  return 'chest';
};

const normalizeProfile = (row: Record<string, unknown>): ProfileRow => ({
  id: String(row.id),
  display_name: (row.display_name as string | null) ?? null,
  avatar_trainer: ensureAvatar((row.avatar_trainer as string | null) ?? 'yuki'),
  weight_kg: toNullableNumber((row.weight_kg as NumericLike) ?? null),
  height_cm: toNullableNumber((row.height_cm as NumericLike) ?? null),
  unit: (row.unit as string | null) ?? 'kg',
  created_at: String(row.created_at),
  updated_at: String(row.updated_at),
});

const normalizeExercise = (row: Record<string, unknown>): ExerciseRow => ({
  id: String(row.id),
  name: String(row.name),
  category: ensureCategory((row.category as string | null) ?? 'chest'),
  is_custom: Boolean(row.is_custom),
  user_id: (row.user_id as string | null) ?? null,
  created_at: String(row.created_at),
});

const normalizeWorkout = (row: Record<string, unknown>): WorkoutRow => ({
  id: String(row.id),
  user_id: String(row.user_id),
  started_at: String(row.started_at),
  completed_at: (row.completed_at as string | null) ?? null,
  notes: (row.notes as string | null) ?? null,
});

const normalizeSet = (row: Record<string, unknown>): SetRow => ({
  id: String(row.id),
  workout_id: String(row.workout_id),
  exercise_id: String(row.exercise_id),
  set_number: Number(row.set_number),
  weight_kg: toNullableNumber((row.weight_kg as NumericLike) ?? null),
  reps: toNullableNumber((row.reps as NumericLike) ?? null),
  set_type: (row.set_type as SetRow['set_type']) ?? 'normal',
  created_at: String(row.created_at),
});

const normalizePersonalRecord = (row: Record<string, unknown>): PersonalRecordRow => ({
  id: String(row.id),
  user_id: String(row.user_id),
  exercise_id: String(row.exercise_id),
  max_weight_kg: toNullableNumber((row.max_weight_kg as NumericLike) ?? null),
  max_reps: toNullableNumber((row.max_reps as NumericLike) ?? null),
  estimated_1rm: toNullableNumber((row.estimated_1rm as NumericLike) ?? null),
  achieved_at: String(row.achieved_at),
});

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session;
};

export const subscribeToAuthChanges = (
  callback: (session: Session | null) => void,
): { unsubscribe: () => void } => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return subscription;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    // より親切なエラーメッセージ
    if (error?.message?.includes('Invalid login credentials')) {
      throw new Error('メールアドレスまたはパスワードが違います。まだアカウントを作成していない場合は「サインアップ」タブから作成してください。');
    }
    throw new Error(error?.message ?? 'ログインに失敗しました。');
  }

  return data.user;
};

export const signUpWithEmail = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw new Error(error.message);
  }

  return { user: data.user, session: data.session };
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

export const ensureProfile = async (userId: string, email?: string): Promise<ProfileRow> => {
  const existing = await getProfile(userId);
  if (existing) {
    return existing;
  }

  const displayName = email?.split('@')[0] ?? 'トレーニー';
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      display_name: displayName,
      avatar_trainer: 'yuki',
      unit: 'kg',
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const profile = await getProfile(userId);
      if (profile) {
        return profile;
      }
    }
    throw new Error(error.message);
  }

  return normalizeProfile(data as Record<string, unknown>);
};

export const getProfile = async (userId: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return normalizeProfile(data as Record<string, unknown>);
};

export const updateProfile = async (
  userId: string,
  updates: ProfileUpdateInput,
): Promise<ProfileRow> => {
  const payload: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeProfile(data as Record<string, unknown>);
};

export const fetchExercises = async (): Promise<ExerciseRow[]> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name, category, is_custom, user_id, created_at')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeExercise(row as Record<string, unknown>));
};

export const getActiveWorkout = async (userId: string): Promise<WorkoutRow | null> => {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, user_id, started_at, completed_at, notes')
    .eq('user_id', userId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return normalizeWorkout(data as Record<string, unknown>);
};

export const createWorkout = async (userId: string): Promise<WorkoutRow> => {
  const activeWorkout = await getActiveWorkout(userId);
  if (activeWorkout) {
    return activeWorkout;
  }

  const { data, error } = await supabase
    .from('workouts')
    .insert({ user_id: userId })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeWorkout(data as Record<string, unknown>);
};

export const completeWorkout = async (workoutId: string): Promise<WorkoutRow> => {
  const { data, error } = await supabase
    .from('workouts')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', workoutId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeWorkout(data as Record<string, unknown>);
};

export const createSet = async (input: CreateSetInput): Promise<SetRow> => {
  const { data, error } = await supabase
    .from('sets')
    .insert({
      ...input,
      set_type: input.set_type ?? 'normal',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeSet(data as Record<string, unknown>);
};

export const fetchWorkoutExerciseSetCount = async (
  workoutId: string,
  exerciseId: string,
): Promise<number> => {
  const { data, error } = await supabase
    .from('sets')
    .select('set_number')
    .eq('workout_id', workoutId)
    .eq('exercise_id', exerciseId)
    .order('set_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return 0;
  }

  return Number(data.set_number) || 0;
};

export const getLastSetForExercise = async (
  userId: string,
  exerciseId: string,
): Promise<SetRow | null> => {
  const { data, error } = await supabase
    .from('sets')
    .select(
      'id, workout_id, exercise_id, set_number, weight_kg, reps, set_type, created_at, workouts!inner(user_id)',
    )
    .eq('exercise_id', exerciseId)
    .eq('workouts.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return normalizeSet(data as Record<string, unknown>);
};

export const getPersonalRecord = async (
  userId: string,
  exerciseId: string,
): Promise<PersonalRecordRow | null> => {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return normalizePersonalRecord(data as Record<string, unknown>);
};

export const upsertPersonalRecord = async (
  input: UpsertPersonalRecordInput,
): Promise<PersonalRecordRow> => {
  const { data, error } = await supabase
    .from('personal_records')
    .upsert(
      {
        ...input,
        achieved_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,exercise_id' },
    )
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizePersonalRecord(data as Record<string, unknown>);
};

const mapWorkoutSummaries = (
  workouts: WorkoutRow[],
  sets: Array<Pick<SetRow, 'workout_id' | 'exercise_id' | 'weight_kg' | 'reps'>>,
): WorkoutSummary[] => {
  const stats = new Map<string, { exerciseIds: Set<string>; totalVolume: number }>();

  for (const row of sets) {
    const current = stats.get(row.workout_id) ?? {
      exerciseIds: new Set<string>(),
      totalVolume: 0,
    };

    current.exerciseIds.add(row.exercise_id);
    current.totalVolume += toNumber(row.weight_kg) * toNumber(row.reps);
    stats.set(row.workout_id, current);
  }

  return workouts.map((workout) => {
    const workoutStats = stats.get(workout.id);
    return {
      id: workout.id,
      started_at: workout.started_at,
      completed_at: workout.completed_at,
      exerciseCount: workoutStats ? workoutStats.exerciseIds.size : 0,
      totalVolume: workoutStats ? Math.round(workoutStats.totalVolume) : 0,
    };
  });
};

export const fetchWorkoutSummaries = async (
  userId: string,
  limit?: number,
): Promise<WorkoutSummary[]> => {
  let query = supabase
    .from('workouts')
    .select('id, user_id, started_at, completed_at, notes')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('started_at', { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const workouts = (data ?? []).map((row) => normalizeWorkout(row as Record<string, unknown>));
  if (workouts.length === 0) {
    return [];
  }

  const workoutIds = workouts.map((workout) => workout.id);
  const { data: setRows, error: setError } = await supabase
    .from('sets')
    .select('workout_id, exercise_id, weight_kg, reps')
    .in('workout_id', workoutIds);

  if (setError) {
    throw new Error(setError.message);
  }

  const normalizedSets = (setRows ?? []).map((row) => ({
    workout_id: String(row.workout_id),
    exercise_id: String(row.exercise_id),
    weight_kg: toNullableNumber((row.weight_kg as NumericLike) ?? null),
    reps: toNullableNumber((row.reps as NumericLike) ?? null),
  }));

  return mapWorkoutSummaries(workouts, normalizedSets);
};

export const fetchWorkoutDetail = async (workoutId: string): Promise<WorkoutDetail> => {
  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .select('id, user_id, started_at, completed_at, notes')
    .eq('id', workoutId)
    .single();

  if (workoutError) {
    throw new Error(workoutError.message);
  }

  const workout = normalizeWorkout(workoutData as Record<string, unknown>);

  const { data: setData, error: setError } = await supabase
    .from('sets')
    .select(
      'id, workout_id, exercise_id, set_number, weight_kg, reps, set_type, created_at, exercises(name, category)',
    )
    .eq('workout_id', workoutId)
    .order('created_at', { ascending: true })
    .order('set_number', { ascending: true });

  if (setError) {
    throw new Error(setError.message);
  }

  const detailedSets: WorkoutSetDetail[] = (setData ?? []).map((row) => {
    const normalized = normalizeSet(row as Record<string, unknown>);
    const relation = (row as Record<string, unknown>).exercises as
      | Record<string, unknown>
      | Array<Record<string, unknown>>
      | null
      | undefined;
    const exercise = Array.isArray(relation) ? relation[0] : relation;

    return {
      ...normalized,
      exercise_name: exercise?.name ? String(exercise.name) : '不明な種目',
      exercise_category: ensureCategory((exercise?.category as string | undefined) ?? 'chest'),
    };
  });

  const exerciseIds = new Set<string>();
  let totalVolume = 0;

  for (const setRow of detailedSets) {
    exerciseIds.add(setRow.exercise_id);
    totalVolume += toNumber(setRow.weight_kg) * toNumber(setRow.reps);
  }

  return {
    id: workout.id,
    started_at: workout.started_at,
    completed_at: workout.completed_at,
    exerciseCount: exerciseIds.size,
    totalVolume: Math.round(totalVolume),
    sets: detailedSets,
  };
};

export const fetchExerciseWeightHistory = async (
  userId: string,
  exerciseId: string,
  limit = 10,
): Promise<ExerciseWeightHistoryPoint[]> => {
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.floor(limit), 1), 50) : 10;

  const { data: workoutRows, error: workoutError } = await supabase
    .from('workouts')
    .select('id, started_at, sets!inner(exercise_id)')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .eq('sets.exercise_id', exerciseId)
    .order('started_at', { ascending: false })
    .limit(safeLimit);

  if (workoutError) {
    throw new Error(workoutError.message);
  }

  const sessions = (workoutRows ?? []).map((row) => ({
    id: String(row.id),
    started_at: String(row.started_at),
  }));

  if (sessions.length === 0) {
    return [];
  }

  const workoutIds = sessions.map((session) => session.id);
  const { data: setRows, error: setError } = await supabase
    .from('sets')
    .select('workout_id, weight_kg')
    .eq('exercise_id', exerciseId)
    .in('workout_id', workoutIds);

  if (setError) {
    throw new Error(setError.message);
  }

  const maxWeightByWorkout = new Map<string, number>();

  for (const row of setRows ?? []) {
    const workoutId = String(row.workout_id);
    const currentMax = maxWeightByWorkout.get(workoutId) ?? 0;
    const nextMax = Math.max(currentMax, toNumber((row.weight_kg as NumericLike) ?? null));
    maxWeightByWorkout.set(workoutId, nextMax);
  }

  const history = sessions
    .map((session) => ({
      date: session.started_at,
      maxWeight: Number((maxWeightByWorkout.get(session.id) ?? 0).toFixed(2)),
    }))
    .filter((row) => row.maxWeight > 0);

  return history.reverse();
};

export const fetchVolumeByCategory = async (
  userId: string,
  since: Date,
): Promise<CategoryVolume[]> => {
  const { data: workoutRows, error: workoutError } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .gte('started_at', since.toISOString());

  if (workoutError) {
    throw new Error(workoutError.message);
  }

  const workoutIds = (workoutRows ?? []).map((row) => String(row.id));
  if (workoutIds.length === 0) {
    return CATEGORY_VALUES.map((category) => ({ category, totalVolume: 0 }));
  }

  const { data: setRows, error: setError } = await supabase
    .from('sets')
    .select('weight_kg, reps, exercises(category)')
    .in('workout_id', workoutIds);

  if (setError) {
    throw new Error(setError.message);
  }

  const totals = new Map<ExerciseCategory, number>(CATEGORY_VALUES.map((category) => [category, 0]));

  for (const row of setRows ?? []) {
    const relation = (row as Record<string, unknown>).exercises as
      | Record<string, unknown>
      | Array<Record<string, unknown>>
      | null
      | undefined;
    const exercise = Array.isArray(relation) ? relation[0] : relation;
    const category = ensureCategory((exercise?.category as string | null | undefined) ?? undefined);
    const volume = toNumber((row.weight_kg as NumericLike) ?? null) * toNumber((row.reps as NumericLike) ?? null);
    totals.set(category, (totals.get(category) ?? 0) + volume);
  }

  return CATEGORY_VALUES.map((category) => ({
    category,
    totalVolume: Math.round(totals.get(category) ?? 0),
  }));
};

export const fetchWorkoutCount = async (userId: string, since: Date): Promise<number> => {
  const { count, error } = await supabase
    .from('workouts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .gte('started_at', since.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
};

export const calculateEstimated1RM = (weightKg: number, reps: number): number => {
  if (weightKg <= 0 || reps <= 0) {
    return 0;
  }

  return Number((weightKg * (1 + reps / 30)).toFixed(2));
};

export const shouldUpdatePersonalRecord = (
  currentRecord: PersonalRecordRow | null,
  weightKg: number,
  reps: number,
): boolean => {
  const estimated = calculateEstimated1RM(weightKg, reps);

  if (!currentRecord) {
    return true;
  }

  const currentEstimated = currentRecord.estimated_1rm ?? 0;
  if (estimated > currentEstimated) {
    return true;
  }

  const currentWeight = currentRecord.max_weight_kg ?? 0;
  const currentReps = currentRecord.max_reps ?? 0;

  if (weightKg > currentWeight) {
    return true;
  }

  return weightKg === currentWeight && reps > currentReps;
};
