import { create } from 'zustand';
import { Workout, WorkoutSet, Exercise } from '../types';

interface WorkoutState {
  // 現在のワークアウト
  currentWorkout: Workout | null;
  sets: WorkoutSet[];
  
  // 休憩タイマー
  restTimerSeconds: number;
  isRestTimerRunning: boolean;
  
  // アクション
  startWorkout: () => void;
  endWorkout: () => void;
  addSet: (set: Omit<WorkoutSet, 'id' | 'workout_id' | 'created_at'>) => void;
  
  // 休憩タイマー
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  currentWorkout: null,
  sets: [],
  restTimerSeconds: 0,
  isRestTimerRunning: false,

  startWorkout: () => {
    const workout: Workout = {
      id: Date.now().toString(), // 仮のID（Supabase連携後に変更）
      user_id: '', // 認証後に設定
      started_at: new Date().toISOString(),
    };
    set({ currentWorkout: workout, sets: [] });
  },

  endWorkout: () => {
    const { currentWorkout } = get();
    if (currentWorkout) {
      set({
        currentWorkout: {
          ...currentWorkout,
          completed_at: new Date().toISOString(),
        },
      });
    }
  },

  addSet: (setData) => {
    const { currentWorkout, sets } = get();
    if (!currentWorkout) return;

    const newSet: WorkoutSet = {
      ...setData,
      id: Date.now().toString(),
      workout_id: currentWorkout.id,
      created_at: new Date().toISOString(),
    };
    set({ sets: [...sets, newSet] });
  },

  startRestTimer: (seconds) => {
    set({ restTimerSeconds: seconds, isRestTimerRunning: true });
  },

  stopRestTimer: () => {
    set({ restTimerSeconds: 0, isRestTimerRunning: false });
  },

  tickRestTimer: () => {
    const { restTimerSeconds } = get();
    if (restTimerSeconds > 0) {
      set({ restTimerSeconds: restTimerSeconds - 1 });
    } else {
      set({ isRestTimerRunning: false });
    }
  },
}));
