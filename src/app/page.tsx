import MathChallengeClient from '@/components/math-challenge-client';

export default function SavageMathPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background text-foreground">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl sm:text-5xl font-headline font-bold mb-6 sm:mb-8">
          SavageMath 🔥💀
        </h1>
        <MathChallengeClient />
      </div>
    </main>
  );
}
