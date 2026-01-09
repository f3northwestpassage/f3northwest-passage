import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact F3 Northwest Passage | Get in Touch',
  description: 'Contact F3 Northwest Passage for questions about free men\'s workouts in Cypress, Jersey Village, Bridgeland, and Houston, TX. Join our fitness community today.',
  keywords: [
    'contact F3 Northwest',
    'F3 Northwest Passage contact',
    'join F3 Cypress',
    'join F3 Houston',
    'F3 Jersey Village contact',
    'F3 Bridgeland contact',
    'free workout contact',
    'Houston fitness contact',
  ],
  openGraph: {
    title: 'Contact F3 Northwest Passage',
    description: 'Get in touch with F3 Northwest Passage. Questions about free workouts in Cypress, Jersey Village, or Houston? We\'d love to hear from you.',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
