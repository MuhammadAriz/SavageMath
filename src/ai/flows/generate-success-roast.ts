
'use server';
/**
 * @fileOverview A flow to generate a witty roast for getting a math question RIGHT.
 *
 * - generateSuccessRoast - A function that generates a roast for a correct answer.
 * - GenerateSuccessRoastInput - The input type for the generateSuccessRoast function.
 * - GenerateSuccessRoastOutput - The return type for the generateSuccessRoast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSuccessRoastInputSchema = z.object({
  question: z.string().describe('The math question that was solved correctly.'),
  answer: z.number().describe('The correct answer to the math question.'),
});
export type GenerateSuccessRoastInput = z.infer<typeof GenerateSuccessRoastInputSchema>;

const GenerateSuccessRoastOutputSchema = z.object({
  roast: z.string().describe('A witty, backhanded, or sarcastic Gen Z roast in Roman Urdu for solving the math question correctly. It should sound like a roast, not a compliment. CRITICAL: Avoid using the words "ustaad" or "slay".'),
});
export type GenerateSuccessRoastOutput = z.infer<typeof GenerateSuccessRoastOutputSchema>;

export async function generateSuccessRoast(input: GenerateSuccessRoastInput): Promise<GenerateSuccessRoastOutput> {
  return generateSuccessRoastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSuccessRoastPrompt',
  input: {schema: GenerateSuccessRoastInputSchema},
  output: {schema: GenerateSuccessRoastOutputSchema},
  prompt: `You are a savage Gen Z roaster. The user just CORRECTLY solved this math question: "{{{question}}}" The answer was {{{answer}}}.
Instead of a compliment, give them a witty, sarcastic, or backhanded roast for their success.
Make it sound like they just got lucky or like the question was too easy.
The roast MUST be in Roman Urdu.
Be creative and funny. Don't be genuinely mean, just sarcastic.
Examples: "Tukka lag gaya?", "Itna asaan sawaal? Nursery me karte the hum.", "Calculator use kiya na? Sach batao."
IMPORTANT: DO NOT use the word "ustaad". DO NOT use the word "slay".
Avoid generic congratulations. This is a ROAST for being correct.`,
});

const generateSuccessRoastFlow = ai.defineFlow(
  {
    name: 'generateSuccessRoastFlow',
    inputSchema: GenerateSuccessRoastInputSchema,
    outputSchema: GenerateSuccessRoastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    