// src/ai/flows/course-suggestion.ts
'use server';
/**
 * @fileOverview A personalized course suggestion AI agent.
 *
 * - getCourseSuggestion - A function that handles the course suggestion process.
 * - CourseSuggestionInput - The input type for the getCourseSuggestion function.
 * - CourseSuggestionOutput - The return type for the getCourseSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CourseSuggestionInputSchema = z.object({
  interests: z
    .string()
    .describe('A description of the users interests for courses.'),
});
export type CourseSuggestionInput = z.infer<typeof CourseSuggestionInputSchema>;

const CourseSuggestionOutputSchema = z.object({
  suggestedCourses: z
    .array(z.string())
    .describe('The suggested courses based on the user interests.'),
});
export type CourseSuggestionOutput = z.infer<typeof CourseSuggestionOutputSchema>;

export async function getCourseSuggestion(input: CourseSuggestionInput): Promise<CourseSuggestionOutput> {
  return courseSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'courseSuggestionPrompt',
  input: {schema: CourseSuggestionInputSchema},
  output: {schema: CourseSuggestionOutputSchema},
  prompt: `You are an expert career counselor specializing in recommending courses based on user interests.

You will use this information to suggest courses that are most relevant to the user. You will return the suggested courses as a list of strings.

User Interests: {{{interests}}}
`,
});

const courseSuggestionFlow = ai.defineFlow(
  {
    name: 'courseSuggestionFlow',
    inputSchema: CourseSuggestionInputSchema,
    outputSchema: CourseSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
