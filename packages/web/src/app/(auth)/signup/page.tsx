'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Create an Account</h1>
        <p className="text-slate-500 mt-2">Join DukaanOS today</p>
      </div>
      <form onSubmit={handleSignUp} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <Button type="submit" className="w-full" isLoading={isLoading}>Sign Up</Button>
      </form>
      <div className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </div>
    </div>
  );
}
