import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RestTimer } from '../components/RestTimer';
import { ExercisePicker } from '../components/ExercisePicker';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { useWorkoutStore } from '../store/workoutStore';
import { Exercise, AvatarType, WorkoutSet } from '../types';
import { getExerciseById } from '../data/exercises';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type WorkoutScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Workout'>;
};

interface SetInput {
  weight: string;
  reps: string;
}

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ navigation }) => {
  const {
    currentWorkout,
    sets,
    startWorkout,
    endWorkout,
    addSet,
  } = useWorkoutStore();

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [setInput, setSetInput] = useState<SetInput>({ weight: '', reps: '' });
  const [avatarEvent, setAvatarEvent] = useState<'start' | 'setComplete' | 'workoutComplete'>('start');
  const selectedAvatar: AvatarType = 'yuki';

  // ワークアウト開始
  const handleStart = useCallback(() => {
    startWorkout();
    setAvatarEvent('start');
  }, [startWorkout]);

  // セット記録
  const handleAddSet = useCallback(() => {
    if (!currentExercise) return;

    const weight = parseFloat(setInput.weight);
    const reps = parseInt(setInput.reps, 10);

    if (isNaN(weight) || isNaN(reps) || weight < 0 || reps <= 0) {
      Alert.alert('入力エラー', '正しい重量とレップ数を入力してください');
      return;
    }

    const exerciseSets = sets.filter((s) => s.exercise_id === currentExercise.id);

    addSet({
      exercise_id: currentExercise.id,
      set_number: exerciseSets.length + 1,
      weight,
      reps,
      is_warmup: false,
    });

    setAvatarEvent('setComplete');
    setSetInput({ weight: setInput.weight, reps: '' });
  }, [currentExercise, setInput, sets, addSet]);

  // ワークアウト終了
  const handleEndWorkout = useCallback(() => {
    Alert.alert(
      'トレーニング終了',
      'トレーニングを終了しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '終了する',
          onPress: () => {
            endWorkout();
            setAvatarEvent('workoutComplete');
            navigation.goBack();
          },
        },
      ]
    );
  }, [endWorkout, navigation]);

  // 種目選択
  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    setCurrentExercise(exercise);
    setShowExercisePicker(false);
    setSetInput({ weight: '', reps: '' });
  }, []);

  // 種目ごとのセットをグループ化
  const groupedSets = sets.reduce<Record<string, WorkoutSet[]>>((acc, s) => {
    if (!acc[s.exercise_id]) acc[s.exercise_id] = [];
    acc[s.exercise_id].push(s);
    return acc;
  }, {});

  // ワークアウト未開始
  if (!currentWorkout) {
    return (
      <View style={styles.emptyContainer}>
        <AvatarDisplay avatarId={selectedAvatar} event="start" />
        <Button
          title="トレーニングを開始する"
          onPress={handleStart}
          size="lg"
          style={styles.startButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* アバター */}
        <AvatarDisplay avatarId={selectedAvatar} event={avatarEvent} compact />

        {/* 種目選択 */}
        <Card style={styles.exerciseCard}>
          <TouchableOpacity
            style={styles.exerciseSelector}
            onPress={() => setShowExercisePicker(true)}
          >
            <Text style={styles.exerciseSelectorLabel}>
              {currentExercise ? currentExercise.name : '種目を選択してください'}
            </Text>
            <Text style={styles.exerciseSelectorArrow}>▼</Text>
          </TouchableOpacity>
        </Card>

        {/* セット入力 */}
        {currentExercise && (
          <Card style={styles.inputCard}>
            <Text style={styles.inputTitle}>{currentExercise.name}</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>重量 (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={setInput.weight}
                  onChangeText={(text) => setSetInput({ ...setInput, weight: text })}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              <Text style={styles.inputSeparator}>×</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>レップ数</Text>
                <TextInput
                  style={styles.input}
                  value={setInput.reps}
                  onChangeText={(text) => setSetInput({ ...setInput, reps: text })}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              <Button title="記録" onPress={handleAddSet} size="md" />
            </View>
          </Card>
        )}

        {/* 休憩タイマー */}
        <Card style={styles.timerCard}>
          <RestTimer />
        </Card>

        {/* 記録済みセット */}
        {Object.entries(groupedSets).map(([exerciseId, exerciseSets]) => {
          const exercise = getExerciseById(exerciseId);
          return (
            <Card key={exerciseId} style={styles.setHistoryCard}>
              <Text style={styles.setHistoryTitle}>
                {exercise?.name ?? exerciseId}
              </Text>
              {exerciseSets.map((s) => (
                <View key={s.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {s.set_number}</Text>
                  <Text style={styles.setDetail}>
                    {s.weight} kg × {s.reps} 回
                  </Text>
                  {s.is_warmup && <Text style={styles.warmupBadge}>W-up</Text>}
                </View>
              ))}
            </Card>
          );
        })}
      </ScrollView>

      {/* 終了ボタン */}
      <View style={styles.footer}>
        <Button
          title="トレーニングを終了"
          onPress={handleEndWorkout}
          variant="secondary"
          size="lg"
          style={styles.endButton}
        />
      </View>

      <ExercisePicker
        visible={showExercisePicker}
        onSelect={handleExerciseSelect}
        onClose={() => setShowExercisePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  startButton: {
    marginTop: Spacing.lg,
    width: '100%',
  },
  exerciseCard: {
    marginTop: Spacing.md,
  },
  exerciseSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  exerciseSelectorLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  exerciseSelectorArrow: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  inputCard: {
    marginTop: Spacing.sm,
  },
  inputTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm + 2,
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  inputSeparator: {
    fontSize: FontSize.xl,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  timerCard: {
    marginTop: Spacing.sm,
  },
  setHistoryCard: {
    marginTop: Spacing.sm,
  },
  setHistoryTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  setNumber: {
    width: 60,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  setDetail: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  warmupBadge: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: '700',
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  endButton: {
    width: '100%',
  },
});
