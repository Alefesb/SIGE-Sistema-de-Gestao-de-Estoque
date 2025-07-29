
import React, { useState } from 'react';
import { useBobinas } from '../hooks/useBobinas';
import Dashboard from '../components/Dashboard';
import AdicionarBobina from '../components/AdicionarBobina';
import ListaBobinas from '../components/ListaBobinas';
import EstoquePorPrioridade from '../components/EstoquePorPrioridade';
import Layout from '../components/Layout';
import { toast } from 'sonner';

const Index = () => {
  console.log('Index component rendering...');
  
  const {
    bobinas,
    filtro,
    setFiltro,
    adicionarBobina,
    removerBobina,
    totalBobinas,
    totalQuantidade
  } = useBobinas();

  const [activeTab, setActiveTab] = useState('dashboard');
  
  console.log('Active tab:', activeTab);
  console.log('Total bobinas:', totalBobinas);

  const handleAdicionarBobina = (novaBobina: any) => {
    console.log('Adding bobina:', novaBobina);
    adicionarBobina(novaBobina);
    toast.success('Bobina adicionada com sucesso!', {
      description: `${novaBobina.codigo} - ${novaBobina.descricao}`
    });
  };

  const handleRemoverBobina = (id: string) => {
    const bobina = bobinas.find(b => b.id === id);
    removerBobina(id);
    toast.success('Bobina removida do estoque!', {
      description: bobina ? `${bobina.codigo} foi removida` : 'Bobina removida'
    });
  };

  const renderContent = () => {
    console.log('Rendering content for tab:', activeTab);
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard bobinas={bobinas} />;
      case 'adicionar':
        return <AdicionarBobina onAdicionar={handleAdicionarBobina} />;
      case 'estoque':
        return <EstoquePorPrioridade bobinas={bobinas} />;
      case 'listar':
        return (
          <ListaBobinas 
            bobinas={bobinas}
            filtro={filtro}
            onFiltroChange={setFiltro}
            onRemover={handleRemoverBobina}
          />
        );
      default:
        return <Dashboard bobinas={bobinas} />;
    }
  };

  console.log('About to render Layout...');

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      totalBobinas={totalBobinas}
      totalQuantidade={totalQuantidade}
    >
      {renderContent()}
    </Layout>
  );
};

export default Index;
