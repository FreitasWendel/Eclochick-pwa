// src/components/ModalIniciarCiclo.jsx
import { useState } from 'react';
import { X, PlayCircle, Egg } from 'lucide-react';

export default function ModalIniciarCiclo({ isOpen, onClose, onConfirm }) {
  const [quantidadeOvos, setQuantidadeOvos] = useState('');
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleConfirmar = () => {
    const qtd = Number(quantidadeOvos);

    if (!quantidadeOvos || isNaN(qtd) || qtd <= 0) {
      setErro('Por favor, insira um número válido maior que zero.');
      return;
    }

    setErro('');
    onConfirm(qtd);
    // Limpa o campo ao fechar
    setQuantidadeOvos('');
  };

  const handleClose = () => {
    setErro('');
    setQuantidadeOvos('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <PlayCircle size={32} className="text-eclo-green" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">Iniciar Novo Ciclo</h2>
          <p className="text-gray-500 text-sm mb-6">
            Informe a quantidade de ovos que serão incubados. A data de início será registrada automaticamente.
          </p>

          <div className="relative w-full mb-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Egg size={24} />
            </div>
            <input
              type="number"
              value={quantidadeOvos}
              onChange={(e) => setQuantidadeOvos(e.target.value)}
              placeholder="Ex: 50"
              className="w-full text-center text-2xl font-bold p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-eclo-green focus:outline-none"
              min="1"
              autoFocus
            />
          </div>
          
          {erro && <p className="text-red-500 text-xs mb-4">{erro}</p>}

          <button
            onClick={handleConfirmar}
            className="w-full mt-4 bg-eclo-green text-white py-3 rounded-xl font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
          >
            <PlayCircle size={20} />
            Iniciar Ciclo
          </button>
        </div>
      </div>
    </div>
  );
}