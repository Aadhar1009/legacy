'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, Users, ShoppingBag, FileText, Bell, CheckSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
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
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-primary">DukaanOS</h1>
        <p className="text-sm text-slate-500 mt-1">Sharma Digital House</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link 
              key={link.name} 
              href={link.href} 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "text-primary bg-primary-50" : "text-slate-700 hover:text-primary hover:bg-slate-50"
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
