
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
  userAnswer: z.string().optional().describe('The answer provided by the user. Can be non-numeric, gibberish, or empty if submitted nothing/timed out.'),
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
  prompt: `You are a Gen Z roaster. The user was asked "{{{question}}}" (a {{{topic}}} problem).
{{#if userAnswer}}
  Their answer was "{{{userAnswer}}}".
  You MUST determine if "{{{userAnswer}}}" is a valid numerical answer or not.
  If "{{{userAnswer}}}" is clearly not a number (e.g., it's text, symbols, just random letters, or gibberish like "sdfkjh"), roast them hilariously for not even ATTEMPTING to give a numerical answer. Make fun of their attempt to type something random. Example: "Bhai, {{{userAnswer}}} konsi new math hai? Number poocha tha, novel nahi!"
  If "{{{userAnswer}}}" IS a number but it's WRONG, roast them for their poor math skills for this specific question. Example: "Itna simple {{{topic}}} nahi aata? Google karlo agli baar."
{{else}}
  They submitted absolutely NOTHING or ran out of time! Roast them hard for their cowardice, hesitation, or slowness. Example: "Khali chor dia? Dar gaye kya?"
{{/if}}
The roast MUST be in Roman Urdu. Keep it short, punchy, and savage. CRITICAL: DO NOT use the word "ustaad". DO NOT use the word "slay".`,
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

