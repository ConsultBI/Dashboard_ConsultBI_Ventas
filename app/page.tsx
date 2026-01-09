"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ShoppingCart, DollarSign, Users, Globe, TrendingUp, Package, MapPin } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';
import { useDashboardStore } from '@/lib/store';
import { filterData, getKPIMetrics } from '@/lib/analytics';
import KPICard from '@/components/KPICard';

const COLORS = ['#1E2A45', '#3E5D8F', '#6A8CAF', '#A0A4AB', '#F5F6F8'];

export default function Dashboard() {
    const { data, isLoading, isError } = useData();
    const { filters } = useDashboardStore();

    const filteredOrders = useMemo(() => {
        if (!data?.pedidos) return [];
        return filterData(data.pedidos, filters);
    }, [data, filters]);

    const metrics = useMemo(() => getKPIMetrics(filteredOrders), [filteredOrders]);

    // Transform data for charts
    const salesTrend = useMemo(() => {
        const daily: Record<string, any> = {};
        filteredOrders.forEach(order => {
            const date = order.Fecha.split('T')[0];
            if (!daily[date]) daily[date] = { date, total: 0, gratuita: 0, avanzada: 0 };
            daily[date].total++;
            if (order.Pedido_Gratuito === 'SI') daily[date].gratuita++;
            else daily[date].avanzada++;
        });
        return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredOrders]);

    const topOrigins = useMemo(() => {
        const origins: Record<string, number> = {};
        filteredOrders.forEach(order => {
            const source = order.Origen || 'Directo';
            origins[source] = (origins[source] || 0) + 1;
        });
        return Object.entries(origins)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredOrders]);

    const topProductsRaw = useMemo(() => {
        const products: Record<string, number> = {};
        // This is simplified since we'd need to link with Productos table
        // For now using product ids from order
        filteredOrders.forEach(order => {
            order.Productos?.forEach(pid => {
                products[pid] = (products[pid] || 0) + 1;
            });
        });
        return Object.entries(products)
            .map(([id, value]) => {
                const product = data?.productos.find(p => p.id === id);
                return {
                    name: product?.Nombre_Producto || `Producto ${id}`,
                    value,
                    version: product?.Version?.includes('Gratuita') ? 'Gratuita' : 'Avanzada'
                };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredOrders, data]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium">Cargando datos...</div>;
    if (isError) return <div className="p-8 text-center text-red-500 font-medium">Error al cargar los datos.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Ventas Totales"
                    value={metrics.totalVentas}
                    change={12}
                    isPositive={true}
                    icon={<ShoppingCart size={20} />}
                    subtitle="Pedidos totales en el periodo"
                />
                <KPICard
                    title="Facturación Total"
                    value={metrics.facturacionTotal}
                    prefix="€"
                    change={8.5}
                    isPositive={true}
                    icon={<DollarSign size={20} />}
                    subtitle={`Pagos: ${metrics.totalPagos} | Gratuitas: ${metrics.totalGratuitos}`}
                />
                <KPICard
                    title="Clientes Únicos"
                    value={metrics.clientesUnicos}
                    change={4}
                    isPositive={true}
                    icon={<Users size={20} />}
                    subtitle="Compradores diferentes"
                />
                <KPICard
                    title="Ratio Pago/Total"
                    value={metrics.ratioPago.toFixed(1)}
                    suffix="%"
                    icon={<TrendingUp size={20} />}
                    subtitle="Porcentaje de pedidos de pago"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Evolution Chart */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-cb-secondary" />
                        Evolución de Pedidos
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrend}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E2A45" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1E2A45" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A0A4AB', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A0A4AB', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 4px 6px rgba(30, 42, 69, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#1E2A45" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                                <Area type="monotone" dataKey="avanzada" stroke="#6A8CAF" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Origin Distribution */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-cb-secondary" />
                        Origen de Tráfico
                    </h3>
                    <div className="h-[300px] flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topOrigins}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {topOrigins.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Package size={20} className="text-cb-secondary" />
                        Top 5 Productos
                    </h3>
                    <div className="space-y-4">
                        {topProductsRaw.map((product, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cb-gray-light flex items-center justify-center text-cb-primary font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                                        <p className="text-xs text-cb-gray-medium">{product.version}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 flex-1 max-w-[150px] mx-4">
                                    <div className="h-2 w-full bg-cb-gray-light rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cb-secondary rounded-full"
                                            style={{ width: `${(product.value / topProductsRaw[0].value) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="font-bold text-cb-primary">{product.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dummy Map Placeholder */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <MapPin size={20} className="text-cb-secondary" />
                        Distribución por Países
                    </h3>
                    <div className="h-[300px] bg-cb-gray-light rounded-cb flex items-center justify-center text-cb-gray-medium text-sm">
                        Mapa de calor geográfico (Placeholder - Integración MapBox o SvgMap necesaria)
                    </div>
                </div>
            </div>
        </div>
    );
}
