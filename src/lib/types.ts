export interface Demanda {
  id: number;
  titulo: string;
  descricao: string | null;
  responsavel: string;
  categoria: string;
  status: string;
  prazo: string | null;
  valorEstimado: string | null;
  fornecedor: string | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
  atualizadoPor: string;
}

export interface Historico {
  id: number;
  demandaId: number;
  campo: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  alteradoPor: string;
  alteradoEm: string;
}
