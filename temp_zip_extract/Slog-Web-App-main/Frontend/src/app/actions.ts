"use server";

import { getCourseSuggestion, CourseSuggestionOutput } from '@/ai/flows/course-suggestion';

type SuggestionResult = Partial<CourseSuggestionOutput> & {
    error?: string;
}

export async function handleCourseSuggestion(formData: FormData): Promise<SuggestionResult> {
  const interests = formData.get('interests') as string;
  if (!interests || interests.trim().length < 10) {
    return {
      suggestedCourses: [],
      error: 'Please describe your interests in more detail (at least 10 characters).',
    };
  }

  try {
    const result = await getCourseSuggestion({ interests });
    if (!result || !result.suggestedCourses || result.suggestedCourses.length === 0) {
        return {
            suggestedCourses: [],
            error: 'Could not generate suggestions based on your input. Please try being more specific.'
        }
    }
    return {
      suggestedCourses: result.suggestedCourses,
      error: undefined,
    };
  } catch (e) {
    console.error(e);
    return {
      suggestedCourses: [],
      error: 'An unexpected error occurred while getting suggestions. Please try again later.',
    };
  }
}


export async function handleContactForm(formData: FormData): Promise<{success: boolean; message: string}> {
    const email = formData.get('email') as string;
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Please enter a valid email." };
    }

    try {
        console.log('New subscriber:', email);
        // Here you would typically add the email to a database or mailing list service.
        return { success: true, message: "Thanks for subscribing! We'll be in touch." };

    } catch (e) {
        console.error("Failed to save email:", e)
        return { success: false, message: "Something went wrong. Please try again." };
    }
  }
