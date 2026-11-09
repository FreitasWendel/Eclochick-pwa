// src/models/CicloModel.js

export const FasesCiclo = {
  INCUBACAO: 'incubacao', // Dias 1 a 17
  ECLOSAO: 'eclosao',     // Dias 18 a 21
  FINALIZADO: 'finalizado'
};

export class CicloAtivo {
  constructor(quantidadeOvos, dataInicio = new Date()) {
    this.id = crypto.randomUUID(); // Gera um ID único
    this.quantidade_ovos = quantidadeOvos;
    this.data_inicio = dataInicio.toISOString();
    this.fase = FasesCiclo.INCUBACAO;
    this.ovos_eclodidos = null;
  }
}