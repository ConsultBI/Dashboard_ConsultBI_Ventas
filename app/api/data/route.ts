import { NextResponse } from 'next/server';
import { getPedidos, getProductos, getClientes } from '@/lib/airtable';

export async function GET() {
    try {
        const [pedidos, productos, clientes] = await Promise.all([
            getPedidos(),
            getProductos(),
            getClientes(),
        ]);

        return NextResponse.json({
            pedidos,
            productos,
            clientes,
            lastUpdate: new Date().toISOString()
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Error fetching data from Airtable' }, { status: 500 });
    }
}
