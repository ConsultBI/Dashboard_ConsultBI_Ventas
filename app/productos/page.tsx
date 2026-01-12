"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, Legend
} from 'recharts';
import { Package, TrendingUp, Layers, Tag, ArrowUpDown } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';

export default function ProductsPage() {
    const { data, isLoading } = useData();
    const [sortConfig, setSortConfig] = React.useState({ key: 'downloads', direction: 'desc' });
    const [versionSortOrder, setVersionSortOrder] = React.useState<'asc' | 'desc'>('desc');

    const productStats = useMemo(() => {
        if (!data) return [];
        const stats: Record<string, any> = {};

        data.productos.forEach(p => {
            // Normalize name and version to group correctly
            const baseName = p.Nombre_Producto.trim();
            const version = p.Version.trim();
            const key = `${baseName}::${version}`;

            if (!stats[key]) {
                stats[key] = {
                    name: baseName,
                    version: version,
                    downloads: 0,
                    clients: new Set(),
                    type: version.toLowerCase().includes('gratu') ? 'Gratuita' : 'Pagada'
                };
            }

            // Count total downloads for this specific product + version
            // Actually, we should count occurrences in the Productos table linked to orders
            stats[key].downloads++;

            // Link to unique clients if possible (via ID_Pedido)
            const relatedOrder = data.pedidos.find(o => o.ID_Pedido === p.ID_Pedido);
            if (relatedOrder) {
                stats[key].clients.add(relatedOrder.ID_Cliente);
            }
        });

        return Object.values(stats)
            .map((s: any) => ({
                ...s,
                uniqueClients: s.clients.size
            }))
            .sort((a: any, b: any) => {
                if (sortConfig.key === 'name') {
                    return sortConfig.direction === 'asc'
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                }
                return sortConfig.direction === 'asc'
                    ? a[sortConfig.key] - b[sortConfig.key]
                    : b[sortConfig.key] - a[sortConfig.key];
            });
    }, [data, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const versionStats = useMemo(() => {
        const counts = { gratuita: 0, pagada: 0 };
        productStats.forEach(s => {
            if (s.type === 'Gratuita') counts.gratuita += s.downloads;
            else counts.pagada += s.downloads;
        });
        return [
            { name: 'Gratuita', value: counts.gratuita },
            { name: 'Pagada', value: counts.pagada }
        ].sort((a, b) => versionSortOrder === 'desc' ? b.value - a.value : a.value - b.value);
    }, [productStats, versionSortOrder]);

    // Basket Analysis (Combinations)
    const combinationStats = useMemo(() => {
        if (!data) return [];
        const combinations: Record<string, number> = {};

        // Group products by Order ID
        const productsByOrder: Record<string, string[]> = {};
        data.productos.forEach(p => {
            if (!productsByOrder[p.ID_Pedido]) productsByOrder[p.ID_Pedido] = [];
            productsByOrder[p.ID_Pedido].push(p.Nombre_Producto.trim());
        });

        Object.values(productsByOrder).forEach(prods => {
            if (prods.length > 1) {
                // Sort to normalize [A, B] as same as [B, A]
                const sorted = Array.from(new Set(prods)).sort();
                for (let i = 0; i < sorted.length; i++) {
                    for (let j = i + 1; j < sorted.length; j++) {
                        const pair = `${sorted[i]} + ${sorted[j]}`;
                        combinations[pair] = (combinations[pair] || 0) + 1;
                    }
                }
            }
        });

        return Object.entries(combinations)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [data]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium animate-pulse">Cargando datos...</div>;

    const totalDownloadsAll = productStats.reduce((acc, curr) => acc + curr.downloads, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Ranking Products Table */}
            <div className="card overflow-hidden">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cb-secondary" />
                    Ranking de Productos (Deduplicado)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-cb-gray-light text-cb-primary text-sm uppercase font-bold">
                            <tr>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-cb-gray-light transition-colors group"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        Producto <ArrowUpDown size={14} className="text-cb-gray-medium group-hover:text-cb-primary" />
                                    </div>
                                </th>
                                <th className="px-6 py-4">Versión</th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-cb-gray-light transition-colors group"
                                    onClick={() => handleSort('downloads')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Descargas <ArrowUpDown size={14} className="text-cb-gray-medium group-hover:text-cb-primary" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer hover:bg-cb-gray-light transition-colors group"
                                    onClick={() => handleSort('uniqueClients')}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        Clientes Únicos <ArrowUpDown size={14} className="text-cb-gray-medium group-hover:text-cb-primary" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">Participación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cb-gray-light">
                            {productStats.map((product: any, i) => {
                                const pct = ((product.downloads / (totalDownloadsAll || 1)) * 100).toFixed(1);
                                return (
                                    <tr key={`${product.name}-${product.version}`} className="hover:bg-cb-gray-light/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-cb-primary">{product.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.type === 'Gratuita' ? 'bg-cb-tertiary/20 text-cb-secondary' : 'bg-cb-primary text-white'
                                                }`}>
                                                {product.version}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-cb-primary">{product.downloads}</td>
                                        <td className="px-6 py-4 text-center text-cb-gray-medium">{product.uniqueClients}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 justify-end">
                                                <div className="w-16 h-1 bg-cb-gray-light rounded-full overflow-hidden">
                                                    <div className="h-full bg-cb-secondary" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-cb-gray-medium min-w-[35px] text-right">{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Version Distribution */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Layers size={20} className="text-cb-secondary" />
                            Distribución Gratuita vs Avanzada
                        </h3>
                        <button
                            onClick={() => setVersionSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="p-1.5 hover:bg-cb-gray-light rounded-lg transition-colors text-cb-gray-medium hover:text-cb-primary"
                            title="Cambiar orden"
                        >
                            <ArrowUpDown size={16} />
                        </button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={versionStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1E2A45', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0A4AB', fontSize: 10 }} />
                                <Tooltip cursor={{ fill: '#F5F6F8' }} contentStyle={{ borderRadius: '14px', border: 'none' }} />
                                <Bar dataKey="value" fill="#1E2A45" radius={[4, 4, 0, 0]} barSize={40}>
                                    {versionStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Gratuita' ? '#6A8CAF' : '#1E2A45'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Combinations Analysis */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Tag size={20} className="text-cb-secondary" />
                        Combinaciones Más Comunes
                    </h3>
                    <div className="space-y-4 pt-4">
                        {combinationStats.length > 0 ? combinationStats.map((combo, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-cb-primary truncate max-w-[80%]">{combo.name}</span>
                                    <span className="text-xs font-bold text-cb-secondary">{combo.value} pedidos</span>
                                </div>
                                <div className="w-full bg-cb-gray-light h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cb-secondary group-hover:bg-cb-primary transition-colors duration-500"
                                        style={{ width: `${(combo.value / (combinationStats[0]?.value || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="h-[200px] flex items-center justify-center text-cb-gray-medium text-sm italic">
                                No hay suficientes datos de combinaciones
                            </div>
                        )}
                        <p className="text-[10px] text-cb-gray-medium mt-6 uppercase tracking-widest text-center font-bold">
                            Basado en pedidos multiproducto
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
