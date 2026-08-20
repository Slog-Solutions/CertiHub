import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Student Training & Experience Certificate',
  description: 'Authenticity checking portal. Verify the validity of training certificates, industrial letters, and experience credentials issued by Slog Solutions Pvt. Ltd.',
  keywords: [
    'Verify certificate online',
    'Certificate validation portal',
    'Slog Solutions verification',
    'Student experience letter verify',
    'Verify training credentials Dehradun',
  ],
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
