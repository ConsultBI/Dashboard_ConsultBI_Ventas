"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';
import { Share2, MousePointer2, FileText, Mail } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';
import { useDashboardStore } from '@/lib/store';
import { filterData } from '@/lib/analytics';

const COLORS = ['#1E2A45', '#3E5D8F', '#6A8CAF', '#A0A4AB'];

export default function SalesPage() {
    const { data, isLoading } = useData();
    const { filters } = useDashboardStore();

    const filteredOrders = useMemo(() => {
        if (!data?.pedidos) return [];
        return filterData(data.pedidos, filters);
    }, [data, filters]);

    // Table Data
    const originStats = useMemo(() => {
        const origins: Record<string, any> = {};
        filteredOrders.forEach(order => {
            const src = order.Origen || 'Directo';
            if (!origins[src]) origins[src] = { name: src, orders: 0, newsletter: 0, pages: 0, mobile: 0 };
            origins[src].orders++;
            if (order.Newsletter === 'SI') origins[src].newsletter++;
            origins[src].pages += (order.Paginas_Sesion || 0);
            if (order.Tipo_Dispositivo === 'Mobile') origins[src].mobile++;
        });

        return Object.values(origins).map(o => ({
            ...o,
            newsletterRate: ((o.newsletter / o.orders) * 100).toFixed(1),
            avgPages: (o.pages / o.orders).toFixed(1),
            pctTotal: ((o.orders / filteredOrders.length) * 100).toFixed(1)
        })).sort((a, b) => b.orders - a.orders);
    }, [filteredOrders]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium">Cargando...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Section 1: Traffic Sources */}
            <div className="card overflow-hidden">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Share2 size={20} className="text-cb-secondary" />
                    Tabla Detallada de Orígenes
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-cb-gray-light text-cb-primary text-sm uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Origen</th>
                                <th className="px-6 py-4">Pedidos</th>
                                <th className="px-6 py-4">% Total</th>
                                <th className="px-6 py-4">Conv. Newsletter</th>
                                <th className="px-6 py-4">Págs. Promedio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cb-gray-light">
                            {originStats.map((stat, i) => (
                                <tr key={stat.name} className="hover:bg-cb-gray-light/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-cb-primary">{stat.name}</td>
                                    <td className="px-6 py-4">{stat.orders}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-cb-gray-light rounded-full overflow-hidden">
                                                <div className="h-full bg-cb-primary" style={{ width: `${stat.pctTotal}%` }} />
                                            </div>
                                            <span className="text-xs">{stat.pctTotal}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                            {stat.newsletterRate}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{stat.avgPages}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pages per Session */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <MousePointer2 size={20} className="text-cb-secondary" />
                        Págs. por Sesión (Distribución)
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={originStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="avgPages" fill="#1E2A45" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Newsletter Subscription rate */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Mail size={20} className="text-cb-secondary" />
                        Tasa de Suscripción a Newsletter
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={originStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                                <Tooltip />
                                <Bar dataKey="newsletterRate" fill="#6A8CAF" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Temporal Analysis (Dummy) */}
            <div className="card">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-cb-secondary" />
                    Rendimiento Temporal por Día
                </h3>
                <div className="h-[250px] flex items-center justify-center text-cb-gray-medium bg-cb-gray-light rounded-cb">
                    Gráfico de barras por día de la semana (Lunes - Domingo)
                </div>
            </div>
        </div>
    );
}
