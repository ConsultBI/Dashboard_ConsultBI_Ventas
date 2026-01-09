import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');

export async function generateInsight(prompt: string, data: any) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const fullPrompt = `${prompt}\n\nDatos: ${JSON.stringify(data, null, 2)}`;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating AI insight:', error);
        return 'No se pudo generar el insight en este momento.';
    }
}

export async function getResumenEjecutivo(dashboardData: any) {
    const prompt = `
    Eres un analista de datos experto. Analiza los siguientes datos de ventas de ConsultBI 
    y proporciona un resumen ejecutivo profesional en español.
    
    Incluye:
    1. Resumen de rendimiento (2-3 párrafos)
    2. 3 insights clave más importantes
    3. Estado de salud del negocio (escala 1-10 con justificación breve)
    
    Responde en formato JSON para que pueda procesarlo:
    {
      "resumen": "string",
      "insights": ["string", "string", "string"],
      "salud": { "score": number, "justificacion": "string" }
    }
  `;

    const response = await generateInsight(prompt, dashboardData);
    try {
        // Attempt to parse JSON if AI returned it correctly, else return as text
        return JSON.parse(response.replace(/```json|```/g, ''));
    } catch (e) {
        return { resumen: response, insights: [], salud: { score: 0, justificacion: '' } };
    }
}
