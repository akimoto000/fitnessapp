import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AvatarType } from '../types';
import { AVATARS, getRandomPhrase } from '../utils/avatars';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';

interface AvatarDisplayProps {
  avatarId: AvatarType;
  event?: keyof typeof AVATARS[AvatarType]['phrases'];
  compact?: boolean;
}

const AVATAR_EMOJIS: Record<AvatarType, string> = {
  yuki: '🔥',
  sakura: '🌸',
  ryu: '⚔️',
  miku: '⭐',
  ken: '📊',
  ai7: '🤖',
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarId,
  event,
  compact = false,
}) => {
  const avatar = AVATARS[avatarId];
  const [phrase, setPhrase] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (event) {
      const newPhrase = getRandomPhrase(avatarId, event);
      setPhrase(newPhrase);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [event, avatarId]);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.emoji}>{AVATAR_EMOJIS[avatarId]}</Text>
        <Text style={styles.compactName}>{avatar.name}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarCircle}>
        <Text style={styles.emojiLarge}>{AVATAR_EMOJIS[avatarId]}</Text>
      </View>
      <Text style={styles.name}>{avatar.name}</Text>
      <Text style={styles.personality}>{avatar.personality}</Text>
      {phrase ? (
        <Animated.View style={[styles.speechBubble, { opacity: fadeAnim }]}>
          <Text style={styles.phrase}>「{phrase}」</Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  emojiLarge: {
    fontSize: 40,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  compactName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  personality: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  speechBubble: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    maxWidth: '90%',
  },
  phrase: {
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
});
