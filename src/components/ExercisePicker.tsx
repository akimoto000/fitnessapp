import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Modal,
} from 'react-native';
import { Exercise, MuscleGroup } from '../types';
import { PRESET_EXERCISES, MUSCLE_GROUP_LABELS } from '../data/exercises';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';

interface ExercisePickerProps {
  visible: boolean;
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
];

export const ExercisePicker: React.FC<ExercisePickerProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = PRESET_EXERCISES.filter((e) => {
    const matchesGroup = selectedGroup ? e.muscle_group === selectedGroup : true;
    const matchesSearch = searchQuery
      ? e.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesGroup && matchesSearch;
  });

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setSelectedGroup(null);
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setSelectedGroup(null);
    setSearchQuery('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>種目を選択</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeButton}>閉じる</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="種目を検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textLight}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedGroup && styles.filterChipActive]}
            onPress={() => setSelectedGroup(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedGroup && styles.filterChipTextActive,
              ]}
            >
              すべて
            </Text>
          </TouchableOpacity>
          {MUSCLE_GROUPS.map((group) => (
            <TouchableOpacity
              key={group}
              style={[
                styles.filterChip,
                selectedGroup === group && styles.filterChipActive,
              ]}
              onPress={() => setSelectedGroup(group)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedGroup === group && styles.filterChipTextActive,
                ]}
              >
                {MUSCLE_GROUP_LABELS[group]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseItem}
              onPress={() => handleSelect(item)}
            >
              <View>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {MUSCLE_GROUP_LABELS[item.muscle_group]} ・ {item.equipment}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '600',
  },
  searchInput: {
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    fontSize: FontSize.lg,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  exerciseItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  exerciseName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  exerciseMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
});
