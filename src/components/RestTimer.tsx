import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWorkoutStore } from '../store/workoutStore';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';

const TIMER_PRESETS = [30, 60, 90, 120, 180];

export const RestTimer: React.FC = () => {
  const {
    restTimerSeconds,
    isRestTimerRunning,
    startRestTimer,
    stopRestTimer,
    tickRestTimer,
  } = useWorkoutStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRestTimerRunning) {
      intervalRef.current = setInterval(() => {
        tickRestTimer();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRestTimerRunning]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>休憩タイマー</Text>

      {isRestTimerRunning ? (
        <View style={styles.activeTimer}>
          <Text style={styles.time}>{formatTime(restTimerSeconds)}</Text>
          <TouchableOpacity style={styles.stopButton} onPress={stopRestTimer}>
            <Text style={styles.stopButtonText}>停止</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.presets}>
          {TIMER_PRESETS.map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={styles.presetButton}
              onPress={() => startRestTimer(seconds)}
            >
              <Text style={styles.presetText}>{formatTime(seconds)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  activeTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  time: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  stopButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  stopButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  presets: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  presetButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  presetText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
});
