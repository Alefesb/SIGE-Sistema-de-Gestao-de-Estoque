
import { useState, useEffect } from 'react';
import { Bobina, PrioridadeFilter } from '../types/bobina';

export const useBobinas = () => {
  const [bobinas, setBobinas] = useState<Bobina[]>([]);
  const [filtro, setFiltro] = useState<PrioridadeFilter>('todas');

  // Carregar dados do localStorage
  useEffect(() => {
    const storedBobinas = localStorage.getItem('bobinas-estoque');
    if (storedBobinas) {
      setBobinas(JSON.parse(storedBobinas));
    } else {
      // Dados de exemplo
      const exemplosBobinas: Bobina[] = [
        {
          id: '1',
          codigo: 'BOB-001',
          descricao: 'Bobina PEBD Transparente',
          peso: 25.5,
          largura: 100,
          comprimento: 500,
          cor: 'Transparente',
          material: 'PEBD',
          quantidade: 15,
          localizacao: 'A1-02',
          prioridade: 'alta',
          dataEntrada: '2024-01-15',
          fornecedor: 'Plastinova Ltda',
          observacoes: 'Material para produção urgente'
        },
        {
          id: '2',
          codigo: 'BOB-002',
          descricao: 'Bobina PP Azul',
          peso: 30.0,
          largura: 80,
          comprimento: 600,
          cor: 'Azul',
          material: 'PP',
          quantidade: 8,
          localizacao: 'B2-15',
          prioridade: 'media',
          dataEntrada: '2024-01-10',
          fornecedor: 'Polimeros do Sul'
        }
      ];
      setBobinas(exemplosBobinas);
    }
  }, []);

  // Salvar no localStorage sempre que bobinas mudam
  useEffect(() => {
    localStorage.setItem('bobinas-estoque', JSON.stringify(bobinas));
  }, [bobinas]);

  const adicionarBobina = (novaBobina: Omit<Bobina, 'id'>) => {
    const bobina: Bobina = {
      ...novaBobina,
      id: Date.now().toString()
    };
    setBobinas(prev => [...prev, bobina]);
  };

  const removerBobina = (id: string) => {
    setBobinas(prev => prev.filter(bobina => bobina.id !== id));
  };

  const editarBobina = (id: string, dadosAtualizados: Partial<Bobina>) => {
    setBobinas(prev => 
      prev.map(bobina => 
        bobina.id === id ? { ...bobina, ...dadosAtualizados } : bobina
      )
    );
  };

  const bobinasFiltradas = bobinas.filter(bobina => 
    filtro === 'todas' || bobina.prioridade === filtro
  );

  const bobinasOrdenadas = [...bobinasFiltradas].sort((a, b) => {
    const prioridadeOrder = { alta: 3, media: 2, baixa: 1 };
    return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
  });

  return {
    bobinas: bobinasOrdenadas,
    filtro,
    setFiltro,
    adicionarBobina,
    removerBobina,
    editarBobina,
    totalBobinas: bobinas.length,
    totalQuantidade: bobinas.reduce((sum, bobina) => sum + bobina.quantidade, 0)
  };
};
