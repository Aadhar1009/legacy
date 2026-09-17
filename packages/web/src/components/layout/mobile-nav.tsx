'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, FileText, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Memory', href: '/memory', icon: Brain },
    { name: 'Docs', href: '/documents', icon: FileText },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'More', href: '/menu', icon: Menu },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={cn(
              "flex flex-col items-center p-2 transition-colors",
              isActive ? "text-primary" : "text-slate-500 hover:text-primary"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </Link>
        )
      })}
    </div>
  );
}
