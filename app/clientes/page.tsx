"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie
} from 'recharts';
import { Users, UserCheck, Map as MapIcon, Star, ArrowUpDown } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';
import { getClientesRecurrentes } from '@/lib/analytics';
import KPICard from '@/components/KPICard';

const COLORS = ['#1E2A45', '#3E5D8F', '#6A8CAF', '#A0A4AB'];

export default function CustomersPage() {
    const { data, isLoading } = useData();

    const [countrySortOrder, setCountrySortOrder] = React.useState<'asc' | 'desc'>('desc');

    const metrics = useMemo(() => {
        if (!data) return null;
        // Unique clients should be based on the Clientes table or unique IDs in Pedidos
        const unique = data.clientes.length;
        const recurrentes = getClientesRecurrentes(data.pedidos, data.clientes);
        const countries = new Set(data.clientes.map(c => c.Pais).filter(Boolean)).size;

        return {
            unique,
            recurrentes: recurrentes.length,
            recurrenceRate: unique > 0 ? ((recurrentes.length / unique) * 100).toFixed(1) : 0,
            countries
        };
    }, [data]);

    const topCountries = useMemo(() => {
        if (!data) return [];
        const counts: Record<string, number> = {};
        data.clientes.forEach(c => {
            if (c.Pais) counts[c.Pais] = (counts[c.Pais] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => countrySortOrder === 'desc' ? b.value - a.value : a.value - b.value)
            .slice(0, 10);
    }, [data, countrySortOrder]);

    const recurrentList = useMemo(() => {
        if (!data) return [];
        return getClientesRecurrentes(data.pedidos, data.clientes)
            .sort((a, b) => b.pedidos - a.pedidos)
            .slice(0, 50); // Show more VIPs if available
    }, [data]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium animate-pulse">Cargando...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <KPICard
                    title="Total Clientes Únicos"
                    value={metrics?.unique || 0}
                    icon={<Users size={20} />}
                    subtitle="Registrados en la base"
                />
                <KPICard
                    title="Clientes Recurrentes"
                    value={metrics?.recurrentes || 0}
                    icon={<UserCheck size={20} />}
                    subtitle="Con 2 o más compras"
                />
                <KPICard
                    title="Tasa Recurrencia"
                    value={metrics?.recurrenceRate || 0}
                    suffix="%"
                    icon={<Star size={20} />}
                    subtitle="Fidelización total"
                />
                <KPICard
                    title="Países Alcanzados"
                    value={metrics?.countries || 0}
                    icon={<MapIcon size={20} />}
                    subtitle="Presencia global"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Geographic Distribution */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <MapIcon size={20} className="text-cb-secondary" />
                            Distribución por País
                        </h3>
                        <button
                            onClick={() => setCountrySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="p-1.5 hover:bg-cb-gray-light rounded-lg transition-colors text-cb-gray-medium hover:text-cb-primary"
                            title="Cambiar orden"
                        >
                            <ArrowUpDown size={16} />
                        </button>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCountries} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F1F1" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#1E2A45', fontSize: 12 }}
                                />
                                <Tooltip cursor={{ fill: '#F5F6F8' }} contentStyle={{ borderRadius: '14px', border: 'none' }} />
                                <Bar dataKey="value" fill="#3E5D8F" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recurrent Customers List */}
                <div className="card flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <UserCheck size={20} className="text-cb-secondary" />
                        Clientes VIP (Recurrentes)
                    </h3>
                    <div className="flex-1 overflow-auto max-h-[350px] scrollbar-thin">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-cb-gray-light text-cb-primary font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">País</th>
                                    <th className="px-4 py-3 text-center">Pedidos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cb-gray-light">
                                {recurrentList.length > 0 ? recurrentList.map((item: any, i) => (
                                    <tr key={i} className="hover:bg-cb-gray-light/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-cb-primary">{item.cliente?.Nombre_Apellidos || 'Anónimo'}</p>
                                            <p className="text-[10px] text-cb-gray-medium">{item.cliente?.Email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-cb-gray-medium">{item.cliente?.Pais || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-cb-primary text-white rounded-full text-[10px] font-bold">
                                                {item.pedidos}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-10 text-center text-cb-gray-medium">
                                            No se han detectado clientes recurrentes
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
