// src/components/ModalFinalizarCiclo.jsx
import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function ModalFinalizarCiclo({ isOpen, onClose, onConfirm, totalOvos }) {
  const [ovosEclodidos, setOvosEclodidos] = useState('');
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleConfirmar = () => {
    const qtd = Number(ovosEclodidos);
    
    if (!ovosEclodidos || isNaN(qtd) || qtd < 0) {
      setErro('Por favor, insira um número válido.');
      return;
    }
    if (qtd > totalOvos) {
      setErro(`O número não pode ser maior que o total de ovos (${totalOvos}).`);
      return;
    }

    setErro('');
    onConfirm(qtd);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle size={32} className="text-eclo-green" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">Finalizar Ciclo</h2>
          <p className="text-gray-500 text-sm mb-6">
            Foram colocados <strong>{totalOvos} ovos</strong> no início. Quantos eclodiram com sucesso?
          </p>

          <input
            type="number"
            value={ovosEclodidos}
            onChange={(e) => setOvosEclodidos(e.target.value)}
            placeholder="Ex: 45"
            className="w-full text-center text-2xl font-bold p-4 border-2 border-gray-200 rounded-xl focus:border-eclo-green focus:outline-none mb-2"
            min="0"
            max={totalOvos}
          />
          
          {erro && <p className="text-red-500 text-xs mb-4">{erro}</p>}

          <button
            onClick={handleConfirmar}
            className="w-full mt-4 bg-eclo-green text-white py-3 rounded-xl font-bold hover:bg-green-800 transition-colors"
          >
            Confirmar e Gerar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}