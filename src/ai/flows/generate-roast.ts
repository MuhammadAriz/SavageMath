
'use server';

/**
 * @fileOverview A flow for generating Gen Z style roasts for incorrect math answers.
 *
 * - generateRoast - A function that generates a roast based on the input.
 * - GenerateRoastInput - The input type for the generateRoast function.
 * - GenerateRoastOutput - The return type for the generateRoast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoastInputSchema = z.object({
  topic: z.string().describe('The type of math operation (e.g., addition, multiplication).'),
  question: z.string().describe('The math question that was answered incorrectly or timed out.'),
  userAnswer: z.string().optional().describe('The incorrect answer provided by the user. Can be empty if timed out.'),
});
export type GenerateRoastInput = z.infer<typeof GenerateRoastInputSchema>;

const GenerateRoastOutputSchema = z.object({
  roast: z.string().describe('A funny and savage Gen Z style roast in Roman Urdu.'),
});
export type GenerateRoastOutput = z.infer<typeof GenerateRoastOutputSchema>;

export async function generateRoast(input: GenerateRoastInput): Promise<GenerateRoastOutput> {
  return generateRoastFlow(input);
}

const generateRoastPrompt = ai.definePrompt({
  name: 'generateRoastPrompt',
  input: {schema: GenerateRoastInputSchema},
  output: {schema: GenerateRoastOutputSchema},
  prompt: `Give me a funny and savage one-liner Gen Z style roast in Roman Urdu for someone who messed up this math question: "{{{question}}}". Their answer was "{{#if userAnswer}}{{{userAnswer}}}{{else}}they ran out of time or didn't even try{{/if}}". The question was about {{{topic}}}. Keep it short and punchy.`,
});

const generateRoastFlow = ai.defineFlow(
  {
    name: 'generateRoastFlow',
    inputSchema: GenerateRoastInputSchema,
    outputSchema: GenerateRoastOutputSchema,
  },
  async input => {
    const {output} = await generateRoastPrompt(input);
    return output!;
  }
);
