import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional IT Courses & Syllabus',
  description: 'Explore our industry-focused technical courses. Get comprehensive training in Web Dev, Python, Java, Cloud, and AI with hands-on practice, certificate programs, and internship opportunities.',
  keywords: [
    'IT courses Dehradun',
    'Java programming course',
    'Python syllabus',
    'Web Development training',
    'React JS classes',
    'Mobile application development course',
    'Best coding bootcamp Dehradun',
  ],
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
