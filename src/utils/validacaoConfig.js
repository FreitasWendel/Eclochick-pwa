// src/utils/validacaoConfig.js
// Regras de validação dos parâmetros (GP-05 a GP-12).
//
// ATENÇÃO: a planilha pede para NÃO inventar limites. Os valores abaixo são
// PLACEHOLDERS (faixas típicas de incubação de galinha). Confirme com os
// requisitos do projeto e ajuste aqui — é o único lugar a alterar.
export const LIMITES = {
  temp_alvo: { nome: 'Temperatura alvo', unidade: '°C', min: 35.0, max: 40.0, casas: 1 },
  alerta_temperatura: { nome: 'Alerta de temperatura', unidade: '°C', min: 35.0, max: 43.0, casas: 1 },
  umid_alvo: { nome: 'Umidade alvo', unidade: '%', min: 30, max: 90, casas: 0 },
};

export const CAMPOS_NUMERICOS = Object.keys(LIMITES);

// Aceita "37.5" ou "37,5". Retorna número ou NaN. Só dígitos, um separador, sinal opcional.
export function converterNumero(texto) {
  const t = String(texto ?? '').trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return NaN;
  return Number(t);
}

// Valida o formulário (valores em texto). Retorna { erros: {campo: msg}, valores }
export function validarConfig(form) {
  const erros = {};
  const valores = { viragem_automatica: Boolean(form.viragem_automatica) };

  for (const campo of CAMPOS_NUMERICOS) {
    const { nome, unidade, min, max, casas } = LIMITES[campo];
    const bruto = String(form[campo] ?? '').trim();

    if (bruto === '') {                                   // GP-05
      erros[campo] = `${nome} é obrigatória.`;
      continue;
    }
    const n = converterNumero(bruto);
    if (Number.isNaN(n)) {                                // GP-06
      erros[campo] = `${nome} aceita somente números.`;
      continue;
    }
    if (n < min || n > max) {                             // GP-07, GP-08 (limites inclusivos: GP-09, GP-10)
      erros[campo] = `${nome} deve estar entre ${min} e ${max} ${unidade}.`;
      continue;
    }
    valores[campo] = Number(n.toFixed(casas));
  }

  // GP-11 (adaptado ao modelo atual): alerta precisa ser maior que a temperatura alvo.
  if (!erros.temp_alvo && !erros.alerta_temperatura &&
      valores.alerta_temperatura <= valores.temp_alvo) {
    erros.alerta_temperatura = 'O alerta de temperatura deve ser maior que a temperatura alvo.';
  }

  return { erros, valores };
}