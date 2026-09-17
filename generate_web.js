const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, 'packages', 'web');

const files = {
  'package.json': \`{
  "name": "@dukaanos/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@aws-amplify/adapter-nextjs": "^1.2.14",
    "@dukaanos/shared": "workspace:*",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "aws-amplify": "^6.5.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.428.0",
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5",
    "vitest": "^2.0.5"
  }
}\`,
  'tsconfig.json': \`{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@dukaanos/shared": ["../shared/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}\`,
  'next.config.js': \`/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@dukaanos/shared'],
};

module.exports = nextConfig;\`,
  'tailwind.config.ts': \`import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#312e81',
          DEFAULT: '#4f46e5',
        },
        accent: {
          DEFAULT: '#f59e0b',
        },
        success: {
          DEFAULT: '#10b981',
        },
        warning: {
          DEFAULT: '#f59e0b',
        },
        error: {
          DEFAULT: '#f43f5e',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          900: '#0f172a',
          DEFAULT: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;\`,
  'postcss.config.js': \`module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};\`,
  'src/app/globals.css': \`@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-surface-50 text-slate-900;
  }
}\`,
  'src/app/layout.tsx': \`import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DukaanOS - Your business finally remembers',
  description: 'AI-powered business memory platform for Indian local businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}\`,
  'src/app/page.tsx': \`import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}\`,
  'src/lib/amplify-config.ts': \`import { ResourcesConfig } from 'aws-amplify';

export const authConfig: ResourcesConfig['Auth'] = {
  Cognito: {
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
    userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
  },
};\`,
  'src/lib/api-client.ts': \`import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \\\`Bearer \\\${token}\\\` } : {}),
      ...options.headers,
    };

    const response = await fetch(\\\`\\\${API_URL}\\\${endpoint}\\\`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error('API Request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const apiClient = {
  getStats: () => fetchWithAuth('/stats'),
};\`,
  'src/lib/utils.ts': \`import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}\`,
  'src/components/ui/button.tsx': \`import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-600',
      secondary: 'bg-surface-100 text-slate-900 hover:bg-surface-200',
      outline: 'border border-slate-300 bg-transparent hover:bg-slate-50',
      ghost: 'bg-transparent hover:bg-slate-50',
      destructive: 'bg-error text-white hover:bg-rose-600',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';\`,
  'src/components/ui/input.tsx': \`import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus:ring-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';\`,
  'src/components/ui/badge.tsx': \`import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'status' | 'severity' | 'confidence';
  status?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

export function Badge({ className, variant = 'default', status, ...props }: BadgeProps) {
  let statusClasses = 'bg-slate-100 text-slate-800';
  
  if (status === 'HIGH') statusClasses = 'bg-success/10 text-success';
  if (status === 'MEDIUM') statusClasses = 'bg-warning/10 text-warning';
  if (status === 'LOW') statusClasses = 'bg-error/10 text-error';
  if (status === 'UNKNOWN') statusClasses = 'bg-slate-100 text-slate-500';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        statusClasses,
        className
      )}
      {...props}
    />
  );
}\`,
  'src/components/ui/card.tsx': \`import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border bg-card text-card-foreground shadow-sm bg-white', className)} {...props} />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-slate-500', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };\`,
  'src/components/ui/loading.tsx': \`import * as React from 'react';
import { Loader2 } from 'lucide-react';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={\\\`animate-pulse rounded-md bg-slate-200 \\\${className}\\\`} {...props} />;
}

export function FullPageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function InlineLoading() {
  return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
}\`,
  'src/components/ui/empty-state.tsx': \`import * as React from 'react';
import { ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon: ReactNode, title: string, description: string, action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-white shadow-sm h-64">
      <div className="mb-4 text-slate-400">{icon}</div>
      <h3 className="mb-1 text-lg font-medium text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}\`,
  'src/components/ui/error-state.tsx': \`import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

export function ErrorState({ title, description, onRetry }: { title: string, description: string, onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-white shadow-sm h-64">
      <AlertCircle className="mb-4 h-10 w-10 text-error" />
      <h3 className="mb-1 text-lg font-medium text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try Again</Button>}
    </div>
  );
}\`,
  'src/components/business/evidence-card.tsx': \`import * as React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatDate } from '@/lib/utils';
import { FileText } from 'lucide-react';

export function EvidenceCard({ source, page, excerpt, date, confidence }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center text-sm font-medium text-primary">
            <FileText className="w-4 h-4 mr-1" /> {source} (Page {page})
          </div>
          <Badge status={confidence}>{confidence}</Badge>
        </div>
        <p className="text-sm text-slate-700 italic border-l-2 border-slate-200 pl-3 mb-2">"{excerpt}"</p>
        <div className="text-xs text-slate-500 text-right">{formatDate(date)}</div>
      </CardContent>
    </Card>
  );
}\`,
  'src/components/business/confidence-badge.tsx': \`import * as React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export function ConfidenceBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN' }) {
  const iconMap = {
    HIGH: <CheckCircle2 className="w-3 h-3 mr-1 text-success" />,
    MEDIUM: <AlertTriangle className="w-3 h-3 mr-1 text-warning" />,
    LOW: <AlertCircle className="w-3 h-3 mr-1 text-error" />,
    UNKNOWN: <HelpCircle className="w-3 h-3 mr-1 text-slate-500" />
  };

  return (
    <Badge status={level} className="flex items-center">
      {iconMap[level]}
      {level} Confidence
    </Badge>
  );
}\`,
  'src/components/business/timeline.tsx': \`import * as React from 'react';

export function Timeline({ events }: { events: any[] }) {
  return (
    <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-4">
      {events.map((event, idx) => (
        <div key={idx} className="relative pl-6">
          <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white" />
          <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
          <time className="block mb-2 text-xs font-normal leading-none text-slate-400">{event.date}</time>
          <p className="text-sm font-normal text-slate-500">{event.description}</p>
        </div>
      ))}
    </div>
  );
}\`,
  'src/components/business/source-citation.tsx': \`import * as React from 'react';
import { FileText } from 'lucide-react';

export function SourceCitation({ documentName, onClick }: { documentName: string, onClick?: () => void }) {
  return (
    <span 
      onClick={onClick}
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors mx-1"
    >
      <FileText className="w-3 h-3 mr-1" />
      {documentName}
    </span>
  );
}\`,
  'src/components/layout/sidebar.tsx': \`import * as React from 'react';
import Link from 'next/link';
import { Home, Brain, Users, ShoppingBag, FileText, Bell, CheckSquare, Settings } from 'lucide-react';

export function Sidebar() {
  const links = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Business Memory', href: '/memory', icon: Brain },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Suppliers', href: '/suppliers', icon: Users },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-primary">DukaanOS</h1>
        <p className="text-sm text-slate-500 mt-1">Sharma Digital House</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.name} href={link.href} className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:text-primary hover:bg-slate-50">
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}\`,
  'src/components/layout/app-shell.tsx': \`import * as React from 'react';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}\`,
  'src/components/layout/mobile-nav.tsx': \`import * as React from 'react';
import Link from 'next/link';
import { Home, Brain, FileText, Bell, Menu } from 'lucide-react';

export function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2">
      <Link href="/dashboard" className="flex flex-col items-center p-2 text-slate-500 hover:text-primary">
        <Home className="h-6 w-6" />
        <span className="text-[10px] mt-1">Home</span>
      </Link>
      <Link href="/memory" className="flex flex-col items-center p-2 text-slate-500 hover:text-primary">
        <Brain className="h-6 w-6" />
        <span className="text-[10px] mt-1">Memory</span>
      </Link>
      <Link href="/documents" className="flex flex-col items-center p-2 text-slate-500 hover:text-primary">
        <FileText className="h-6 w-6" />
        <span className="text-[10px] mt-1">Docs</span>
      </Link>
      <Link href="/alerts" className="flex flex-col items-center p-2 text-slate-500 hover:text-primary">
        <Bell className="h-6 w-6" />
        <span className="text-[10px] mt-1">Alerts</span>
      </Link>
      <Link href="/menu" className="flex flex-col items-center p-2 text-slate-500 hover:text-primary">
        <Menu className="h-6 w-6" />
        <span className="text-[10px] mt-1">More</span>
      </Link>
    </div>
  );
}\`,
  'src/app/(auth)/login/page.tsx': \`'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
  );
}\`,
  'src/app/(auth)/signup/page.tsx': \`'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/login');
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" className="w-full">Sign Up</Button>
    </form>
  );
}\`,
  'src/app/(auth)/layout.tsx': \`export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">DukaanOS</h1>
          <p className="text-slate-500 mt-2">Your business finally remembers</p>
        </div>
        {children}
      </div>
    </div>
  );
}\`,
  'src/app/(dashboard)/layout.tsx': \`import { AppShell } from '@/components/layout/app-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}\`,
  'src/app/(dashboard)/dashboard/page.tsx': \`import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">1,248</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">42</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Documents Indexed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">3,891</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Important Alerts</h2>
          <Card className="border-l-4 border-l-error">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-slate-900">Warranty Expiring Soon</h4>
                <p className="text-sm text-slate-500">Samsung TV Batch #4992 warranty expires in 5 days</p>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/documents" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-slate-200 hover:border-primary hover:text-primary transition-colors text-center">
              <UploadCloud className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Upload Document</span>
            </Link>
            <Link href="/memory" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-slate-200 hover:border-primary hover:text-primary transition-colors text-center">
              <MessageSquare className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Ask Memory</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}\`,
  'src/app/(dashboard)/memory/page.tsx': \`import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EvidenceCard } from '@/components/business/evidence-card';
import { ConfidenceBadge } from '@/components/business/confidence-badge';
import { Search } from 'lucide-react';

export default function Memory() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-10">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Ask DukaanOS</h1>
        <p className="text-slate-500">Search through invoices, warranties, supplier terms and more.</p>
      </div>

      <div className="relative shadow-sm rounded-lg">
        <Input className="pl-12 h-14 text-lg" placeholder="Ask anything about your business..." />
        <Search className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-slate-500 mt-1 mr-2">Suggestions:</span>
        <Button variant="outline" size="sm" className="rounded-full">What did we pay Sharma last time?</Button>
        <Button variant="outline" size="sm" className="rounded-full">Which warranties expire this month?</Button>
      </div>
      
      <div className="mt-12 p-6 bg-white border rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg">Answer</h3>
          <ConfidenceBadge level="HIGH" />
        </div>
        <p className="text-slate-700 leading-relaxed">
          The lowest price you have recorded for a Samsung 55" Smart TV is ₹36,000 from <strong className="text-primary cursor-pointer hover:underline">Sharma Electronics</strong> on Oct 12, 2023.
        </p>
        
        <h4 className="mt-6 mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Evidence</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <EvidenceCard source="Invoice #4992" page="1" excerpt="Samsung 55 inch Smart TV - Qty 10 @ ₹36,000 each" date="2023-10-12" confidence="HIGH" />
        </div>
      </div>
    </div>
  );
}\`,
  'src/app/(dashboard)/documents/page.tsx': \`import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, FileText } from 'lucide-react';

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <Button><UploadCloud className="w-4 h-4 mr-2" /> Upload</Button>
      </div>
      
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center bg-white">
        <UploadCloud className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Drag & drop files here</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">Supports PDF, JPG, PNG, CSV, XLSX up to 10MB</p>
        <Button variant="outline">Browse Files</Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Document Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Upload Date</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-slate-50">
              <td className="px-6 py-4 font-medium flex items-center"><FileText className="w-4 h-4 mr-2 text-slate-400"/> invoice_sharma_oct.pdf</td>
              <td className="px-6 py-4"><Badge variant="outline">Invoice</Badge></td>
              <td className="px-6 py-4">Oct 12, 2023</td>
              <td className="px-6 py-4"><Badge status="HIGH">Processed</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}\`,
  'src/app/(dashboard)/documents/[id]/page.tsx': \`export default function DocumentDetail({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 h-[80vh]">
      <div className="w-full md:w-1/2 bg-slate-200 rounded-lg flex items-center justify-center">
        <p className="text-slate-500">Document Preview</p>
      </div>
      <div className="w-full md:w-1/2 bg-white rounded-lg border p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Extracted Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Supplier Name</label>
            <div className="mt-1 p-2 border rounded-md bg-slate-50">Sharma Electronics</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Total Amount</label>
            <div className="mt-1 p-2 border rounded-md bg-slate-50">₹360,000</div>
          </div>
        </div>
      </div>
    </div>
  );
}\`,
  'src/app/(dashboard)/suppliers/page.tsx': \`import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <Input className="pl-10" placeholder="Search suppliers..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map((i) => (
          <Link key={i} href={\`/suppliers/\${i}\`} className="block">
            <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-1">Sharma Electronics</h3>
              <p className="text-sm text-slate-500 mb-4">Last purchase: 2 weeks ago</p>
              <div className="text-sm font-medium">Total Spend: ₹12,50,000</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}\`,
  'src/app/(dashboard)/suppliers/[id]/page.tsx': \`import { Timeline } from '@/components/business/timeline';
import { Card, CardContent } from '@/components/ui/card';

export default function SupplierDetail({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-slate-900">Sharma Electronics</h1>
        <p className="text-slate-500 mt-1">Contact: Rajesh Sharma • +91 98765 43210</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Interaction Timeline</h2>
              <Timeline events={[
                { title: 'Invoice #4992 Uploaded', date: 'Oct 12, 2023', description: 'Bought 10 Samsung TVs' },
                { title: 'Price Inquiry', date: 'Sep 05, 2023', description: 'Asked about LG ACs' }
              ]} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500">Total Spend</div>
                  <div className="text-xl font-semibold">₹12,50,000</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Active Warranties</div>
                  <div className="text-xl font-semibold">14 items</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}\`,
  'src/app/(dashboard)/alerts/page.tsx': \`import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Alerts() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
      
      <div className="space-y-4">
        <Card className="border-l-4 border-l-error">
          <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">Warranty Expiring Soon</h3>
                <Badge status="LOW">High Priority</Badge>
              </div>
              <p className="text-slate-600 mb-2">Samsung TV Batch #4992 warranty expires in 5 days.</p>
              <p className="text-sm text-slate-500">Source: Invoice #4992</p>
            </div>
            <Button>Acknowledge</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}\`
};

function ensureDir(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

for (const [file, content] of Object.entries(files)) {
  const fullPath = path.join(webDir, file);
  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content);
  console.log(\`Created \${file}\`);
}
