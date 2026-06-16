export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return res.status(500).json({ error: 'API key is not configured' });
    }

    try {
        // Prepare the payload for Gemini API
        const payload = {
            contents: [{
                parts: [{ text: `Você é LuIA, uma assistente e pesquisadora virtual minimalista, inteligente e direta. Responda à seguinte pergunta de forma clara, organizada e em linguagem simples, sem se alongar muito, mantendo o tom profissional e direto: ${query}` }]
            }],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${errorText}`);
        }

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;

        res.status(200).json({ response: textResponse });
    } catch (error) {
        console.error('Error in AI function:', error);
        res.status(500).json({ error: 'Failed to process request with AI' });
    }
}
