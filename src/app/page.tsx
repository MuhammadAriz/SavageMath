
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
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-foreground transition-colors duration-1000 ease-in-out relative"
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-headline font-bold mb-2 sm:mb-4">
        Roast n’ Math 🔥💀
        </h1>
        <MathChallengeClient />
      </div>

      <footer className="absolute bottom-4 w-full text-center text-muted-foreground text-sm">
        <div className="inline-flex items-center gap-2">
          <span>Powered by</span>
          <a href="https://3xa.ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            <svg
              width="40"
              height="20"
              viewBox="0 0 135 55"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-auto"
            >
              <path d="M16.5912 36.312H30.4092V43.8H16.5912V36.312Z" />
              <path d="M2.14917 11.1H15.9672V18.588H2.14917V11.1Z" />
              <path d="M2.14917 36.312H15.9672V43.8H2.14917V36.312Z" />
              <path d="M16.5912 11.1H30.4092V18.588H16.5912V11.1Z" />
              <path d="M9.37036 18.588H23.1884V23.712H9.37036V18.588Z" />
              <path d="M9.37036 31.188H23.1884V36.312H9.37036V31.188Z" />
              <path d="M136 35.856V11.376H123.328L117.824 23.016L112.32 11.376H99.536V35.856H107.12V17.736L112.56 29.256H117.888L123.264 17.736V35.856H136Z" />
              <path d="M49.2638 11.376V35.856H87.3598V28.776H56.8478V25.32H86.4398V18.312H56.8478V11.376H49.2638Z" />
              <path d="M72.2356 42.168H88.3156V49.08H72.2356V42.168Z" />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}
