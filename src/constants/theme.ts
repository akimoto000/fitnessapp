// アプリ全体のテーマ定数

export const Colors = {
  primary: '#4A90D9',
  primaryDark: '#3A7BC8',
  primaryLight: '#6BA5E7',
  secondary: '#FF6B6B',
  secondaryDark: '#E55555',
  accent: '#FFD93D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F2F5',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
  // 筋肉グループ別カラー
  muscleColors: {
    chest: '#FF6B6B',
    back: '#4A90D9',
    shoulders: '#FFD93D',
    arms: '#FF9800',
    legs: '#4CAF50',
    core: '#9C27B0',
    full_body: '#607D8B',
  } as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
