import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Slog Solutions Portal',
  description: 'Secure Administrative Panel',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
