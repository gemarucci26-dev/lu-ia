export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query, files = [], history = [] } = req.body;
    
    if (!query && files.length === 0) {
        return res.status(400).json({ error: 'Query or file is required' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return res.status(500).json({ error: 'API key is not configured' });
    }

    try {
        // Build the current message parts
        const currentParts = [];
        if (query) {
            currentParts.push({ text: query });
        }
        
        files.forEach(f => {
            currentParts.push({
                inlineData: {
                    mimeType: f.mimeType,
                    data: f.base64
                }
            });
        });

        // Assemble all contents (History + Current Message)
        const contents = [...history, { role: 'user', parts: currentParts }];

        // Prepare the payload for Gemini API v1beta
        const payload = {
            systemInstruction: {
                parts: [{ text: "Você é a Lulu-IA, uma assistente pessoal e pesquisadora inteligente, exclusiva da namorada do criador. Você deve ser muito educada, direta, romântica às vezes, mas focada em ajudar com dúvidas e pesquisas de forma simples." }]
            },
            contents: contents,
            generationConfig: {
                maxOutputTokens: 800,
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
