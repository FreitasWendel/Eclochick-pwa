// src/pages/Config.jsx
import { useState, useEffect, useRef } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../services/firebase';
import { Thermometer, Droplets, AlertTriangle, RefreshCw, Save, X, WifiOff } from 'lucide-react';
import { LIMITES, validarConfig } from '../utils/validacaoConfig';

const PADRAO = { temp_alvo: 37.5, umid_alvo: 60, alerta_temperatura: 39, viragem_automatica: false };
const TIMEOUT_SALVAR_MS = 8000;

const paraForm = (c) => ({
  temp_alvo: String(c.temp_alvo),
  umid_alvo: String(c.umid_alvo),
  alerta_temperatura: String(c.alerta_temperatura),
  viragem_automatica: Boolean(c.viragem_automatica),
});

export default function Config() {
  const [form, setForm] = useState(paraForm(PADRAO));
  const [servidor, setServidor] = useState(null);      // últimos valores confirmados no Firebase
  const [carregando, setCarregando] = useState(true);
  const [erroLeitura, setErroLeitura] = useState('');  // GP-20
  const [semCadastro, setSemCadastro] = useState(false);
  const [online, setOnline] = useState(true);          // GP-18 / GP-19
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  const sujoRef = useRef(false);                       // há edição local não salva?
  const timerMsg = useRef(null);

  const avisar = (texto, tipo, ms = 4000) => {
    clearTimeout(timerMsg.current);
    setMensagem({ texto, tipo });
    if (ms) timerMsg.current = setTimeout(() => setMensagem({ texto: '', tipo: '' }), ms);
  };

  // Leitura em tempo real dos parâmetros (GP-01, GP-16, GP-20)
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'config'),
      (snap) => {
        const d = snap.val();
        setErroLeitura('');
        setCarregando(false);
        if (!d) {                                      // nó ainda não cadastrado
          setSemCadastro(true);
          return;
        }
        setSemCadastro(false);
        const lido = {
          temp_alvo: d.temp_alvo ?? PADRAO.temp_alvo,
          umid_alvo: d.umid_alvo ?? PADRAO.umid_alvo,
          alerta_temperatura: d.alerta_temperatura ?? PADRAO.alerta_temperatura,
          viragem_automatica: d.viragem_automatica ?? PADRAO.viragem_automatica,
        };
        setServidor(lido);
        if (!sujoRef.current) setForm(paraForm(lido)); // não sobrescreve o que a pessoa está digitando
      },
      (err) => {
        console.error('Erro ao ler config:', err);
        setCarregando(false);
        setErroLeitura('Não foi possível carregar os parâmetros do Firebase. Os valores exibidos podem não ser os reais.');
      }
    );
    return () => unsub();
  }, []);

  // Estado da conexão com o Firebase (GP-18, GP-19)
  useEffect(() => {
    const unsub = onValue(ref(db, '.info/connected'), (snap) => setOnline(snap.val() === true));
    return () => unsub();
  }, []);

  useEffect(() => () => clearTimeout(timerMsg.current), []);

  const alterado = servidor
    ? JSON.stringify(paraForm(servidor)) !== JSON.stringify(form)
    : true;
  sujoRef.current = alterado && !!servidor;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // GP-06: só aceita dígitos, um separador decimal e sinal "-" no início
    if (!/^-?\d*[.,]?\d*$/.test(value)) return;
    setForm((p) => ({ ...p, [name]: value }));
    setErros((p) => ({ ...p, [name]: undefined }));
  };

  const toggleViragem = () => setForm((p) => ({ ...p, viragem_automatica: !p.viragem_automatica }));

  // GP-13
  const cancelarEdicao = () => {
    if (servidor) setForm(paraForm(servidor));
    setErros({});
    avisar('Alterações descartadas. Valores salvos mantidos.', 'info', 3000);
  };

  // GP-02, 03, 05–12, 14, 18, 24
  const salvar = async () => {
    const { erros: e, valores } = validarConfig(form);
    setErros(e);
    if (Object.keys(e).length > 0) {
      avisar(`Corrija ${Object.keys(e).length} campo(s) antes de salvar.`, 'error', 0);
      return;
    }
    if (!online) {
      avisar('Sem conexão com o Firebase. Nada foi salvo.', 'error', 0);
      return;
    }
    setSalvando(true);
    try {
      // update() não rejeita quando offline (fica pendente), por isso o timeout.
      await Promise.race([
        update(ref(db, 'config'), valores),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), TIMEOUT_SALVAR_MS)),
      ]);
      setServidor(valores);
      setForm(paraForm(valores));
      avisar('Configurações salvas e sincronizadas com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      avisar(
        err.message === 'timeout'
          ? 'Gravação não confirmada pelo Firebase (sem resposta). Verifique a conexão e tente novamente.'
          : `Erro ao salvar: ${err.code || err.message}`,
        'error',
        0
      );
    } finally {
      setSalvando(false);
    }
  };

  const renderCampo = ({ name, rotulo, icone, step }) => {
    const l = LIMITES[name];
    return (
      <div key={name} className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <div>
            <label htmlFor={name} className="text-sm text-gray-600 flex items-center gap-1">
              {icone}{rotulo}
            </label>
            <span className="text-xs text-gray-400">Faixa: {l.min} a {l.max} {l.unidade}</span>
          </div>
          <input
            id={name}
            name={name}
            type="text"
            inputMode="decimal"
            step={step}
            value={form[name]}
            onChange={handleChange}
            aria-invalid={!!erros[name]}
            className={`w-24 p-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-eclo-green ${erros[name] ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        {erros[name] && <p className="text-xs text-red-600 text-right">{erros[name]}</p>}
      </div>
    );
  };

  if (carregando) return <div className="p-5 text-center text-gray-500">Carregando parâmetros…</div>;

  const bloqueado = salvando || !!erroLeitura;

  return (
    <div className="p-5 flex flex-col gap-5 pb-24">
      {!online && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-orange-100 text-orange-700">
          <WifiOff size={16} /> Sem conexão com o Firebase. Você pode editar, mas só poderá salvar quando a conexão voltar.
        </div>
      )}
      {erroLeitura && <div className="p-3 rounded-lg text-sm bg-red-100 text-red-700">{erroLeitura}</div>}
      {semCadastro && !erroLeitura && (
        <div className="p-3 rounded-lg text-sm bg-blue-100 text-blue-700">
          Nenhum parâmetro cadastrado ainda. Os valores abaixo são sugestões — salve para cadastrá-los.
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold border-b pb-2">
          <Thermometer size={20} className="text-red-500" /><h2>Temperatura</h2>
        </div>
        {renderCampo({ name: "temp_alvo", rotulo: "Temperatura alvo (°C)", step: "0.1" })}
        {renderCampo({ name: "alerta_temperatura", rotulo: "Alerta de temp. (°C)", step: "0.1",
          icone: <AlertTriangle size={14} className="text-orange-500" /> })}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold border-b pb-2">
          <Droplets size={20} className="text-blue-500" /><h2>Umidade</h2>
        </div>
        {renderCampo({ name: "umid_alvo", rotulo: "Umidade alvo (%)", step: "1" })}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <RefreshCw size={20} className="text-eclo-green" /><h2>Viragem Automática</h2>
        </div>
        <button
          type="button" role="switch" aria-checked={form.viragem_automatica} onClick={toggleViragem}
          className={`w-14 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${form.viragem_automatica ? 'bg-eclo-green' : 'bg-gray-300'}`}
        >
          <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${form.viragem_automatica ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="button" onClick={cancelarEdicao} disabled={!alterado || salvando}
          className="flex items-center justify-center gap-1 w-1/3 py-4 rounded-2xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all shadow-sm disabled:opacity-50"
        >
          <X size={18} /> Cancelar
        </button>
        <button
          type="button" onClick={salvar} disabled={bloqueado}
          className={`flex items-center justify-center gap-2 w-2/3 py-4 rounded-2xl font-bold text-white shadow-md transition-all ${bloqueado ? 'bg-gray-400' : 'bg-eclo-green hover:bg-green-800 active:scale-95'}`}
        >
          <Save size={20} /> {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>

      {mensagem.texto && (
        <div role="status" className={`text-center p-3 rounded-lg text-sm font-medium ${
          mensagem.tipo === 'success' ? 'bg-green-100 text-green-700'
          : mensagem.tipo === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
          {mensagem.texto}
        </div>
      )}
    </div>
  );
}

