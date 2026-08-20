import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQs)',
  description: 'Find answers to common questions about Slog Solutions\' training programs, corporate consulting, project deliveries, student registrations, and certification support.',
  keywords: [
    'Slog Solutions FAQs',
    'Training registration help',
    'Course eligibility',
    'Certification verification FAQ',
    'Dehradun coding training cost',
  ],
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
