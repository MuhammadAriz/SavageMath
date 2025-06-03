"use client";

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRoast } from '@/ai/flows/generate-roast';
import { generateCompliment } from '@/ai/flows/generate-compliment';
import { Loader2, Send } from 'lucide-react';

type Operator = '+' | '-' | '*' | '/';

export default function MathChallengeClient() {
  const [questionStr, setQuestionStr] = useState<string>('Loading question...');
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [operator, setOperator] = useState<Operator>('+');
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const generateNewQuestion = useCallback(() => {
    setFeedback(''); // Clear previous feedback when generating a new question
    
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
        // Allow negative results for more variety
        calculatedAnswer = n1 - n2;
        break;
      case '*':
        n1 = Math.floor(Math.random() * 12) + 1; // Max 12 for multiplication
        n2 = Math.floor(Math.random() * 12) + 1;
        calculatedAnswer = n1 * n2;
        break;
      case '/':
        n2 = Math.floor(Math.random() * 9) + 2; // Divisor from 2 to 10
        n1 = (Math.floor(Math.random() * 9) + 1) * n2; // Ensure integer result (1-9)
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
    setUserAnswer('');
    setIsLoading(false); // Ensure loading is reset
  }, []);

  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    const userAnswerNum = parseFloat(userAnswer);
    if (isNaN(userAnswerNum)) {
      setFeedback("❌ Please enter a valid number.");
      return;
    }    generateNewQuestion(); // Generate a new question immediately on submission
    setIsLoading(true);
    setFeedback('⏳ AI is brewing a response...');
    const isCorrect = Math.abs(userAnswerNum - correctAnswer) < 0.001;
    
    let operationTypeForRoast = '';
    if (operator === '+') operationTypeForRoast = 'addition';
    else if (operator === '-') operationTypeForRoast = 'subtraction';
    else if (operator === '*') operationTypeForRoast = 'multiplication';
    else if (operator === '/') operationTypeForRoast = 'division';

    try {
      if (isCorrect) {
        const complimentResult = await generateCompliment({ 
          question: `${num1} ${operator} ${num2}`, 
          answer: correctAnswer 
        });
        setFeedback(`✅ ${complimentResult.compliment}`);
      } else {
        const roastResult = await generateRoast({
          topic: operationTypeForRoast,
          question: questionStr, // Add the question
          userAnswer: userAnswer, // Add the user's answer
        });
        setFeedback(`❌ ${roastResult.roast}`);
      }
    } catch (error: any) {
      console.error("AI API Error:", error);
      setFeedback(`😵‍💫 Oops! AI hiccup: ${error.message || 'Failed to get response.'}`);
    }
 finally {
 setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-2xl bg-card/90 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-headline text-center text-primary">
          {questionStr}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="number"
            step="any" // Allow decimals
            id="answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your Answer"
            className="text-center text-lg h-12 bg-input placeholder:text-muted-foreground"
            disabled={isLoading}
            required
          />
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-medium"
            disabled={isLoading}
          >
            {isLoading && !feedback.startsWith("✅") && !feedback.startsWith("❌") && !feedback.startsWith("😵‍💫") ? ( // Show loader only during AI call
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {isLoading && !feedback.startsWith("✅") && !feedback.startsWith("❌") && !feedback.startsWith("😵‍💫") ? 'Thinking...' : 'Submit Answer'}
          </Button>
        </form>
        {feedback && ( // Show feedback if it exists
          <div className="mt-6 p-4 rounded-md bg-muted/70 border border-border/30 min-h-[5rem] flex items-center justify-center transition-opacity duration-500 ease-in-out opacity-100">
            <p className="text-center text-md sm:text-lg font-body leading-relaxed">{feedback}</p>
</div>
        )}
      </CardContent>
    </Card>
  );
}
