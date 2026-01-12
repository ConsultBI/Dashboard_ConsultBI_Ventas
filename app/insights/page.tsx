"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Brain, Lightbulb, Activity, Zap, ArrowRight, Target } from 'lucide-react';
import { useData } from '@/lib/hooks/useData';
import { getKPIMetrics, getClientesRecurrentes } from '@/lib/analytics';

import { filterData } from '@/lib/analytics';
import { useDashboardStore } from '@/lib/store';

export default function InsightsPage() {
    const { data, isLoading } = useData();
    const { filters } = useDashboardStore();
    const [insights, setInsights] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

    const filteredOrders = useMemo(() => {
        if (!data?.pedidos) return [];
        return filterData(data.pedidos, filters);
    }, [data, filters]);

    const dashboardDataSummary = useMemo(() => {
        if (!data || filteredOrders.length === 0) return null;
        const metrics = getKPIMetrics(filteredOrders);
        const recurrentes = getClientesRecurrentes(filteredOrders, data.clientes);

        // Top Products by Quantity
        const prodCounts: Record<string, number> = {};
        data.productos.forEach(p => {
            if (filteredOrders.some(o => o.ID_Pedido === p.ID_Pedido)) {
                prodCounts[p.Nombre_Producto] = (prodCounts[p.Nombre_Producto] || 0) + 1;
            }
        });

        const topProd = Object.entries(prodCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => `${name} (${count} descargas)`);

        return {
            periodo: filters.dateRange,
            version: filters.version,
            dispositivo: filters.dispositivo,
            totalVentas: metrics.totalVentas,
            pedidosGratuitos: metrics.totalGratuitos,
            pedidosAvanzados: metrics.totalPagos,
            clientesUnicos: metrics.clientesUnicos,
            clientesRecurrentes: recurrentes.length,
            tasaRecurrencia: ((recurrentes.length / (metrics.clientesUnicos || 1)) * 100).toFixed(1) + '%',
            topProductos: topProd,
            topPaises: Array.from(new Set(data.clientes.map(c => c.Pais).filter(Boolean))).slice(0, 5)
        };
    }, [data, filteredOrders, filters]);

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
            if (result.error) throw new Error(result.error);
            setInsights(result);
            setLastAnalysis(new Date().toLocaleString());
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Auto-fetch ONLY once when data is ready if no insights exist
    useEffect(() => {
        if (dashboardDataSummary && !insights && !isGenerating) {
            fetchInsights();
        }
    }, [dashboardDataSummary]);

    if (isLoading) return <div className="p-8 text-center text-cb-primary font-medium animate-pulse">Cargando datos...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-cb-primary flex items-center gap-2">
                        <Brain size={24} className="text-cb-secondary" />
                        Inteligencia de Negocio
                    </h2>
                    {lastAnalysis && (
                        <p className="text-[10px] text-cb-gray-medium font-bold uppercase tracking-wider mt-1">
                            Última actualización: {lastAnalysis}
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchInsights}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-cb-primary hover:bg-cb-secondary text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-cb-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isGenerating ? <Sparkles className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {isGenerating ? 'Analizando...' : 'Actualizar Análisis IA'}
                </button>
            </div>

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
                        <h2 className="text-2xl font-bold text-cb-primary font-heading">Visión General</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 text-cb-primary/80 leading-relaxed text-lg italic">
                            {isGenerating ? (
                                <div className="space-y-3">
                                    <div className="h-4 bg-cb-gray-light rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-cb-gray-light rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-cb-gray-light rounded w-4/6 animate-pulse"></div>
                                </div>
                            ) : (
                                "« " + (insights?.resumen || "Inicia un análisis para obtener una visión profunda de tus ventas.") + " »"
                            )}
                        </div>
                        <div className="bg-cb-gray-light/50 p-6 rounded-cb border border-cb-gray-medium/10">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-cb-gray-medium mb-4 flex items-center gap-2">
                                <Activity size={16} />
                                Business Score
                            </h4>
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`text-5xl font-black ${(insights?.salud?.score || 0) > 7 ? 'text-green-500' :
                                    (insights?.salud?.score || 0) > 4 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                    {isGenerating ? '--' : insights?.salud?.score || '0'}<span className="text-2xl text-cb-gray-medium font-normal">/10</span>
                                </div>
                            </div>
                            <p className="text-xs text-cb-primary/70 font-medium leading-relaxed">
                                {isGenerating ? 'Evaluando indicadores...' : insights?.salud?.justificacion}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights Clave */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(isGenerating ? [1, 2, 3] : (insights?.insights || [])).map((insight: any, idx: number) => (
                    <div key={idx} className="card bg-gradient-to-br from-white to-cb-gray-light hover:shadow-lg transition-all duration-300 group">
                        <div className="mb-4 text-cb-secondary bg-cb-secondary/10 w-fit p-3 rounded-xl group-hover:bg-cb-secondary group-hover:text-white transition-colors">
                            <Lightbulb size={24} />
                        </div>
                        {isGenerating ? (
                            <div className="h-4 bg-cb-gray-light rounded w-full animate-pulse"></div>
                        ) : (
                            <p className="text-cb-primary font-bold leading-relaxed text-sm">
                                {insight}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Contexto de Datos Reales */}
            <div className="card bg-cb-primary text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                    <Target size={20} className="text-cb-tertiary" />
                    Métricas Alimentadas a la IA
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-cb-gray-medium">Filtro Aplicado</p>
                        <p className="text-sm font-bold truncate">{dashboardDataSummary?.periodo || 'Todo'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-cb-gray-medium">Top Productos</p>
                        <p className="text-sm font-bold truncate">{(dashboardDataSummary?.topProductos || []).length} identificados</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-cb-gray-medium">Recurrencia</p>
                        <p className="text-sm font-bold">{dashboardDataSummary?.tasaRecurrencia || '0%'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-cb-gray-medium">Clientes</p>
                        <p className="text-sm font-bold">{dashboardDataSummary?.clientesUnicos || 0} totales</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
