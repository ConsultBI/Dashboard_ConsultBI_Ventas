"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Menu, X } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';
import FilterBar from '@/components/FilterBar';
import { navItems } from './Sidebar';

const pageTitles: Record<string, string> = {
    '/': 'Dashboard Principal',
    '/ventas': 'Análisis de Ventas',
    '/clientes': 'Análisis de Clientes',
    '/productos': 'Análisis de Productos',
    '/insights': 'Insights IA',
};

export default function Header() {
    const pathname = usePathname();
    const title = pageTitles[pathname] || 'Dashboard';
    const { lastUpdate, isLoading, setIsLoading, setLastUpdate } = useDashboardStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleRefresh = async () => {
        setIsLoading(true);
        setTimeout(() => {
            setLastUpdate(new Date().toLocaleString());
            setIsLoading(false);
        }, 1000);
    };

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden bg-cb-primary px-4 py-3 relative z-[60] flex items-center justify-between shadow-md">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white p-2 hover:bg-cb-secondary rounded-lg transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex-1 flex justify-center">
                    <img
                        src="https://consultbi.es/wp-content/uploads/2025/06/Logo-Texto-2000x1000-Blanco.png"
                        alt="ConsultBI"
                        className="h-8 object-contain"
                    />
                </div>
                <div className="w-10"></div> {/* Spacer for symmetry */}
            </header>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-cb-primary z-50 pt-20 animate-in fade-in slide-in-from-left duration-300">
                    <nav className="px-6 space-y-4">
                        {navItems.map((item: any) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center p-4 rounded-xl transition-all ${isActive ? 'bg-cb-secondary text-white' : 'text-cb-gray-medium'
                                        }`}
                                >
                                    <Icon size={24} className="mr-4" />
                                    <span className="text-lg font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* Desktop Header & Filters (Not fixed on mobile scroll) */}
            <div className="bg-white border-b border-cb-gray-light px-4 md:px-8 py-4 lg:sticky lg:top-0 z-10 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="hidden lg:block">
                        <h1 className="text-2xl font-bold text-cb-primary">{title}</h1>
                        <p className="text-xs text-cb-gray-medium mt-1">Última actualización: {lastUpdate}</p>
                    </div>

                    {/* Mobile Title */}
                    <div className="lg:hidden text-center mb-2">
                        <h1 className="text-xl font-bold text-cb-primary">{title}</h1>
                        <p className="text-[10px] text-cb-gray-medium mt-0.5">Act: {lastUpdate}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                            <FilterBar />
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="w-full sm:w-auto flex items-center justify-center bg-cb-primary text-white px-4 py-2.5 rounded-cb hover:bg-cb-tertiary transition-all disabled:opacity-50 text-sm font-semibold"
                        >
                            <RefreshCw size={18} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
                            <span>Actualizar</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
