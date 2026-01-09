"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ventas', href: '/ventas', icon: BarChart3 },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Insights IA', href: '/insights', icon: Sparkles },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={cn(
      "bg-cb-primary text-white h-screen transition-all duration-300 ease-in-out flex flex-col relative sticky top-0",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header / Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg p-1 flex-shrink-0 overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {!isCollapsed && <span className="font-spartan text-xl font-bold tracking-tight">ConsultBI</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 hover:bg-cb-secondary rounded-lg transition-colors",
            !isCollapsed && "ml-auto"
          )}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center p-3 rounded-cb transition-all duration-200 group",
                isActive ? "bg-cb-secondary text-white" : "text-cb-gray-medium hover:bg-cb-secondary/50 hover:text-white",
                isCollapsed && "justify-center"
              )}
            >
              <Icon size={22} className={cn(isActive ? "text-white" : "text-cb-gray-medium group-hover:text-white")} />
              {!isCollapsed && (
                <span className="ml-3 font-medium text-sm">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cb-secondary/30">
        {!isCollapsed && (
          <div className="text-xs text-cb-gray-medium text-center">
            v1.0.0 © ConsultBI
          </div>
        )}
      </div>
    </aside>
  );
}
