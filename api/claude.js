// api/claude.js
// Proxy serverless (Vercel) para a API da Anthropic.
// A API key fica no servidor (variável de ambiente), nunca no frontend.

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no projeto Vercel' });
  }

  const body = req.body;

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  };

  if (body && body.mcp_servers) {
    headers['anthropic-beta'] = 'mcp-client-2025-04-04';
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Falha ao contatar a API da Anthropic', detail: String(err) });
  }
}
