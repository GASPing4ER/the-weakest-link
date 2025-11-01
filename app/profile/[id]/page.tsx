"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Target } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Profile, Workout } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/header";

export default function ProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndWorkouts = async () => {
      setLoading(true);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!profileData) {
        setProfile(null);
        setWorkouts([]);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const start = startOfMonth(new Date()).toISOString();
      const end = endOfMonth(new Date()).toISOString();

      const { data: workoutsData } = await supabase
        .from("workouts")
        .select("*")
        .eq("profile_id", params.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false });

      setWorkouts(workoutsData || []);
      setLoading(false);
    };

    fetchProfileAndWorkouts();
  }, [params.id]);

  if (loading) {
    return (
      <p className="text-center text-muted-foreground mt-20">
        Loading profile...
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="text-center text-destructive mt-20">Profile not found</p>
    );
  }

  // Summary stats
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);
  const maxMinutes = Math.max(...workouts.map((w) => w.duration_minutes), 1);

  return (
    <div className="space-y-8 px-4 md:px-0">
      <Header />
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <Card className="p-4 flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">
              Workout entries for {format(new Date(), "MMMM yyyy")}
            </p>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-green-300 bg-green-50">
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">
                Total Workouts
              </p>
              <p className="text-2xl font-bold">{totalWorkouts}</p>
            </CardContent>
          </Card>

          <Card className="border border-blue-300 bg-blue-50">
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">
                Total Minutes
              </p>
              <p className="text-2xl font-bold">{totalMinutes} min</p>
            </CardContent>
          </Card>
        </div>

        {/* Workout Entries */}
        <div className="space-y-4">
          {workouts.length ? (
            workouts.map((entry) => {
              const progress = (entry.duration_minutes / maxMinutes) * 100;

              return (
                <Card
                  key={entry.id}
                  className="border hover:shadow-md transition-shadow"
                >
                  <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                    <div>
                      <p className="font-medium text-lg">
                        {entry.activity_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), "PPP")}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>1 workout</span>
                        <Clock className="h-3 w-3" />
                        <span>{entry.duration_minutes} min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground mt-4">
              No workouts recorded this month.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
