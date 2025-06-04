
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
import { Send, MessageSquareText, MessageSquareOff, MessageSquarePlus, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


interface SubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // onSubmit prop is no longer needed as we handle submission internally
}

export default function SubmissionDialog({ isOpen, onClose }: SubmissionDialogProps) {
  const [submissionType, setSubmissionType] = useState<'roast' | 'compliment'>('roast');
  const [submissionText, setSubmissionText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      setError('Please enter your submission.');
      return;
    }
    // TODO: Replace "YOUR_PROJECT_ID" in src/lib/firebase.ts with your actual Firebase project ID
    if (db.app.options.projectId === "YOUR_PROJECT_ID") {
        toast({
            title: "Firebase Not Configured",
            description: "Please update src/lib/firebase.ts with your Firebase project details to submit.",
            variant: "destructive",
        });
        return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'submissions'), {
        type: submissionType,
        text: submissionText.trim(),
        submittedAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        // In a real app, you might add userId here if you have authentication
      });

      toast({
        title: "Submission Sent!",
        description: `Your ${submissionType} has been submitted to the fire! 🔥 Thanks!`,
        variant: "default",
      });
      setSubmissionText(''); // Clear text after successful submission
      onClose(); // Close dialog on successful submission
    } catch (err: any) {
      console.error("Error submitting to Firestore:", err);
      setError(`Failed to submit: ${err.message}. Check Firestore rules.`);
      toast({
        title: "Submission Failed",
        description: "Could not save your submission. Please try again. (Check Firestore setup & rules)",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog is closed or opened
  useState(() => {
    if (!isOpen) {
      setSubmissionText('');
      setError('');
      setSubmissionType('roast');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border/70">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center">
            <MessageSquarePlus className="mr-2 h-6 w-6" />
            Suggest a Savage Line
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Got a killer roast or a slick compliment? Share it! It might become Roast of the Day!
            (Submissions are added to Firestore if configured).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="submission-type" className="text-foreground">Type of Submission</Label>
            <RadioGroup
              value={submissionType}
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
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !submissionText.trim()}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
