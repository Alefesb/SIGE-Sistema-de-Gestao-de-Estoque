
export interface Bobina {
  id: string;
  codigo: string;
  descricao: string;
  peso: number;
  largura: number;
  comprimento: number;
  cor: string;
  material: string;
  quantidade: number;
  localizacao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  dataEntrada: string;
  fornecedor: string;
  observacoes?: string;
}

export type PrioridadeFilter = 'todas' | 'alta' | 'media' | 'baixa';
