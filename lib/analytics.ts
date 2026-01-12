import { Order, Product, Client, FilterState } from '@/types';
import { isWithinInterval, subMonths, startOfYear, parseISO, isAfter } from 'date-fns';

export function filterData(data: Order[], filters: FilterState): Order[] {
    return data.filter(order => {
        // Date filter
        const orderDate = parseISO(order.Fecha);
        let dateMatch = true;
        const now = new Date();

        if (filters.dateRange === 'ultimo_mes') {
            dateMatch = isAfter(orderDate, subMonths(now, 1));
        } else if (filters.dateRange === 'ultimos_3_meses') {
            dateMatch = isAfter(orderDate, subMonths(now, 3));
        } else if (filters.dateRange === 'ultimos_6_meses') {
            dateMatch = isAfter(orderDate, subMonths(now, 6));
        } else if (filters.dateRange === 'year') {
            dateMatch = isAfter(orderDate, startOfYear(now));
        }

        if (!dateMatch) return false;

        // Device filter
        if (filters.dispositivo !== 'todos' && order.Tipo_Dispositivo?.toLowerCase() !== filters.dispositivo) {
            return false;
        }

        // Version filter (this is tricky because version is on Product table)
        // We'll handle this by passing pre-filtered data or adding product info to order

        return true;
    });
}

export function getClientesRecurrentes(pedidos: Order[], clientes: Client[]) {
    const pedidosPorCliente: Record<string, Order[]> = {};

    pedidos.forEach(pedido => {
        if (!pedidosPorCliente[pedido.ID_Cliente]) {
            pedidosPorCliente[pedido.ID_Cliente] = [];
        }
        pedidosPorCliente[pedido.ID_Cliente].push(pedido);
    });

    return Object.entries(pedidosPorCliente)
        .filter(([_, customerPedidos]) => customerPedidos.length >= 2)
        .map(([clienteId, customerPedidos]) => ({
            cliente: clientes.find(c => c.ID_Cliente === clienteId),
            pedidos: customerPedidos.length,
            productos: customerPedidos.flatMap(p => p.Productos)
        }));
}

export function getKPIMetrics(pedidos: Order[]) {
    const totalVentas = pedidos.length;
    const facturacionTotal = pedidos.reduce((acc, curr) => acc + curr.Total, 0);
    const totalGratuitos = pedidos.filter(p => p.Total === 0 && p.Pedido_Gratuito === 'SI').length;
    const totalPagos = pedidos.filter(p => p.Total > 0 || p.Pedido_Gratuito === 'NO').length;
    const clientesUnicos = new Set(pedidos.map(p => p.ID_Cliente)).size;

    return {
        totalVentas,
        facturacionTotal,
        totalGratuitos,
        totalPagos,
        clientesUnicos,
        ratioPago: totalVentas > 0 ? (totalPagos / totalVentas) * 100 : 0
    };
}
