import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WorkoutSummary } from '../types';

interface WorkoutSummaryCardProps {
  summary: WorkoutSummary;
  onPress?: () => void;
}

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });

export const WorkoutSummaryCard: React.FC<WorkoutSummaryCardProps> = ({ summary, onPress }) => {
  const content = (
    <>
      <View style={styles.row}>
        <Text style={styles.date}>{formatDate(summary.started_at)}</Text>
        <Text style={styles.volume}>{summary.totalVolume.toLocaleString()} kg</Text>
      </View>
      <Text style={styles.meta}>
        種目数 {summary.exerciseCount} / 総ボリューム {summary.totalVolume.toLocaleString()} kg
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={styles.card} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#21213a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    padding: 12,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  volume: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    color: '#cfcfe6',
    fontSize: 13,
  },
});
