"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';
import FilterBar from '@/components/FilterBar';

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

    const handleRefresh = async () => {
        setIsLoading(true);
        // In a real app, this would trigger a SWR revalidate or similar
        setTimeout(() => {
            setLastUpdate(new Date().toLocaleString());
            setIsLoading(false);
        }, 1000);
    };

    return (
        <header className="bg-white border-b border-cb-gray-light px-8 py-4 sticky top-0 z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-cb-primary">{title}</h1>
                    <p className="text-xs text-cb-gray-medium mt-1">Última actualización: {lastUpdate}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <FilterBar />

                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center bg-cb-primary text-white px-4 py-2 rounded-cb hover:bg-cb-tertiary transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
