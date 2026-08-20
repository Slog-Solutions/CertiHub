import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Core Tech Mentors & Experts',
  description: 'Meet the expert team of senior software engineers, researchers, and corporate trainers guiding students and enterprise teams at Slog Solutions.',
  keywords: [
    'Tech mentors Dehradun',
    'Coding instructors Dehradun',
    'Corporate trainers Uttarakhand',
    'Industry experts software',
    'Slog Solutions mentors list',
  ],
};

export default function MentorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
