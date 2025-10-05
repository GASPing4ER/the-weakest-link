"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutForm } from "./workout-form";
import { Plus, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function QuickLogButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentProfile } = useAppStore();

  if (!currentProfile) return null;

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-full bg-primary-foreground/20 group-hover:bg-primary-foreground/30 transition-colors">
              <Plus className="h-4 w-4" />
            </div>
            <span className="font-medium">Log Workout</span>
            <Zap className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <WorkoutForm
          onSuccess={handleSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
