
"use client";

import { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquareText, MessageSquareOff, MessageSquarePlus } from 'lucide-react';

interface SubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'roast' | 'compliment', text: string) => void;
}

export default function SubmissionDialog({ isOpen, onClose, onSubmit }: SubmissionDialogProps) {
  const [submissionType, setSubmissionType] = useState<'roast' | 'compliment'>('roast');
  const [submissionText, setSubmissionText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!submissionText.trim()) {
      setError('Please enter your submission.');
      return;
    }
    setError('');
    onSubmit(submissionType, submissionText);
    setSubmissionText(''); // Clear text after submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border/70">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center">
            <MessageSquarePlus className="mr-2 h-6 w-6" />
            Suggest a Savage Line
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Got a killer roast or a slick compliment? Share it with the community!
            (Note: Submissions are reviewed and not directly added to the game yet.)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="submission-type" className="text-foreground">Type of Submission</Label>
            <RadioGroup
              defaultValue="roast"
              onValueChange={(value: 'roast' | 'compliment') => setSubmissionType(value)}
              className="flex gap-4"
              id="submission-type"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="roast" id="r-roast" className="text-primary focus:ring-primary"/>
                <Label htmlFor="r-roast" className="flex items-center cursor-pointer">
                  <MessageSquareOff className="mr-2 h-5 w-5 text-destructive" /> Roast
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compliment" id="r-compliment" className="text-primary focus:ring-primary"/>
                <Label htmlFor="r-compliment" className="flex items-center cursor-pointer">
                  <MessageSquareText className="mr-2 h-5 w-5 text-green-400" /> Compliment
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="submission-text" className="text-foreground">
              Your {submissionType === 'roast' ? 'Savage Roast' : 'Fire Compliment'} (Roman Urdu)
            </Label>
            <Textarea
              id="submission-text"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder={submissionType === 'roast' ? "e.g., Itna easy? School main parha tha ya khwab dekha tha?" : "e.g., Math wizard ho boss! Dimagh hai ya calculator?"}
              className="min-h-[100px] bg-input placeholder:text-muted-foreground/80"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            <Send className="mr-2 h-4 w-4" /> Submit Suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
