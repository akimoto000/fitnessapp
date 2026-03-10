import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getAvatarImageForTrigger } from '../constants/avatarAssets';
import { getAvatarName } from '../data/avatarMessages';
import { AvatarMessageTrigger, AvatarType } from '../types';

interface AvatarCoachCardProps {
  avatar: AvatarType;
  message: string;
  trigger?: AvatarMessageTrigger;
}

export const AvatarCoachCard: React.FC<AvatarCoachCardProps> = ({
  avatar,
  message,
  trigger = 'workoutStart',
}) => {
  const imageSource = getAvatarImageForTrigger(avatar, trigger);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Image source={imageSource} style={styles.avatarImage} resizeMode="contain" />
        <Text style={styles.name}>{getAvatarName(avatar)}</Text>
      </View>
      <View style={styles.messageWrap}>
        <View style={styles.bubble}>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#21213a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    paddingRight: 14,
    paddingBottom: 14,
    paddingTop: 0,
    paddingLeft: 0,
    gap: 10,
    minHeight: 130,
    overflow: 'hidden',
  },
  avatarWrap: {
    alignItems: 'center',
    width: 110,
  },
  avatarImage: {
    width: 110,
    height: 120,
  },
  name: {
    marginTop: 2,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  messageWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 14,
  },
  bubble: {
    backgroundColor: '#2f2f50',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3f3f6a',
    padding: 10,
  },
  message: {
    color: '#f4f4f8',
    fontSize: 14,
    lineHeight: 21,
  },
});
