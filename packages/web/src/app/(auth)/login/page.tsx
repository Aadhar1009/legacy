'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login for offline demo
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary">DukaanOS</h1>
        <p className="text-slate-500 mt-2">Your business finally remembers</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" isLoading={isLoading}>Sign In (Offline Demo)</Button>
      </form>
      <div className="mt-6 text-center text-sm text-slate-500">
        Don't have an account? <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
      </div>
    </div>
  );
}
