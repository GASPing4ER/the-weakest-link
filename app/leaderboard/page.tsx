"use client";

import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { MonthlyStats } from "@/components/stats/monthly-stats";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/components/auth/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, BarChart3 } from "lucide-react";

export default function LeaderboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger
              value="leaderboard"
              className="flex items-center space-x-2"
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="stats">
            <MonthlyStats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
