
'use server';
/**
 * @fileOverview A flow to generate an epic, boss-level Gen Z compliment for achieving a 5-question streak.
 *
 * - generateBossCompliment - A function that generates a boss-level compliment.
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
  bossCompliment: z.string().describe('An absolutely epic, over-the-top, Gen Z compliment in Roman Urdu for achieving a 5-question streak.'),
});
export type GenerateBossComplimentOutput = z.infer<typeof GenerateBossComplimentOutputSchema>;

export async function generateBossCompliment(input: GenerateBossComplimentInput): Promise<GenerateBossComplimentOutput> {
  return generateBossComplimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBossComplimentPrompt',
  input: {schema: GenerateBossComplimentInputSchema},
  output: {schema: GenerateBossComplimentOutputSchema},
  prompt: `You are a hype Gen Z chatbot. The user just achieved an amazing 5-question correct streak! The last question they nailed was "{{{question}}}" and the answer was {{{answer}}}. Deliver an absolutely epic, over-the-top, legendary Gen Z compliment in Roman Urdu for this math god/goddess. Make it memorable!`,
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
