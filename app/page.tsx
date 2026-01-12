"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ShoppingCart, DollarSign, Users, Globe, TrendingUp, Package, MapPin, ArrowUpDown } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';
import { useDashboardStore } from '@/lib/store';
import { filterData, getKPIMetrics } from '@/lib/analytics';
import KPICard from '@/components/KPICard';

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#1E2A45', '#3E5D8F', '#6A8CAF', '#5BC0BE', '#9FD3DE']; // Improved color visibility

export default function Dashboard() {
    const { data, isLoading, isError } = useData();
    const { filters } = useDashboardStore();
    const [countrySortOrder, setCountrySortOrder] = React.useState<'asc' | 'desc'>('desc');

    const filteredOrders = useMemo(() => {
        if (!data?.pedidos) return [];
        return filterData(data.pedidos, filters);
    }, [data, filters]);

    const metrics = useMemo(() => getKPIMetrics(filteredOrders), [filteredOrders]);

    // Transform data for charts
    const salesTrend = useMemo(() => {
        const daily: Record<string, any> = {};
        filteredOrders.forEach(order => {
            const dateStr = order.Fecha.split('T')[0];
            if (!daily[dateStr]) daily[dateStr] = { dateStr, total: 0, gratuita: 0, avanzada: 0 };
            daily[dateStr].total++;
            if (order.Total === 0 && order.Pedido_Gratuito === 'SI') daily[dateStr].gratuita++;
            else daily[dateStr].avanzada++;
        });
        return Object.values(daily)
            .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
            .map(d => ({
                ...d,
                formattedDate: format(parseISO(d.dateStr), 'dd/MM/yy')
            }));
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
        const productsCount: Record<string, number> = {};
        // Sum from Productos table instead of Order.Productos IDs
        data?.productos.forEach(p => {
            // Only count products related to filtered orders
            const orderOfProduct = filteredOrders.find(o => o.ID_Pedido === p.ID_Pedido);
            if (orderOfProduct) {
                const key = `${p.Nombre_Producto} (${p.Version})`;
                productsCount[key] = (productsCount[key] || 0) + 1;
            }
        });

        return Object.entries(productsCount)
            .map(([nameAndVersion, value]) => {
                const [name, versionRaw] = nameAndVersion.split(' (');
                const version = versionRaw.replace(')', '');
                return {
                    name,
                    value,
                    version
                };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredOrders, data]);

    const topCountries = useMemo(() => {
        const countries: Record<string, number> = {};
        filteredOrders.forEach(order => {
            const client = data?.clientes.find(c => c.ID_Cliente === order.ID_Cliente);
            const country = client?.Pais || 'Desconocido';
            countries[country] = (countries[country] || 0) + 1;
        });
        return Object.entries(countries)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => countrySortOrder === 'desc' ? b.value - a.value : a.value - b.value)
            .slice(0, 6);
    }, [filteredOrders, data, countrySortOrder]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium animate-pulse">Cargando datos...</div>;
    if (isError) return <div className="p-8 text-center text-red-500 font-medium">Error al cargar los datos.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <KPICard
                    title="Ventas Totales"
                    value={metrics.totalVentas}
                    change={12}
                    isPositive={true}
                    icon={<ShoppingCart size={20} />}
                    subtitle="vs periodo anterior"
                />
                <KPICard
                    title="Facturación Total"
                    value={metrics.facturacionTotal}
                    prefix="€"
                    change={8.5}
                    isPositive={true}
                    icon={<DollarSign size={20} />}
                    subtitle="Ingresos por pagos"
                />
                <KPICard
                    title="Clientes Únicos"
                    value={metrics.clientesUnicos}
                    change={4}
                    isPositive={true}
                    icon={<Users size={20} />}
                    subtitle="Compradores únicos"
                />
                <KPICard
                    title="Ratio Pago/Total"
                    value={metrics.ratioPago.toFixed(1)}
                    suffix="%"
                    icon={<TrendingUp size={20} />}
                    subtitle="Pedidos de pago"
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
                                    dataKey="formattedDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A0A4AB', fontSize: 10 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#A0A4AB', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 4px 6px rgba(30, 42, 69, 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#1E2A45"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    strokeWidth={3}
                                    dot={false}
                                />
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
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topOrigins}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {topOrigins.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    layout="horizontal"
                                    align="center"
                                    verticalAlign="bottom"
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products */}
                ...
                {/* Countries Bar Chart (Replacing Map) */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <MapPin size={20} className="text-cb-secondary" />
                            Distribución por Países
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCountrySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="p-1.5 hover:bg-cb-gray-light rounded-lg transition-colors text-cb-gray-medium hover:text-cb-primary"
                                title="Cambiar orden"
                            >
                                <ArrowUpDown size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCountries} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F1F1" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fill: '#1E2A45', fontWeight: 500, fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F5F6F8' }}
                                    contentStyle={{ borderRadius: '14px', border: 'none' }}
                                />
                                <Bar dataKey="value" fill="#3E5D8F" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
