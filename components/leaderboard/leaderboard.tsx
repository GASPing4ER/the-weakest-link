"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import {
  Trophy,
  Medal,
  Award,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { useLoadProfiles } from "@/hooks/use-load-profiles";
import { useRouter } from "next/navigation";

export function Leaderboard() {
  useLoadProfiles();
  const router = useRouter();

  const { currentProfile, profiles } = useAppStore();

  const sortedProfiles = profiles.sort((a, b) => {
    // Primary: workouts desc
    if (b.current_month_workouts !== a.current_month_workouts) {
      return b.current_month_workouts - a.current_month_workouts;
    }
    // Secondary: minutes desc
    return b.current_month_minutes - a.current_month_minutes;
  });

  if (!profiles.length)
    return (
      <p className="text-center text-muted-foreground">
        Loading leaderboard...
      </p>
    );

  const leaderboard = sortedProfiles.map((profile, index) => ({
    ...profile,
    rank: index + 1,
    is_at_risk: index + 1 > 7, // bottom performers
    days_since_last_workout: profile.last_workout_date
      ? Math.floor(
          (Date.now() - new Date(profile.last_workout_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null,
  }));

  const topPerformer = leaderboard[0];
  const maxMinutes = Math.max(
    ...leaderboard.map((entry) => entry.current_month_minutes)
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number, isAtRisk: boolean) => {
    if (isAtRisk) return "border-destructive/50 bg-destructive/5";
    if (rank <= 3)
      return "border-green-500/50 bg-green-50 dark:bg-green-950/20";
    if (rank <= 7)
      return "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20";
    return "border-border";
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Top Performer
                </p>
                <p className="text-2xl font-bold">{topPerformer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {topPerformer.current_month_minutes} minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Group Average
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    leaderboard.reduce(
                      (sum, entry) => sum + entry.current_month_minutes,
                      0
                    ) / leaderboard.length
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  minutes this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  At Risk
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {leaderboard.filter((entry) => entry.is_at_risk).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  users facing elimination
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Monthly Leaderboard</span>
          </CardTitle>
          <CardDescription>
            Current standings for {format(new Date(), "MMMM yyyy")}. Bottom 3
            are at risk of elimination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry) => {
              const isCurrentProfile = entry.id === currentProfile?.id;
              const progressPercentage =
                (entry.current_month_minutes / maxMinutes) * 100;

              return (
                <div
                  onClick={() => router.push(`/profile/${entry.id}`)}
                  key={entry.id}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 cursor-pointer
                    ${getRankColor(entry.rank, entry.is_at_risk)}
                    ${
                      isCurrentProfile ? "ring-2 ring-primary/50 shadow-md" : ""
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(entry.rank)}
                      </div>

                      <Avatar className="hidden md:block h-10 w-10">
                        <AvatarFallback>
                          {entry.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {entry.name}
                            {isCurrentProfile && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                You
                              </Badge>
                            )}
                          </h4>
                          {entry.is_at_risk && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              At Risk
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span>{entry.current_month_workouts} workouts</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{entry.current_month_minutes} minutes</span>
                          </div>
                          {entry.days_since_last_workout !== null &&
                            entry.days_since_last_workout > 0 && (
                              <span
                                className={`text-xs ${
                                  entry.days_since_last_workout > 3
                                    ? "text-destructive"
                                    : "text-yellow-600"
                                }`}
                              >
                                {entry.days_since_last_workout}d ago
                              </span>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block text-right">
                      <p className="text-lg font-bold">
                        {entry.current_month_minutes}
                      </p>
                      <p className="text-xs text-muted-foreground">minutes</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Elimination Warning */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Elimination Zone</span>
          </CardTitle>
          <CardDescription>
            The bottom performer at month-end will be eliminated and replaced by
            the top waitlist member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Days until rotation:</span>
              <span className="font-medium">
                {Math.ceil(
                  (new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    1
                  ).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Current weakest link:</span>
              <span className="font-medium text-destructive">
                {leaderboard[leaderboard.length - 1].name}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
