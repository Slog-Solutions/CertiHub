import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Outbound Corporate Training & Team Building',
  description: 'Energize your workforce with our custom outbound training programs. We offer team building activities, leadership retreats, and corporate upskilling workshops.',
  keywords: [
    'Outbound training corporate',
    'Team building Dehradun',
    'Leadership development retreat',
    'Employee upskilling workshops',
    'Corporate outbound activities Uttarakhand',
  ],
};

export default function OutboundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
