"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, Cell
} from 'recharts';
import { Share2, MousePointer2, FileText, Mail, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';
import { useDashboardStore } from '@/lib/store';
import { filterData } from '@/lib/analytics';

const COLORS = ['#1E2A45', '#3E5D8F', '#6A8CAF', '#A0A4AB'];

import { format, parseISO, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SalesPage() {
    const { data, isLoading } = useData();
    const { filters } = useDashboardStore();
    const [pagesSortOrder, setPagesSortOrder] = React.useState<'asc' | 'desc'>('desc');
    const [daySortType, setDaySortType] = React.useState<'name' | 'value'>('name');

    const filteredOrders = useMemo(() => {
        if (!data?.pedidos) return [];
        return filterData(data.pedidos, filters);
    }, [data, filters]);

    // Table Data
    const originStats = useMemo(() => {
        const origins: Record<string, any> = {};
        filteredOrders.forEach(order => {
            const src = order.Origen || 'Directo';
            if (!origins[src]) origins[src] = { name: src, orders: 0, pages: 0 };
            origins[src].orders++;
            origins[src].pages += (order.Paginas_Sesion || 0);
        });

        return Object.values(origins).map(o => ({
            ...o,
            avgPages: (o.pages / o.orders).toFixed(1),
            pctTotal: ((o.orders / (filteredOrders.length || 1)) * 100).toFixed(1)
        })).sort((a, b) => pagesSortOrder === 'desc' ? b.avgPages - a.avgPages : a.avgPages - b.avgPages);
    }, [filteredOrders, pagesSortOrder]);

    // Temporal Performance by Day
    const dayStats = useMemo(() => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const counts: Record<string, number> = {};
        days.forEach(d => counts[d] = 0);

        filteredOrders.forEach(order => {
            const dayIndex = getDay(parseISO(order.Fecha));
            counts[days[dayIndex]]++;
        });

        const orderedDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const baseData = orderedDays.map(name => ({ name, value: counts[name] }));

        if (daySortType === 'value') {
            return [...baseData].sort((a, b) => b.value - a.value);
        }
        return baseData;
    }, [filteredOrders, daySortType]);

    // Purchase Funnel: Free -> More than 1 product -> Paid
    const funnelData = useMemo(() => {
        const total = filteredOrders.length;
        const free = filteredOrders.filter(o => o.Total === 0 && o.Pedido_Gratuito === 'SI').length;
        const recurrent = filteredOrders.filter(o => o.Productos.length > 1).length;
        const paid = filteredOrders.filter(o => o.Total > 0 || o.Pedido_Gratuito === 'NO').length;

        return [
            { name: 'Descarga Gratuita', value: free, fill: '#6A8CAF' },
            { name: 'Multipedido (>1 prod)', value: recurrent, fill: '#3E5D8F' },
            { name: 'Pedido de Pago', value: paid, fill: '#1E2A45' }
        ];
    }, [filteredOrders]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium animate-pulse">Cargando datos...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
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
                                <th className="px-6 py-4 text-center">Pedidos</th>
                                <th className="px-6 py-4">% Total</th>
                                <th className="px-6 py-4 text-right">Págs. Promedio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cb-gray-light">
                            {originStats.map((stat, i) => (
                                <tr key={stat.name} className="hover:bg-cb-gray-light/50 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-cb-primary">{stat.name}</td>
                                    <td className="px-6 py-4 text-center font-bold text-cb-primary">{stat.orders}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-cb-gray-light rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-cb-secondary group-hover:bg-cb-primary transition-colors"
                                                    style={{ width: `${stat.pctTotal}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-cb-gray-medium w-8">{stat.pctTotal}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">{stat.avgPages}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Purchase Funnel */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FileText size={20} className="text-cb-secondary" />
                        Embudo de Conversión
                    </h3>
                    <div className="space-y-6 py-4">
                        {funnelData.map((step, i) => (
                            <div key={i} className="relative">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-cb-primary">{step.name}</span>
                                    <span className="text-sm font-bold text-cb-gray-medium">{step.value} pedidos</span>
                                </div>
                                <div className="w-full bg-cb-gray-light h-8 rounded-lg overflow-hidden relative">
                                    <div
                                        className="h-full transition-all duration-1000"
                                        style={{
                                            width: `${(step.value / (funnelData[0].value || 1)) * 100}%`,
                                            backgroundColor: step.fill
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[10px] font-bold text-white drop-shadow-sm">
                                            {((step.value / (funnelData[0].value || 1)) * 100).toFixed(0)}% de alcance
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pages per Session */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <MousePointer2 size={20} className="text-cb-secondary" />
                            Págs. por Sesión
                        </h3>
                        <button
                            onClick={() => setPagesSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="p-1.5 hover:bg-cb-gray-light rounded-lg transition-colors text-cb-gray-medium hover:text-cb-primary"
                            title="Cambiar orden"
                        >
                            <ArrowUpDown size={16} />
                        </button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={originStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#A0A4AB' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A0A4AB' }} />
                                <Tooltip cursor={{ fill: '#F5F6F8' }} contentStyle={{ borderRadius: '14px', border: 'none' }} />
                                <Bar dataKey="avgPages" fill="#3E5D8F" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Temporal Analysis */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp size={20} className="text-cb-secondary" />
                        Rendimiento Temporal por Día
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDaySortType(prev => prev === 'name' ? 'value' : 'name')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${daySortType === 'value' ? 'bg-cb-primary text-white' : 'bg-cb-gray-light text-cb-gray-medium hover:text-cb-primary'}`}
                        >
                            {daySortType === 'value' ? 'Por Valor' : 'Por Día'}
                        </button>
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#1E2A45', fontWeight: 500 }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A0A4AB' }} allowDecimals={false} />
                            <Tooltip cursor={{ fill: '#F5F6F8' }} contentStyle={{ borderRadius: '14px', border: 'none' }} />
                            <Bar dataKey="value" fill="#1E2A45" radius={[4, 4, 0, 0]} barSize={40}>
                                {dayStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value === Math.max(...dayStats.map(d => d.value)) ? '#3E5D8F' : '#1E2A45'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
