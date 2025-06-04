
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

interface Submission {
  id: string;
  text: string;
  type: 'roast' | 'compliment';
  upvotes?: number;
  downvotes?: number;
  submittedAt?: Timestamp;
}

const fallbackRoast = "Your math skills are like a broken pencil... pointless.";

export default function RoastOfTheDay() {
  const [dailyRoast, setDailyRoast] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoast = async () => {
      setLoading(true);
      setError(null);
      try {
        if (db.app.options.projectId === "YOUR_PROJECT_ID") {
          setError("Firebase not configured. Please update src/lib/firebase.ts. Displaying fallback roast.");
          setDailyRoast(fallbackRoast + " (Firebase Not Configured)");
          setLoading(false);
          return;
        }

        const submissionsCol = collection(db, 'submissions');
        const q = query(submissionsCol, where('type', '==', 'roast'), orderBy('submittedAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        const roasts: Submission[] = [];
        querySnapshot.forEach((doc) => {
          roasts.push({ id: doc.id, ...doc.data() } as Submission);
        });

        if (roasts.length > 0) {
          const randomIndex = Math.floor(Math.random() * roasts.length);
          setDailyRoast(roasts[randomIndex].text);
        } else {
          setError("No roasts found in the database. Be the first to submit one!");
          setDailyRoast(fallbackRoast + " (No roasts in DB yet)");
        }
      } catch (err: any) {
        console.error("Error fetching roast of the day:", err); // Check browser console for detailed Firebase error
        setError("Failed to load Roast of the Day. Check Firestore: 'submissions' collection should exist, be readable, and have necessary indexes (e.g., for type & submittedAt).");
        setDailyRoast(fallbackRoast + " (Error from Firestore)");
      } finally {
        setLoading(false);
      }
    };

    fetchRoast();
  }, []);

  if (loading) {
    return (
      <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm border-border/40">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-center text-accent flex items-center justify-center">
            <Zap className="mr-2 h-5 w-5" /> Roast of the Day
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="ml-2">Fetching today's roast...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-center text-accent flex items-center justify-center">
          <Zap className="mr-2 h-5 w-5" /> Roast of the Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-center text-destructive text-sm mb-2">{error}</p>}
        <p className="text-center text-sm sm:text-md font-body italic text-muted-foreground">
          "{dailyRoast}"
        </p>
         <p className="text-xs text-center mt-3 text-muted-foreground/70">
          {db.app.options.projectId === "YOUR_PROJECT_ID" 
            ? "(Connect to Firebase for live roasts)" 
            : error && dailyRoast.includes("(Error from Firestore)")
            ? "(Showing fallback roast due to Firestore error)"
            : error && dailyRoast.includes("(No roasts in DB yet)")
            ? "(No roasts in DB, fallback shown)"
            : error && dailyRoast.includes("(Firebase Not Configured)")
            ? "(Firebase not configured, fallback shown)"
            : "(Fetched from user submissions)"}
        </p>
      </CardContent>
    </Card>
  );
}
