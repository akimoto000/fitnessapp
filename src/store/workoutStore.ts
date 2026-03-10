import { create } from 'zustand';
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import { getRandomAvatarMessage } from '../data/avatarMessages';
import { AvatarMessageTrigger, AvatarType } from '../types';

type RestTriggerTimeoutId = ReturnType<typeof setTimeout>;

const fallbackStorageCache = new Map<string, string>();
let warnedMissingAsyncStorage = false;

const clearRestTriggerTimeout = (timeoutId: RestTriggerTimeoutId | null): void => {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }
};

const fallbackStorage: StateStorage = {
  getItem: async (name) => fallbackStorageCache.get(name) ?? null,
  setItem: async (name, value) => {
    fallbackStorageCache.set(name, value);
  },
  removeItem: async (name) => {
    fallbackStorageCache.delete(name);
  },
};

const resolveWorkoutStorage = (): StateStorage => {
  try {
    const asyncStorageModule = require('@react-native-async-storage/async-storage') as {
      default?: StateStorage;
    };
    return asyncStorageModule.default ?? fallbackStorage;
  } catch {
    if (!warnedMissingAsyncStorage) {
      warnedMissingAsyncStorage = true;
      console.warn(
        'AsyncStorage package is missing. Install @react-native-async-storage/async-storage to persist recent exercises across app restarts.',
      );
    }
    return fallbackStorage;
  }
};

interface WorkoutState {
  currentWorkoutId: string | null;
  selectedAvatar: AvatarType;
  coachMessage: string;
  setCounterByExercise: Record<string, number>;
  restTimerSeconds: number;
  isRestTimerRunning: boolean;
  restTriggerTimeoutId: RestTriggerTimeoutId | null;
  recentExerciseIds: string[]; // 最近使った種目ID（先頭が最新）
  currentTrigger: AvatarMessageTrigger;
  setSelectedAvatar: (avatar: AvatarType) => void;
  setCoachMessage: (message: string) => void;
  triggerAvatarMessage: (trigger: AvatarMessageTrigger) => void;
  startWorkoutSession: (workoutId: string) => void;
  finishWorkoutSession: () => void;
  clearWorkoutSession: () => void;
  setExerciseSetCount: (exerciseId: string, count: number) => void;
  nextSetNumber: (exerciseId: string) => number;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  markExerciseUsed: (exerciseId: string) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      currentWorkoutId: null,
      selectedAvatar: 'yuki',
      coachMessage: getRandomAvatarMessage('yuki', 'workoutStart'),
      setCounterByExercise: {},
      restTimerSeconds: 0,
      isRestTimerRunning: false,
      restTriggerTimeoutId: null,
      recentExerciseIds: [],
      currentTrigger: 'workoutStart',

      setSelectedAvatar: (avatar) => {
        set({
          selectedAvatar: avatar,
          coachMessage: getRandomAvatarMessage(avatar, 'workoutStart'),
          currentTrigger: 'workoutStart',
        });
      },

      setCoachMessage: (message) => {
        set({ coachMessage: message });
      },

      triggerAvatarMessage: (trigger) => {
        const { selectedAvatar } = get();
        set({ coachMessage: getRandomAvatarMessage(selectedAvatar, trigger), currentTrigger: trigger });
      },

      startWorkoutSession: (workoutId) => {
        const { selectedAvatar, restTriggerTimeoutId } = get();
        clearRestTriggerTimeout(restTriggerTimeoutId);
        set({
          currentWorkoutId: workoutId,
          setCounterByExercise: {},
          coachMessage: getRandomAvatarMessage(selectedAvatar, 'workoutStart'),
          restTimerSeconds: 0,
          isRestTimerRunning: false,
          restTriggerTimeoutId: null,
          currentTrigger: 'workoutStart',
        });
      },

      finishWorkoutSession: () => {
        const { selectedAvatar, restTriggerTimeoutId } = get();
        clearRestTriggerTimeout(restTriggerTimeoutId);
        set({
          currentWorkoutId: null,
          setCounterByExercise: {},
          coachMessage: getRandomAvatarMessage(selectedAvatar, 'workoutComplete'),
          restTimerSeconds: 0,
          isRestTimerRunning: false,
          restTriggerTimeoutId: null,
          currentTrigger: 'workoutComplete',
        });
      },

      clearWorkoutSession: () => {
        const { selectedAvatar, restTriggerTimeoutId } = get();
        clearRestTriggerTimeout(restTriggerTimeoutId);
        set({
          currentWorkoutId: null,
          setCounterByExercise: {},
          coachMessage: getRandomAvatarMessage(selectedAvatar, 'workoutStart'),
          restTimerSeconds: 0,
          isRestTimerRunning: false,
          restTriggerTimeoutId: null,
          currentTrigger: 'workoutStart',
        });
      },

      setExerciseSetCount: (exerciseId, count) => {
        const normalizedCount = Math.max(0, Math.floor(count));
        set((state) => ({
          setCounterByExercise: {
            ...state.setCounterByExercise,
            [exerciseId]: normalizedCount,
          },
        }));
      },

      nextSetNumber: (exerciseId) => {
        const counters = get().setCounterByExercise;
        const next = (counters[exerciseId] ?? 0) + 1;
        set({
          setCounterByExercise: {
            ...counters,
            [exerciseId]: next,
          },
        });
        return next;
      },

      startRestTimer: (seconds) => {
        const { restTriggerTimeoutId } = get();
        clearRestTriggerTimeout(restTriggerTimeoutId);

        const timeoutId = setTimeout(() => {
          const { isRestTimerRunning, restTriggerTimeoutId: activeTimeoutId } = get();
          if (!isRestTimerRunning || activeTimeoutId !== timeoutId) {
            return;
          }

          get().triggerAvatarMessage('restStart');
          set({ restTriggerTimeoutId: null });
        }, 3000);

        set({
          restTimerSeconds: seconds,
          isRestTimerRunning: true,
          restTriggerTimeoutId: timeoutId,
        });
      },

      stopRestTimer: () => {
        const { restTriggerTimeoutId } = get();
        clearRestTriggerTimeout(restTriggerTimeoutId);
        set({ restTimerSeconds: 0, isRestTimerRunning: false, restTriggerTimeoutId: null });
      },

      tickRestTimer: () => {
        const { restTimerSeconds: seconds, restTriggerTimeoutId } = get();
        if (seconds <= 1) {
          clearRestTriggerTimeout(restTriggerTimeoutId);
          set({ restTimerSeconds: 0, isRestTimerRunning: false, restTriggerTimeoutId: null });
          return;
        }

        set({ restTimerSeconds: seconds - 1 });
      },

      markExerciseUsed: (exerciseId) => {
        const current = get().recentExerciseIds.filter((id) => id !== exerciseId);
        set({ recentExerciseIds: [exerciseId, ...current].slice(0, 20) });
      },
    }),
    {
      name: 'fitnessapp-workout-store',
      storage: createJSONStorage(resolveWorkoutStorage),
      partialize: (state) => ({
        recentExerciseIds: state.recentExerciseIds,
      }),
    },
  ),
);
