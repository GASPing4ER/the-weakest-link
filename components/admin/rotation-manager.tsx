"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { performMonthlyRotation } from "@/lib/supabase-actions";
import {
  RotateCcw,
  AlertTriangle,
  Users,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

// Mock data for the rotation preview
const mockRotationPreview = {
  eliminatedUser: {
    id: "10",
    name: "Sophie Martinez",
    email: "sophie@example.com",
    avatar_url: "/fitness-yoga.jpg",
    current_month_workouts: 2,
    current_month_minutes: 60,
    rank: 10,
  },
  promotedUser: {
    id: "w1",
    name: "Jordan Smith",
    email: "jordan@example.com",
    avatar_url: "/fitness-person.png",
    waitlist_position: 1,
    joined_waitlist_at: "2024-01-15T10:00:00Z",
  },
};

export function RotationManager() {
  const [isRotating, setIsRotating] = useState(false);
  const [rotationComplete, setRotationComplete] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [daysUntilRotation, setDaysUntilRotation] = useState(15); // Mock value

  const { currentProfile } = useAppStore();

  // Only show to admin users
  if (currentProfile?.email !== "simecgasper@gmail.com") {
    return null;
  }

  const handlePerformRotation = async () => {
    setIsRotating(true);
    setShowConfirmDialog(false);

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      await performMonthlyRotation(currentMonth);

      // Simulate rotation process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setRotationComplete(true);
      console.log("Monthly rotation completed successfully");
    } catch (error) {
      console.error("Rotation failed:", error);
    } finally {
      setIsRotating(false);
    }
  };

  const canPerformRotation = daysUntilRotation <= 3; // Allow rotation in last 3 days of month

  return (
    <div className="space-y-6">
      {/* Rotation Status */}
      <Card
        className={`${
          canPerformRotation
            ? "border-orange-500/50 bg-orange-50 dark:bg-orange-950/20"
            : ""
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            <span>Monthly Rotation Manager</span>
          </CardTitle>
          <CardDescription>
            Manage the monthly elimination and promotion process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-500 text-white">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Days Until Rotation
                </p>
                <p className="text-2xl font-bold">{daysUntilRotation}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-500 text-white">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Members
                </p>
                <p className="text-2xl font-bold">10</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-orange-500 text-white">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Waitlist Size
                </p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </div>

          {rotationComplete ? (
            <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Monthly rotation completed successfully! The leaderboard has
                been updated.
              </AlertDescription>
            </Alert>
          ) : canPerformRotation ? (
            <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                Rotation window is now open. You can perform the monthly
                rotation in the last 3 days of the month.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Rotation will be available in the last 3 days of the month.
                Current rotation scheduled for{" "}
                {format(
                  new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    1
                  ),
                  "MMMM d, yyyy"
                )}
                .
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Rotation Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Rotation Preview</span>
          </CardTitle>
          <CardDescription>
            Preview of the upcoming monthly rotation based on current standings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Elimination */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ArrowDown className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-destructive">
                  To Be Eliminated
                </h3>
              </div>

              <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        mockRotationPreview.eliminatedUser.avatar_url ||
                        "/placeholder.svg"
                      }
                      alt={mockRotationPreview.eliminatedUser.name}
                    />
                    <AvatarFallback className="bg-destructive text-destructive-foreground">
                      {mockRotationPreview.eliminatedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h4 className="font-medium">
                      {mockRotationPreview.eliminatedUser.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {mockRotationPreview.eliminatedUser.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="destructive">
                        Rank #{mockRotationPreview.eliminatedUser.rank}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {
                          mockRotationPreview.eliminatedUser
                            .current_month_workouts
                        }{" "}
                        workouts,{" "}
                        {
                          mockRotationPreview.eliminatedUser
                            .current_month_minutes
                        }{" "}
                        minutes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotion */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-600">To Be Promoted</h3>
              </div>

              <div className="p-4 rounded-lg border border-green-500/50 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        mockRotationPreview.promotedUser.avatar_url ||
                        "/placeholder.svg"
                      }
                      alt={mockRotationPreview.promotedUser.name}
                    />
                    <AvatarFallback className="bg-green-500 text-white">
                      {mockRotationPreview.promotedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h4 className="font-medium">
                      {mockRotationPreview.promotedUser.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {mockRotationPreview.promotedUser.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-green-500 text-white">
                        Waitlist #
                        {mockRotationPreview.promotedUser.waitlist_position}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined{" "}
                        {format(
                          new Date(
                            mockRotationPreview.promotedUser.joined_waitlist_at
                          ),
                          "MMM d, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rotation Button */}
          <div className="mt-6 flex justify-center">
            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  disabled={
                    !canPerformRotation || isRotating || rotationComplete
                  }
                  className="bg-primary hover:bg-primary/90"
                >
                  {isRotating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Performing Rotation...
                    </>
                  ) : rotationComplete ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Rotation Complete
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Perform Monthly Rotation
                    </>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Confirm Monthly Rotation</span>
                  </DialogTitle>
                  <DialogDescription>
                    This action will permanently eliminate the lowest performer
                    and promote the top waitlist member. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-medium mb-2">Changes to be made:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <ArrowDown className="h-4 w-4 text-destructive" />
                        <span>
                          <strong>
                            {mockRotationPreview.eliminatedUser.name}
                          </strong>{" "}
                          will be eliminated and moved to the back of the
                          waitlist
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        <span>
                          <strong>
                            {mockRotationPreview.promotedUser.name}
                          </strong>{" "}
                          will be promoted to active member
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePerformRotation}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Confirm Rotation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Rotation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Rotation Rules</CardTitle>
          <CardDescription>
            How the monthly elimination and promotion system works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-primary text-primary-foreground mt-1">
                <span className="text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Elimination Criteria</h4>
                <p className="text-sm text-muted-foreground">
                  The active member with the lowest total workout minutes for
                  the month is eliminated.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-primary text-primary-foreground mt-1">
                <span className="text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Promotion Process</h4>
                <p className="text-sm text-muted-foreground">
                  The #1 person on the waitlist is automatically promoted to
                  active member status.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-primary text-primary-foreground mt-1">
                <span className="text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Waitlist Repositioning</h4>
                <p className="text-sm text-muted-foreground">
                  The eliminated member goes to the back of the waitlist, and
                  all other waitlist positions move up by one.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-primary text-primary-foreground mt-1">
                <span className="text-xs font-bold">4</span>
              </div>
              <div>
                <h4 className="font-medium">Timing</h4>
                <p className="text-sm text-muted-foreground">
                  Rotations can only be performed in the last 3 days of each
                  month and take effect immediately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
