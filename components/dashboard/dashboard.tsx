"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { QuickLogButton } from "@/components/workout/quick-log-button";
import { WorkoutHistory } from "@/components/workout/workout-history";
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLoadProfiles } from "@/hooks/use-load-profiles";

export function Dashboard() {
  useLoadProfiles();

  const {
    currentProfile,
    getProfileRank,
    getWorkoutStreak,
    fetchWorkouts,
    fetchWaitlist,
    profiles,
  } = useAppStore();

  // Fetch data on mount
  useEffect(() => {
    if (currentProfile) {
      fetchWorkouts(currentProfile.id);
    }
    fetchWaitlist();
  }, [currentProfile, fetchWorkouts, fetchWaitlist]);

  if (!currentProfile) return null;

  const workoutStreak = getWorkoutStreak(currentProfile.id);

  const sortedProfiles = profiles.sort((a, b) => {
    // Primary: workouts desc
    if (b.current_month_workouts !== a.current_month_workouts) {
      return b.current_month_workouts - a.current_month_workouts;
    }
    // Secondary: minutes desc
    return b.current_month_minutes - a.current_month_minutes;
  });

  const currentRank =
    sortedProfiles.findIndex((p) => p.id === currentProfile.id) + 1;
  const isAtRisk = currentRank > 7;

  const stats = [
    {
      title: "This Month",
      value: `${currentProfile.current_month_workouts} workouts`,
      subtitle: `${currentProfile.current_month_minutes} minutes`,
      icon: <Calendar className="h-5 w-5" />,
      color: "text-blue-600",
    },
    {
      title: "Current Rank",
      value: currentRank > 0 ? `#${currentRank}` : "Unranked",
      subtitle: "out of 10 active",
      icon: <Trophy className="h-5 w-5" />,
      color:
        currentRank <= 3
          ? "text-green-600"
          : currentRank <= 7
          ? "text-yellow-600"
          : "text-red-600",
    },
    {
      title: "Workout Streak",
      value: `${workoutStreak} days`,
      subtitle: workoutStreak > 0 ? "Keep it up!" : "Start today!",
      icon: <TrendingUp className="h-5 w-5" />,
      color:
        workoutStreak >= 7
          ? "text-green-600"
          : workoutStreak >= 3
          ? "text-yellow-600"
          : "text-gray-600",
    },
    {
      title: "Total Workouts",
      value: currentProfile.total_workouts.toString(),
      subtitle: `${currentProfile.total_minutes} total minutes`,
      icon: <Target className="h-5 w-5" />,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        {isAtRisk && (
          <div className="max-w-md mx-auto">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Elimination Risk!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  You're in the bottom 3. Step up your game to avoid
                  elimination!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <QuickLogButton />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`${stat.color} opacity-70`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workout History */}
      <WorkoutHistory />
    </div>
  );
}
