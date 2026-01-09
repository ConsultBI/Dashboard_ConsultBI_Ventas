"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, Legend
} from 'recharts';
import { Package, TrendingUp, Layers, Tag } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';

export default function ProductsPage() {
    const { data, isLoading } = useData();

    const productStats = useMemo(() => {
        if (!data) return [];
        const stats: Record<string, any> = {};

        data.pedidos.forEach(order => {
            order.Productos?.forEach(pid => {
                if (!stats[pid]) {
                    const product = data.productos.find(p => p.id === pid);
                    stats[pid] = {
                        id: pid,
                        name: product?.Nombre_Producto || 'Unknown',
                        version: product?.Version || 'N/A',
                        downloads: 0,
                        clients: new Set()
                    };
                }
                stats[pid].downloads++;
                stats[pid].clients.add(order.ID_Cliente);
            });
        });

        return Object.values(stats)
            .map(s => ({
                ...s,
                uniqueClients: s.clients.size,
                type: s.version.toLowerCase().includes('gratuita') ? 'Gratuita' : 'Avanzada'
            }))
            .sort((a, b) => b.downloads - a.downloads);
    }, [data]);

    const versionStats = useMemo(() => {
        const counts = { gratuita: 0, avanzada: 0 };
        productStats.forEach(s => {
            if (s.type === 'Gratuita') counts.gratuita += s.downloads;
            else counts.avanzada += s.downloads;
        });
        return [
            { name: 'Gratuita', value: counts.gratuita },
            { name: 'Avanzada', value: counts.avanzada }
        ];
    }, [productStats]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium">Cargando...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Ranking Products Table */}
            <div className="card overflow-hidden">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cb-secondary" />
                    Ranking de Productos
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-cb-gray-light text-cb-primary text-sm uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Versión</th>
                                <th className="px-6 py-4 text-center">Descargas</th>
                                <th className="px-6 py-4 text-center">Clientes Únicos</th>
                                <th className="px-6 py-4">% Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cb-gray-light">
                            {productStats.map((product, i) => {
                                const totalDownloads = productStats.reduce((acc, curr) => acc + curr.downloads, 0);
                                const pct = ((product.downloads / totalDownloads) * 100).toFixed(1);
                                return (
                                    <tr key={product.id} className="hover:bg-cb-gray-light/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-cb-primary">{product.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.type === 'Gratuita' ? 'bg-cb-tertiary/20 text-cb-secondary' : 'bg-cb-primary text-white'
                                                }`}>
                                                {product.version}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-lg">{product.downloads}</td>
                                        <td className="px-6 py-4 text-center">{product.uniqueClients}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 justify-end">
                                                <div className="w-16 h-1.5 bg-cb-gray-light rounded-full overflow-hidden">
                                                    <div className="h-full bg-cb-primary" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs">{pct}%</span>
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
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Layers size={20} className="text-cb-secondary" />
                        Distribución Gratuita vs Avanzada
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={versionStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#1E2A45" radius={[4, 4, 0, 0]}>
                                    {versionStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6A8CAF' : '#1E2A45'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Combinations Placeholder */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Tag size={20} className="text-cb-secondary" />
                        Combinaciones Más Comunes
                    </h3>
                    <div className="h-[300px] flex items-center justify-center text-cb-gray-medium bg-cb-gray-light rounded-cb">
                        Análisis de productos descargados juntos (Cesta de la compra)
                    </div>
                </div>
            </div>
        </div>
    );
}
