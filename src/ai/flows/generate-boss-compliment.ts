
'use server';
/**
 * @fileOverview A flow to generate an epic, boss-level Gen Z roast for achieving a 5-question streak.
 *
 * - generateBossCompliment - A function that generates a boss-level success roast.
 * - GenerateBossComplimentInput - The input type for the generateBossCompliment function.
 * - GenerateBossComplimentOutput - The return type for the generateBossCompliment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBossComplimentInputSchema = z.object({
  question: z.string().describe('The math question that was solved as the 5th correct answer in a row.'),
  answer: z.number().describe('The correct answer to the math question.'),
});
export type GenerateBossComplimentInput = z.infer<typeof GenerateBossComplimentInputSchema>;

const GenerateBossComplimentOutputSchema = z.object({
  bossCompliment: z.string().describe('An absolutely epic, over-the-top, legendary Gen Z success roast STRICTLY in Roman Urdu for achieving a 5-question streak. This is a roast for being CORRECT. It should be sarcastic or backhanded. CRITICAL: Avoid using the words "ustaad" or "slay".'),
});
export type GenerateBossComplimentOutput = z.infer<typeof GenerateBossComplimentOutputSchema>;

export async function generateBossCompliment(input: GenerateBossComplimentInput): Promise<GenerateBossComplimentOutput> {
  return generateBossComplimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBossComplimentPrompt',
  input: {schema: GenerateBossComplimentInputSchema},
  output: {schema: GenerateBossComplimentOutputSchema},
  prompt: `You are a legendary Gen Z roaster. The user just achieved an amazing 5-question correct streak! The last question they nailed was "{{{question}}}" and the answer was {{{answer}}}.
Instead of a compliment, you must deliver an absolutely epic, over-the-top, legendary success roast for this achievement.
This is a ROAST for being CORRECT. It should be sarcastic, backhanded, and witty. Make it sound like they just got lucky or the questions were too easy.
Example ideas: "5 sahi? Lagta hai aaj Google search fast chal raha hai.", "Wah, 5 sahi jawab. Calculator ka shukriya ada kiya?", "Itni lambi streak? Pehli baar hui hai kya?"

IMPORTANT:
1. The roast MUST be in Roman Urdu ONLY. Do not use any other language.
2. Be creative. This is a bigger achievement, so the roast should feel more "boss-level" than a regular success roast.
3. CRITICAL: DO NOT use the word "ustaad". DO NOT use the word "slay".`,
});

const generateBossComplimentFlow = ai.defineFlow(
  {
    name: 'generateBossComplimentFlow',
    inputSchema: GenerateBossComplimentInputSchema,
    outputSchema: GenerateBossComplimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
