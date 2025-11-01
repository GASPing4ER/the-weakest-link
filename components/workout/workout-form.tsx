"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppStore } from "@/lib/store";
import { createWorkout, uploadWorkoutImage } from "@/lib/supabase-actions";
import type { WorkoutType } from "@/lib/types";
import {
  Bike,
  Waves,
  Unlink as Running,
  Dumbbell,
  Heart,
  Zap,
  Flower2,
  Target,
  Plus,
  ImageIcon,
} from "lucide-react";

const workoutTypes: {
  type: WorkoutType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    type: "cycling",
    label: "Cycling",
    icon: <Bike className="h-4 w-4" />,
    color: "bg-blue-500",
  },
  {
    type: "swimming",
    label: "Swimming",
    icon: <Waves className="h-4 w-4" />,
    color: "bg-cyan-500",
  },
  {
    type: "running",
    label: "Running",
    icon: <Running className="h-4 w-4" />,
    color: "bg-green-500",
  },
  {
    type: "fitness",
    label: "Fitness",
    icon: <Dumbbell className="h-4 w-4" />,
    color: "bg-orange-500",
  },
  {
    type: "calisthenics",
    label: "Calisthenics",
    icon: <Dumbbell className="h-4 w-4" />,
    color: "bg-red-500",
  },
  // {
  //   type: "cardio",
  //   label: "Cardio",
  //   icon: <Heart className="h-4 w-4" />,
  //   color: "bg-pink-500",
  // },
  // {
  //   type: "crossfit",
  //   label: "CrossFit",
  //   icon: <Zap className="h-4 w-4" />,
  //   color: "bg-purple-500",
  // },
  // {
  //   type: "yoga",
  //   label: "Yoga",
  //   icon: <Flower2 className="h-4 w-4" />,
  //   color: "bg-indigo-500",
  // },
  {
    type: "other",
    label: "Other",
    icon: <Target className="h-4 w-4" />,
    color: "bg-gray-500",
  },
];

interface WorkoutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WorkoutForm({ onSuccess, onCancel }: WorkoutFormProps) {
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { currentProfile, addWorkout } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProfile || !selectedType || !duration) {
      setError("Please fill in all required fields");
      return;
    }

    const durationNum = Number.parseInt(duration);
    if (durationNum <= 0) {
      setError("Duration must be greater than 0");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let uploadedImgUrl: string | undefined = undefined;
      if (imageFile) {
        uploadedImgUrl = await uploadWorkoutImage(imageFile, currentProfile.id);
      }

      const workoutData = {
        profile_id: currentProfile.id,
        activity_type: selectedType,
        duration_minutes: durationNum,
        date: selectedDate,
        notes: notes.trim() || undefined,
        img_url: uploadedImgUrl,
      };

      // Create workout in Supabase
      const { data: createdWorkout, error } = await createWorkout(workoutData);

      if (error || !createdWorkout) {
        throw new Error(error?.message || "Failed to log workout");
      }

      // Add the confirmed workout to local store
      addWorkout(createdWorkout);

      // Reset form
      setSelectedType(null);
      setDuration("");
      setNotes("");
      setImageFile(null);
      setImagePreview(null);

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to log workout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-primary" />
          <span>Log Today's Workout</span>
        </CardTitle>
        <CardDescription>
          Track your daily exercise to stay competitive in the group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label className="text-base font-medium">Workout Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {workoutTypes.map((workout) => (
                <button
                  key={workout.type}
                  type="button"
                  onClick={() => setSelectedType(workout.type)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2
                    ${
                      selectedType === workout.type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }
                  `}
                  disabled={isLoading}
                >
                  <div
                    className={`p-2 rounded-full ${workout.color} text-white`}
                  >
                    {workout.icon}
                  </div>
                  <span className="text-sm font-medium">{workout.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-base font-medium">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              disabled={isLoading}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-base font-medium">
              Duration (minutes) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="600"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 45"
              required
              disabled={isLoading}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">
              Notes<span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specify what training you did (Upper body, lower body, full body...)"
              rows={3}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="image"
              className="text-base font-medium flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" /> Upload Image{" "}
              <span className="text-destructive">*</span>
            </Label>

            <label
              htmlFor="image"
              className={`
      flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer
      transition-all duration-200 p-6 text-center
      ${
        isLoading
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-primary hover:bg-accent/30"
      }
    `}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full rounded-lg border object-cover max-h-64"
                />
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Click to upload
                    </span>{" "}
                    or drag & drop
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or JPEG up to 5MB
                  </p>
                </div>
              )}
            </label>

            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              disabled={isLoading}
              className="hidden"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={
                isLoading || !selectedType || !duration || !notes || !imageFile
              }
            >
              {isLoading ? "Logging Workout..." : "Log Workout"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
