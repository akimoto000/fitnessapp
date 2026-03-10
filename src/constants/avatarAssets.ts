import type { ImageSourcePropType } from 'react-native';
import { AvatarMessageTrigger, AvatarType } from '../types';

export type AvatarExpression =
  | 'normal'
  | 'encourage'
  | 'praise'
  | 'rest'
  | 'surprised'
  | 'focused';

export const DEFAULT_AVATAR_EXPRESSION: AvatarExpression = 'normal';

export const AVATAR_TRIGGER_EXPRESSIONS: Record<AvatarMessageTrigger, AvatarExpression> = {
  workoutStart: 'focused',
  setComplete: 'encourage',
  personalBest: 'surprised',
  workoutComplete: 'praise',
  restStart: 'rest',
  heavyLift: 'focused',
};

export const AVATAR_ASSETS = {
  yuki: {
    normal: require('../assets/avatars/yuki_normal.png'),
    encourage: require('../assets/avatars/yuki_encourage.png'),
    praise: require('../assets/avatars/yuki_praise.png'),
    rest: require('../assets/avatars/yuki_rest.png'),
    surprised: require('../assets/avatars/yuki_surprised.png'),
    focused: require('../assets/avatars/yuki_focused.png'),
  },
  sakura: {
    normal: require('../assets/avatars/sakura_normal.png'),
    encourage: require('../assets/avatars/sakura_encourage.png'),
    praise: require('../assets/avatars/sakura_praise.png'),
    rest: require('../assets/avatars/sakura_rest.png'),
    surprised: require('../assets/avatars/sakura_surprised.png'),
    focused: require('../assets/avatars/sakura_focused.png'),
  },
  ryu: {
    normal: require('../assets/avatars/ryu_normal.png'),
    encourage: require('../assets/avatars/ryu_encourage.png'),
    praise: require('../assets/avatars/ryu_praise.png'),
    rest: require('../assets/avatars/ryu_rest.png'),
    surprised: require('../assets/avatars/ryu_surprised.png'),
    focused: require('../assets/avatars/ryu_focused.png'),
  },
  miku: {
    normal: require('../assets/avatars/miku_normal.png'),
    encourage: require('../assets/avatars/miku_encourage.png'),
    praise: require('../assets/avatars/miku_praise.png'),
    rest: require('../assets/avatars/miku_rest.png'),
    surprised: require('../assets/avatars/miku_surprised.png'),
    focused: require('../assets/avatars/miku_focused.png'),
  },
  ken: {
    normal: require('../assets/avatars/ken_normal.png'),
    encourage: require('../assets/avatars/ken_encourage.png'),
    praise: require('../assets/avatars/ken_praise.png'),
    rest: require('../assets/avatars/ken_rest.png'),
    surprised: require('../assets/avatars/ken_surprised.png'),
    focused: require('../assets/avatars/ken_focused.png'),
  },
  ai7: {
    normal: require('../assets/avatars/ai7_normal.png'),
    encourage: require('../assets/avatars/ai7_encourage.png'),
    praise: require('../assets/avatars/ai7_praise.png'),
    rest: require('../assets/avatars/ai7_rest.png'),
    surprised: require('../assets/avatars/ai7_surprised.png'),
    focused: require('../assets/avatars/ai7_focused.png'),
  },
} satisfies Record<AvatarType, Record<AvatarExpression, ImageSourcePropType>>;

export const getAvatarImage = (
  avatar: AvatarType,
  expression: AvatarExpression = DEFAULT_AVATAR_EXPRESSION,
): ImageSourcePropType => AVATAR_ASSETS[avatar][expression];

export const getAvatarImageForTrigger = (
  avatar: AvatarType,
  trigger: AvatarMessageTrigger,
): ImageSourcePropType => getAvatarImage(avatar, AVATAR_TRIGGER_EXPRESSIONS[trigger]);
