// src/pages/History.jsx
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { Egg, CheckCircle, Calendar } from 'lucide-react';

export default function History() {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const historicoRef = ref(db, 'historico');

    const unsubscribe = onValue(historicoRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Converte o objeto do Firebase em array e inverte (mais recente primeiro)
        const listaConvertida = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        })).reverse();
        
        setHistorico(listaConvertida);
      } else {
        setHistorico([]);
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 font-medium animate-pulse">Carregando histórico...</p>
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-400">
        <Egg size={48} className="mb-4 opacity-50" />
        <p className="font-medium">Nenhum histórico encontrado.</p>
        <p className="text-sm">Finalize um ciclo para vê-lo aqui.</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {historico.map((item) => (
        <div 
          key={item.id} 
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3"
        >
          {/* Cabeçalho do Card (Datas e Taxa) */}
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} className="text-gray-400" />
              <span>{item.data_inicio} <span className="text-gray-300">→</span> {item.data_fim}</span>
            </div>
            <span className="text-lg font-bold text-eclo-green bg-green-50 px-3 py-1 rounded-full">
              {item.taxa_sucesso}
            </span>
          </div>

          {/* Detalhes do Ciclo */}
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Egg size={18} className="text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Total colocado</span>
                <span className="font-semibold text-gray-700">{item.quantidade_ovos} ovos</span>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200"></div> {/* Linha divisória */}

            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle size={18} className="text-green-600" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-400">Eclodiram</span>
                <span className="font-semibold text-gray-700">{item.ovos_eclodidos} ovos</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}