"use client";

import { useState } from "react";
import { handleCourseSuggestion } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Lightbulb, AlertTriangle, Loader2, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AiSuggester() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions([]);

    const formData = new FormData(event.currentTarget);
    try {
        const result = await handleCourseSuggestion(formData);
        if (result.error) {
            setError(result.error);
        } else if (result.suggestedCourses) {
            setSuggestions(result.suggestedCourses);
        }
    } catch (e) {
        toast({
            title: "Something went wrong",
            description: "Failed to get suggestions. Please try again later.",
            variant: "destructive"
        })
    }


    setLoading(false);
  };

  return (
    <section id="ai-suggester" className="py-20 md:py-28 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4">
                Need Help Choosing?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Describe your interests and our AI will suggest the perfect courses for you!
            </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-body">
                    <Lightbulb />
                    Your Personal Course Suggester
                </CardTitle>
                <CardDescription>
                    For example: "I'm interested in building websites, mobile apps, and data science."
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid w-full gap-4">
                        <Textarea name="interests" placeholder="Tell us what you're passionate about..." rows={4} required minLength={10} />
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {loading ? 'Analyzing...' : 'Get Suggestions'}
                        </Button>
                    </div>
                </form>

                {error && (
                    <Alert variant="destructive" className="mt-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {suggestions.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><List /> Suggested Courses:</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {suggestions.map((course, index) => (
                                <li key={index}>{course}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
        
      </div>
    </section>
  );
}
