// src/pages/Config.jsx
import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../services/firebase';
import { Thermometer, Droplets, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Config() {
  const [config, setConfig] = useState({
    temp_alvo: 37.5,
    umid_alvo: 60,
    alerta_temperatura: 39.0,
    viragem_automatica: true,
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // 1. Buscar configurações em tempo real
  useEffect(() => {
    const configRef = ref(db, 'config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setConfig((prev) => ({
          ...prev,
          temp_alvo: Number(data.temp_alvo) || 37.5,
          umid_alvo: Number(data.umid_alvo) || 60,
          alerta_temperatura: Number(data.alerta_temperatura) || 39.0,
          viragem_automatica: Boolean(data.viragem_automatica),
        }));
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value === '' ? '' : Number(value),
    }));
  };

  const toggleViragem = () => {
    setConfig((prev) => ({
      ...prev,
      viragem_automatica: !prev.viragem_automatica,
    }));
  };

  const handleSalvar = async () => {
    if (config.temp_alvo === '' || config.umid_alvo === '') {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setSalvando(true);
    const loadingToast = toast.loading('Salvando configurações...');

    try {
      const configRef = ref(db, 'config');
      await update(configRef, config);
      toast.success('Configurações salvas com sucesso!', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar configurações.', { id: loadingToast });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 font-medium animate-pulse">Carregando configurações...</p>
      </div>
    );
  }

  // ⬇️ ESTE DIV É O ELEMENTO PAI QUE ESTAVA FALTANDO ⬇️
  return (
    <div className="p-5 flex flex-col gap-5 pb-24">
      
      {/* CARD: CONTROLE DE TEMPERATURA */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold border-b pb-2">
          <Thermometer size={20} className="text-red-500" />
          <h2>Temperatura</h2>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600 font-medium">Temperatura Alvo (°C)</label>
          <input 
            type="number" 
            step="0.1"
            name="temp_alvo"
            value={config.temp_alvo}
            onChange={handleChange}
            className="w-24 p-2 border border-gray-300 rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-eclo-green"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600 flex items-center gap-1 font-medium">
            <AlertTriangle size={14} className="text-orange-500"/> 
            Alerta de Temp. (°C)
          </label>
          <input 
            type="number" 
            step="0.1"
            name="alerta_temperatura"
            value={config.alerta_temperatura}
            onChange={handleChange}
            className="w-24 p-2 border border-gray-300 rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-eclo-green"
          />
        </div>
      </div>

      {/* CARD: CONTROLE DE UMIDADE */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold border-b pb-2">
          <Droplets size={20} className="text-blue-500" />
          <h2>Umidade</h2>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600 font-medium">Umidade Alvo (%)</label>
          <input 
            type="number" 
            name="umid_alvo"
            value={config.umid_alvo}
            onChange={handleChange}
            className="w-24 p-2 border border-gray-300 rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-eclo-green"
          />
        </div>
      </div>

      {/* CARD: VIRAGEM AUTOMÁTICA */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <RefreshCw size={20} className="text-eclo-green" />
          <h2>Viragem Automática</h2>
        </div>
        
        {/* Switch Customizado */}
        <button 
          onClick={toggleViragem}
          className={`w-14 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${config.viragem_automatica ? 'bg-eclo-green' : 'bg-gray-300'}`}
        >
          <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${config.viragem_automatica ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>

      {/* BOTÃO SALVAR */}
      <button 
        onClick={handleSalvar}
        disabled={salvando}
        className={`mt-2 flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white shadow-md transition-all ${salvando ? 'bg-gray-400' : 'bg-eclo-green hover:bg-green-800 active:scale-95'}`}
      >
        <Save size={20} />
        {salvando ? 'Salvando...' : 'Salvar Configurações'}
      </button>

    </div>
  );
}