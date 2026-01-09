import Airtable from 'airtable';
import { Order, Product, Client } from '@/types';

const base = new Airtable({
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

export async function getPedidos(): Promise<Order[]> {
    const records = await base('Pedidos').select({
        view: 'Grid view'
    }).all();

    return records.map(record => ({
        id: record.id,
        ID_Pedido: record.get('ID Pedido') as string,
        Clave_Pedido: record.get('Clave Pedido') as string,
        Estado: record.get('Estado') as any,
        Fecha: record.get('Fecha') as string,
        ID_Cliente: record.get('ID Cliente') as string,
        Total: Number(record.get('Total') || 0),
        Descuento: Number(record.get('Descuento') || 0),
        Impuestos: Number(record.get('Impuestos') || 0),
        Moneda: record.get('Moneda') as string,
        Metodo_Pago: record.get('Método de Pago') as string,
        Pedido_Gratuito: record.get('Pedido Gratuito (SI/NO)') as any,
        Newsletter: record.get('Newsletter (SI/NO)') as any,
        Origen: record.get('Origen') as string,
        Tipo_Dispositivo: record.get('Tipo Dispositivo') as any,
        Paginas_Sesion: Number(record.get('Páginas Sesión') || 0),
        Productos: record.get('Productos') as string[] || [],
    }));
}

export async function getProductos(): Promise<Product[]> {
    const records = await base('Productos').select({
        view: 'Grid view'
    }).all();

    return records.map(record => ({
        id: record.id,
        ID_Elemento: record.get('ID Elemento') as string,
        ID_Pedido: record.get('ID Pedido') as string,
        Nombre_Producto: record.get('Nombre Producto') as string,
        Version: record.get('Versión (ej: "Español, Gratuita")') as string,
        ID_Producto: record.get('ID Producto') as string,
        ID_Variacion: record.get('ID Variación') as string,
    }));
}

export async function getClientes(): Promise<Client[]> {
    const records = await base('Clientes').select({
        view: 'Grid view'
    }).all();

    return records.map(record => ({
        id: record.id,
        ID_Cliente: record.get('ID Cliente') as string,
        ID_Pedido: record.get('ID Pedido') as string,
        Nombre_Apellidos: record.get('Nombre y Apellidos') as string,
        Empresa: record.get('Empresa') as string,
        Telefono: record.get('Teléfono') as string,
        Email: record.get('Email') as string,
        Pais: record.get('País') as string,
        Ciudad: record.get('Ciudad') as string,
        Codigo_Postal: record.get('Código Postal') as string,
    }));
}
