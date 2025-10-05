"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppStore } from "@/lib/store";
import {
  Users,
  Clock,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Info,
  Calendar,
  Trophy,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useWaitlist } from "@/hooks/use-waitlist";

export function Waitlist() {
  const { currentProfile } = useAppStore();
  const { waitlist } = useWaitlist();

  const nextInLine = waitlist[0];
  const daysUntilRotation = Math.ceil(
    (new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1
    ).getTime() -
      new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Waitlist Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Waitlist
                </p>
                <p className="text-2xl font-bold">{waitlist.length}</p>
                <p className="text-xs text-muted-foreground">people waiting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Next In Line
                </p>
                <p className="text-lg font-bold">
                  {nextInLine?.name || "None"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nextInLine
                    ? `Waiting ${formatDistanceToNow(
                        new Date(nextInLine.waitlist_date)
                      )}`
                    : "Empty waitlist"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Next Rotation
                </p>
                <p className="text-2xl font-bold">{daysUntilRotation}</p>
                <p className="text-xs text-muted-foreground">days remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rotation Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          At the end of each month, the lowest-performing active member is
          eliminated and replaced by the #1 waitlist member. The eliminated
          member goes to the back of the waitlist.
        </AlertDescription>
      </Alert>

      {/* Waitlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Current Waitlist</span>
          </CardTitle>
          <CardDescription>
            Members waiting to join the active competition. Position determines
            entry priority.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {waitlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No one on the waitlist</p>
              <p className="text-sm">All spots are currently filled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitlist.map((entry, index) => {
                const isCurrentProfile = entry.id === currentProfile?.id;
                const position = index + 1;
                const isNext = position === 1;

                return (
                  <div
                    key={entry.id}
                    className={`
                      p-4 rounded-lg border transition-all duration-200
                      ${
                        isNext
                          ? "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                          : "border-border"
                      }
                      ${
                        isCurrentProfile
                          ? "ring-2 ring-primary/50 shadow-md"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          <div
                            className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${
                              isNext
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }
                          `}
                          >
                            #{position}
                          </div>
                        </div>

                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={entry.avatar_url || "/placeholder.svg"}
                            alt={entry.name}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
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
                            {isNext && (
                              <Badge className="bg-green-500 text-white text-xs">
                                Next In Line
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Joined{" "}
                                {format(
                                  new Date(entry.waitlist_date),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                            <span>
                              Waiting{" "}
                              {formatDistanceToNow(
                                new Date(entry.waitlist_date)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Join Waitlist (for eliminated members) */}
      {currentProfile?.status === "eliminated" && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>Rejoin the Competition</span>
            </CardTitle>
            <CardDescription>
              You were eliminated but can join the waitlist to compete again
              next month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Join Waitlist
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
