
"use client";
import { useState, useEffect } from 'react';
import MathChallengeClient from '@/components/math-challenge-client';

export default function SavageMathPage() {
  const [bgColor, setBgColor] = useState<string>('hsl(260, 6%, 10%)'); // Initial background

  useEffect(() => {
    const changeColor = () => {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 30) + 40; // 40-70%
      const lightness = Math.floor(Math.random() * 20) + 10; // 10-30% for dark theme
      setBgColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    };
    const intervalId = setInterval(changeColor, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main 
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-foreground transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-headline font-bold mb-2 sm:mb-4">
        Roast n’ Math 🔥💀
        </h1>
        <MathChallengeClient />
      </div>
    </main>
  );
}
