'use server';

/**
 * @fileOverview AI flow for analyzing a user-created doodle and guessing what it is.
 *
 * - analyzeDoodle - A function that takes a doodle image and returns the AI's guess.
 * - AnalyzeDoodleInput - The input type for the analyzeDoodle function.
 * - AnalyzeDoodleOutput - The return type for the analyzeDoodle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDoodleInputSchema = z.object({
  doodleDataUri: z
    .string()
    .describe(
      "The doodle drawn by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeDoodleInput = z.infer<typeof AnalyzeDoodleInputSchema>;

const AnalyzeDoodleOutputSchema = z.object({
  guess: z.string().describe('The AI model guess of what the doodle is.'),
});
export type AnalyzeDoodleOutput = z.infer<typeof AnalyzeDoodleOutputSchema>;

export async function analyzeDoodle(input: AnalyzeDoodleInput): Promise<AnalyzeDoodleOutput> {
  return analyzeDoodleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDoodlePrompt',
  input: {schema: AnalyzeDoodleInputSchema},
  output: {schema: AnalyzeDoodleOutputSchema},
  prompt: `You are an AI model that is good at guessing doodles.

  A user has drawn a doodle and you need to guess what it is.

  Here is the doodle:
  {{media url=doodleDataUri}}

  What is your guess?
  `,
});

const analyzeDoodleFlow = ai.defineFlow(
  {
    name: 'analyzeDoodleFlow',
    inputSchema: AnalyzeDoodleInputSchema,
    outputSchema: AnalyzeDoodleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
