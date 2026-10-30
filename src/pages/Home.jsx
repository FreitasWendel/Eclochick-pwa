// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { Wifi, Thermometer, Droplets } from 'lucide-react';

export default function Home() {
  const [dados, setDados] = useState({
    temperatura: 0,
    umidade: 0,
    diasDecorridos: 0,
    conectado: false,
  });

  useEffect(() => {
    // Referência para a raiz do banco (ou nós específicos)
    const sensoresRef = ref(db, 'sensores');
    const statusRef = ref(db, 'status');

    // Escuta mudanças nos sensores
    const unsubscribeSensores = onValue(sensoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDados((prev) => ({
          ...prev,
          temperatura: data.temperatura || 0,
          umidade: data.umidade || 0,
        }));
      }
    });

    // Escuta mudanças no status
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDados((prev) => ({
          ...prev,
          diasDecorridos: data.dias_decorridos || 0,
          conectado: data.conectado || false,
        }));
      }
    });

    // Limpa os listeners quando o componente é desmontado
    return () => {
      unsubscribeSensores();
      unsubscribeStatus();
    };
  }, []);

  // Cálculo da barra de progresso (considerando 21 dias totais de incubação)
  const progresso = Math.min((dados.diasDecorridos / 21) * 100, 100);
  const diasRestantes = Math.max(21 - dados.diasDecorridos, 0);

  return (
    <div className="p-5 flex flex-col gap-6">
      
      {/* STATUS DE CONEXÃO */}
      <div className="flex justify-center">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-sm font-medium ${dados.conectado ? 'bg-white border-gray-200 text-gray-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          <span>{dados.conectado ? 'Dispositivo conectado' : 'Dispositivo offline'}</span>
          <Wifi size={16} className={dados.conectado ? 'text-black' : 'text-red-500'} />
        </div>
      </div>

      {/* CARD PERÍODO DE INCUBAÇÃO */}
      <div className="bg-eclo-light-green text-white p-6 rounded-3xl shadow-md flex flex-col items-center">
        <span className="text-lg">Período de incubação</span>
        <span className="text-6xl font-bold my-2">{dados.diasDecorridos}</span>
        <span className="text-sm">dias de incubação</span>
        
        {/* BARRA DE PROGRESSO */}
        <div className="w-full bg-white rounded-full h-3 mt-6 mb-2 overflow-hidden">
          <div 
            className="bg-eclo-lime h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progresso}%` }}
          ></div>
        </div>
        <span className="text-xs">Faltam {diasRestantes} dias para o nascimento</span>
      </div>

      {/* GRID DE SENSORES */}
      <div className="grid grid-cols-2 gap-5">
        
        {/* CARD TEMPERATURA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
          <span className="font-semibold text-gray-700">Temperatura</span>
          <Thermometer size={32} className="text-red-500" />
          <span className="text-2xl font-bold text-gray-800">
            {dados.temperatura.toFixed(1).replace('.', ',')} C°
          </span>
        </div>

        {/* CARD UMIDADE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
          <span className="font-semibold text-gray-700">Umidade</span>
          <Droplets size={32} className="text-blue-500" />
          <span className="text-2xl font-bold text-gray-800">
            {dados.umidade.toFixed(1).replace('.', ',')}%
          </span>
        </div>

      </div>
    </div>
  );
}