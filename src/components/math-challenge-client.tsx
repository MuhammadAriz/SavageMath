
"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRoast } from '@/ai/flows/generate-roast';
import { generateCompliment } from '@/ai/flows/generate-compliment';
import { Loader2, Send, AlertTriangle, SmilePlus, ChevronRight } from 'lucide-react';
import Confetti from 'react-confetti';

type Operator = '+' | '-' | '*' | '/';
const TIMER_DURATION = 5; // 5 seconds

export default function MathChallengeClient() {
  const [questionStr, setQuestionStr] = useState<string>('Loading question...');
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [operator, setOperator] = useState<Operator>('+');
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATION);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<{ width: number; height: number; }>({ width: 0, height: 0 });

  const [buttonStyle, setButtonStyle] = useState<React.CSSProperties>({});
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const [isFeedbackPhase, setIsFeedbackPhase] = useState<boolean>(false);


  const getOperationTypeForAI = useCallback((op: Operator): string => {
    if (op === '+') return 'addition';
    if (op === '-') return 'subtraction';
    if (op === '*') return 'multiplication';
    if (op === '/') return 'division';
    return 'math';
  }, []);

  const generateNewQuestion = useCallback(() => {
    setFeedback('');
    setUserAnswer('');
    setIsLoading(false);
    setShowConfetti(false);
    
    // Important: Reset timeLeft here to ensure timer effect restarts correctly
    setTimeLeft(TIMER_DURATION); 

    const ops: Operator[] = ['+', '-', '*', '/'];
    const currentOp = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 10) + 1;
    let n2 = Math.floor(Math.random() * 10) + 1;
    let calculatedAnswer: number;

    switch (currentOp) {
      case '+':
        calculatedAnswer = n1 + n2;
        break;
      case '-':
        // Ensure n1 is greater or equal to n2 for non-negative results in subtraction for simplicity
        if (n1 < n2) {
          [n1, n2] = [n2, n1]; 
        }
        calculatedAnswer = n1 - n2;
        break;
      case '*':
        n1 = Math.floor(Math.random() * 12) + 1;
        n2 = Math.floor(Math.random() * 12) + 1;
        calculatedAnswer = n1 * n2;
        break;
      case '/':
        n2 = Math.floor(Math.random() * 9) + 2; // Divisor not 0 or 1
        n1 = (Math.floor(Math.random() * 9) + 1) * n2; // Ensure whole number result
        calculatedAnswer = n1 / n2;
        break;
      default:
        calculatedAnswer = 0;
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(currentOp);
    setQuestionStr(`${n1} ${currentOp} ${n2} = ?`);
    setCorrectAnswer(calculatedAnswer);

    if (buttonContainerRef.current) {
      const containerWidth = buttonContainerRef.current.offsetWidth;
      const maxLeft = Math.max(0, containerWidth - 180); // Assuming button width ~180px
      const newLeft = Math.random() * maxLeft;
      const newTop = Math.random() * 10 + 5; // Random top within 5px to 15px
      
      setButtonStyle({
        position: 'absolute',
        left: `${newLeft}px`,
        top: `${newTop}px`,
        transition: 'left 0.5s ease-out, top 0.5s ease-out',
      });
    }
  }, []); // Removed dependencies like setTimeLeft as they are stable setters

  // Initial question generation
  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);


  const handleTimeUp = useCallback(async () => {
    if (isLoading || isFeedbackPhase) return; // Don't run if already processing or in feedback

    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }
    
    setIsLoading(true);
    setIsFeedbackPhase(true); // Enter feedback phase
    setFeedback(`⏰ Time's up! AI is brewing a roast...`);
    
    try {
      const roastResult = await generateRoast({
        topic: getOperationTypeForAI(operator),
        question: `${num1} ${operator} ${num2}`,
        userAnswer: "Ran out of time",
      });
      setFeedback(`❌ ${roastResult.roast}`);
    } catch (error: any) {
      console.error("AI API Error (Time Up):", error);
      setFeedback(`😵‍💫 Oops! AI hiccup: ${error.message || 'Failed to get response.'}`);
    } finally {
      setIsLoading(false);
      // DO NOT generate new question here. Wait for "Next Question" button.
    }
  }, [num1, num2, operator, isLoading, isFeedbackPhase, getOperationTypeForAI]);

  // Timer effect
  useEffect(() => {
    if (isFeedbackPhase || isLoading) {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      return;
    }

    if (timeLeft === 0) {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      handleTimeUp();
      return; 
    }

    timerIdRef.current = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [timeLeft, isLoading, isFeedbackPhase, handleTimeUp]);


  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading || timeLeft === 0 || isFeedbackPhase) return;

    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }

    const userAnswerNum = parseFloat(userAnswer);
    if (isNaN(userAnswerNum)) {
      setFeedback("❌ Please enter a valid number.");
      // Restart timer for the same question allowing user to correct
      setTimeLeft(TIMER_DURATION); 
      return;
    }
    
    setIsLoading(true);
    setIsFeedbackPhase(true); // Enter feedback phase
    setFeedback('⏳ AI is brewing a response...');
    const isCorrect = Math.abs(userAnswerNum - correctAnswer) < 0.001;
    
    try {
      if (isCorrect) {
        setShowConfetti(true);
        const complimentResult = await generateCompliment({ 
          question: `${num1} ${operator} ${num2}`, 
          answer: correctAnswer 
        });
        setFeedback(`✅ ${complimentResult.compliment}`);
        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        const roastResult = await generateRoast({
          topic: getOperationTypeForAI(operator),
          question: `${num1} ${operator} ${num2}`,
          userAnswer: userAnswer,
        });
        setFeedback(`❌ ${roastResult.roast}`);
      }
    } catch (error: any) {
      console.error("AI API Error:", error);
      setFeedback(`😵‍💫 Oops! AI hiccup: ${error.message || 'Failed to get response.'}`);
    } finally {
      setIsLoading(false);
      // DO NOT generate new question here. Wait for "Next Question" button.
    }
  };

  const handleNextQuestion = () => {
    setIsFeedbackPhase(false); // Exit feedback phase
    generateNewQuestion(); // This will also reset timeLeft and trigger timer effect
  };
  
  const timerColor = timeLeft <= 2 && !isFeedbackPhase ? 'text-destructive' : 'text-accent';

  return (
    <>
      {showConfetti && windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      <p className={`text-xl font-bold text-center my-3 ${timerColor}`}>
        {!isFeedbackPhase ? `Time left: ${timeLeft}s` : ' '}
      </p>
      <Card className="w-full shadow-2xl bg-card/90 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-headline text-center text-primary">
            {questionStr}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="number"
              step="any"
              id="answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your Answer"
              className="text-center text-lg h-12 bg-input placeholder:text-muted-foreground"
              disabled={isLoading || isFeedbackPhase || (!isFeedbackPhase && timeLeft === 0)}
              required
            />
            <div ref={buttonContainerRef} className="relative h-16 w-full flex items-center justify-center">
              {isFeedbackPhase && !isLoading ? (
                <Button 
                  onClick={handleNextQuestion} 
                  className="h-12 text-lg font-medium px-8 min-w-[200px]"
                  type="button" // Important: type="button" to not submit form
                >
                  Next Question <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="h-12 text-lg font-medium px-8 min-w-[180px]"
                  style={!isFeedbackPhase ? buttonStyle : {}} // Only apply moving style if not in feedback
                  disabled={isLoading || timeLeft === 0 || userAnswer.trim() === '' || isFeedbackPhase}
                >
                  {isLoading && !feedback.startsWith("✅") && !feedback.startsWith("❌") && !feedback.startsWith("😵‍💫") && !feedback.startsWith("⏰") ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  {isLoading && !feedback.startsWith("✅") && !feedback.startsWith("❌") && !feedback.startsWith("😵‍💫") && !feedback.startsWith("⏰") ? 'Thinking...' : 'Submit Answer'}
                </Button>
              )}
            </div>
          </form>
          {feedback && (
            <div className={`mt-6 p-4 rounded-md bg-muted/70 border border-border/30 min-h-[5rem] flex items-center justify-center transition-opacity duration-500 ease-in-out ${feedback ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-center text-md sm:text-lg font-body leading-relaxed">
                {feedback.startsWith("✅") && <SmilePlus className="inline mr-2 h-6 w-6 text-green-400"/>}
                {feedback.startsWith("❌") && <AlertTriangle className="inline mr-2 h-6 w-6 text-red-400"/>}
                {feedback.startsWith("😵‍💫") && <AlertTriangle className="inline mr-2 h-6 w-6 text-yellow-400"/>}
                {feedback.startsWith("⏰") && <AlertTriangle className="inline mr-2 h-6 w-6 text-orange-400"/>}
                {feedback.substring(feedback.indexOf(" ") + 1)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

