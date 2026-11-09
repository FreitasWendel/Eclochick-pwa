// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { CicloService } from '../services/CicloService';
import { NotificationService } from '../services/NotificationService';
import { Wifi, Thermometer, Droplets, PlayCircle, CheckCircle, Egg, AlertTriangle } from 'lucide-react';
import ModalFinalizarCiclo from '../components/ModalFinalizarCiclo';
import ModalIniciarCiclo from '../components/ModalIniciarCiclo';
import toast from 'react-hot-toast';

export default function Home() {
  const [dados, setDados] = useState({
    temperatura: 0,
    umidade: 0,
    conectado: false,
  });

  const [cicloAtivo, setCicloAtivo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalIniciarOpen, setIsModalIniciarOpen] = useState(false);
  const [isModalFinalizarOpen, setIsModalFinalizarOpen] = useState(false);

  useEffect(() => {
    NotificationService.solicitarPermissao();

    const carregarCiclo = async () => {
      try {
        const estado = await CicloService.verificarEstadoDoCiclo();
        setCicloAtivo(estado);
      } catch (error) {
        console.error("Erro ao carregar ciclo:", error);
      }
    };
    carregarCiclo();

    const sensoresRef = ref(db, 'sensores');
    const statusRef = ref(db, 'status');

    const unsubscribeSensores = onValue(sensoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // CORREÇÃO 1: Garantir que os dados sejam lidos como números
        const tempNum = Number(data.temperatura) || 0;
        const umidNum = Number(data.umidade) || 0;

        setDados((prev) => ({
          ...prev,
          temperatura: tempNum,
          umidade: umidNum,
        }));

        // ALERTA EM TEMPO REAL: Usa tempNum para não quebrar
        if (tempNum > 37.5 || (tempNum < 37.0 && tempNum > 0)) {
          toast.error(`Atenção: Temperatura em ${tempNum.toFixed(1)}°C!`, {
            id: 'alerta-temp',
            icon: '🌡️',
          });
        }
      }
    });

    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDados((prev) => ({
          ...prev,
          conectado: data.conectado || false,
        }));
      }
    });

    return () => {
      unsubscribeSensores();
      unsubscribeStatus();
    };
  }, []);

  const handleIniciarCiclo = async (quantidadeOvos) => {
    setIsProcessing(true);
    const loadingToast = toast.loading('Iniciando ciclo...');
    
    try {
      await CicloService.iniciarCiclo(quantidadeOvos);
      const estado = await CicloService.verificarEstadoDoCiclo();
      setCicloAtivo(estado);
      setIsModalIniciarOpen(false);
      toast.success('Ciclo iniciado com sucesso!', { id: loadingToast });
    } catch (error) {
      toast.error('Erro ao iniciar ciclo.', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizarCiclo = async (qtdEclodidos) => {
    setIsProcessing(true);
    const loadingToast = toast.loading('Calculando resultados...');
    
    try {
      const resultado = await CicloService.finalizarCiclo(qtdEclodidos);
      setCicloAtivo(null);
      setIsModalFinalizarOpen(false);
      
      toast.success(`Ciclo finalizado! Eficiência: ${resultado.taxa_sucesso}`, { 
        id: loadingToast,
        duration: 5000
      });
    } catch (error) {
      toast.error('Erro ao finalizar ciclo.', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const diasDecorridos = cicloAtivo?.diasDecorridos || 0;
  const progresso = Math.min((diasDecorridos / 21) * 100, 100);
  const diasRestantes = Math.max(21 - diasDecorridos, 0);

  // CORREÇÃO 2: Garantir Number() nos cálculos de alerta visual
  const tempForaDoPadrao = Number(dados.temperatura) > 37.5 || (Number(dados.temperatura) < 37.0 && Number(dados.temperatura) > 0);
  const umidForaDoPadrao = Number(dados.umidade) > 55 || (Number(dados.umidade) < 50 && Number(dados.umidade) > 0);

  return (
    <div className="p-5 flex flex-col gap-6 pb-24">
      
      {/* STATUS DE CONEXÃO */}
      <div className="flex justify-center">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-sm font-medium ${dados.conectado ? 'bg-white border-gray-200 text-gray-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          <span>{dados.conectado ? 'Dispositivo conectado' : 'Dispositivo offline'}</span>
          <Wifi size={16} className={dados.conectado ? 'text-black' : 'text-red-500'} />
        </div>
      </div>

      {/* CARD PERÍODO DE INCUBAÇÃO */}
      <div className={`text-white p-6 rounded-3xl shadow-md flex flex-col items-center transition-colors duration-500 ${cicloAtivo ? 'bg-eclo-light-green' : 'bg-gray-400'}`}>
        <span className="text-lg">Período de incubação</span>
        
        {cicloAtivo ? (
          <>
            <span className="text-6xl font-bold my-2">{diasDecorridos}</span>
            <span className="text-sm">dias de incubação</span>
            
            <div className="w-full bg-white rounded-full h-3 mt-6 mb-2 overflow-hidden">
              <div 
                className="bg-eclo-lime h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
            <span className="text-xs">
              {diasRestantes > 0 
                ? `Faltam ${diasRestantes} dias para o nascimento` 
                : "Pronto para eclosão! Finalize o ciclo."}
            </span>

            <div className="flex items-center gap-2 mt-4 bg-black/20 px-3 py-1 rounded-full text-sm">
              <Egg size={16} />
              <span>{cicloAtivo.quantidade_ovos} ovos • Fase: {cicloAtivo.fase}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-6">
            <span className="text-xl font-medium mb-4">Nenhum ciclo ativo</span>
            <button 
              onClick={() => setIsModalIniciarOpen(true)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <PlayCircle size={20} />
              {isProcessing ? 'Iniciando...' : 'Iniciar Ciclo'}
            </button>
          </div>
        )}
      </div>

      {/* BOTÃO DE FINALIZAR */}
      {cicloAtivo && diasDecorridos >= 21 && (
        <button 
          onClick={() => setIsModalFinalizarOpen(true)}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 w-full bg-eclo-green text-white py-4 rounded-2xl font-bold shadow-md hover:bg-green-800 transition-all active:scale-95"
        >
          <CheckCircle size={20} />
          Registrar Fim do Ciclo
        </button>
      )}

      {/* GRID DE SENSORES COM ALERTA VISUAL */}
      <div className="grid grid-cols-2 gap-5">
        
        {/* CARD TEMPERATURA */}
        <div className={`p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 transition-colors duration-300 ${
          tempForaDoPadrao ? 'bg-red-50 border border-red-200' : 'bg-white'
        }`}>
          <span className="font-semibold text-gray-700">Temperatura</span>
          <Thermometer 
            size={32} 
            className={tempForaDoPadrao ? 'text-red-600 animate-pulse' : 'text-red-500'} 
          />
          <span className="text-2xl font-bold text-gray-800">
            {/* CORREÇÃO 3: Number() direto na renderização */}
            {Number(dados.temperatura).toFixed(1).replace('.', ',')} C°
          </span>
          {tempForaDoPadrao && (
            <div className="flex items-center gap-1 text-red-600 mt-1">
              <AlertTriangle size={12} />
              <span className="text-xs font-bold">Fora do ideal</span>
            </div>
          )}
        </div>

        {/* CARD UMIDADE */}
        <div className={`p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 transition-colors duration-300 ${
          umidForaDoPadrao ? 'bg-red-50 border border-red-200' : 'bg-white'
        }`}>
          <span className="font-semibold text-gray-700">Umidade</span>
          <Droplets 
            size={32} 
            className={umidForaDoPadrao ? 'text-red-600 animate-pulse' : 'text-blue-500'} 
          />
          <span className="text-2xl font-bold text-gray-800">
            {Number(dados.umidade).toFixed(1).replace('.', ',')}%
          </span>
          {umidForaDoPadrao && (
            <div className="flex items-center gap-1 text-red-600 mt-1">
              <AlertTriangle size={12} />
              <span className="text-xs font-bold">Fora do ideal</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAIS */}
      <ModalIniciarCiclo 
        isOpen={isModalIniciarOpen} 
        onClose={() => setIsModalIniciarOpen(false)} 
        onConfirm={handleIniciarCiclo}
      />

      <ModalFinalizarCiclo 
        isOpen={isModalFinalizarOpen} 
        onClose={() => setIsModalFinalizarOpen(false)} 
        onConfirm={handleFinalizarCiclo}
        totalOvos={cicloAtivo?.quantidade_ovos || 0}
      />
    </div>
  );
}