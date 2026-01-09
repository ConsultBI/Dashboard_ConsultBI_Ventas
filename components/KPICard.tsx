"use client";

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: number;
    isPositive?: boolean;
    prefix?: string;
    suffix?: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export default function KPICard({ title, value, change, isPositive, prefix, suffix, subtitle, icon }: KPICardProps) {
    return (
        <div className="bg-white p-6 rounded-cb shadow-cb-card border border-cb-gray-light hover:border-cb-tertiary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-cb-gray-light rounded-lg text-cb-primary group-hover:bg-cb-primary group-hover:text-white transition-colors">
                    {icon}
                </div>
                {change !== undefined && (
                    <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {change}%
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-cb-gray-medium text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-baseline gap-1">
                    {prefix && <span className="text-cb-primary text-xl font-bold">{prefix}</span>}
                    <span className="text-3xl font-bold text-cb-primary tracking-tight">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                    {suffix && <span className="text-cb-gray-medium text-sm font-medium ml-1">{suffix}</span>}
                </div>
                {subtitle && (
                    <p className="text-xs text-cb-gray-medium mt-2">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
