export async function sendWebhookNotification(payload: {
    tipo: string;
    categoria: string;
    titulo: string;
    descripcion: string;
    datos: any;
}) {
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
    if (!webhookUrl) return false;

    const fullPayload = {
        ...payload,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fullPayload),
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending webhook:', error);
        return false;
    }
}

export function detectAlerts(previousData: any, currentData: any) {
    const alerts: any[] = [];

    // Cliente con 3+ descargas (VIP)
    const currentVIPs = currentData.clientes.filter((c: any) => c.pedidos >= 3);
    const prevVIPs = previousData.clientes.filter((c: any) => c.pedidos >= 3);

    currentVIPs.forEach((cliente: any) => {
        if (!prevVIPs.find((p: any) => p.ID_Cliente === cliente.ID_Cliente)) {
            alerts.push({
                tipo: 'alerta',
                categoria: 'cliente_vip',
                titulo: 'Nuevo Cliente VIP Detectado',
                descripcion: `El cliente ${cliente.Nombre_Apellidos} ha alcanzado ${cliente.pedidos} descargas`,
                datos: cliente
            });
        }
    });

    return alerts;
}
