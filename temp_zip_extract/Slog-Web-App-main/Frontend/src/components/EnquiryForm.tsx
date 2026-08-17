"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, User, MessageSquare, Send, X, Building2, GraduationCap } from "lucide-react";

export default function EnquiryForm({ triggerButton }: { triggerButton: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("✅ Enquiry submitted successfully!");
      setForm({ name: "", email: "", phone: "", message: "" });
      setOpen(false);
    } else {
      alert("❌ Something went wrong. Please try again!");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Any button can trigger the form */}
      <div onClick={() => setOpen(true)}>{triggerButton}</div>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md md:max-w-lg rounded-lg shadow-xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-bold text-gray-800 text-center">
            Contact Us
          </DialogTitle>
          <p className="text-sm text-gray-500 text-center mt-1">
            Fill out the form below and we'll get back to you soon
          </p>
          <div className="absolute top-0 right-0 hidden sm:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full"
            >
              {/* <X className="h-4 w-4" /> */}
            </Button>
          </div>
        </DialogHeader>
        
        {/* Contact Information Section */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Direct Contact Numbers:</h3>
          
          <div className="space-y-2">
            <div className="flex items-center p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-4 w-4 mr-2 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-gray-700">Government/Corporate/MoD:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <a href="tel:7456000240" className="text-blue-600 hover:text-blue-800">7456000240</a>
                  <a href="tel:7456000241" className="text-blue-600 hover:text-blue-800">7456000241</a>
                </div>

                <div className="flex items-center justify-center p-2 bg-purple-50 rounded-lg">
              <a href="mailto:slogcounsellor@gmail.com" className="flex items-center text-purple-700 text-sm font-medium">
                <Mail className="h-4 w-4 mr-2" />
                slog.doon@gmail.com
              </a>
            </div>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-green-50 rounded-lg">
              <GraduationCap className="h-4 w-4 mr-2 text-green-600" />
              <div className="text-sm">
                <p className="font-medium text-gray-700">Students:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <a href="tel:7456000242" className="text-green-600 hover:text-green-800">7456000242</a>
                  <a href="tel:7456000244" className="text-green-600 hover:text-green-800">7456000244</a>
                </div>


                 <div className="flex items-center justify-center p-2 bg-purple-50 rounded-lg">
              <a href="mailto:slogcounsellor@gmail.com" className="flex items-center text-purple-700 text-sm font-medium">
                <Mail className="h-4 w-4 mr-2" />
                slogcounsellor@gmail.com
              </a>
            </div>
              </div>
            </div>
            
           
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Label htmlFor="name" className="text-gray-700 text-sm font-medium">Full Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="name"
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                className="pl-10 py-2 text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Name"
              />
            </div>
          </div>
          
          <div className="relative">
            <Label htmlFor="email" className="text-gray-700 text-sm font-medium">Email Address</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="email"
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                className="pl-10 py-2 text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="name@example.com"
              />
            </div>
          </div>
          
          <div className="relative">
            <Label htmlFor="phone" className="text-gray-700 text-sm font-medium">Phone Number</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="phone"
                type="tel" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                required 
                className="pl-10 py-2 text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your phone number"
              />
            </div>
          </div>
          
          <div className="relative">
            <Label htmlFor="message" className="text-gray-700 text-sm font-medium">Message</Label>
            <div className="relative mt-1">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <Textarea 
                id="message"
                name="message" 
                value={form.message} 
                onChange={handleChange} 
                className="pl-10 py-2 text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                placeholder="Tell us how we can help you..."
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
        
        <div className="text-xs text-gray-400 text-center mt-3">
          By submitting this form, you agree to our{' '}
          <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
        </div>
      </DialogContent>
    </Dialog>
  );
}