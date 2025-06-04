
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SaveScoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string) => Promise<void>;
  currentScoreToSave: number;
  isLoading: boolean;
}

export default function SaveScoreDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentScoreToSave,
  isLoading
}: SaveScoreDialogProps) {
  const [playerName, setPlayerName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Reset playerName when dialog opens/closes or score changes,
    // but not if it's just a re-render while open.
    if (isOpen) {
        // Optionally, you could clear playerName when it opens,
        // or persist it if the user closes and reopens for the same score.
        // For now, let's clear it.
        setPlayerName(''); 
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name to save your score.",
        variant: "destructive",
      });
      return;
    }
    await onSubmit(playerName.trim());
    // onClose will be called by the parent component after submission logic
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/70">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center">
            <Save className="mr-2 h-6 w-6" />
            Save Your High Score!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You achieved a score of <span className="font-bold text-accent">{currentScoreToSave}</span>! 
            Enter your name to save it to the leaderboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="playerName" className="text-right text-foreground">
              Name
            </Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="col-span-3 bg-input placeholder:text-muted-foreground/80"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading} onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !playerName.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Score'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
