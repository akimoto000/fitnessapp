import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { useWorkoutStore } from '../store/workoutStore';
import { AVATARS } from '../utils/avatars';
import { AvatarType } from '../types';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentWorkout } = useWorkoutStore();
  const [selectedAvatar] = useState<AvatarType>('yuki');

  const handleStartWorkout = () => {
    navigation.navigate('Workout');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* アバター表示 */}
      <Card style={styles.avatarCard}>
        <AvatarDisplay avatarId={selectedAvatar} event="start" />
      </Card>

      {/* ワークアウト開始ボタン */}
      <Button
        title={currentWorkout ? 'トレーニングを続ける' : 'トレーニングを始める'}
        onPress={handleStartWorkout}
        variant={currentWorkout ? 'secondary' : 'primary'}
        size="lg"
        style={styles.startButton}
      />

      {/* クイックスタートメニュー */}
      <Text style={styles.sectionTitle}>クイックスタート</Text>
      <View style={styles.quickStartGrid}>
        {QUICK_START_MENUS.map((menu) => (
          <TouchableOpacity
            key={menu.id}
            style={styles.quickStartItem}
            onPress={handleStartWorkout}
          >
            <Text style={styles.quickStartEmoji}>{menu.emoji}</Text>
            <Text style={styles.quickStartLabel}>{menu.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* トレーナー選択 */}
      <Text style={styles.sectionTitle}>トレーナー</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trainerList}>
        {(Object.keys(AVATARS) as AvatarType[]).map((id) => (
          <TouchableOpacity key={id} style={styles.trainerItem}>
            <AvatarDisplay avatarId={id} compact />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 最近のトレーニング概要 */}
      <Text style={styles.sectionTitle}>今週のサマリー</Text>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>トレーニング数</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>総セット数</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0 kg</Text>
            <Text style={styles.summaryLabel}>総ボリューム</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const QUICK_START_MENUS = [
  { id: 'chest', emoji: '💪', label: '胸の日' },
  { id: 'back', emoji: '🔙', label: '背中の日' },
  { id: 'legs', emoji: '🦵', label: '脚の日' },
  { id: 'shoulders', emoji: '🏋️', label: '肩の日' },
  { id: 'arms', emoji: '💪', label: '腕の日' },
  { id: 'free', emoji: '📝', label: 'フリー' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  avatarCard: {
    marginBottom: Spacing.md,
  },
  startButton: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickStartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickStartItem: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStartEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  quickStartLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  trainerList: {
    marginBottom: Spacing.md,
  },
  trainerItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    marginRight: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCard: {
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
});
