import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Hero from '@/components/sections/hero';
import Courses from '@/components/sections/courses';
import WhyChooseUs from '@/components/sections/why-choose-us';
import Partners from '@/components/sections/partners';
import About from '@/components/sections/about';
import Testimonials from '@/components/sections/testimonials';
import AiSuggester from '@/components/sections/ai-suggester';
import Purpose from '@/components/sections/purpose';
import PurposeSection from '@/components/sections/purpose';
import ClientsSection from '@/components/sections/ClientsSection';

export const metadata: Metadata = {
  title: 'Slog Solutions | Best IT Solutions & Training in Dehradun',
  description: 'Empowering businesses and students with state-of-the-art custom software development, mobile app development, Lab setups, and corporate/industrial training in Dehradun.',
  keywords: [
    'Slog Solutions',
    'IT Company Dehradun',
    'Software Development Dehradun',
    'Industrial Training Dehradun',
    'PHP React Python Dehradun',
    'Mobile App Development Uttarakhand',
    'Corporate Consulting India',
  ],
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* <Header /> */}
      <main className="bg-white">
        <Hero />
        {/* <Courses /> */}
        {/* <AiSuggester /> */}
        {/* <WhyChooseUs /> */}
        <Partners />
        <PurposeSection />
        <ClientsSection />
        {/* <About /> */}
        {/*<Testimonials /> */}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
