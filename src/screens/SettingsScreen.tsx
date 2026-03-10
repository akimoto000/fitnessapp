import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AvatarSelector } from '../components/AvatarSelector';
import { signOut, updateProfile } from '../services/supabase';
import { AvatarType, ProfileRow } from '../types';

interface SettingsScreenProps {
  userId: string;
  profile: ProfileRow | null;
  selectedAvatar: AvatarType;
  onAvatarChange: (avatar: AvatarType) => Promise<void> | void;
  onProfileSaved: (profile: ProfileRow) => void;
}

const parseOptionalNumber = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userId,
  profile,
  selectedAvatar,
  onAvatarChange,
  onProfileSaved,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDisplayName(profile?.display_name ?? '');
    setWeight(profile?.weight_kg?.toString() ?? '');
    setHeight(profile?.height_cm?.toString() ?? '');
  }, [profile]);

  const handleSaveProfile = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const updated = await updateProfile(userId, {
        display_name: displayName.trim() || null,
        weight_kg: parseOptionalNumber(weight),
        height_cm: parseOptionalNumber(height),
        avatar_trainer: selectedAvatar,
      });
      onProfileSaved(updated);
      Alert.alert('保存完了', 'プロフィールを更新しました。');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'プロフィール更新に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = async (avatar: AvatarType): Promise<void> => {
    setError('');
    try {
      await onAvatarChange(avatar);
    } catch (avatarError) {
      setError(avatarError instanceof Error ? avatarError.message : 'アバターの変更に失敗しました。');
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await signOut();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'ログアウトに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>設定</Text>
      <Text style={styles.subtitle}>プロフィールとアバターを管理</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>プロフィール</Text>

        <Text style={styles.label}>表示名</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          placeholder="表示名"
          placeholderTextColor="#7c7c9f"
        />

        <Text style={styles.label}>体重 (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          style={styles.input}
          placeholder="70"
          placeholderTextColor="#7c7c9f"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>身長 (cm)</Text>
        <TextInput
          value={height}
          onChangeText={setHeight}
          style={styles.input}
          placeholder="170"
          placeholderTextColor="#7c7c9f"
          keyboardType="decimal-pad"
        />

        <Pressable onPress={handleSaveProfile} style={styles.primaryButton} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryText}>プロフィール保存</Text>}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AIアバター変更</Text>
        <AvatarSelector selectedAvatar={selectedAvatar} onSelect={(avatar) => void handleAvatarSelect(avatar)} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={handleSignOut} style={styles.logoutButton} disabled={loading}>
        <Text style={styles.logoutText}>ログアウト</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 16,
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
  section: {
    backgroundColor: '#21213a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2f2f4d',
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    color: '#cfcfe6',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34345a',
    backgroundColor: '#171729',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#e94560',
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  error: {
    color: '#ff8fa1',
    fontSize: 13,
  },
  logoutButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e94560',
    backgroundColor: '#2d1e2b',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
