import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getAvatarImage } from '../constants/avatarAssets';
import { AVATAR_ORDER, getAvatarName } from '../data/avatarMessages';
import { AvatarType } from '../types';

// キャラ別カラーテーマ
const AVATAR_COLORS: Record<AvatarType, { bg: string; border: string }> = {
  yuki:   { bg: '#3d1f00', border: '#ff6b35' }, // オレンジ・熱血
  sakura: { bg: '#3d0020', border: '#ff8fab' }, // ピンク・優しい
  ryu:    { bg: '#0d0d2b', border: '#6c63ff' }, // ダーク紫・ストイック
  miku:   { bg: '#2d2200', border: '#ffd60a' }, // イエロー・元気
  ken:    { bg: '#002b3d', border: '#4cc9f0' }, // シアン・科学派
  ai7:    { bg: '#002020', border: '#00f5d4' }, // テック緑・ロボット
};

interface AvatarSelectorProps {
  selectedAvatar: AvatarType;
  onSelect: (avatar: AvatarType) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onSelect }) => {
  return (
    <View style={styles.container}>
      {AVATAR_ORDER.map((avatar) => {
        const isActive = selectedAvatar === avatar;
        const colors = AVATAR_COLORS[avatar];

        return (
          <Pressable
            key={avatar}
            onPress={() => onSelect(avatar)}
            style={[
              styles.item,
              { backgroundColor: colors.bg, borderColor: isActive ? colors.border : '#2f2f4d' },
              isActive && styles.activeItem,
            ]}
          >
            <Image
              source={getAvatarImage(avatar)}
              style={styles.avatarImage}
              resizeMode="contain"
            />
            <Text style={[styles.label, isActive && { color: colors.border }]}>
              {getAvatarName(avatar)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 14,
    borderWidth: 2,
    paddingBottom: 8,
    paddingTop: 4,
    paddingHorizontal: 6,
    width: 88,
    height: 100,
    overflow: 'hidden',
  },
  activeItem: {
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  avatarImage: {
    width: 72,
    height: 72,
    marginBottom: 2,
  },
  label: {
    color: '#cfcfe6',
    fontSize: 12,
    fontWeight: '700',
  },
});
