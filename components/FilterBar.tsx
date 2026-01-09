"use client";

import React from 'react';
import { useDashboardStore } from '@/lib/store';
import { Calendar, Layers, Monitor } from 'lucide-react';

export default function FilterBar() {
    const { filters, setFilters } = useDashboardStore();

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Date Range */}
            <div className="flex items-center bg-cb-gray-light rounded-cb px-3 py-2 border border-cb-gray-medium/20 text-sm">
                <Calendar size={16} className="text-cb-primary mr-2" />
                <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ dateRange: e.target.value as any })}
                    className="bg-transparent outline-none text-cb-primary font-medium cursor-pointer"
                >
                    <option value="ultimo_mes">Último Mes</option>
                    <option value="ultimos_3_meses">Últimos 3 Meses</option>
                    <option value="ultimos_6_meses">Últimos 6 Meses</option>
                    <option value="year">Año Actual</option>
                    <option value="all">Todo</option>
                </select>
            </div>

            {/* Version */}
            <div className="flex items-center bg-cb-gray-light rounded-cb px-3 py-2 border border-cb-gray-medium/20 text-sm">
                <Layers size={16} className="text-cb-primary mr-2" />
                <select
                    value={filters.version}
                    onChange={(e) => setFilters({ version: e.target.value as any })}
                    className="bg-transparent outline-none text-cb-primary font-medium cursor-pointer"
                >
                    <option value="todas">Todas las Versiones</option>
                    <option value="gratuita">Gratuita</option>
                    <option value="avanzada">Avanzada</option>
                </select>
            </div>

            {/* Device */}
            <div className="flex items-center bg-cb-gray-light rounded-cb px-3 py-2 border border-cb-gray-medium/20 text-sm">
                <Monitor size={16} className="text-cb-primary mr-2" />
                <select
                    value={filters.dispositivo}
                    onChange={(e) => setFilters({ dispositivo: e.target.value as any })}
                    className="bg-transparent outline-none text-cb-primary font-medium cursor-pointer"
                >
                    <option value="todos">Todos los Dispositivos</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                </select>
            </div>
        </div>
    );
}
