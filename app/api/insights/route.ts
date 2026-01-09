import { NextResponse } from 'next/server';
import { getResumenEjecutivo } from '@/lib/ai-insights';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const insights = await getResumenEjecutivo(data);
        return NextResponse.json(insights);
    } catch (error) {
        console.error('AI Insight Error:', error);
        return NextResponse.json({ error: 'Error generating insights' }, { status: 500 });
    }
}
