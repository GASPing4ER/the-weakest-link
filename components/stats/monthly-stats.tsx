"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, Target, Clock, Award, Zap } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDate,
  parseISO,
} from "date-fns";
import { useEffect } from "react";

export function MonthlyStats() {
  const { currentProfile, getCurrentMonthWorkouts, fetchWorkouts } =
    useAppStore();

  useEffect(() => {
    const loadWorkouts = async () =>
      currentProfile ? await fetchWorkouts(currentProfile.id) : null;

    loadWorkouts();
  }, [currentProfile]);

  if (!currentProfile) return null;

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthlyWorkouts = getCurrentMonthWorkouts();
  const totalMinutesThisMonth = currentProfile.current_month_minutes;
  const totalWorkoutsThisMonth = currentProfile.current_month_workouts;
  const averagePerWorkout =
    totalWorkoutsThisMonth > 0
      ? Math.round(totalMinutesThisMonth / totalWorkoutsThisMonth)
      : 0;

  // Calculate workout frequency
  const workoutDays = new Set(
    monthlyWorkouts.map((w) => format(parseISO(w.date), "yyyy-MM-dd"))
  ).size;
  const totalDays = new Date().getDate(); // days passed in this month
  const frequency =
    totalDays > 0 ? Math.round((workoutDays / totalDays) * 100) : 0;

  // ---- Daily Activity (minutes per day) ----
  const dailyActivity = daysInMonth.map((day) => {
    const workoutsThatDay = monthlyWorkouts.filter(
      (w) =>
        format(parseISO(w.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );
    const minutes = workoutsThatDay.reduce(
      (sum, w) => sum + w.duration_minutes,
      0
    );
    return {
      day: getDate(day),
      workouts: workoutsThatDay.length,
      minutes,
    };
  });

  // ---- Workout Types Distribution ----
  const typeMap: Record<
    string,
    { count: number; minutes: number; color: string }
  > = {};

  const colors = [
    "#10b981", // green
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#06b6d4", // cyan
    "#8b5cf6", // purple
    "#6b7280", // gray
  ];

  monthlyWorkouts.forEach((w, idx) => {
    const type = w.activity_type;
    if (!typeMap[type]) {
      typeMap[type] = {
        count: 0,
        minutes: 0,
        color: colors[Object.keys(typeMap).length % colors.length],
      };
    }
    typeMap[type].count += 1;
    typeMap[type].minutes += w.duration_minutes;
  });

  const workoutTypes = Object.entries(typeMap).map(([type, data]) => ({
    type,
    ...data,
  }));

  const stats = [
    {
      title: "Monthly Goal Progress",
      value: `${totalMinutesThisMonth}/600`,
      subtitle: "minutes (target: 600)",
      progress: Math.min((totalMinutesThisMonth / 600) * 100, 100),
      icon: <Target className="h-5 w-5" />,
      color: "text-blue-600",
    },
    {
      title: "Workout Frequency",
      value: `${frequency}%`,
      subtitle: `${workoutDays} days out of ${totalDays}`,
      progress: frequency,
      icon: <Calendar className="h-5 w-5" />,
      color: "text-green-600",
    },
    {
      title: "Average Per Session",
      value: `${averagePerWorkout} min`,
      subtitle: "per workout",
      progress: Math.min((averagePerWorkout / 60) * 100, 100),
      icon: <Clock className="h-5 w-5" />,
      color: "text-purple-600",
    },
    {
      title: "Consistency Score",
      value: "85%",
      subtitle: "based on regularity",
      progress: 85,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{format(currentMonth, "MMMM yyyy")} Overview</span>
          </CardTitle>
          <CardDescription>
            Your performance metrics for this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={stat.color}>{stat.icon}</div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-primary" />
              <span>Daily Activity</span>
            </CardTitle>
            <CardDescription>
              Workout minutes per day this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="minutes"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Workout Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Workout Types</span>
            </CardTitle>
            <CardDescription>Activity breakdown this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workoutTypes.map((workout, index) => {
                const maxCount = Math.max(...workoutTypes.map((w) => w.count));
                const percentage =
                  maxCount > 0 ? (workout.count / maxCount) * 100 : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: workout.color }}
                        />
                        <span className="text-sm font-medium">
                          {workout.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">
                          {workout.count}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({workout.minutes}min)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements (static for now) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Monthly Achievements</span>
          </CardTitle>
          <CardDescription>Milestones reached this month</CardDescription>
        </CardHeader>
        <CardContent>
          {/* You can later make this dynamic too */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Example cards */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
