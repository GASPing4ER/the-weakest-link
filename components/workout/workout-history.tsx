"use client";

import type React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import {
  Bike,
  Waves,
  Unlink as Running,
  Dumbbell,
  Heart,
  Zap,
  Flower2,
  Target,
  Clock,
  Calendar,
  Trash2,
} from "lucide-react";
import type { WorkoutType } from "@/lib/types";

const workoutIcons: Record<WorkoutType, React.ReactNode> = {
  cycling: <Bike className="h-4 w-4" />,
  swimming: <Waves className="h-4 w-4" />,
  running: <Running className="h-4 w-4" />,
  fitness: <Dumbbell className="h-4 w-4" />,
  calisthenics: <Dumbbell className="h-4 w-4" />,
  cardio: <Heart className="h-4 w-4" />,
  crossfit: <Zap className="h-4 w-4" />,
  yoga: <Flower2 className="h-4 w-4" />,
  other: <Target className="h-4 w-4" />,
};

const workoutColors: Record<WorkoutType, string> = {
  cycling: "bg-blue-500",
  swimming: "bg-cyan-500",
  running: "bg-green-500",
  fitness: "bg-orange-500",
  calisthenics: "bg-red-500",
  cardio: "bg-pink-500",
  crossfit: "bg-purple-500",
  yoga: "bg-indigo-500",
  other: "bg-gray-500",
};

export function WorkoutHistory() {
  const { workouts, currentProfile } = useAppStore();

  const userWorkouts = workouts
    .filter((workout) => workout.profile_id === currentProfile?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Show last 10 workouts

  if (userWorkouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
          <CardDescription>
            Your workout history will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No workouts logged yet</p>
            <p className="text-sm">Start logging to see your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
        <CardDescription>
          Your last {userWorkouts.length} workouts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-full ${
                    workoutColors[workout.activity_type]
                  } text-white`}
                >
                  {workoutIcons[workout.activity_type]}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium capitalize">
                      {workout.activity_type.replace("_", " ")}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {workout.duration_minutes}min
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(workout.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  {workout.notes && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {workout.notes}
                    </p>
                  )}
                </div>
              </div>
              {/* 
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  // This would delete the workout
                  console.log("Delete workout:", workout.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button> */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
