// src/pages/Config.jsx
import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../services/firebase';
import { Thermometer, Droplets, AlertTriangle, RefreshCw, Save } from 'lucide-react';

export default function Config() {
  // Estado local para os campos do formulário
  const [config, setConfig] = useState({
    temp_alvo: 0,
    umid_alvo: 0,
    alerta_temperatura: 0,
    viragem_automatica: false,
  });

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Busca as configurações atuais assim que a tela abre
  useEffect(() => {
    const configRef = ref(db, 'config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setConfig({
          temp_alvo: data.temp_alvo || 0,
          umid_alvo: data.umid_alvo || 0,
          alerta_temperatura: data.alerta_temperatura || 0,
          viragem_automatica: data.viragem_automatica || false,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Função para lidar com a mudança dos inputs numéricos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  // Função para alternar o switch (viragem automática)
  const toggleViragem = () => {
    setConfig((prev) => ({
      ...prev,
      viragem_automatica: !prev.viragem_automatica,
    }));
  };

  // Função para salvar no Firebase
  const salvarConfiguracoes = async () => {
    setSalvando(true);
    setMensagem('');
    
    try {
      const configRef = ref(db, 'config');
      // O update() altera apenas os campos passados, mantendo o resto intacto
      await update(configRef, config);
      setMensagem('Configurações salvas com sucesso!');
      
      // Esconde a mensagem após 3 segundos
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMensagem('Erro ao salvar configurações.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-5 flex flex-col gap-5 pb-24">
      
      {/* CARD: CONTROLE DE TEMPERATURA */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold border-b pb-2">
          <Thermometer size={20} className="text-red-500" />
          <h2>Temperatura</h2>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600">Temperatura Alvo (°C)</label>
          <input 
            type="number" 
            step="0.1"
            name="temp_alvo"
            value={config.temp_alvo}
            onChange={handleChange}
            className="w-24 p-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-eclo-green"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600 flex items-center gap-1">
            <AlertTriangle size={14} className="text-orange-500"/> 
            Alerta de Temp. (°C)
          </label>
          <input 
            type="number" 
            step="0.1"
            name="alerta_temperatura"
            value={config.alerta_temperatura}
            onChange={handleChange}
            className="w-24 p-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-eclo-green"
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
          <label className="text-sm text-gray-600">Umidade Alvo (%)</label>
          <input 
            type="number" 
            name="umid_alvo"
            value={config.umid_alvo}
            onChange={handleChange}
            className="w-24 p-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-eclo-green"
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
        onClick={salvarConfiguracoes}
        disabled={salvando}
        className={`mt-4 flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white shadow-md transition-all ${salvando ? 'bg-gray-400' : 'bg-eclo-green hover:bg-green-800 active:scale-95'}`}
      >
        <Save size={20} />
        {salvando ? 'Salvando...' : 'Salvar Configurações'}
      </button>

      {/* MENSAGEM DE SUCESSO */}
      {mensagem && (
        <div className={`text-center p-3 rounded-lg text-sm font-medium ${mensagem.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensagem}
        </div>
      )}

    </div>
  );
}