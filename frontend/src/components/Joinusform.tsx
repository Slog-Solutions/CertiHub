"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function JoinUsForm({ triggerButton }: { triggerButton: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(''); // Clear previous messages
    setIsError(false);

    try {
      const response = await fetch('/api/joinus/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check for a successful response before trying to parse JSON
      if (!response.ok) {
        // If the response is not OK, it might be an HTML error page or a non-JSON response.
        const errorText = await response.text();
        console.error("Server responded with a non-OK status:", response.status, errorText);
        setStatusMessage(`Error: ${response.status}. Please check your API route.`);
        setIsError(true);
        return;
      }
      
      const result = await response.json();

      if (result.message) {
        setStatusMessage(result.message);
        setIsError(false);
        setFormData({ name: '', email: '', phone: '', position: '', message: '' }); // Clear the form
        // Optional: you can close the form automatically after a delay
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        setStatusMessage('Failed to send application.');
        setIsError(true);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      // More specific message for the JSON parsing error
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        setStatusMessage('Failed to connect to the server. Please ensure the API route is correctly set up.');
      } else {
        setStatusMessage('An unexpected error occurred. Please try again.');
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerButton}
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md p-6 bg-gray-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-cyan-500">Join Our Team</SheetTitle>
          <SheetDescription className="text-gray-400">
            Tell us about yourself and what you're interested in. We'll get back to you shortly.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm">Full Name</Label>
            <Input id="name" type="text" placeholder="John Doe" required className="mt-1 bg-gray-800 border-gray-700 text-white" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" required className="mt-1 bg-gray-800 border-gray-700 text-white" value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="+91-1234567890" className="mt-1 bg-gray-800 border-gray-700 text-white" value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="position" className="text-sm">Interested Position (Optional)</Label>
            <Input id="position" type="text" placeholder="e.g., Software Developer, Trainer" className="mt-1 bg-gray-800 border-gray-700 text-white" value={formData.position} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="message" className="text-sm">Your Message or Skills</Label>
            <Textarea id="message" rows={4} placeholder="Describe your skills and why you'd be a great fit." className="mt-1 bg-gray-800 border-gray-700 text-white" value={formData.message} onChange={handleChange} />
          </div>

          {/* Status Message Display */}
          {statusMessage && (
            <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {statusMessage}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg">
            {isLoading ? 'Sending...' : 'Submit Application'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
