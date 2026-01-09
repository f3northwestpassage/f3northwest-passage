import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New to F3? Welcome FNG! | F3 Northwest Passage',
  description: 'First time at F3 Northwest Passage? Learn what to expect at our free men\'s workouts in Cypress, Jersey Village, Bridgeland, and Houston. All fitness levels welcome!',
  keywords: [
    'F3 new member',
    'first F3 workout',
    'F3 FNG',
    'join F3 Cypress',
    'join F3 Houston',
    'what to expect F3',
    'free workout beginner',
    'men\'s fitness beginner',
  ],
  openGraph: {
    title: 'New to F3 Northwest Passage? Welcome!',
    description: 'First time at F3? Learn what to expect at our free men\'s workouts. All fitness levels welcome.',
    type: 'website',
  },
};

export default function FngLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
