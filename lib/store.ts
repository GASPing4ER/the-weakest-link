import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Workout, LeaderboardEntry, Profile } from "./types";
import {
  getWorkouts,
  getLeaderboard,
  getWaitlistProfiles,
} from "./supabase-actions";

interface AppState {
  // Profile state
  currentProfile: Profile | null;
  profiles: Profile[];

  // Workout state
  workouts: Workout[];
  todaysWorkout: Workout | null;

  // Leaderboard state
  leaderboard: LeaderboardEntry[];
  currentMonth: string;

  // Waitlist state
  waitlist: Profile[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentProfile: (profile: Profile | null) => void;
  setProfiles: (profiles: Profile[]) => void;
  addWorkout: (workout: Workout) => void;
  setWorkouts: (workouts: Workout[]) => void;
  fetchWorkouts: (profileId: string) => Promise<void>;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  fetchLeaderboard: () => Promise<void>;
  setWaitlist: (waitlist: Profile[]) => void;
  fetchWaitlist: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed getters
  getCurrentMonthWorkouts: () => Workout[];
  getProfileRank: (profileId: string) => number;
  getWorkoutStreak: (profileId: string) => number;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentProfile: null,
      profiles: [],
      workouts: [],
      todaysWorkout: null,
      leaderboard: [],
      currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      waitlist: [],
      isLoading: false,
      error: null,

      // Actions
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      setProfiles: (profiles) => set({ profiles }),
      setWorkouts: (workouts) => set({ workouts }),
      setLeaderboard: (leaderboard) => set({ leaderboard }),
      setWaitlist: (waitlist) => set({ waitlist }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      addWorkout: (workoutData) => {
        const workout: Workout = {
          ...workoutData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };

        set((state) => {
          // Update currentProfile totals
          const updatedProfile = state.currentProfile
            ? {
                ...state.currentProfile,
                current_month_workouts:
                  (state.currentProfile.current_month_workouts || 0) + 1,
                current_month_minutes:
                  (state.currentProfile.current_month_minutes || 0) +
                  workout.duration_minutes,
                total_workouts: (state.currentProfile.total_workouts || 0) + 1,
                total_minutes:
                  (state.currentProfile.total_minutes || 0) +
                  workout.duration_minutes,
              }
            : null;

          return {
            workouts: [...state.workouts, workout],
            todaysWorkout: workout,
            currentProfile: updatedProfile,
          };
        });
      },

      // Fetch workouts for current profile
      fetchWorkouts: async (profileId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await getWorkouts(profileId);
          if (error) throw error;
          if (data) set({ workouts: data });
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch workouts" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch leaderboard
      fetchLeaderboard: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await getLeaderboard();
          if (error) throw error;
          if (data) set({ leaderboard: data });
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch leaderboard" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch waitlist
      fetchWaitlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await getWaitlistProfiles();
          if (error) throw error;
          if (data) set({ waitlist: data });
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch waitlist" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Computed getters
      getCurrentMonthWorkouts: () => {
        const { workouts, currentMonth } = get();
        return workouts.filter((workout) =>
          workout.date.startsWith(currentMonth)
        );
      },

      getProfileRank: (profileId) => {
        const { leaderboard } = get();
        const entry = leaderboard.find(
          (entry) => entry.profile_id === profileId
        );
        return entry?.rank || 0;
      },

      getWorkoutStreak: (profileId) => {
        const { workouts } = get();
        const profileWorkouts = workouts
          .filter((w) => w.profile_id === profileId)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        if (profileWorkouts.length === 0) return 0;

        let streak = 0;
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const workout of profileWorkouts) {
          const workoutDate = new Date(workout.date);
          workoutDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor(
            (currentDate.getTime() - workoutDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (daysDiff === streak) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
        return streak;
      },
    }),
    { name: "weakest-link-store" }
  )
);
