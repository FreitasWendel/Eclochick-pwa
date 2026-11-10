// src/pages/Simulador.jsx
import { useState } from 'react';
import { Thermometer, Droplets, Wifi, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Simulador() {
  const [temp, setTemp] = useState('37.5');
  const [umid, setUmid] = useState('60');
  const [conectado, setConectado] = useState(true);
  const [isEnviando, setIsEnviando] = useState(false);

  const enviarDados = async () => {
    setIsEnviando(true);
    const loadingToast = toast.loading('Enviando dados para o app...');

    try {
      // Chama a API que criamos no Vercel
      const response = await fetch('/api/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperatura: Number(temp),
          umidade: Number(umid),
          conectado: conectado,
        }),
      });

      if (!response.ok) throw new Error('Erro na requisição');

      toast.success('Dados enviados! Olhe o app no celular.', { id: loadingToast });
    } catch (error) {
      toast.error('Falha ao enviar dados.', { id: loadingToast });
    } finally {
      setIsEnviando(false);
    }
  };

  return (
    <div className="p-5 flex flex-col gap-6 pb-24 min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-3xl shadow-md">
        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Painel do Hardware (Teste)</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Use este painel para simular os sensores da incubadora.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
              <Thermometer size={16} className="text-red-500" /> Temperatura (°C)
            </label>
            <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl text-lg font-bold" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
              <Droplets size={16} className="text-blue-500" /> Umidade (%)
            </label>
            <input type="number" value={umid} onChange={(e) => setUmid(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl text-lg font-bold" />
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Wifi size={16} /> Status de Conexão
            </label>
            <button onClick={() => setConectado(!conectado)} className={`w-12 h-6 rounded-full transition-colors ${conectado ? 'bg-eclo-green' : 'bg-gray-300'} flex items-center px-1`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${conectado ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <button onClick={enviarDados} disabled={isEnviando} className="mt-4 bg-eclo-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 active:scale-95 transition-all">
            <Send size={20} />
            {isEnviando ? 'Enviando...' : 'Enviar para o App'}
          </button>
        </div>
      </div>
    </div>
  );
}