import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../components/Card';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { AVATARS } from '../utils/avatars';
import { AvatarType } from '../types';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';

export const SettingsScreen: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>('yuki');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* プロフィール */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>U</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>ゲストユーザー</Text>
            <Text style={styles.profileSub}>ログインして記録を保存しましょう</Text>
          </View>
        </View>
      </Card>

      {/* トレーナー選択 */}
      <Text style={styles.sectionTitle}>AIトレーナー選択</Text>
      <View style={styles.trainerGrid}>
        {(Object.keys(AVATARS) as AvatarType[]).map((id) => {
          const avatar = AVATARS[id];
          const isSelected = id === selectedAvatar;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.trainerCard, isSelected && styles.trainerCardSelected]}
              onPress={() => setSelectedAvatar(id)}
            >
              <AvatarDisplay avatarId={id} compact />
              <Text style={styles.trainerPersonality}>{avatar.personality}</Text>
              {isSelected && <View style={styles.selectedBadge}><Text style={styles.selectedBadgeText}>選択中</Text></View>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 選択中のトレーナーのプレビュー */}
      <Card style={styles.previewCard}>
        <AvatarDisplay avatarId={selectedAvatar} event="start" />
      </Card>

      {/* 設定メニュー */}
      <Text style={styles.sectionTitle}>設定</Text>
      <Card>
        {SETTINGS_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.settingItem,
              index < SETTINGS_ITEMS.length - 1 && styles.settingItemBorder,
            ]}
          >
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              {item.value && (
                <Text style={styles.settingValue}>{item.value}</Text>
              )}
            </View>
            <Text style={styles.settingArrow}>▶</Text>
          </TouchableOpacity>
        ))}
      </Card>

      {/* アプリ情報 */}
      <Text style={styles.versionText}>FitnessApp v1.0.0</Text>
    </ScrollView>
  );
};

const SETTINGS_ITEMS = [
  { id: 'unit', icon: '⚖️', label: '重量単位', value: 'kg' },
  { id: 'timer', icon: '⏱️', label: 'デフォルト休憩時間', value: '90秒' },
  { id: 'notification', icon: '🔔', label: '通知設定', value: '' },
  { id: 'data', icon: '💾', label: 'データの管理', value: '' },
  { id: 'about', icon: 'ℹ️', label: 'このアプリについて', value: '' },
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
  profileCard: {
    marginBottom: Spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  profileInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  profileSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  trainerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  trainerCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  trainerCardSelected: {
    borderColor: Colors.primary,
  },
  trainerPersonality: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  selectedBadge: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  selectedBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: '700',
  },
  previewCard: {
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    fontSize: 20,
    width: 32,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  settingValue: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  settingArrow: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginLeft: Spacing.sm,
  },
  versionText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: FontSize.sm,
    marginTop: Spacing.xl,
  },
});
