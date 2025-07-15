
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle, MapPin, BarChart3 } from 'lucide-react';
import { Bobina } from '../types/bobina';

interface DashboardProps {
  bobinas: Bobina[];
}

const Dashboard: React.FC<DashboardProps> = ({ bobinas }) => {
  console.log('Dashboard component rendering with bobinas:', bobinas.length);
  
  const totalBobinas = bobinas.length;
  const totalQuantidade = bobinas.reduce((sum, bobina) => sum + bobina.quantidade, 0);
  const totalPeso = bobinas.reduce((sum, bobina) => sum + (bobina.peso * bobina.quantidade), 0);
  
  const bobinasPrioridadeAlta = bobinas.filter(b => b.prioridade === 'alta').length;
  const bobinasPrioridadeMedia = bobinas.filter(b => b.prioridade === 'media').length;
  const bobinasPrioridadeBaixa = bobinas.filter(b => b.prioridade === 'baixa').length;

  const materiaisUnicos = [...new Set(bobinas.map(b => b.material))];
  const localizacoesUnicas = [...new Set(bobinas.map(b => b.localizacao))];

  const estatisticas = [
    {
      titulo: 'Total de Bobinas',
      valor: totalBobinas,
      subvalor: `${totalQuantidade} unidades`,
      icon: Package,
      cor: 'from-primary/20 to-primary/10',
      textCor: 'text-primary',
      iconCor: 'text-primary'
    },
    {
      titulo: 'Peso Total',
      valor: `${totalPeso.toFixed(1)} kg`,
      subvalor: `${(totalPeso / 1000).toFixed(2)} toneladas`,
      icon: TrendingUp,
      cor: 'from-green-500/20 to-green-500/10',
      textCor: 'text-green-600',
      iconCor: 'text-green-600'
    },
    {
      titulo: 'Alta Prioridade',
      valor: bobinasPrioridadeAlta,
      subvalor: 'Requer atenção',
      icon: AlertTriangle,
      cor: 'from-red-500/20 to-red-500/10',
      textCor: 'text-red-600',
      iconCor: 'text-red-600'
    },
    {
      titulo: 'Localizações',
      valor: localizacoesUnicas.length,
      subvalor: `${materiaisUnicos.length} materiais`,
      icon: MapPin,
      cor: 'from-purple-500/20 to-purple-500/10',
      textCor: 'text-purple-600',
      iconCor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Principal</h2>
        <p className="text-muted-foreground">Visão geral do estoque de bobinas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {estatisticas.map((stat, index) => (
          <Card key={index} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className={`bg-gradient-to-br ${stat.cor} pb-3`}>
              <CardTitle className="flex items-center justify-between text-sm font-medium text-foreground">
                {stat.titulo}
                <stat.icon className={`h-4 w-4 ${stat.iconCor}`} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${stat.textCor}`}>
                {stat.valor}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subvalor}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Alta Prioridade</span>
                </div>
                <span className="font-bold text-red-600">{bobinasPrioridadeAlta}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Média Prioridade</span>
                </div>
                <span className="font-bold text-yellow-600">{bobinasPrioridadeMedia}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Baixa Prioridade</span>
                </div>
                <span className="font-bold text-green-600">{bobinasPrioridadeBaixa}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Materiais em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materiaisUnicos.length > 0 ? (
                materiaisUnicos.map((material, index) => {
                  const quantidade = bobinas
                    .filter(b => b.material === material)
                    .reduce((sum, b) => sum + b.quantidade, 0);
                  return (
                    <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{material}</span>
                      <span className="font-bold text-primary">{quantidade} un</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum material cadastrado</p>
                  <p className="text-xs text-muted-foreground mt-1">Adicione bobinas para ver os materiais aqui</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
