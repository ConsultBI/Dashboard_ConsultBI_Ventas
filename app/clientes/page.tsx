"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie
} from 'recharts';
import { Users, UserCheck, Map as MapIcon, Star } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';
import { getClientesRecurrentes } from '@/lib/analytics';
import KPICard from '@/components/KPICard';

const COLORS = ['#1E2A45', '#3E5D8F', '#6A8CAF', '#A0A4AB'];

export default function CustomersPage() {
    const { data, isLoading } = useData();

    const metrics = useMemo(() => {
        if (!data) return null;
        const unique = new Set(data.pedidos.map(p => p.ID_Cliente)).size;
        const recurrentes = getClientesRecurrentes(data.pedidos, data.clientes);
        const countries = new Set(data.clientes.map(c => c.Pais)).size;

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
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [data]);

    const recurrentList = useMemo(() => {
        if (!data) return [];
        return getClientesRecurrentes(data.pedidos, data.clientes)
            .sort((a, b) => b.pedidos - a.pedidos);
    }, [data]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium">Cargando...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Clientes Únicos"
                    value={metrics?.unique || 0}
                    icon={<Users size={20} />}
                />
                <KPICard
                    title="Clientes Recurrentes"
                    value={metrics?.recurrentes || 0}
                    icon={<UserCheck size={20} />}
                    subtitle="Con 2 o más pedidos"
                />
                <KPICard
                    title="Tasa Recurrencia"
                    value={metrics?.recurrenceRate || 0}
                    suffix="%"
                    icon={<Star size={20} />}
                />
                <KPICard
                    title="Países Alcanzados"
                    value={metrics?.countries || 0}
                    icon={<MapIcon size={20} />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Geographic Distribution */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <MapIcon size={20} className="text-cb-secondary" />
                        Distribución por País
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCountries} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3E5D8F" radius={[0, 4, 4, 0]} />
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
                    <div className="flex-1 overflow-auto max-h-[350px]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-cb-gray-light text-cb-primary font-bold sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">País</th>
                                    <th className="px-4 py-3 text-center">Pedidos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cb-gray-light">
                                {recurrentList.map((item, i) => (
                                    <tr key={i} className="hover:bg-cb-gray-light/30">
                                        <td className="px-4 py-3 font-medium">{item.cliente?.Nombre_Apellidos}</td>
                                        <td className="px-4 py-3">{item.cliente?.Pais}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-0.5 bg-cb-primary text-white rounded-full text-xs font-bold">
                                                {item.pedidos}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
