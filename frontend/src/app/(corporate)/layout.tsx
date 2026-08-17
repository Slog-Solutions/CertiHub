import type { Metadata } from 'next';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import NextTopLoader from 'nextjs-toploader';
// In your layout.jsx or _app.jsx

export const metadata: Metadata = {
  title: {
    default: 'Slog Solutions | IT Solutions, Corporate & Industrial Training in Dehradun',
    template: '%s | Slog Solutions',
  },
  description: 'Slog Solutions Pvt. Ltd. is Dehradun\'s leading technology and training company offering custom software development, professional development, and corporate/industrial training programs.',
  keywords: [
    'Slog Solutions',
    'Slog Solutions Dehradun',
    'Software Development Company Dehradun',
    'IT Solutions Uttarakhand',
    'Corporate Training Dehradun',
    'Industrial Training Dehradun',
    'Web Development Course',
    'Mobile App Development Dehradun',
    'Lab Setup Services',
    'Defence IT Solutions India',
    'Student Certification Programs',
    'Best IT Training Institute Dehradun',
    'ISO Certified IT Company Dehradun',
    'AI Solutions',
    'Cloud-native Development',
  ],
  authors: [{ name: 'Slog Solutions Pvt. Ltd.', url: 'https://slogsolutions.com' }],
  creator: 'Slog Solutions Pvt. Ltd.',
  publisher: 'Slog Solutions Pvt. Ltd.',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://slogsolutions.com',
    siteName: 'Slog Solutions',
    title: 'Slog Solutions | IT Solutions, Corporate & Industrial Training',
    description: 'Empowering businesses, institutions, and individuals with innovative IT solutions, corporate training, and advanced technology services from Dehradun, Uttarakhand.',
    images: [
      {
        url: 'https://slogsolutions.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Slog Solutions - IT Solutions & Corporate Training',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slog Solutions | IT Solutions, Corporate & Industrial Training',
    description: 'Empowering businesses, institutions, and individuals with innovative IT solutions, corporate training, and advanced technology services.',
    images: ['https://slogsolutions.com/og-image.jpg'],
    creator: '@SlogSolutions',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Quicksand:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="font-body antialiased">
        <NextTopLoader
          color="#2563EB" 
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563EB,0 0 5px #2563EB"
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
