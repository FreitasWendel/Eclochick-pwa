// api/simular.js

export default async function handler(req, res) {
  // Configuração de CORS para permitir chamadas de qualquer lugar (útil para testes)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const { temperatura, umidade, conectado } = req.body;

  if (temperatura === undefined || umidade === undefined) {
    return res.status(400).json({ error: 'Temperatura e umidade são obrigatórias.' });
  }

  // SUBSTITUA PELA URL DO SEU FIREBASE (Vem antes do .firebaseio.com)
  const firebaseDbUrl = 'https://testeprototipo-74ae9-default-rtdb.firebaseio.com';

  try {
    // Atualiza os sensores via REST API do Firebase
    const responseSensores = await fetch(`${firebaseDbUrl}/sensores.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temperatura: Number(temperatura),
        umidade: Number(umidade),
      }),
    });

    // Atualiza o status
    if (conectado !== undefined) {
      await fetch(`${firebaseDbUrl}/status.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conectado: Boolean(conectado) }),
      });
    }

    return res.status(200).json({ success: true, message: 'Hardware simulado com sucesso!' });
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar o Firebase.' });
  }
}