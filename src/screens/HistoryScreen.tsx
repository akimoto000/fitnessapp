import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../components/Card';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// 簡易カレンダーの日付生成
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

export const HistoryScreen: React.FC = () => {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const days = generateCalendarDays(currentYear, currentMonth);

  // TODO: Supabase連携後に実データを取得
  const trainingDays: Set<number> = new Set();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day: number) => {
    return (
      day === now.getDate() &&
      currentMonth === now.getMonth() &&
      currentYear === now.getFullYear()
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* カレンダーヘッダー */}
      <Card style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <Text style={styles.navButton}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentYear}年 {currentMonth + 1}月
          </Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Text style={styles.navButton}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* 曜日ヘッダー */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((day, i) => (
            <Text
              key={day}
              style={[
                styles.weekdayText,
                i === 0 && styles.sundayText,
                i === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* カレンダーグリッド */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => (
            <View key={index} style={styles.dayCell}>
              {day !== null ? (
                <View
                  style={[
                    styles.dayContent,
                    isToday(day) && styles.todayHighlight,
                    trainingDays.has(day) && styles.trainingDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday(day) && styles.todayText,
                      trainingDays.has(day) && styles.trainingDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Card>

      {/* 月間サマリー */}
      <Text style={styles.sectionTitle}>
        {currentMonth + 1}月のサマリー
      </Text>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>トレーニング回数</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>総セット数</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0 kg</Text>
            <Text style={styles.summaryLabel}>総ボリューム</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>自己ベスト更新</Text>
          </View>
        </View>
      </Card>

      {/* 履歴リスト (プレースホルダー) */}
      <Text style={styles.sectionTitle}>トレーニング履歴</Text>
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          まだトレーニング記録がありません。{'\n'}
          トレーニングを始めて記録しましょう！
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  calendarCard: {
    marginBottom: Spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navButton: {
    fontSize: FontSize.xl,
    color: Colors.primary,
    paddingHorizontal: Spacing.sm,
  },
  monthTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sundayText: {
    color: Colors.error,
  },
  saturdayText: {
    color: Colors.primary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayHighlight: {
    backgroundColor: Colors.primary,
  },
  trainingDay: {
    backgroundColor: Colors.success,
  },
  dayText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  todayText: {
    color: Colors.white,
    fontWeight: '700',
  },
  trainingDayText: {
    color: Colors.white,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
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
  emptyCard: {
    marginBottom: Spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 24,
    paddingVertical: Spacing.lg,
  },
});
