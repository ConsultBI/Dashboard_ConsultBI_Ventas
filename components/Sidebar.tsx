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

export const navItems = [
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
      "bg-cb-primary text-white h-screen transition-all duration-300 ease-in-out flex flex-col relative sticky top-0 z-50 overflow-hidden hidden lg:flex",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header / Logo */}
      <div className="p-6 flex flex-col items-center gap-6">
        {isCollapsed ? (
          <div className="w-12 h-12 bg-white rounded-full p-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img src="https://consultbi.es/wp-content/uploads/2025/04/Logo-Original-ConsultBI-512-x-512-px.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-full px-2">
            <img
              src="https://consultbi.es/wp-content/uploads/2025/06/Logo-Texto-2000x1000-Blanco.png"
              alt="ConsultBI"
              className="w-full h-auto max-h-16 object-contain"
            />
          </div>
        )}
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

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-cb-secondary/30 flex justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-cb-secondary rounded-lg transition-colors text-cb-gray-medium hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>
    </aside>
  );
}
