import useSWR from 'swr';
import { DashboardData } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useData() {
    const { data, error, isLoading, mutate } = useSWR<DashboardData>('/api/data', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 300000, // 5 minutes
    });

    return {
        data,
        isLoading,
        isError: error,
        refresh: mutate
    };
}
