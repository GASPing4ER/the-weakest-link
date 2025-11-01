export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  status: "active" | "waitlist" | "eliminated";
  joined_at?: string;
  total_workouts: number;
  total_minutes: number;
  current_month_workouts: number;
  current_month_minutes: number;
  last_workout_date?: string;
  waitlist_date: string;
}

export interface LoginUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

export interface Workout {
  id: string;
  profile_id: string;
  activity_type: WorkoutType;
  duration_minutes: number;
  date: string;
  notes?: string;
  img_url?: string;
  created_at: string;
}

export type WorkoutType =
  | "cycling"
  | "swimming"
  | "running"
  | "fitness"
  | "calisthenics"
  | "cardio"
  | "yoga"
  | "crossfit"
  | "other";

export interface MonthlyStats {
  profile_id: string;
  month: string; // YYYY-MM format
  total_workouts: number;
  total_minutes: number;
  rank: number;
  is_eliminated: boolean;
}

export interface LeaderboardEntry {
  profile_id: Profile["id"];
  workouts_this_month: number;
  minutes_this_month: number;
  rank: number;
  days_since_last_workout: number;
  is_at_risk: boolean; // true if in bottom 3
}

export interface WaitlistEntry {
  id: string;
  profile_id: string;
  profile: Profile;
  position: number;
  joined_waitlist_at: string;
}

export interface MonthlyRotation {
  id: string;
  month: string; // YYYY-MM format
  eliminated_profile_id: string;
  added_profile_id?: string;
  rotation_date: string;
  is_completed: boolean;
}
