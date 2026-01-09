import { create } from 'zustand';
import { FilterState } from '@/types';

interface DashboardStore {
    filters: FilterState;
    setFilters: (filters: Partial<FilterState>) => void;
    lastUpdate: string;
    setLastUpdate: (date: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    filters: {
        dateRange: 'ultimos_3_meses',
        pais: [],
        version: 'todas',
        dispositivo: 'todos',
    },
    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
    })),
    lastUpdate: new Date().toLocaleString(),
    setLastUpdate: (date) => set({ lastUpdate: date }),
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
}));
