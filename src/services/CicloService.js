// src/services/CicloService.js
import { ref, set, update, get, remove } from 'firebase/database';
import { db } from './firebase'; // Seu arquivo de conexão
import { FasesCiclo, CicloAtivo } from '../models/CicloModel';
import { NotificationService } from './NotificationService';

export const CicloService = {
  
  // 1. INICIAR CICLO
  iniciarCiclo: async (quantidadeOvos) => {
    const novoCiclo = new CicloAtivo(quantidadeOvos);
    
    // Salva o ciclo ativo no Firebase
    await set(ref(db, 'ciclos/ativo'), novoCiclo);

    // Configura o hardware para a Fase de Incubação (Dias 1-17)
    await update(ref(db, 'config'), {
      temp_min: 37.0,
      temp_max: 37.5,
      umid_min: 50,
      umid_max: 55,
      viragem_automatica: true
    });

    return novoCiclo;
  },

  // 2. VERIFICAR O ESTADO ATUAL (Deve rodar ao abrir o app ou em um timer)
  verificarEstadoDoCiclo: async () => {
    const snapshot = await get(ref(db, 'ciclos/ativo'));
    if (!snapshot.exists()) return null;

    const ciclo = snapshot.val();
    const dataInicio = new Date(ciclo.data_inicio);
    const hoje = new Date();
    
    // Cálculo de dias decorridos (Considerando o dia de início como Dia 1)
    const diffTime = Math.abs(hoje - dataInicio);
    const diasDecorridos = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Regra: Notificações de Temperatura/Umidade (Ler sensores)
    const sensoresSnap = await get(ref(db, 'sensores'));
    if (sensoresSnap.exists()) {
      const { temperatura, umidade } = sensoresSnap.val();
      
      if (temperatura < 37.0 || temperatura > 37.5) {
        NotificationService.enviar("Alerta de Temperatura!", `Temp atual: ${temperatura}°C. Fora do ideal (37.0 - 37.5).`);
      }
      if (umidade < 50 || umidade > 55) {
        NotificationService.enviar("Alerta de Umidade!", `Umidade atual: ${umidade}%. Fora do ideal (50 - 55%).`);
      }
    }

    // Regra: Transição para o 18º dia
    if (diasDecorridos >= 18 && ciclo.fase === FasesCiclo.INCUBACAO) {
      await CicloService.mudarParaFaseEclosao(ciclo);
    }

    // Regra: Chegou no último dia (21º)
    if (diasDecorridos === 21) {
      NotificationService.enviar("Último dia!", "Hoje é o 21º dia. Verifique a eclosão e finalize o ciclo no app.");
    }

    return { ...ciclo, diasDecorridos };
  },

  // 3. MUDANÇA AUTOMÁTICA PARA FASE DE ECLOSÃO
  mudarParaFaseEclosao: async (ciclo) => {
    // Atualiza o ciclo
    await update(ref(db, 'ciclos/ativo'), { fase: FasesCiclo.ECLOSAO });

    // Atualiza o Hardware (Umid 60%, Viragem OFF)
    await update(ref(db, 'config'), {
      umid_min: 60,
      umid_max: 65, // Uma margem de segurança
      viragem_automatica: false
    });

    NotificationService.enviar("Fase de Eclosão!", "O 18º dia chegou. Umidade ajustada para 60% e viragem desativada.");
  },

   // 4. FINALIZAR CICLO E CALCULAR EFICIÊNCIA
  finalizarCiclo: async (ovosEclodidos) => {
    const snapshot = await get(ref(db, 'ciclos/ativo'));
    if (!snapshot.exists()) throw new Error("Nenhum ciclo ativo.");

    const ciclo = snapshot.val();
    const dataFim = new Date().toISOString();

    // Cálculo da Taxa de Sucesso (Eficiência)
    const taxaSucesso = ((ovosEclodidos / ciclo.quantidade_ovos) * 100).toFixed(1);

    // Função auxiliar para formatar data como DD/MM/AAAA
    const formatarData = (isoString) => {
      const d = new Date(isoString);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    };

    // Prepara o objeto de histórico completo
    const registroHistorico = {
      data_inicio: formatarData(ciclo.data_inicio),
      data_fim: formatarData(dataFim),
      quantidade_ovos: ciclo.quantidade_ovos,
      ovos_eclodidos: ovosEclodidos,
      taxa_sucesso: `${taxaSucesso}%` // Ex: "90.0%"
    };

    // Salva no Histórico
    await set(ref(db, `historico/${ciclo.id}`), registroHistorico);

    // Remove o ciclo ativo
    await remove(ref(db, 'ciclos/ativo'));

    // Reseta o hardware para o padrão
    await update(ref(db, 'config'), {
      umid_min: 50,
      umid_max: 55,
      viragem_automatica: true
    });

    return registroHistorico;
  }
};