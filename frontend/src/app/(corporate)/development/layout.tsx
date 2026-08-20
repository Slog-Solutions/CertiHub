import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Software & Mobile App Development Services',
  description: 'Professional end-to-end IT services. We build high-performance web applications, iOS/Android mobile apps, custom ERP platforms, and cloud-native solutions.',
  keywords: [
    'Custom software development Dehradun',
    'Mobile app developer Uttarakhand',
    'Web design agency',
    'Cloud-native development',
    'Enterprise ERP software Dehradun',
    'Ecommerce website development',
  ],
};

export default function DevelopmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
