"use client"

import { useFormStatus } from 'react-dom';
import { useRef } from 'react';
import { handleContactForm } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="rounded-full flex-shrink-0" size="lg">
            {pending ? "Submitting..." : "Let's Go"}
        </Button>
    )
}

export function ContactForm() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    async function action(formData: FormData) {
        const result = await handleContactForm(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
        } else {
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
            });
        }
    }

    return (
        <form ref={formRef} action={action} className="mt-8 max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-4">
            <Input 
                type="email" 
                name="email"
                placeholder="Enter Your Email" 
                required 
                className="h-14 text-base rounded-full px-6 flex-grow"
            />
            <SubmitButton />
        </form>
    );
}
