import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { WorkoutSummaryCard } from '../components/WorkoutSummaryCard';
import { EXERCISE_CATEGORY_LABELS } from '../data/avatarMessages';
import {
  fetchExerciseWeightHistory,
  fetchExercises,
  fetchVolumeByCategory,
  fetchWorkoutCount,
  fetchWorkoutDetail,
  fetchWorkoutSummaries,
  getPersonalRecord,
} from '../services/supabase';
import {
  CategoryVolume,
  ExerciseCategory,
  ExerciseRow,
  ExerciseWeightHistoryPoint,
  WorkoutDetail,
  WorkoutSummary,
} from '../types';

interface HistoryScreenProps {
  userId: string;
  refreshKey: number;
}

type HistoryTabKey = 'records' | 'graphs' | 'summary';

const HISTORY_TABS: Array<{ key: HistoryTabKey; label: string }> = [
  { key: 'records', label: '記録' },
  { key: 'graphs', label: 'グラフ' },
  { key: 'summary', label: 'サマリー' },
];

const CATEGORY_ORDER: ExerciseCategory[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'abs',
  'cardio',
];

const createEmptyCategoryVolume = (): CategoryVolume[] =>
  CATEGORY_ORDER.map((category) => ({ category, totalVolume: 0 }));

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatChartDate = (value: string): string =>
  new Date(value).toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  });

const formatWeightLabel = (value: number): string => (Number.isInteger(value) ? `${value}` : value.toFixed(1));

const getStartOfWeek = (baseDate: Date): Date => {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getStartOfMonth = (baseDate: Date): Date => {
  const start = new Date(baseDate);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
};

const sumCategoryVolume = (rows: CategoryVolume[]): number =>
  rows.reduce((sum, item) => sum + item.totalVolume, 0);

interface WeightTrendChartProps {
  data: ExerciseWeightHistoryPoint[];
  width: number;
}

const WeightTrendChart: React.FC<WeightTrendChartProps> = ({ data, width }) => {
  if (data.length === 0) {
    return null;
  }

  const height = 210;
  const paddingTop = 12;
  const paddingRight = 10;
  const paddingBottom = 20;
  const paddingLeft = 44;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const weights = data.map((item) => item.maxWeight);
  const minRaw = Math.min(...weights);
  const maxRaw = Math.max(...weights);
  const minValue = minRaw === maxRaw ? Math.max(0, minRaw - 5) : Math.max(0, minRaw * 0.9);
  const maxValue = minRaw === maxRaw ? maxRaw + 5 : maxRaw * 1.1;
  const range = Math.max(maxValue - minValue, 1);

  const points = data.map((item, index) => {
    const xRatio = index / Math.max(data.length - 1, 1);
    const yRatio = (maxValue - item.maxWeight) / range;

    return {
      x: paddingLeft + chartWidth * xRatio,
      y: paddingTop + chartHeight * yRatio,
    };
  });

  const yTicks = Array.from({ length: 5 }, (_, index) => ({
    y: paddingTop + (chartHeight * index) / 4,
    value: maxValue - ((maxValue - minValue) * index) / 4,
  }));

  const labelStride = Math.max(1, Math.ceil(data.length / 5));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.axisLabel}>重量 (kg)</Text>
      <View style={[styles.trendPlotArea, { width, height }]}>
        {yTicks.map((tick, index) => (
          <React.Fragment key={`tick-${index}`}>
            <View style={[styles.trendGridLine, { top: tick.y, left: paddingLeft, right: paddingRight }]} />
            <Text style={[styles.trendTickLabel, { top: tick.y - 8, width: paddingLeft - 8 }]}>
              {formatWeightLabel(Number(tick.value.toFixed(1)))}
            </Text>
          </React.Fragment>
        ))}

        {points.slice(0, -1).map((point, index) => {
          const nextPoint = points[index + 1];
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          return (
            <View
              key={`segment-${index}`}
              style={[
                styles.trendLineSegment,
                {
                  width: length,
                  left: point.x + dx / 2 - length / 2,
                  top: point.y + dy / 2 - 1,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {points.map((point, index) => (
          <View
            key={`point-${index}`}
            style={[styles.trendPoint, { left: point.x - 4, top: point.y - 4 }]}
          />
        ))}
      </View>

      <View style={styles.xAxisRow}>
        {data.map((item, index) => {
          const shouldShowLabel = index % labelStride === 0 || index === data.length - 1;
          return (
            <View key={`${item.date}-${index}`} style={styles.xAxisSlot}>
              <Text style={styles.xAxisLabel}>{shouldShowLabel ? formatChartDate(item.date) : ''}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface CategoryVolumeChartProps {
  data: CategoryVolume[];
  width: number;
}

const CategoryVolumeChart: React.FC<CategoryVolumeChartProps> = ({ data, width }) => {
  const values = CATEGORY_ORDER.map((category) => ({
    category,
    label: EXERCISE_CATEGORY_LABELS[category],
    totalVolume: data.find((item) => item.category === category)?.totalVolume ?? 0,
  }));

  const height = 220;
  const maxVolume = Math.max(...values.map((item) => item.totalVolume), 1);
  const ticks = Array.from({ length: 4 }, (_, index) =>
    Math.round(maxVolume - (maxVolume * index) / 3),
  );

  return (
    <View style={[styles.categoryChartWrap, { width, height }]}>
      <Text style={styles.axisLabel}>ボリューム (kg)</Text>
      <View style={styles.categoryBarsArea}>
        {Array.from({ length: 4 }, (_, index) => (
          <View
            key={`grid-${index}`}
            style={[styles.categoryGridLine, { top: `${(index / 3) * 100}%` }]}
          />
        ))}

        {ticks.map((tick, index) => (
          <Text key={`tick-${index}`} style={[styles.categoryTickLabel, { top: `${(index / 3) * 100}%` }]}>
            {tick}
          </Text>
        ))}

        <View style={styles.categoryBarsRow}>
          {values.map((item) => {
            const ratio = maxVolume > 0 ? item.totalVolume / maxVolume : 0;
            const barHeight = item.totalVolume > 0 ? Math.max(6, ratio * 132) : 0;

            return (
              <View key={item.category} style={styles.categoryBarSlot}>
                <View style={styles.categoryBarTrack}>
                  <View style={[styles.categoryBar, { height: barHeight }]} />
                </View>
                <Text style={styles.categoryBarLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ userId, refreshKey }) => {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(windowWidth - 56, 250);

  const [activeTab, setActiveTab] = useState<HistoryTabKey>('records');

  const [history, setHistory] = useState<WorkoutSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');

  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const [weightHistory, setWeightHistory] = useState<ExerciseWeightHistoryPoint[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState('');
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const [weekWorkoutCount, setWeekWorkoutCount] = useState(0);
  const [monthWorkoutCount, setMonthWorkoutCount] = useState(0);
  const [weekTotalVolume, setWeekTotalVolume] = useState(0);
  const [monthTotalVolume, setMonthTotalVolume] = useState(0);
  const [monthVolumeByCategory, setMonthVolumeByCategory] = useState<CategoryVolume[]>(
    createEmptyCategoryVolume(),
  );

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<WorkoutDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null,
    [exercises, selectedExerciseId],
  );

  useEffect(() => {
    let active = true;

    const loadHistoryAndExercises = async (): Promise<void> => {
      setHistoryLoading(true);
      setHistoryError('');

      try {
        const [summaries, fetchedExercises] = await Promise.all([
          fetchWorkoutSummaries(userId),
          fetchExercises(),
        ]);

        if (!active) {
          return;
        }

        setHistory(summaries);
        setExercises(fetchedExercises);
        setSelectedExerciseId((current) => {
          if (current && fetchedExercises.some((exercise) => exercise.id === current)) {
            return current;
          }

          return fetchedExercises[0]?.id ?? null;
        });
      } catch (loadError) {
        if (active) {
          setHistoryError(
            loadError instanceof Error
              ? loadError.message
              : '履歴データの取得に失敗しました。',
          );
        }
      } finally {
        if (active) {
          setHistoryLoading(false);
        }
      }
    };

    void loadHistoryAndExercises();

    return () => {
      active = false;
    };
  }, [refreshKey, userId]);

  useEffect(() => {
    let active = true;

    const loadSummary = async (): Promise<void> => {
      setSummaryLoading(true);
      setSummaryError('');

      const now = new Date();
      const weekStart = getStartOfWeek(now);
      const monthStart = getStartOfMonth(now);

      try {
        const [
          weeklyCount,
          monthlyCount,
          weeklyVolumeByCategory,
          monthlyVolumeByCategory,
        ] = await Promise.all([
          fetchWorkoutCount(userId, weekStart),
          fetchWorkoutCount(userId, monthStart),
          fetchVolumeByCategory(userId, weekStart),
          fetchVolumeByCategory(userId, monthStart),
        ]);

        if (!active) {
          return;
        }

        setWeekWorkoutCount(weeklyCount);
        setMonthWorkoutCount(monthlyCount);
        setWeekTotalVolume(sumCategoryVolume(weeklyVolumeByCategory));
        setMonthTotalVolume(sumCategoryVolume(monthlyVolumeByCategory));
        setMonthVolumeByCategory(monthlyVolumeByCategory);
      } catch (loadError) {
        if (active) {
          setSummaryError(
            loadError instanceof Error
              ? loadError.message
              : 'サマリーデータの取得に失敗しました。',
          );
        }
      } finally {
        if (active) {
          setSummaryLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      active = false;
    };
  }, [refreshKey, userId]);

  useEffect(() => {
    if (!selectedExerciseId) {
      setWeightHistory([]);
      setPersonalBest(null);
      setGraphError('');
      return;
    }

    let active = true;

    const loadGraphData = async (): Promise<void> => {
      setGraphLoading(true);
      setGraphError('');

      try {
        const [historyRows, record] = await Promise.all([
          fetchExerciseWeightHistory(userId, selectedExerciseId, 10),
          getPersonalRecord(userId, selectedExerciseId),
        ]);

        if (!active) {
          return;
        }

        setWeightHistory(historyRows);

        const highestFromHistory = historyRows.reduce(
          (currentMax, row) => Math.max(currentMax, row.maxWeight),
          0,
        );
        const recordWeight = record?.max_weight_kg ?? null;

        if (recordWeight && recordWeight > 0) {
          setPersonalBest(recordWeight);
        } else if (highestFromHistory > 0) {
          setPersonalBest(highestFromHistory);
        } else {
          setPersonalBest(null);
        }
      } catch (loadError) {
        if (active) {
          setGraphError(
            loadError instanceof Error
              ? loadError.message
              : 'グラフデータの取得に失敗しました。',
          );
          setWeightHistory([]);
          setPersonalBest(null);
        }
      } finally {
        if (active) {
          setGraphLoading(false);
        }
      }
    };

    void loadGraphData();

    return () => {
      active = false;
    };
  }, [refreshKey, selectedExerciseId, userId]);

  const handleCloseDetail = (): void => {
    setDetailVisible(false);
    setSelectedDetail(null);
    setDetailLoading(false);
    setDetailError('');
  };

  const handleSelectWorkout = async (workoutId: string): Promise<void> => {
    setDetailVisible(true);
    setSelectedDetail(null);
    setDetailLoading(true);
    setDetailError('');

    try {
      const detail = await fetchWorkoutDetail(workoutId);
      setSelectedDetail(detail);
    } catch (error) {
      const message = error instanceof Error ? error.message : '詳細の取得に失敗しました。';
      setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const renderRecordsTab = (): React.ReactNode => (
    <View style={styles.tabBody}>
      {historyLoading ? <ActivityIndicator color="#e94560" style={styles.loader} /> : null}
      {historyError ? <Text style={styles.error}>{historyError}</Text> : null}

      {!historyLoading && history.length === 0 ? (
        <Text style={styles.empty}>まだ履歴がありません。記録タブから最初のワークアウトを保存してください。</Text>
      ) : null}

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <WorkoutSummaryCard summary={item} onPress={() => void handleSelectWorkout(item.id)} />
        )}
      />
    </View>
  );

  const renderGraphTab = (): React.ReactNode => (
    <ScrollView contentContainerStyle={styles.analyticsContent}>
      {historyLoading ? <ActivityIndicator color="#e94560" style={styles.loader} /> : null}
      {!historyLoading && exercises.length === 0 ? (
        <Text style={styles.empty}>グラフ表示に使える種目がありません。</Text>
      ) : null}

      {exercises.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exerciseChipRow}
        >
          {exercises.map((exercise) => {
            const selected = exercise.id === selectedExerciseId;
            return (
              <Pressable
                key={exercise.id}
                style={[styles.exerciseChip, selected && styles.exerciseChipActive]}
                onPress={() => setSelectedExerciseId(exercise.id)}
              >
                <Text style={[styles.exerciseChipText, selected && styles.exerciseChipTextActive]}>
                  {exercise.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {selectedExercise ? (
        <Text style={styles.sectionTitle}>{selectedExercise.name} の重量推移（直近10セッション）</Text>
      ) : null}

      <Text style={styles.pbText}>
        {personalBest ? `PB: ${formatWeightLabel(Number(personalBest.toFixed(1)))}kg` : 'PB: まだ記録がありません'}
      </Text>

      {graphLoading ? <ActivityIndicator color="#e94560" style={styles.loader} /> : null}
      {graphError ? <Text style={styles.error}>{graphError}</Text> : null}

      {!graphLoading && !graphError && selectedExerciseId && weightHistory.length === 0 ? (
        <Text style={styles.empty}>この種目のデータがまだありません。</Text>
      ) : null}

      {!graphLoading && !graphError && weightHistory.length > 0 ? (
        <View style={styles.chartCard}>
          <WeightTrendChart data={weightHistory} width={chartWidth} />
        </View>
      ) : null}
    </ScrollView>
  );

  const renderSummaryTab = (): React.ReactNode => (
    <ScrollView contentContainerStyle={styles.analyticsContent}>
      {summaryLoading ? <ActivityIndicator color="#e94560" style={styles.loader} /> : null}
      {summaryError ? <Text style={styles.error}>{summaryError}</Text> : null}

      {!summaryLoading && !summaryError ? (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryPeriodLabel}>今週</Text>
              <Text style={styles.summaryValue}>{weekWorkoutCount}回</Text>
              <Text style={styles.summaryMeta}>総ボリューム</Text>
              <Text style={styles.summaryVolume}>{weekTotalVolume.toLocaleString()} kg</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryPeriodLabel}>今月</Text>
              <Text style={styles.summaryValue}>{monthWorkoutCount}回</Text>
              <Text style={styles.summaryMeta}>総ボリューム</Text>
              <Text style={styles.summaryVolume}>{monthTotalVolume.toLocaleString()} kg</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>今月の部位別ボリューム</Text>
            <CategoryVolumeChart data={monthVolumeByCategory} width={chartWidth} />
          </View>
        </>
      ) : null}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>履歴</Text>
      <Text style={styles.subtitle}>記録・グラフ・サマリーを確認</Text>

      <View style={styles.tabSwitchWrap}>
        {HISTORY_TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabSwitchButton, active && styles.tabSwitchButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabSwitchText, active && styles.tabSwitchTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.contentWrap}>
        {activeTab === 'records' ? renderRecordsTab() : null}
        {activeTab === 'graphs' ? renderGraphTab() : null}
        {activeTab === 'summary' ? renderSummaryTab() : null}
      </View>

      <Modal visible={detailVisible} animationType="slide" transparent onRequestClose={handleCloseDetail}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ワークアウト詳細</Text>
              <Pressable onPress={handleCloseDetail} style={styles.closeButton}>
                <Text style={styles.closeText}>閉じる</Text>
              </Pressable>
            </View>

            {detailLoading ? <ActivityIndicator color="#e94560" /> : null}
            {detailError ? <Text style={styles.error}>{detailError}</Text> : null}

            {selectedDetail ? (
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalMeta}>開始: {formatDateTime(selectedDetail.started_at)}</Text>
                <Text style={styles.modalMeta}>種目数: {selectedDetail.exerciseCount}</Text>
                <Text style={styles.modalMeta}>
                  総ボリューム: {selectedDetail.totalVolume.toLocaleString()} kg
                </Text>

                <View style={styles.divider} />

                {selectedDetail.sets.map((setItem) => (
                  <View key={setItem.id} style={styles.setRow}>
                    <Text style={styles.setTitle}>
                      Set {setItem.set_number}: {setItem.exercise_name}
                    </Text>
                    <Text style={styles.setMeta}>
                      {EXERCISE_CATEGORY_LABELS[setItem.exercise_category]} / {setItem.weight_kg ?? 0}
                      kg x {setItem.reps ?? 0}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
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
  tabSwitchWrap: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    overflow: 'hidden',
    backgroundColor: '#171729',
  },
  tabSwitchButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSwitchButtonActive: {
    backgroundColor: '#2d1e2b',
  },
  tabSwitchText: {
    color: '#9d9db8',
    fontSize: 13,
    fontWeight: '700',
  },
  tabSwitchTextActive: {
    color: '#ffffff',
  },
  contentWrap: {
    flex: 1,
  },
  tabBody: {
    flex: 1,
  },
  loader: {
    marginVertical: 12,
  },
  listContent: {
    gap: 10,
    paddingBottom: 120,
  },
  analyticsContent: {
    gap: 12,
    paddingVertical: 8,
    paddingBottom: 120,
  },
  exerciseChipRow: {
    gap: 8,
    paddingBottom: 4,
    paddingRight: 6,
  },
  exerciseChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    backgroundColor: '#171729',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exerciseChipActive: {
    borderColor: '#e94560',
    backgroundColor: '#3a1e2a',
  },
  exerciseChipText: {
    color: '#bcbcd9',
    fontSize: 13,
    fontWeight: '600',
  },
  exerciseChipTextActive: {
    color: '#ffffff',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  pbText: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#21213a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    padding: 12,
    gap: 2,
  },
  summaryPeriodLabel: {
    color: '#bcbcd9',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  summaryMeta: {
    color: '#9d9db8',
    fontSize: 12,
    marginTop: 4,
  },
  summaryVolume: {
    color: '#e94560',
    fontSize: 15,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#1f1f36',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
  },
  chartContainer: {
    gap: 6,
  },
  axisLabel: {
    color: '#9d9db8',
    fontSize: 11,
    fontWeight: '600',
  },
  trendPlotArea: {
    position: 'relative',
  },
  trendGridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#2f2f4d',
  },
  trendTickLabel: {
    position: 'absolute',
    left: 0,
    color: '#9d9db8',
    fontSize: 10,
    textAlign: 'right',
  },
  trendLineSegment: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor: '#e94560',
  },
  trendPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94560',
  },
  xAxisRow: {
    flexDirection: 'row',
    marginLeft: 42,
    marginRight: 10,
  },
  xAxisSlot: {
    flex: 1,
    alignItems: 'center',
  },
  xAxisLabel: {
    color: '#9d9db8',
    fontSize: 10,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryChartWrap: {
    gap: 8,
  },
  categoryBarsArea: {
    position: 'relative',
    height: 168,
    marginTop: 2,
    paddingLeft: 26,
    paddingRight: 6,
    paddingTop: 8,
    paddingBottom: 24,
  },
  categoryGridLine: {
    position: 'absolute',
    left: 26,
    right: 6,
    height: 1,
    backgroundColor: '#2f2f4d',
  },
  categoryTickLabel: {
    position: 'absolute',
    left: 0,
    width: 24,
    color: '#9d9db8',
    fontSize: 9,
    textAlign: 'right',
    marginTop: -6,
  },
  categoryBarsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  categoryBarSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  categoryBarTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  categoryBar: {
    width: '72%',
    maxWidth: 24,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: '#e94560',
  },
  categoryBarLabel: {
    color: '#bcbcd9',
    fontSize: 11,
    fontWeight: '600',
  },
  error: {
    color: '#ff8fa1',
    fontSize: 13,
  },
  empty: {
    color: '#9d9db8',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '82%',
    backgroundColor: '#1f1f36',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e94560',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  modalContent: {
    gap: 10,
    paddingBottom: 20,
  },
  modalMeta: {
    color: '#cfcfe6',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#313156',
    marginVertical: 4,
  },
  setRow: {
    backgroundColor: '#171729',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#303055',
    padding: 10,
    gap: 4,
  },
  setTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  setMeta: {
    color: '#bcbcd9',
    fontSize: 13,
  },
});
