import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Training & Summer Internship Programs',
  description: 'Boost your IT career with live project training and internship opportunities. Learn from senior developers and earn certified training credentials.',
  keywords: [
    'Industrial training Dehradun',
    'Summer Internship Dehradun',
    '6 months IT training',
    'Student live project training',
    'Web development internship Dehradun',
    'PHP Python React internship',
  ],
};

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
