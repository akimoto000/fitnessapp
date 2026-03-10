import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AvatarCoachCard } from '../components/AvatarCoachCard';
import { AvatarSelector } from '../components/AvatarSelector';
import { WorkoutSummaryCard } from '../components/WorkoutSummaryCard';
import { fetchWorkoutSummaries } from '../services/supabase';
import { useWorkoutStore } from '../store/workoutStore';
import { AvatarType, WorkoutSummary } from '../types';

interface HomeScreenProps {
  userId: string;
  selectedAvatar: AvatarType;
  refreshKey: number;
  onSelectAvatar: (avatar: AvatarType) => Promise<void> | void;
  onStartWorkout: () => Promise<void> | void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userId,
  selectedAvatar,
  refreshKey,
  onSelectAvatar,
  onStartWorkout,
}) => {
  const coachMessage = useWorkoutStore((state) => state.coachMessage);
  const currentTrigger = useWorkoutStore((state) => state.currentTrigger);
  const currentWorkoutId = useWorkoutStore((state) => state.currentWorkoutId);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadRecentWorkouts = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const summaries = await fetchWorkoutSummaries(userId, 3);
        if (active) {
          setRecentWorkouts(summaries);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : '履歴の取得に失敗しました。');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecentWorkouts();

    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  const handleStartWorkout = async (): Promise<void> => {
    setButtonLoading(true);
    setError('');
    try {
      await onStartWorkout();
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'ワークアウト開始に失敗しました。');
    } finally {
      setButtonLoading(false);
    }
  };

  const handleSelectAvatar = async (avatar: AvatarType): Promise<void> => {
    setError('');
    try {
      await onSelectAvatar(avatar);
    } catch (avatarError) {
      setError(avatarError instanceof Error ? avatarError.message : 'アバターの変更に失敗しました。');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>ホーム</Text>
        <Text style={styles.subtitle}>
          {currentWorkoutId ? '進行中のセッションを再開できます' : '今日のトレーニングを始めましょう'}
        </Text>
      </View>

      <Pressable onPress={handleStartWorkout} style={styles.startButton} disabled={buttonLoading}>
        {buttonLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.startButtonText}>
            {currentWorkoutId ? '進行中のワークアウトに戻る' : '今日のワークアウト開始'}
          </Text>
        )}
      </Pressable>

      <AvatarCoachCard avatar={selectedAvatar} message={coachMessage} trigger={currentTrigger} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AIアバター</Text>
        <AvatarSelector selectedAvatar={selectedAvatar} onSelect={(avatar) => void handleSelectAvatar(avatar)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>直近のトレーニング履歴（3件）</Text>
        {loading ? <ActivityIndicator color="#e94560" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && recentWorkouts.length === 0 ? (
          <Text style={styles.empty}>履歴はまだありません。最初のワークアウトを記録しましょう。</Text>
        ) : null}
        <View style={styles.workoutList}>
          {recentWorkouts.map((item) => (
            <WorkoutSummaryCard key={item.id} summary={item} />
          ))}
        </View>
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
    paddingBottom: 24,
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
  startButton: {
    backgroundColor: '#e94560',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  workoutList: {
    gap: 10,
  },
  empty: {
    color: '#9d9db8',
    fontSize: 13,
  },
  error: {
    color: '#ff8fa1',
    fontSize: 13,
  },
});
