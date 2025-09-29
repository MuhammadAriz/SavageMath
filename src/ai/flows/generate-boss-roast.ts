
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
  question: z.string().describe('The math question where the user broke their streak.'),
  userAnswer: z.string().optional().describe('The answer provided by the user. Can be non-numeric, gibberish, or empty if submitted nothing/timed out.'),
  language: z.string().describe('The language for the generated roast (e.g., "Roman Urdu", "English").'),
  streak: z.number().describe('The glorious streak count the user had before they broke it.'),
});
export type GenerateBossRoastInput = z.infer<typeof GenerateBossRoastInputSchema>;

const GenerateBossRoastOutputSchema = z.object({
  bossRoast: z.string().describe('A truly devastating, yet hilarious, boss-level Gen Z style roast for fumbling a high streak.'),
});
export type GenerateBossRoastOutput = z.infer<typeof GenerateBossRoastOutputSchema>;

export async function generateBossRoast(input: GenerateBossRoastInput): Promise<GenerateBossRoastOutput> {
  return generateBossRoastFlow(input);
}

const generateBossRoastPrompt = ai.definePrompt({
  name: 'generateBossRoastPrompt',
  input: {schema: GenerateBossRoastInputSchema},
  output: {schema: GenerateBossRoastOutputSchema},
  prompt: `You are the Roast Master General, Gen Z edition. This user was on a GLORIOUS {{{streak}}}-question correct streak and then they completely BOMBED it on this {{{topic}}} question: "{{{question}}}".
They broke their amazing streak of {{{streak}}}! How could they fumble an epic streak so spectacularly?
{{#if userAnswer}}
  Their answer was "{{{userAnswer}}}".
  You MUST determine if "{{{userAnswer}}}" is a valid numerical answer or not.
  If "{{{userAnswer}}}" is clearly not a number (e.g., it's text, symbols, random letters, or gibberish like "alkdsjf"), unleash an EVEN MORE DEVASTATING roast. They broke their amazing streak by entering "{{{userAnswer}}}" instead of a number! Make them regret it (in a funny way). Example: "{{{streak}}} ki streak tod di woh bhi '{{{userAnswer}}}' likh kar? Champion se zero hogaye bhai!"
  If "{{{userAnswer}}}" IS a number but it's WRONG, roast them for failing the math after such a good run, breaking their streak with an incorrect calculation. Example: "Wah! {{{streak}}} ke baad yeh galat jawab? Kya talent hai!"
{{else}}
  They submitted NOTHING or ran out of time, breaking their glorious streak! Roast them with extreme prejudice for this epic choke. They had it all and threw it away! Example: "Itni lambi streak hath mein thi, aur jawab nahi? Aise kon karta hai bhai?"
{{/if}}
Unleash a truly devastating, yet hilariously savage, boss-level Gen Z roast in {{{language}}}. Make them question their life choices (in a funny way). This isn't just a roast, it's an event. CRITICAL: DO NOT use the word "ustaad". DO NOT use the word "slay".`,
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
