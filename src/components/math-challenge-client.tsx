
"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRoast } from '@/ai/flows/generate-roast';
import { generateCompliment } from '@/ai/flows/generate-compliment';
import { generateBossRoast } from '@/ai/flows/generate-boss-roast';
import { generateBossCompliment } from '@/ai/flows/generate-boss-compliment';
import { Loader2, Send, AlertTriangle, SmilePlus, ChevronRight, Brain, Info, Languages, Timer, TrendingUp } from 'lucide-react';
import Confetti from 'react-confetti';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Operator = '+' | '-' | '*' | '/';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const TIMER_DURATION = 10; 
const STREAK_TARGET = 5;

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
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [level, setLevel] = useState<Difficulty>('Easy');
  
  const [userSuggestionForFailedApi, setUserSuggestionForFailedApi] = useState<string>('');
  const [hasApiError, setHasApiError] = useState<boolean>(false);
  
  const [language, setLanguage] = useState<string>('Roman Urdu');
  
  const { toast } = useToast();

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
    setHasApiError(false); 
    setUserSuggestionForFailedApi(''); 
    setTimeLeft(TIMER_DURATION); 

    let currentDifficulty: Difficulty = 'Easy';
    if (currentStreak >= 20) {
      currentDifficulty = 'Hard';
    } else if (currentStreak >= 10) {
      currentDifficulty = 'Medium';
    }
    setLevel(currentDifficulty);
    
    const ops: Operator[] = ['+', '-', '*', '/'];
    const currentOp = ops[Math.floor(Math.random() * ops.length)];
    let n1: number, n2: number;
    let calculatedAnswer: number;

    switch (currentOp) {
      case '+':
        if (currentDifficulty === 'Easy') {
          n1 = Math.floor(Math.random() * 90) + 10;
          n2 = Math.floor(Math.random() * 90) + 10;
        } else if (currentDifficulty === 'Medium') {
          n1 = Math.floor(Math.random() * 400) + 100;
          n2 = Math.floor(Math.random() * 400) + 100;
        } else { // Hard
          n1 = Math.floor(Math.random() * 900) + 100;
          n2 = Math.floor(Math.random() * 900) + 100;
        }
        calculatedAnswer = n1 + n2;
        break;
      case '-':
        if (currentDifficulty === 'Easy') {
          n1 = Math.floor(Math.random() * 90) + 10;
          n2 = Math.floor(Math.random() * n1) + 1;
        } else if (currentDifficulty === 'Medium') {
          n1 = Math.floor(Math.random() * 400) + 100;
          n2 = Math.floor(Math.random() * n1);
        } else { // Hard
          n1 = Math.floor(Math.random() * 900) + 100;
          n2 = Math.floor(Math.random() * n1);
        }
        if (n1 < n2) [n1, n2] = [n2, n1]; 
        calculatedAnswer = n1 - n2;
        break;
      case '*':
        if (currentDifficulty === 'Easy') {
          n1 = Math.floor(Math.random() * 11) + 2; 
          n2 = Math.floor(Math.random() * 11) + 2; 
        } else if (currentDifficulty === 'Medium') {
          n1 = Math.floor(Math.random() * 15) + 5;
          n2 = Math.floor(Math.random() * 15) + 5;
        } else { // Hard
          n1 = Math.floor(Math.random() * 20) + 10;
          n2 = Math.floor(Math.random() * 20) + 10;
        }
        calculatedAnswer = n1 * n2;
        break;
      case '/':
        if (currentDifficulty === 'Easy') {
            n2 = Math.floor(Math.random() * 11) + 2;
            n1 = (Math.floor(Math.random() * 12) + 1) * n2;
        } else if (currentDifficulty === 'Medium') {
            n2 = Math.floor(Math.random() * 15) + 5;
            n1 = (Math.floor(Math.random() * 15) + 1) * n2;
        } else { // Hard
            n2 = Math.floor(Math.random() * 20) + 10;
            n1 = (Math.floor(Math.random() * 20) + 1) * n2;
        }
        calculatedAnswer = n1 / n2;
        break;
      default:
        n1 = 0; n2 = 0; 
        calculatedAnswer = 0;
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(currentOp);
    setQuestionStr(`${n1} ${currentOp} ${n2} = ?`);
    setCorrectAnswer(calculatedAnswer);

    if (buttonContainerRef.current) {
      const containerWidth = buttonContainerRef.current.offsetWidth;
      const maxLeft = Math.max(0, containerWidth - 180); 
      const newLeft = Math.random() * maxLeft;
      const newTop = Math.random() * 10 + 5;
      
      setButtonStyle({
        position: 'absolute',
        left: `${newLeft}px`,
        top: `${newTop}px`,
        transition: 'left 0.5s ease-out, top 0.5s ease-out',
      });
    }
  }, [currentStreak]); 

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const handleTimeUp = useCallback(async () => {
    if (isLoading || isFeedbackPhase) return; 

    if (timerIdRef.current) clearInterval(timerIdRef.current);
    
    setIsLoading(true);
    setIsFeedbackPhase(true);
    setFeedback(`⏰ Time's up! AI is brewing a roast...`);
    
    if (hasApiError && userSuggestionForFailedApi.trim() !== '') {
      setFeedback(`💡 ${userSuggestionForFailedApi} (AI unavailable, using your suggestion)`);
      setHasApiError(false);
      setUserSuggestionForFailedApi('');
      setIsLoading(false);
      return;
    }
    
    try {
      let roastMessage: string;

      if (currentStreak >= STREAK_TARGET) {
        const bossRoastResult = await generateBossRoast({
          topic: getOperationTypeForAI(operator),
          question: `${num1} ${operator} ${num2}`,
          userAnswer: undefined,
          language: language,
          streak: currentStreak,
        });
        roastMessage = bossRoastResult.bossRoast;
      } else {
        const roastResult = await generateRoast({
          topic: getOperationTypeForAI(operator),
          question: `${num1} ${operator} ${num2}`,
          userAnswer: undefined,
          language: language,
        });
        roastMessage = roastResult.roast;
      }
      setFeedback(`❌ ${roastMessage}`);

    } catch (error: any) {
      console.error("AI API Error (Time Up):", error);
      setFeedback(`😵‍💫 Oops! AI hiccup: The model is overloaded. Please try again in a moment.`);
      setHasApiError(true); 
    } finally {
      setCurrentStreak(0); 
      setIsLoading(false);
    }
  }, [num1, num2, operator, isLoading, isFeedbackPhase, getOperationTypeForAI, currentStreak, hasApiError, userSuggestionForFailedApi, language]);

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

    if (timerIdRef.current) clearInterval(timerIdRef.current);

    const trimmedUserAnswer = userAnswer.trim();
    
    setIsLoading(true);
    setIsFeedbackPhase(true); 
    setFeedback('⏳ AI is brewing a response...');

    if (hasApiError && userSuggestionForFailedApi.trim() !== '') {
      setFeedback(`💡 ${userSuggestionForFailedApi} (AI unavailable, using your suggestion)`);
      setHasApiError(false);
      setUserSuggestionForFailedApi('');
      setIsLoading(false);
      return;
    }

    const userAnswerNum = parseFloat(trimmedUserAnswer);

    if (trimmedUserAnswer === '' || isNaN(userAnswerNum)) {
      try {
        let roastMessage: string;

        if (currentStreak >= STREAK_TARGET) {
          const bossRoastResult = await generateBossRoast({
            topic: getOperationTypeForAI(operator),
            question: `${num1} ${operator} ${num2}`,
            userAnswer: trimmedUserAnswer === '' ? undefined : trimmedUserAnswer,
            language: language,
            streak: currentStreak,
          });
          roastMessage = bossRoastResult.bossRoast;
        } else {
          const roastResult = await generateRoast({
            topic: getOperationTypeForAI(operator),
            question: `${num1} ${operator} ${num2}`,
            userAnswer: trimmedUserAnswer === '' ? undefined : trimmedUserAnswer,
            language: language,
          });
          roastMessage = roastResult.roast;
        }
        setFeedback(`❌ ${roastMessage}`);

      } catch (error: any) {
        console.error("AI API Error (Invalid Input):", error);
        setFeedback(`😵‍💫 Oops! AI hiccup: The model is overloaded. Please try again in a moment.`);
        setHasApiError(true);
      } finally {
        setCurrentStreak(0);
        setIsLoading(false);
      }
    } else {
      const isCorrect = Math.abs(userAnswerNum - correctAnswer) < 0.001;
      try {
        if (isCorrect) {
          const newStreak = currentStreak + 1;
          setCurrentStreak(newStreak);
          setShowConfetti(true);
          let successMessage: string;

          if (newStreak >= STREAK_TARGET) {
            const bossComplimentResult = await generateBossCompliment({ 
              question: `${num1} ${operator} ${num2}`, 
              answer: correctAnswer,
              streak: newStreak,
              language: language,
            });
            successMessage = bossComplimentResult.bossCompliment;
          } else {
            const complimentResult = await generateCompliment({ 
              question: `${num1} ${operator} ${num2}`, 
              answer: correctAnswer,
              language: language, 
            });
            successMessage = complimentResult.compliment;
          }
          setFeedback(`✅ ${successMessage} (Streak: ${newStreak})`);
          setTimeout(() => setShowConfetti(false), 4000);

        } else {
          let roastMessage: string;

          if (currentStreak >= STREAK_TARGET) {
            const bossRoastResult = await generateBossRoast({
              topic: getOperationTypeForAI(operator),
              question: `${num1} ${operator} ${num2}`,
              userAnswer: trimmedUserAnswer,
              language: language,
              streak: currentStreak,
            });
            roastMessage = bossRoastResult.bossRoast;
          } else {
            const roastResult = await generateRoast({
              topic: getOperationTypeForAI(operator),
              question: `${num1} ${operator} ${num2}`,
              userAnswer: trimmedUserAnswer, 
              language: language,
            });
            roastMessage = roastResult.roast;
          }
          setFeedback(`❌ ${roastMessage}`);
          setCurrentStreak(0);
        }
      } catch (error: any) {
        console.error("AI API Error:", error);
        setFeedback(`😵‍💫 Oops! AI hiccup: The model is overloaded. Please try again in a moment.`);
        setHasApiError(true);
        if (!isCorrect) setCurrentStreak(0); 
      } finally {
        setIsLoading(false);
      }
    } 
  };

  const handleNextQuestion = () => {
    setIsFeedbackPhase(false);
    generateNewQuestion(); 
  };

  const timerColor = timeLeft <= 3 && !isFeedbackPhase ? 'text-destructive' : 'text-accent';
  const feedbackIcon = () => {
    if (feedback.startsWith("✅")) return <SmilePlus className="inline mr-2 h-6 w-6 text-green-400"/>;
    if (feedback.startsWith("❌")) return <AlertTriangle className="inline mr-2 h-6 w-6 text-red-400"/>;
    if (feedback.startsWith("😵‍💫")) return <AlertTriangle className="inline mr-2 h-6 w-6 text-yellow-400"/>;
    if (feedback.startsWith("⏰")) return <AlertTriangle className="inline mr-2 h-6 w-6 text-orange-400"/>;
    if (feedback.startsWith("💡")) return <Info className="inline mr-2 h-6 w-6 text-blue-400"/>;
    return null;
  }
  
  const levelColor = level === 'Easy' ? 'text-green-400' : level === 'Medium' ? 'text-yellow-400' : 'text-red-400';


  return (
    <>
      {showConfetti && windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} gravity={0.2} />}
      <div className="flex flex-col gap-2 w-full mb-4">
        <div className="flex justify-between items-center w-full">
            <div className={`flex items-center text-lg font-semibold ${levelColor}`}>
              <TrendingUp className="mr-2 h-5 w-5" /> 
              <span className="hidden sm:inline">Level:&nbsp;</span>{level}
            </div>
            <div className="flex items-center text-lg font-semibold text-primary">
              <Brain className="mr-2 h-5 w-5" /> <span className="hidden sm:inline">Streak:&nbsp;</span>{currentStreak}
            </div>
        </div>
        <div className="flex justify-between items-center w-full">
            <div className={`flex items-center text-lg font-semibold ${timerColor}`}>
              <Timer className="mr-2 h-5 w-5" /> 
              <span className="hidden sm:inline">Time Left:&nbsp;</span>{!isFeedbackPhase ? `${timeLeft}s` : '0s'}
            </div>
            <div className="flex items-center gap-2">
                <Label htmlFor="language-select" className="flex items-center gap-1">
                  <Languages className="h-4 w-4" /> <span className="hidden sm:inline">Language:</span>
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language-select" className="w-auto sm:w-[150px] h-9">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Roman Urdu">Roman Urdu</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Punjabi">Punjabi</SelectItem>
                    <SelectItem value="Balochi">Balochi</SelectItem>
                    <SelectItem value="Pashto">Pashto</SelectItem>
                    <SelectItem value="Sindhi">Sindhi</SelectItem>
                  </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <Card className="w-full shadow-2xl bg-card/90 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-headline text-center text-primary">
            {questionStr}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              id="answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your Answer"
              className="text-center text-lg h-12 bg-input placeholder:text-muted-foreground"
              disabled={isLoading || isFeedbackPhase || (!isFeedbackPhase && timeLeft === 0)}
              autoComplete="off"
            />
            <div ref={buttonContainerRef} className="relative h-16 w-full flex items-center justify-center">
              {isFeedbackPhase && !isLoading ? (
                <Button 
                  onClick={handleNextQuestion} 
                  className="h-12 text-lg font-medium px-8 min-w-[200px]"
                  type="button"
                >
                  Next Question <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="h-12 text-lg font-medium px-8 min-w-[180px]"
                  style={!isFeedbackPhase ? buttonStyle : {}}
                  disabled={isLoading || timeLeft === 0 || userAnswer.trim() === '' || isFeedbackPhase}
                >
                  {isLoading && !feedback.startsWith("✅") && !feedback.startsWith("❌") && !feedback.startsWith("😵‍💫") && !feedback.startsWith("⏰") && !feedback.startsWith("💡") ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  {isLoading && !feedback.startsWith("✅") && !feedback.startsWith("❌") && !feedback.startsWith("😵‍💫") && !feedback.startsWith("⏰") && !feedback.startsWith("💡") ? 'Thinking...' : 'Submit Answer'}
                </Button>
              )}
            </div>
          </form>
          {feedback && (
            <div className={`mt-6 p-4 rounded-md bg-muted/70 border border-border/30 min-h-[6rem] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${feedback ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-center text-md sm:text-lg font-body leading-relaxed break-words mb-2">
                {feedbackIcon()}
                {feedback.substring(feedback.indexOf(" ") + 1)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

    