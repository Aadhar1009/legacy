import { redirect } from 'next/navigation';

export default function Home() {
  // Normally would check auth here, but for now redirect to login
  redirect('/login');
}
