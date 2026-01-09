export type OrderStatus = 'completed' | 'processing' | 'pending' | 'cancelled' | 'failed';

export interface Order {
    id: string;
    ID_Pedido: string;
    Clave_Pedido: string;
    Estado: OrderStatus;
    Fecha: string;
    ID_Cliente: string;
    Total: number;
    Descuento: number;
    Impuestos: number;
    Moneda: string;
    Metodo_Pago: string;
    Pedido_Gratuito: 'SI' | 'NO';
    Newsletter: 'SI' | 'NO';
    Origen: string;
    Tipo_Dispositivo: 'Desktop' | 'Mobile' | 'Tablet';
    Paginas_Sesion: number;
    Productos: string[]; // These are IDs of product records
}

export interface Product {
    id: string;
    ID_Elemento: string;
    ID_Pedido: string;
    Nombre_Producto: string;
    Version: string; // e.g. "Español, Gratuita"
    ID_Producto: string;
    ID_Variacion: string;
}

export interface Client {
    id: string;
    ID_Cliente: string;
    ID_Pedido: string;
    Nombre_Apellidos: string;
    Empresa: string;
    Telefono: string;
    Email: string;
    Pais: string;
    Ciudad: string;
    Codigo_Postal: string;
}

export interface FilterState {
    dateRange: 'ultimo_mes' | 'ultimos_3_meses' | 'ultimos_6_meses' | 'year' | 'all';
    pais: string[];
    version: 'todas' | 'gratuita' | 'avanzada';
    dispositivo: 'todos' | 'desktop' | 'mobile';
}

export interface DashboardData {
    pedidos: Order[];
    productos: Product[];
    clientes: Client[];
    lastUpdate: string;
}
