// src/utils/validacaoConfig.test.js
// Testes automáticos do Gerenciamento de Parâmetros (planilha GP-xx).
// Rodar com: npm test
import { describe, it, expect } from 'vitest';
import { validarConfig, converterNumero, LIMITES } from './validacaoConfig';
 
const valido = { temp_alvo: '37.5', alerta_temperatura: '39', umid_alvo: '60', viragem_automatica: true };
const com = (alt) => validarConfig({ ...valido, ...alt });
const temErro = (r, campo) => Boolean(r.erros[campo]);
 
describe('Gerenciamento de Parâmetros — validação', () => {
  it('GP-02/GP-14: aceita vários valores válidos e devolve números', () => {
    const r = com({ temp_alvo: '38', umid_alvo: '65', alerta_temperatura: '40' });
    expect(r.erros).toEqual({});
    expect(r.valores).toEqual({ temp_alvo: 38, umid_alvo: 65, alerta_temperatura: 40, viragem_automatica: true });
  });
 
  it('GP-02: aceita vírgula como separador decimal', () => {
    expect(com({ temp_alvo: '37,8' }).valores.temp_alvo).toBe(37.8);
  });
 
  it.each(['temp_alvo', 'alerta_temperatura', 'umid_alvo'])('GP-05: bloqueia %s vazio', (campo) => {
    expect(temErro(com({ [campo]: '' }), campo)).toBe(true);
    expect(temErro(com({ [campo]: '   ' }), campo)).toBe(true);
  });
 
  it.each(['abc', '37.5.1', '--3', '3e2', '+5', '.', '-'])('GP-06: rejeita entrada não numérica "%s"', (txt) => {
    expect(Number.isNaN(converterNumero(txt))).toBe(true);
    expect(temErro(com({ umid_alvo: txt }), 'umid_alvo')).toBe(true);
  });
 
  it.each(Object.keys(LIMITES))('GP-07: bloqueia %s abaixo do mínimo e informa a faixa', (campo) => {
    const { min, max } = LIMITES[campo];
    const r = com({ [campo]: String(min - 0.1) });
    expect(r.erros[campo]).toContain(String(min));
    expect(r.erros[campo]).toContain(String(max));
  });
 
  it.each(Object.keys(LIMITES))('GP-08: bloqueia %s acima do máximo e informa a faixa', (campo) => {
    const { min, max } = LIMITES[campo];
    const r = com({ [campo]: String(max + 0.1) });
    expect(r.erros[campo]).toContain(String(min));
    expect(r.erros[campo]).toContain(String(max));
  });
 
  it.each(['temp_alvo', 'umid_alvo'])('GP-09: aceita %s exatamente no mínimo', (campo) => {
    expect(temErro(com({ [campo]: String(LIMITES[campo].min) }), campo)).toBe(false);
  });
 
  it('GP-09: aceita alerta de temperatura exatamente no mínimo quando a temperatura alvo é menor', () => {
    const r = com({ temp_alvo: '35', alerta_temperatura: '35.1' });
    expect(r.erros).toEqual({});
  });
 
  it.each(Object.keys(LIMITES))('GP-10: aceita %s exatamente no máximo', (campo) => {
    const r = com({ [campo]: String(LIMITES[campo].max) });
    expect(temErro(r, campo)).toBe(false);
  });
 
  it('GP-11: bloqueia alerta de temperatura menor ou igual à temperatura alvo', () => {
    expect(temErro(com({ temp_alvo: '38', alerta_temperatura: '38' }), 'alerta_temperatura')).toBe(true);
    expect(temErro(com({ temp_alvo: '38', alerta_temperatura: '37' }), 'alerta_temperatura')).toBe(true);
    expect(temErro(com({ temp_alvo: '38', alerta_temperatura: '38.1' }), 'alerta_temperatura')).toBe(false);
  });
 
  it('GP-23: valores são arredondados nas casas definidas (sem lixo de ponto flutuante)', () => {
    expect(com({ temp_alvo: '37.55' }).valores.temp_alvo).toBe(Number((37.55).toFixed(1)));
    expect(com({ umid_alvo: '60.7' }).valores.umid_alvo).toBe(61);
  });
});