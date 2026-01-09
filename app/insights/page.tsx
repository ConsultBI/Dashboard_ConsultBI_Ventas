"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Brain, Lightbulb, Activity, Zap, ArrowRight, Target } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';
import { getKPIMetrics, getClientesRecurrentes } from '@/lib/analytics';

export default function InsightsPage() {
    const { data, isLoading } = useData();
    const [insights, setInsights] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const dashboardDataSummary = useMemo(() => {
        if (!data) return null;
        const metrics = getKPIMetrics(data.pedidos);
        const recurrentes = getClientesRecurrentes(data.pedidos, data.clientes);

        // Top Products
        const prodCounts: Record<string, number> = {};
        data.pedidos.forEach(p => p.Productos?.forEach(pid => prodCounts[pid] = (prodCounts[pid] || 0) + 1));
        const topProd = Object.entries(prodCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id]) => data.productos.find(p => p.id === id)?.Nombre_Producto || 'Producto');

        return {
            totalVentas: metrics.totalVentas,
            pedidosGratuitos: metrics.totalGratuitos,
            pedidosAvanzados: metrics.totalPagos,
            clientesUnicos: metrics.clientesUnicos,
            clientesRecurrentes: recurrentes.length,
            tasaRecurrencia: metrics.ratioPago.toFixed(1),
            topProductos: topProd,
            topPaises: Array.from(new Set(data.clientes.map(c => c.Pais))).slice(0, 3)
        };
    }, [data]);

    const fetchInsights = async () => {
        if (!dashboardDataSummary) return;
        setIsGenerating(true);
        try {
            const response = await fetch('/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dashboardDataSummary)
            });
            const result = await response.json();
            setInsights(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (dashboardDataSummary && !insights && !isGenerating) {
            fetchInsights();
        }
    }, [dashboardDataSummary]);

    if (isLoading || isGenerating) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Sparkles className="animate-pulse text-cb-secondary" size={48} />
            <p className="text-cb-primary font-medium">Analizando datos con IA Gemini...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Resumen Ejecutivo */}
            <div className="card relative overflow-hidden border-l-4 border-cb-secondary">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Brain size={120} className="text-cb-primary" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cb-secondary/10 rounded-lg text-cb-secondary">
                            <Zap size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-cb-primary">Resumen Ejecutivo con IA</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 text-cb-primary/80 leading-relaxed text-lg">
                            {insights?.resumen || "Análisis en curso..."}
                        </div>
                        <div className="bg-cb-gray-light/50 p-6 rounded-cb border border-cb-gray-medium/10">
                            <h4 className="text-sm font-bold uppercase text-cb-gray-medium mb-4 flex items-center gap-2">
                                <Activity size={16} />
                                Estado de Salud
                            </h4>
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`text-5xl font-bold ${(insights?.salud?.score || 0) > 7 ? 'text-green-500' :
                                        (insights?.salud?.score || 0) > 4 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                    {insights?.salud?.score || '0'}<span className="text-2xl text-cb-gray-medium">/10</span>
                                </div>
                            </div>
                            <p className="text-sm text-cb-primary/70">{insights?.salud?.justificacion}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights Clave */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(insights?.insights || ["Optimizando métricas...", "Buscando patrones...", "Identificando oportunidades..."]).map((insight: string, idx: number) => (
                    <div key={idx} className="card bg-gradient-to-br from-white to-cb-gray-light hover:shadow-lg transition-all duration-300">
                        <div className="mb-4 text-cb-secondary bg-cb-secondary/10 w-fit p-3 rounded-xl">
                            <Lightbulb size={24} />
                        </div>
                        <p className="text-cb-primary font-medium leading-relaxed">{insight}</p>
                    </div>
                ))}
            </div>

            {/* Secciones Adicionales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Target size={20} className="text-cb-secondary" />
                        Optimización de Marketing
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-cb-gray-light rounded-cb flex items-start gap-3">
                            <div className="mt-1"><ArrowRight size={16} className="text-cb-secondary" /></div>
                            <p className="text-sm">Focalizar campañas en los países con mayor tasa de recurrencia.</p>
                        </div>
                        <div className="p-4 bg-cb-gray-light rounded-cb flex items-start gap-3">
                            <div className="mt-1"><ArrowRight size={16} className="text-cb-secondary" /></div>
                            <p className="text-sm">Potenciar el producto estrella mediante bundles con versiones gratuitas.</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-cb-secondary" />
                        Embudo de Conversión
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-cb-gray-medium">Descarga Gratuita</span>
                            <span className="font-bold">{dashboardDataSummary?.pedidosGratuitos}</span>
                        </div>
                        <div className="w-full bg-cb-gray-light h-2 rounded-full overflow-hidden">
                            <div className="bg-cb-tertiary h-full" style={{ width: '100%' }}></div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-cb-gray-medium">Compra Avanzada</span>
                            <span className="font-bold">{dashboardDataSummary?.pedidosAvanzados}</span>
                        </div>
                        <div className="w-full bg-cb-gray-light h-2 rounded-full overflow-hidden">
                            <div className="bg-cb-primary h-full" style={{ width: `${(dashboardDataSummary?.pedidosAvanzados || 0) / (dashboardDataSummary?.totalVentas || 1) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
