"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/header";
import {
  formatDistanceToNow,
  parseISO,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { useAppStore } from "@/lib/store";
import clsx from "clsx";
import type { Workout, Profile } from "@/lib/types";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profile_id: string;
  profiles: Profile;
  workout_id: string;
}

export default function FeedPage() {
  const { currentProfile } = useAppStore();
  const [workouts, setWorkouts] = useState<(Workout & { profiles: Profile })[]>(
    []
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const start = startOfMonth(new Date()).toISOString();
      const end = endOfMonth(new Date()).toISOString();

      const [{ data: workoutsData }, { data: commentsData }] =
        await Promise.all([
          supabase
            .from("workouts")
            .select("*, profiles(id, name)")
            .gte("created_at", start)
            .lte("created_at", end)
            .order("created_at", { ascending: false }),
          supabase
            .from("comments")
            .select("*, profiles(id, name)")
            .order("created_at", { ascending: true }),
        ]);

      if (workoutsData) setWorkouts(workoutsData as any);
      if (commentsData) setComments(commentsData as any);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCommentChange = (workoutId: string, value: string) => {
    setNewComments((prev) => ({ ...prev, [workoutId]: value }));
  };

  const handleSubmitComment = async (workoutId: string) => {
    const content = newComments[workoutId]?.trim();
    if (!content || !currentProfile) return;

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          workout_id: workoutId,
          profile_id: currentProfile.id,
          content,
        },
      ])
      .select("*, profiles(id, name)")
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data as Comment]);
      setNewComments((prev) => ({ ...prev, [workoutId]: "" }));
    }
  };

  if (loading)
    return (
      <p className="text-center text-muted-foreground mt-20">Loading feed...</p>
    );

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/30">
      <Header />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[800px] mx-auto w-full p-4 space-y-6">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Community Feed (This Month)
          </h1>

          {workouts.length === 0 && (
            <p className="text-center text-muted-foreground">
              No workouts recorded this month.
            </p>
          )}

          <div className="flex flex-col space-y-6 w-full border-x-1 px-4">
            {workouts.map((workout) => {
              const isOwnPost = workout.profiles?.id === currentProfile?.id;
              const workoutComments = comments.filter(
                (c) => c.workout_id === workout.id
              );

              return (
                <div
                  key={workout.id}
                  className={clsx("flex space-x-3 w-full max-w-[500px]", {
                    "self-end flex-row-reverse": isOwnPost,
                  })}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback>
                      {workout.profiles?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={clsx("w-full space-y-2", {
                      "items-end text-right": isOwnPost,
                    })}
                  >
                    <div
                      className={clsx(
                        "rounded-2xl px-4 py-3 shadow-sm border",
                        {
                          "bg-card border-border": !isOwnPost,
                          "bg-primary/10 border-primary/20": isOwnPost,
                        }
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{workout.profiles?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(workout.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      <p className="text-sm font-semibold mt-1">
                        {workout.activity_type} • {workout.duration_minutes} min
                      </p>

                      {workout.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {workout.notes}
                        </p>
                      )}

                      {workout.img_url && (
                        <img
                          src={workout.img_url}
                          alt={workout.activity_type}
                          className={clsx(
                            "mt-2 rounded-lg max-h-64 object-cover border",
                            { "ml-auto": isOwnPost }
                          )}
                        />
                      )}
                    </div>

                    {/* Comments section */}
                    <div
                      className={clsx("space-y-2 pl-2 border-l border-muted", {
                        "pl-0 pr-2 border-l-0 border-r": isOwnPost,
                      })}
                    >
                      {workoutComments.map((comment) => {
                        const isOwnComment =
                          comment.profile_id === currentProfile?.id;
                        return (
                          <div
                            key={comment.id}
                            className={clsx(
                              "text-sm px-3 py-2 rounded-xl max-w-[80%]",
                              {
                                "bg-muted text-muted-foreground": !isOwnComment,
                                "bg-primary/10 text-primary font-medium ml-auto":
                                  isOwnComment,
                              }
                            )}
                          >
                            <div className="flex justify-between">
                              <p>{comment.content}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  parseISO(comment.created_at),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              — {comment.profiles?.name}
                            </p>
                          </div>
                        );
                      })}

                      {/* Comment input */}
                      {currentProfile && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Write a comment..."
                            value={newComments[workout.id] || ""}
                            onChange={(e) =>
                              handleCommentChange(workout.id, e.target.value)
                            }
                            className="text-sm resize-none h-16"
                          />
                          <Button
                            onClick={() => handleSubmitComment(workout.id)}
                            size="sm"
                            className="text-xs"
                            disabled={!newComments[workout.id]?.trim()}
                          >
                            Comment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
