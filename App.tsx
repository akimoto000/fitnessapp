import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthScreen } from './src/screens/AuthScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WorkoutScreen } from './src/screens/WorkoutScreen';
import {
  createWorkout,
  ensureProfile,
  getActiveWorkout,
  getCurrentSession,
  subscribeToAuthChanges,
  updateProfile,
} from './src/services/supabase';
import { useWorkoutStore } from './src/store/workoutStore';
import { AvatarType, ProfileRow } from './src/types';

type TabKey = 'home' | 'record' | 'history' | 'settings';

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'home', label: 'ホーム', icon: '🏠' },
  { key: 'record', label: '記録', icon: '➕' },
  { key: 'history', label: '履歴', icon: '📅' },
  { key: 'settings', label: '設定', icon: '⚙️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [booting, setBooting] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [globalError, setGlobalError] = useState('');

  const selectedAvatar = useWorkoutStore((state) => state.selectedAvatar);
  const currentWorkoutId = useWorkoutStore((state) => state.currentWorkoutId);
  const setSelectedAvatar = useWorkoutStore((state) => state.setSelectedAvatar);
  const startWorkoutSession = useWorkoutStore((state) => state.startWorkoutSession);
  const clearWorkoutSession = useWorkoutStore((state) => state.clearWorkoutSession);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const loadAuthenticatedState = useCallback(
    async (userId: string, email: string | null): Promise<void> => {
      const [ensured, activeWorkout] = await Promise.all([
        ensureProfile(userId, email ?? undefined),
        getActiveWorkout(userId),
      ]);

      setProfile(ensured);
      setSelectedAvatar(ensured.avatar_trainer);

      if (activeWorkout) {
        startWorkoutSession(activeWorkout.id);
      } else {
        clearWorkoutSession();
      }

      setGlobalError('');
    },
    [clearWorkoutSession, setSelectedAvatar, startWorkoutSession],
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async (): Promise<void> => {
      try {
        const session = await getCurrentSession();
        if (!active) {
          return;
        }

        if (session?.user) {
          setSessionUserId(session.user.id);
          await loadAuthenticatedState(session.user.id, session.user.email ?? null);
        } else {
          setSessionUserId(null);
          setProfile(null);
          clearWorkoutSession();
          setGlobalError('');
        }
      } catch (error) {
        if (active) {
          setGlobalError(error instanceof Error ? error.message : '初期化に失敗しました。');
        }
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    };

    void bootstrap();

    const subscription = subscribeToAuthChanges(async (session) => {
      if (!active) {
        return;
      }

      try {
        if (session?.user) {
          setSessionUserId(session.user.id);
          await loadAuthenticatedState(session.user.id, session.user.email ?? null);
        } else {
          setSessionUserId(null);
          setProfile(null);
          setActiveTab('home');
          clearWorkoutSession();
          setGlobalError('');
        }
      } catch (error) {
        if (active) {
          setGlobalError(error instanceof Error ? error.message : 'ユーザー情報の同期に失敗しました。');
        }
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearWorkoutSession, loadAuthenticatedState]);

  const handleAvatarChange = useCallback(
    async (avatar: AvatarType): Promise<void> => {
      if (!sessionUserId) {
        return;
      }

      const updated = await updateProfile(sessionUserId, { avatar_trainer: avatar });
      setProfile(updated);
      setSelectedAvatar(updated.avatar_trainer);
    },
    [sessionUserId, setSelectedAvatar],
  );

  const handleStartWorkoutFromHome = useCallback(async (): Promise<void> => {
    if (!sessionUserId) {
      return;
    }

    if (!currentWorkoutId) {
      const workout = await createWorkout(sessionUserId);
      startWorkoutSession(workout.id);
      bumpRefresh();
    }

    setActiveTab('record');
  }, [bumpRefresh, currentWorkoutId, sessionUserId, startWorkoutSession]);

  const renderedScreen = useMemo(() => {
    if (!sessionUserId || !profile) {
      return null;
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            userId={sessionUserId}
            selectedAvatar={selectedAvatar}
            refreshKey={refreshKey}
            onSelectAvatar={handleAvatarChange}
            onStartWorkout={handleStartWorkoutFromHome}
          />
        );
      case 'record':
        return (
          <WorkoutScreen
            userId={sessionUserId}
            selectedAvatar={selectedAvatar}
            onDataChanged={bumpRefresh}
          />
        );
      case 'history':
        return <HistoryScreen userId={sessionUserId} refreshKey={refreshKey} />;
      case 'settings':
        return (
          <SettingsScreen
            userId={sessionUserId}
            profile={profile}
            selectedAvatar={selectedAvatar}
            onAvatarChange={handleAvatarChange}
            onProfileSaved={(updated) => {
              setProfile(updated);
              setSelectedAvatar(updated.avatar_trainer);
            }}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    bumpRefresh,
    handleAvatarChange,
    handleStartWorkoutFromHome,
    profile,
    refreshKey,
    selectedAvatar,
    sessionUserId,
    setSelectedAvatar,
  ]);

  if (booting) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.centered}>
          <StatusBar style="light" />
          <ActivityIndicator color="#e94560" size="large" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!sessionUserId) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthScreen />
      </SafeAreaProvider>
    );
  }

  if (!profile) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.centered}>
          <StatusBar style="light" />
          <ActivityIndicator color="#e94560" size="large" />
          <Text style={styles.loadingText}>プロフィールを読み込み中...</Text>
          {globalError ? <Text style={styles.errorText}>{globalError}</Text> : null}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />

        {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}

        <View style={styles.screenWrap}>{renderedScreen}</View>

        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  screenWrap: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#cfcfe6',
    fontSize: 14,
  },
  errorText: {
    color: '#ff8fa1',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  globalError: {
    color: '#ff8fa1',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#141425',
    borderTopWidth: 1,
    borderTopColor: '#2f2f4d',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: '#2d1e2b',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    color: '#a9a9c6',
    fontSize: 12,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
});
