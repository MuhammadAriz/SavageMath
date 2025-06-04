
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const hardcodedRoasts = [
  "Are you a magician? Because whenever you do math, numbers disappear... into wrong answers.",
  "Your math skills are like a broken pencil... pointless.",
  "I've seen better calculations on a restaurant bill after three rounds of drinks.",
  "If math was a sport, you'd be the one bringing oranges for the team.",
  "Were you absent the day they taught numbers?",
  "I'm not saying you're bad at math, but 2+2 for you is probably 'not enough information'.",
  "Your math solutions are so creative, they belong in an art gallery, not a textbook."
];

export default function RoastOfTheDay() {
  const [dailyRoast, setDailyRoast] = useState<string>('');

  useEffect(() => {
    // Simple logic to pick a "daily" roast. In a real app, this would be more sophisticated.
    const today = new Date().toDateString(); // Changes once a day
    let storedRoast = localStorage.getItem('dailyRoast');
    let storedDate = localStorage.getItem('dailyRoastDate');

    if (storedRoast && storedDate === today) {
      setDailyRoast(storedRoast);
    } else {
      const randomIndex = Math.floor(Math.random() * hardcodedRoasts.length);
      const newRoast = hardcodedRoasts[randomIndex];
      setDailyRoast(newRoast);
      localStorage.setItem('dailyRoast', newRoast);
      localStorage.setItem('dailyRoastDate', today);
    }
  }, []);

  if (!dailyRoast) {
    return null; 
  }

  return (
    <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-center text-accent flex items-center justify-center">
          <Zap className="mr-2 h-5 w-5" /> Roast of the Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm sm:text-md font-body italic text-muted-foreground">
          "{dailyRoast}"
        </p>
        <p className="text-xs text-center mt-3 text-muted-foreground/70">(UI Prototype: This is a static, hardcoded roast for now.)</p>
      </CardContent>
    </Card>
  );
}
