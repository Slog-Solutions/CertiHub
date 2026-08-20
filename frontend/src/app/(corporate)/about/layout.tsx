import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Technology & Training Company',
  description: 'About Slog Solutions Pvt. Ltd. - India\'s leading technology and training provider. Discover our collaborative centers, ISO certifications, and award-winning projects.',
  keywords: [
    'About Slog Solutions',
    'Slog Solutions Dehradun',
    'IT Company Uttarakhand',
    'ISO Certified Training Dehradun',
    'Quality Innovation Award',
    'Tech Collaborative Centers India',
  ],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
