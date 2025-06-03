
'use server';
/**
 * @fileOverview A flow for generating a devastating, boss-level Gen Z style roast for breaking a 5+ streak.
 *
 * - generateBossRoast - A function that generates a boss-level roast.
 * - GenerateBossRoastInput - The input type for the generateBossRoast function.
 * - GenerateBossRoastOutput - The return type for the generateBossRoast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBossRoastInputSchema = z.object({
  topic: z.string().describe('The type of math operation (e.g., addition, multiplication).'),
  question: z.string().describe('The math question where the user broke their 5+ streak.'),
  userAnswer: z.string().optional().describe('The incorrect answer provided by the user. Can be empty if timed out.'),
});
export type GenerateBossRoastInput = z.infer<typeof GenerateBossRoastInputSchema>;

const GenerateBossRoastOutputSchema = z.object({
  bossRoast: z.string().describe('A truly devastating, yet hilarious, boss-level Gen Z style roast in Roman Urdu for fumbling a 5+ streak.'),
});
export type GenerateBossRoastOutput = z.infer<typeof GenerateBossRoastOutputSchema>;

export async function generateBossRoast(input: GenerateBossRoastInput): Promise<GenerateBossRoastOutput> {
  return generateBossRoastFlow(input);
}

const generateBossRoastPrompt = ai.definePrompt({
  name: 'generateBossRoastPrompt',
  input: {schema: GenerateBossRoastInputSchema},
  output: {schema: GenerateBossRoastOutputSchema},
  prompt: `You are the Roast Master General, Gen Z edition. This user was on a glorious 5+ question correct streak and then they completely BOMBED it on this {{{topic}}} question: "{{{question}}}". Their answer was "{{#if userAnswer}}{{{userAnswer}}}{{else}}they ran out of time or didn't even try{{/if}}". Unleash a truly devastating, yet hilariously savage, boss-level Gen Z roast in Roman Urdu. Make them question their life choices (in a funny way). This isn't just a roast, it's an event.`,
});

const generateBossRoastFlow = ai.defineFlow(
  {
    name: 'generateBossRoastFlow',
    inputSchema: GenerateBossRoastInputSchema,
    outputSchema: GenerateBossRoastOutputSchema,
  },
  async input => {
    const {output} = await generateBossRoastPrompt(input);
    return output!;
  }
);
