import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AvatarCoachCard } from '../components/AvatarCoachCard';
import { EXERCISE_CATEGORY_LABELS } from '../data/avatarMessages';
import {
  calculateEstimated1RM,
  completeWorkout,
  createSet,
  createWorkout,
  fetchWorkoutExerciseSetCount,
  fetchExercises,
  getLastSetForExercise,
  getPersonalRecord,
  shouldUpdatePersonalRecord,
  upsertPersonalRecord,
} from '../services/supabase';
import { useWorkoutStore } from '../store/workoutStore';
import { AvatarType, ExerciseCategory, ExerciseRow } from '../types';

interface WorkoutScreenProps {
  userId: string;
  selectedAvatar: AvatarType;
  onDataChanged: () => void;
}

const CATEGORY_ORDER: ExerciseCategory[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'];
const REST_OPTIONS = [60, 90, 120];
const DEFAULT_WEIGHT = '40';
const DEFAULT_REPS = '10';

const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ userId, selectedAvatar, onDataChanged }) => {
  const currentWorkoutId = useWorkoutStore((state) => state.currentWorkoutId);
  const coachMessage = useWorkoutStore((state) => state.coachMessage);
  const currentTrigger = useWorkoutStore((state) => state.currentTrigger);
  const restTimerSeconds = useWorkoutStore((state) => state.restTimerSeconds);
  const isRestTimerRunning = useWorkoutStore((state) => state.isRestTimerRunning);
  const setCounterByExercise = useWorkoutStore((state) => state.setCounterByExercise);
  const recentExerciseIds = useWorkoutStore((state) => state.recentExerciseIds);
  const markExerciseUsed = useWorkoutStore((state) => state.markExerciseUsed);
  const setExerciseSetCount = useWorkoutStore((state) => state.setExerciseSetCount);
  const startWorkoutSession = useWorkoutStore((state) => state.startWorkoutSession);
  const finishWorkoutSession = useWorkoutStore((state) => state.finishWorkoutSession);
  const startRestTimer = useWorkoutStore((state) => state.startRestTimer);
  const stopRestTimer = useWorkoutStore((state) => state.stopRestTimer);
  const tickRestTimer = useWorkoutStore((state) => state.tickRestTimer);
  const triggerAvatarMessage = useWorkoutStore((state) => state.triggerAvatarMessage);

  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('chest');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);
  const [reps, setReps] = useState(DEFAULT_REPS);
  const [lastWeightByExercise, setLastWeightByExercise] = useState<Record<string, number>>({});
  const [restOption, setRestOption] = useState(90);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadExercises = async (): Promise<void> => {
      setLoadingExercises(true);
      setError('');

      try {
        const loaded = await fetchExercises();
        if (!active) {
          return;
        }

        setExercises(loaded);

        const firstCategory = CATEGORY_ORDER.find((category) =>
          loaded.some((exercise) => exercise.category === category),
        );

        if (firstCategory) {
          setSelectedCategory(firstCategory);
          const firstExercise = loaded.find((exercise) => exercise.category === firstCategory);
          if (firstExercise) {
            setSelectedExerciseId(firstExercise.id);
          }
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : '種目の取得に失敗しました。');
        }
      } finally {
        if (active) {
          setLoadingExercises(false);
        }
      }
    };

    loadExercises();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isRestTimerRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      tickRestTimer();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRestTimerRunning, tickRestTimer]);

  useEffect(() => {
    let active = true;

    const syncLastSet = async (): Promise<void> => {
      if (!selectedExerciseId) {
        return;
      }

      try {
        const [lastSet, currentWorkoutSetCount] = await Promise.all([
          getLastSetForExercise(userId, selectedExerciseId),
          currentWorkoutId
            ? fetchWorkoutExerciseSetCount(currentWorkoutId, selectedExerciseId)
            : Promise.resolve(0),
        ]);

        if (!active) {
          return;
        }

        setWeight(lastSet?.weight_kg != null ? String(lastSet.weight_kg) : DEFAULT_WEIGHT);
        setReps(lastSet?.reps != null ? String(lastSet.reps) : DEFAULT_REPS);
        setExerciseSetCount(selectedExerciseId, currentWorkoutSetCount);
        setLastWeightByExercise((current) => {
          if (current[selectedExerciseId] != null || lastSet?.weight_kg == null) {
            return current;
          }

          return {
            ...current,
            [selectedExerciseId]: lastSet.weight_kg,
          };
        });
      } catch (lastSetError) {
        if (active) {
          console.warn(
            'Failed to load last set',
            lastSetError instanceof Error ? lastSetError.message : lastSetError,
          );
        }
      }
    };

    void syncLastSet();

    return () => {
      active = false;
    };
  }, [currentWorkoutId, selectedExerciseId, setExerciseSetCount, userId]);

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((category) => exercises.some((exercise) => exercise.category === category)),
    [exercises],
  );

  const visibleExercises = useMemo(() => {
    const filtered = exercises.filter((e) => e.category === selectedCategory);
    // 最近使った種目を上位に、それ以外はアルファベット順
    return [...filtered].sort((a, b) => {
      const aIdx = recentExerciseIds.indexOf(a.id);
      const bIdx = recentExerciseIds.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.name.localeCompare(b.name, 'ja');
    });
  }, [exercises, selectedCategory, recentExerciseIds]);

  const activeSetCount = selectedExerciseId ? setCounterByExercise[selectedExerciseId] ?? 0 : 0;

  const ensureWorkout = async (): Promise<string> => {
    if (currentWorkoutId) {
      return currentWorkoutId;
    }

    const created = await createWorkout(userId);
    startWorkoutSession(created.id);
    onDataChanged();
    return created.id;
  };

  const handleStartWorkout = async (): Promise<void> => {
    setWorking(true);
    setError('');
    try {
      await ensureWorkout();
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'ワークアウト開始に失敗しました。');
    } finally {
      setWorking(false);
    }
  };

  const handleCompleteSet = async (): Promise<void> => {
    if (!selectedExerciseId) {
      setError('種目を選択してください。');
      return;
    }

    const exerciseId = selectedExerciseId;
    const weightValue = Number(weight);
    const repsValue = Number(reps);
    const previousWeight = lastWeightByExercise[exerciseId];

    if (!Number.isFinite(weightValue) || !Number.isFinite(repsValue) || weightValue <= 0 || repsValue <= 0) {
      setError('重量kgと回数は正の数で入力してください。');
      return;
    }

    setWorking(true);
    setError('');

    try {
      const workoutId = await ensureWorkout();
      const currentWorkoutSetCount = await fetchWorkoutExerciseSetCount(workoutId, exerciseId);
      const pendingSetNumber = Math.max(setCounterByExercise[exerciseId] ?? 0, currentWorkoutSetCount) + 1;

      await createSet({
        workout_id: workoutId,
        exercise_id: exerciseId,
        set_number: pendingSetNumber,
        weight_kg: weightValue,
        reps: repsValue,
        set_type: 'normal',
      });

      setExerciseSetCount(exerciseId, pendingSetNumber);
      markExerciseUsed(exerciseId);
      setLastWeightByExercise((current) => ({
        ...current,
        [exerciseId]: weightValue,
      }));

      const existingRecord = await getPersonalRecord(userId, exerciseId);
      const isPb = shouldUpdatePersonalRecord(existingRecord, weightValue, repsValue);
      const isHeavyLift = previousWeight != null && weightValue >= previousWeight + 10;

      if (isPb) {
        await upsertPersonalRecord({
          user_id: userId,
          exercise_id: exerciseId,
          max_weight_kg: weightValue,
          max_reps: repsValue,
          estimated_1rm: calculateEstimated1RM(weightValue, repsValue),
        });
        triggerAvatarMessage('personalBest');
      } else if (isHeavyLift) {
        triggerAvatarMessage('heavyLift');
      } else {
        triggerAvatarMessage('setComplete');
      }

      startRestTimer(restOption);
      // 回数はリセットしない（前回の値を維持）
      onDataChanged();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'セット保存に失敗しました。');
    } finally {
      setWorking(false);
    }
  };

  const handleFinishWorkout = async (): Promise<void> => {
    if (!currentWorkoutId) {
      Alert.alert('進行中のワークアウトはありません。');
      return;
    }

    setWorking(true);
    setError('');

    try {
      await completeWorkout(currentWorkoutId);
      finishWorkoutSession();
      stopRestTimer();
      onDataChanged();
      Alert.alert('ワークアウト完了', '記録を保存しました。');
    } catch (finishError) {
      setError(finishError instanceof Error ? finishError.message : 'ワークアウト終了に失敗しました。');
    } finally {
      setWorking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>ワークアウト記録</Text>
        <Text style={styles.subtitle}>
          {currentWorkoutId ? 'ワークアウト進行中' : '開始ボタンでセッションを開始'}
        </Text>
      </View>

      <AvatarCoachCard avatar={selectedAvatar} message={coachMessage} trigger={currentTrigger} />

      {!currentWorkoutId ? (
        <Pressable style={styles.primaryButton} onPress={handleStartWorkout} disabled={working}>
          {working ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>ワークアウト開始</Text>}
        </Pressable>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>種目カテゴリ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => {
                  setSelectedCategory(category);
                  const firstExercise = exercises.find((exercise) => exercise.category === category);
                  if (firstExercise) {
                    setSelectedExerciseId(firstExercise.id);
                  }
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {EXERCISE_CATEGORY_LABELS[category]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>種目選択</Text>
        {loadingExercises ? <ActivityIndicator color="#e94560" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ScrollView
          style={styles.exerciseScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.exerciseList}>
            {visibleExercises.map((exercise, index) => {
              const active = selectedExerciseId === exercise.id;
              const isRecent = recentExerciseIds.includes(exercise.id);
              return (
                <Pressable
                  key={exercise.id}
                  style={[styles.exerciseItem, active && styles.exerciseItemActive]}
                  onPress={() => setSelectedExerciseId(exercise.id)}
                >
                  <View style={styles.exerciseRow}>
                    <Text style={[styles.exerciseText, active && styles.exerciseTextActive]}>
                      {exercise.name}
                    </Text>
                    {isRecent && index < 5 ? (
                      <Text style={styles.recentBadge}>最近</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.setHeaderRow}>
          <View style={styles.setHeaderTextWrap}>
            <Text style={styles.sectionTitle}>セット入力</Text>
            <Text style={styles.helper}>現在のセット数: {activeSetCount}</Text>
          </View>
          {currentWorkoutId ? (
            <Pressable
              style={[styles.finishGhostButton, working && styles.finishGhostButtonDisabled]}
              onPress={handleFinishWorkout}
              disabled={working}
            >
              <Text style={styles.finishGhostText}>ワークアウト完了</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>重量 (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="60"
              placeholderTextColor="#7c7c9f"
            />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>回数</Text>
            <TextInput
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
              style={styles.input}
              placeholder="10"
              placeholderTextColor="#7c7c9f"
            />
          </View>
        </View>

        <Text style={styles.sectionSubTitle}>休憩タイマー</Text>
        <View style={styles.chipRow}>
          {REST_OPTIONS.map((seconds) => {
            const active = restOption === seconds;
            return (
              <Pressable
                key={seconds}
                onPress={() => setRestOption(seconds)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{seconds}秒</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.timerPanel}>
          <Text style={styles.timerLabel}>休憩タイマー</Text>
          <Text style={styles.timerValue}>{formatTimer(restTimerSeconds)}</Text>
          <Text style={styles.timerState}>{isRestTimerRunning ? 'カウント中' : '停止中'}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleCompleteSet} disabled={working || loadingExercises}>
          {working ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>セット完了</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#bcbcd9',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#21213a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3a3a5f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#171729',
  },
  chipActive: {
    borderColor: '#e94560',
    backgroundColor: '#2d1e2b',
  },
  chipText: {
    color: '#cfcfe6',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  exerciseScroll: {
    maxHeight: 248, // 約5種目分（1種目44px × 5 + gap）
  },
  exerciseList: {
    gap: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentBadge: {
    fontSize: 10,
    color: '#e94560',
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  exerciseItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#303055',
    backgroundColor: '#171729',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  exerciseItemActive: {
    borderColor: '#e94560',
    backgroundColor: '#2d1e2b',
  },
  exerciseText: {
    color: '#d6d6ec',
    fontSize: 14,
  },
  exerciseTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  helper: {
    color: '#9d9db8',
    fontSize: 13,
  },
  setHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  setHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputBox: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: '#bcbcd9',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#34345a',
    borderRadius: 10,
    backgroundColor: '#171729',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 15,
  },
  timerPanel: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34345a',
    backgroundColor: '#171729',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  timerLabel: {
    color: '#bcbcd9',
    fontSize: 12,
  },
  timerValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  timerState: {
    color: '#9d9db8',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  finishGhostButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e94560',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  finishGhostButtonDisabled: {
    opacity: 0.6,
  },
  finishGhostText: {
    color: '#e9a7b1',
    fontSize: 12,
    fontWeight: '700',
  },
  error: {
    color: '#ff8fa1',
    fontSize: 13,
  },
});
