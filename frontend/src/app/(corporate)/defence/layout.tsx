import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Defence IT Solutions & Security Systems',
  description: 'Securing national operations with advanced technology. We build secure software, custom hardware integrations, intelligence dashboards, and training programs tailored for the defence sector.',
  keywords: [
    'Defence IT solutions India',
    'Secure software development',
    'Military grade technology',
    'Defence lab setup',
    'Command and control dashboards',
    'High security IT systems',
  ],
};

export default function DefenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
