
"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRoast } from '@/ai/flows/generate-roast';
import { generateCompliment } from '@/ai/flows/generate-compliment';
import { generateBossRoast } from '@/ai/flows/generate-boss-roast';
import { generateBossCompliment } from '@/ai/flows/generate-boss-compliment';
import { Loader2, Send, AlertTriangle, SmilePlus, ChevronRight, MessageSquarePlus, Brain, Info, ThumbsUp, ThumbsDown } from 'lucide-react';
import Confetti from 'react-confetti';
import SubmissionDialog from '@/components/submission-dialog';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';


type Operator = '+' | '-' | '*' | '/';
const TIMER_DURATION = 10; 
const STREAK_TARGET = 5;

export default function MathChallengeClient() {
  const [questionStr, setQuestionStr] = useState<string>('Loading question...');
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [operator, setOperator] = useState<Operator>('+');
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>(''); // For display with prefix
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATION);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<{ width: number; height: number; }>({ width: 0, height: 0 });

  const [buttonStyle, setButtonStyle] = useState<React.CSSProperties>({});
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const [isFeedbackPhase, setIsFeedbackPhase] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  const [userSuggestionForFailedApi, setUserSuggestionForFailedApi] = useState<string>('');
  const [hasApiError, setHasApiError] = useState<boolean>(false);

  const [currentAiMessage, setCurrentAiMessage] = useState<string | null>(null);
  const [currentAiMessageType, setCurrentAiMessageType] = useState<'roast' | 'compliment' | null>(null);
  const [currentFeedbackDocId, setCurrentFeedbackDocId] = useState<string | null>(null);
  const [hasVotedOnCurrentFeedback, setHasVotedOnCurrentFeedback] = useState<boolean>(false);


  const getOperationTypeForAI = useCallback((op: Operator): string => {
    if (op === '+') return 'addition';
    if (op === '-') return 'subtraction';
    if (op === '*') return 'multiplication';
    if (op === '/') return 'division';
    return 'math';
  }, []);

  const saveAiFeedbackToFirestore = async (message: string, type: 'roast' | 'compliment') => {
    if (db.app.options.projectId === "YOUR_PROJECT_ID") {
      console.warn("Firebase not configured, AI feedback not saved.");
      return null;
    }
    try {
      const docRef = await addDoc(collection(db, 'ai_generated_feedback'), {
        text: message,
        type: type,
        upvotes: 0,
        downvotes: 0,
        submittedAt: serverTimestamp(),
        question: `${num1} ${operator} ${num2}`,
        correctAnswer: correctAnswer,
        userAnswerContext: userAnswer, // context of user's answer when this AI feedback was generated
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving AI feedback to Firestore:", error);
      toast({
        title: "Voting System Error",
        description: "Could not save AI feedback for voting. Votes won't be recorded for this item.",
        variant: "destructive",
      });
      return null;
    }
  };


  const generateNewQuestion = useCallback(() => {
    setFeedback('');
    setUserAnswer('');
    setIsLoading(false);
    setShowConfetti(false);
    setHasApiError(false); 
    setUserSuggestionForFailedApi(''); 
    setTimeLeft(TIMER_DURATION); 
    setCurrentAiMessage(null);
    setCurrentAiMessageType(null);
    setCurrentFeedbackDocId(null);
    setHasVotedOnCurrentFeedback(false);

    const ops: Operator[] = ['+', '-', '*', '/'];
    const currentOp = ops[Math.floor(Math.random() * ops.length)];
    let n1: number, n2: number;
    let calculatedAnswer: number;

    switch (currentOp) {
      case '+':
        n1 = Math.floor(Math.random() * 90) + 10; 
        n2 = Math.floor(Math.random() * 90) + 10; 
        calculatedAnswer = n1 + n2;
        break;
      case '-':
        n1 = Math.floor(Math.random() * 90) + 10; 
        n2 = Math.floor(Math.random() * n1) + 1;  
        if (n1 < n2) [n1, n2] = [n2, n1]; 
        calculatedAnswer = n1 - n2;
        break;
      case '*':
        n1 = Math.floor(Math.random() * 13) + 2; 
        n2 = Math.floor(Math.random() * 13) + 2; 
        calculatedAnswer = n1 * n2;
        break;
      case '/':
        n2 = Math.floor(Math.random() * 11) + 2; 
        const maxQuotient = 15;
        n1 = (Math.floor(Math.random() * maxQuotient) + 1) * n2; 
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
  }, []); 

  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);


  const handleTimeUp = useCallback(async () => {
    if (isLoading || isFeedbackPhase) return; 

    if (timerIdRef.current) clearInterval(timerIdRef.current);
    
    setIsLoading(true);
    setIsFeedbackPhase(true);
    setFeedback(`⏰ Time's up! AI is brewing a roast...`);
    setCurrentAiMessage(null);
    setCurrentAiMessageType(null);
    setCurrentFeedbackDocId(null);
    setHasVotedOnCurrentFeedback(false);
    
    if (hasApiError && userSuggestionForFailedApi.trim() !== '') {
      setFeedback(`💡 ${userSuggestionForFailedApi} (AI unavailable, using your suggestion)`);
      setHasApiError(false);
      setUserSuggestionForFailedApi('');
      setIsLoading(false);
      return;
    }
    
    try {
      let roastMessage: string;
      const roastInput = {
        topic: getOperationTypeForAI(operator),
        question: `${num1} ${operator} ${num2}`,
        userAnswer: undefined, 
      };

      if (currentStreak >= STREAK_TARGET) {
        const bossRoastResult = await generateBossRoast(roastInput);
        roastMessage = bossRoastResult.bossRoast;
      } else {
        const roastResult = await generateRoast(roastInput);
        roastMessage = roastResult.roast;
      }
      setCurrentAiMessage(roastMessage);
      setCurrentAiMessageType('roast');
      setFeedback(`❌ ${roastMessage}`);
      const docId = await saveAiFeedbackToFirestore(roastMessage, 'roast');
      setCurrentFeedbackDocId(docId);

    } catch (error: any) {
      console.error("AI API Error (Time Up):", error);
      setFeedback(`😵‍💫 Oops! AI hiccup: ${error.message || 'Failed to get response.'} Maybe suggest a roast while it recovers?`);
      setHasApiError(true); 
    } finally {
      setCurrentStreak(0); 
      setIsLoading(false);
    }
  }, [num1, num2, operator, isLoading, isFeedbackPhase, getOperationTypeForAI, currentStreak, hasApiError, userSuggestionForFailedApi, correctAnswer, userAnswer]);

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
    setCurrentAiMessage(null);
    setCurrentAiMessageType(null);
    setCurrentFeedbackDocId(null);
    setHasVotedOnCurrentFeedback(false);


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
        const roastInput = {
          topic: getOperationTypeForAI(operator),
          question: `${num1} ${operator} ${num2}`,
          userAnswer: trimmedUserAnswer === '' ? undefined : trimmedUserAnswer,
        };

        if (currentStreak >= STREAK_TARGET) {
          const bossRoastResult = await generateBossRoast(roastInput);
          roastMessage = bossRoastResult.bossRoast;
        } else {
          const roastResult = await generateRoast(roastInput);
          roastMessage = roastResult.roast;
        }
        setCurrentAiMessage(roastMessage);
        setCurrentAiMessageType('roast');
        setFeedback(`❌ ${roastMessage}`);
        const docId = await saveAiFeedbackToFirestore(roastMessage, 'roast');
        setCurrentFeedbackDocId(docId);

      } catch (error: any) {
        console.error("AI API Error (Invalid Input):", error);
        setFeedback(`😵‍💫 Oops! AI hiccup: ${error.message || 'Failed to get response.'} Feel free to suggest a roast!`);
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
          let complimentMessage: string;

          if (newStreak >= STREAK_TARGET) {
            const bossComplimentResult = await generateBossCompliment({ 
              question: `${num1} ${operator} ${num2}`, 
              answer: correctAnswer 
            });
            complimentMessage = bossComplimentResult.bossCompliment;
          } else {
            const complimentResult = await generateCompliment({ 
              question: `${num1} ${operator} ${num2}`, 
              answer: correctAnswer 
            });
            complimentMessage = complimentResult.compliment;
          }
          setCurrentAiMessage(complimentMessage);
          setCurrentAiMessageType('compliment');
          setFeedback(`✅ ${complimentMessage} (Streak: ${newStreak})`);
          const docId = await saveAiFeedbackToFirestore(complimentMessage, 'compliment');
          setCurrentFeedbackDocId(docId);
          setTimeout(() => setShowConfetti(false), 4000);

        } else {
          let roastMessage: string;
          const roastInput = {
            topic: getOperationTypeForAI(operator),
            question: `${num1} ${operator} ${num2}`,
            userAnswer: trimmedUserAnswer, 
          };
          if (currentStreak >= STREAK_TARGET) {
            const bossRoastResult = await generateBossRoast(roastInput);
            roastMessage = bossRoastResult.bossRoast;
          } else {
            const roastResult = await generateRoast(roastInput);
            roastMessage = roastResult.roast;
          }
          setCurrentAiMessage(roastMessage);
          setCurrentAiMessageType('roast');
          setFeedback(`❌ ${roastMessage}`);
          const docId = await saveAiFeedbackToFirestore(roastMessage, 'roast');
          setCurrentFeedbackDocId(docId);
          setCurrentStreak(0);
        }
      } catch (error: any) {
        console.error("AI API Error:", error);
        setFeedback(`😵‍💫 Oops! AI hiccup: ${error.message || 'Failed to get response.'} Perhaps suggest a compliment/roast?`);
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

  const handleOpenSubmissionDialog = () => {
    setIsSubmissionDialogOpen(true);
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentFeedbackDocId || hasVotedOnCurrentFeedback) {
      toast({
        title: "Already Voted",
        description: "You've already voted on this feedback or feedback ID is missing.",
        variant: "default",
      });
      return;
    }
    if (db.app.options.projectId === "YOUR_PROJECT_ID") {
       toast({
            title: "Firebase Not Configured",
            description: "Please update src/lib/firebase.ts with your Firebase project details to vote.",
            variant: "destructive",
        });
        return;
    }

    try {
      const feedbackRef = doc(db, 'ai_generated_feedback', currentFeedbackDocId);
      await updateDoc(feedbackRef, {
        [voteType === 'upvote' ? 'upvotes' : 'downvotes']: increment(1)
      });
      setHasVotedOnCurrentFeedback(true);
      toast({
        title: `Vote Recorded!`,
        description: `Your ${voteType} has been submitted to the database.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error submitting vote to Firestore:", error);
      toast({
        title: "Vote Failed",
        description: "Could not record your vote. Please try again.",
        variant: "destructive",
      });
    }
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

  return (
    <>
      {showConfetti && windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} gravity={0.2} />}
      <div className="flex justify-between items-center w-full mb-2">
        <Button variant="outline" size="sm" onClick={handleOpenSubmissionDialog} className="bg-card/80 hover:bg-card">
          <MessageSquarePlus className="mr-2 h-4 w-4" /> Suggest Line
        </Button>
         <div className="flex items-center text-lg font-semibold text-primary">
          <Brain className="mr-2 h-5 w-5" /> Streak: {currentStreak}
        </div>
      </div>
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
              type="text"
              id="answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your Answer"
              className="text-center text-lg h-12 bg-input placeholder:text-muted-foreground"
              disabled={isLoading || isFeedbackPhase || (!isFeedbackPhase && timeLeft === 0)}
              
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
              <p className="text-center text-md sm:text-lg font-body leading-relaxed mb-2">
                {feedbackIcon()}
                {feedback.substring(feedback.indexOf(" ") + 1)}
              </p>
              {isFeedbackPhase && !isLoading && currentFeedbackDocId && (feedback.startsWith("✅") || feedback.startsWith("❌")) && (
                <div className="flex space-x-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => handleVote('upvote')} aria-label="Upvote feedback" disabled={hasVotedOnCurrentFeedback}>
                    <ThumbsUp className={`h-5 w-5 ${hasVotedOnCurrentFeedback ? 'text-muted-foreground' : 'text-green-500'}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVote('downvote')} aria-label="Downvote feedback" disabled={hasVotedOnCurrentFeedback}>
                    <ThumbsDown className={`h-5 w-5 ${hasVotedOnCurrentFeedback ? 'text-muted-foreground' : 'text-red-500'}`} />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <SubmissionDialog 
        isOpen={isSubmissionDialogOpen}
        onClose={() => setIsSubmissionDialogOpen(false)}
      />
    </>
  );
}

