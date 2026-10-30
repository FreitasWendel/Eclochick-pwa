// src/pages/History.jsx
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { Egg } from 'lucide-react';

export default function History() {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const historicoRef = ref(db, 'historico');

    // Escuta mudanças no nó de histórico
    const unsubscribe = onValue(historicoRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // O Firebase retorna um Objeto, precisamos converter para Array para usar o .map()
        const listaConvertida = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        
        // Inverte a lista para mostrar o mais recente primeiro (opcional)
        setHistorico(listaConvertida.reverse());
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
        <p className="text-gray-500 font-medium">Carregando histórico...</p>
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 font-medium">Nenhum histórico encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {historico.map((item) => (
        <div 
          key={item.id} 
          className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100"
        >
          {/* Ícone e Informações */}
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Egg size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Início: {item.data}</p>
              <p className="text-sm text-gray-500">Sucesso: {item.resultado}</p>
            </div>
          </div>

          {/* Taxa de Sucesso */}
          <div className="text-right">
            <span className="text-lg font-bold text-eclo-green">
              {item.taxa}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}