// lib/actions.ts
import { supabase } from "./supabase";
import type {
  Profile,
  Workout,
  LeaderboardEntry,
  WaitlistEntry,
  MonthlyRotation,
  WorkoutType,
} from "./types";

// ----------------------------
// Profile Management
// ----------------------------
export async function createProfile(profileData: {
  email: string;
  name: string;
  avatar_url?: string;
}): Promise<{ data: Profile | null; error: any }> {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        ...profileData,
        status: "waitlist",
        joined_at: new Date().toISOString(),
        total_workouts: 0,
        total_minutes: 0,
        current_month_workouts: 0,
        current_month_minutes: 0,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function getProfiles(): Promise<{
  data: Profile[] | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("current_month_minutes", { ascending: false });

  return { data, error };
}

export async function updateProfileStats(
  profileId: string,
  stats: Partial<{
    total_workouts: number;
    total_minutes: number;
    current_month_workouts: number;
    current_month_minutes: number;
    last_workout_date: string;
  }>
): Promise<{ data: Profile | null; error: any }> {
  const { data, error } = await supabase
    .from("profiles")
    .update(stats)
    .eq("id", profileId)
    .select()
    .single();

  return { data, error };
}

// ----------------------------
// Workout Management
// ----------------------------
export async function createWorkout(workoutData: {
  profile_id: string;
  activity_type: WorkoutType;
  duration_minutes: number;
  date: string;
  notes?: string;
}): Promise<{ data: Workout | null; error: any }> {
  const { profile_id, duration_minutes, date } = workoutData;

  // 1. Insert workout
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert([{ ...workoutData, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (workoutError || !workout) return { data: null, error: workoutError };

  // 2. Fetch current profile
  const { data: profile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profile_id)
    .single();

  if (profileFetchError || !profile)
    return { data: null, error: profileFetchError };

  // 3. Update profile stats
  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCurrentMonth = date.startsWith(currentMonth);

  const { data: updatedProfile, error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      total_workouts: profile.total_workouts + 1,
      total_minutes: profile.total_minutes + duration_minutes,
      current_month_workouts: isCurrentMonth
        ? (profile.current_month_workouts || 0) + 1
        : profile.current_month_workouts,
      current_month_minutes: isCurrentMonth
        ? (profile.current_month_minutes || 0) + duration_minutes
        : profile.current_month_minutes,
      last_workout_date: new Date().toISOString(),
    })
    .eq("id", profile_id)
    .select()
    .single();

  if (profileUpdateError || !updatedProfile)
    return { data: null, error: profileUpdateError };

  return { data: workout, error: null };
}

export async function getWorkouts(
  profileId?: string,
  month?: string
): Promise<{ data: Workout[] | null; error: any }> {
  let query = supabase.from("workouts").select("*");

  if (profileId) query = query.eq("profile_id", profileId);
  if (month) query = query.gte("date", `${month}-01`).lt("date", `${month}-32`);

  const { data, error } = await query.order("date", { ascending: false });
  return { data, error };
}

export async function deleteWorkout(
  workoutId: string
): Promise<{ data: Workout | null; error: any }> {
  const { data, error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId)
    .select()
    .single();
  return { data, error };
}

// ----------------------------
// Leaderboard & Stats
// ----------------------------
export async function getLeaderboard(
  month?: string
): Promise<{ data: LeaderboardEntry[] | null; error: any }> {
  const currentMonth = month || new Date().toISOString().slice(0, 7);
  const { data, error } = await supabase.rpc("get_monthly_leaderboard", {
    target_month: currentMonth,
  });

  return { data, error };
}

export async function calculateMonthlyStats(
  month: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.rpc("calculate_monthly_stats", {
    target_month: month,
  });
  return { data, error };
}

// ----------------------------
// Waitlist Management
// ----------------------------
export async function getWaitlist(): Promise<{
  data: WaitlistEntry[] | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from("waitlist")
    .select("*, profile:profiles(*)")
    .order("position", { ascending: true });

  return { data, error };
}

export async function addToWaitlist(
  profileId: string
): Promise<{ data: WaitlistEntry | null; error: any }> {
  const { data: maxData } = await supabase
    .from("waitlist")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const newPosition = (maxData?.position || 0) + 1;

  const { data, error } = await supabase
    .from("waitlist")
    .insert([
      {
        profile_id: profileId,
        position: newPosition,
        joined_waitlist_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function removeFromWaitlist(
  profileId: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase
    .from("waitlist")
    .delete()
    .eq("profile_id", profileId);
  if (!error) await supabase.rpc("reorder_waitlist_positions");
  return { data, error };
}

// ----------------------------
// Monthly Rotation System
// ----------------------------
export async function performMonthlyRotation(month: string) {
  try {
    const { data, error } = await supabase.rpc("perform_monthly_rotation", {
      rotation_month: month,
    });
    return { data, error };
  } catch (error) {
    console.error("Monthly rotation failed:", error);
    return { data: null, error };
  }
}

export async function getMonthlyRotations(): Promise<{
  data: MonthlyRotation[] | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from("monthly_rotations")
    .select("*")
    .order("rotation_date", { ascending: false });
  return { data, error };
}

// ----------------------------
// Utility Functions
// ----------------------------
export async function checkEliminationRisk(
  profileId: string,
  month?: string
): Promise<boolean> {
  const currentMonth = month || new Date().toISOString().slice(0, 7);
  const { data } = await supabase.rpc("get_profile_rank", {
    profile_id: profileId,
    target_month: currentMonth,
  });
  return data?.rank > 7; // Example: bottom 3 of 10
}

export async function getDaysUntilRotation(): Promise<number> {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil(
    (nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export async function canPerformRotation(): Promise<boolean> {
  const now = new Date();
  const daysUntilEndOfMonth =
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() -
    now.getDate();
  return daysUntilEndOfMonth <= 3;
}

export async function getRotationSchedule() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilRotation = Math.ceil(
    (nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return {
    next_rotation_date: nextMonth.toISOString(),
    days_until_rotation: daysUntilRotation,
    can_rotate_now: await canPerformRotation(),
  };
}

// ----------------------------
// Waitlist (profiles.status = "waitlist")
// ----------------------------
export async function getWaitlistProfiles(): Promise<{
  data: Profile[] | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "waitlist")
    .order("waitlist_date", { ascending: true }); // oldest first → waited the longest

  return { data, error };
}
