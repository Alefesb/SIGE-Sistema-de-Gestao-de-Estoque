
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package2, Weight, Ruler, MapPin, User, Calendar } from 'lucide-react';
import { Bobina } from '../types/bobina';

interface EstoquePorPrioridadeProps {
  bobinas: Bobina[];
}

const EstoquePorPrioridade: React.FC<EstoquePorPrioridadeProps> = ({ bobinas }) => {
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500 hover:bg-red-600';
      case 'media': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'baixa': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return '🔴';
      case 'media': return '🟡';
      case 'baixa': return '🟢';
      default: return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Agrupar bobinas por prioridade
  const bobinasPorPrioridade = {
    alta: bobinas.filter(b => b.prioridade === 'alta'),
    media: bobinas.filter(b => b.prioridade === 'media'),
    baixa: bobinas.filter(b => b.prioridade === 'baixa')
  };

  const prioridades = [
    { key: 'alta', label: 'Alta Prioridade', icon: '🔴', color: 'text-red-600' },
    { key: 'media', label: 'Média Prioridade', icon: '🟡', color: 'text-yellow-600' },
    { key: 'baixa', label: 'Baixa Prioridade', icon: '🟢', color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package2 className="h-5 w-5" />
            Estoque por Prioridade ({bobinas.length} bobinas)
          </CardTitle>
        </CardHeader>
      </Card>

      {prioridades.map((prioridade) => {
        const bobinasDaPrioridade = bobinasPorPrioridade[prioridade.key as keyof typeof bobinasPorPrioridade];
        
        return (
          <div key={prioridade.key} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className={`text-xl font-bold ${prioridade.color}`}>
                {prioridade.icon} {prioridade.label}
              </h2>
              <Badge variant="outline" className="text-sm">
                {bobinasDaPrioridade.length} bobinas
              </Badge>
            </div>

            {bobinasDaPrioridade.length === 0 ? (
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Package2 className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Nenhuma bobina com {prioridade.label.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bobinasDaPrioridade.map((bobina) => (
                  <Card 
                    key={bobina.id} 
                    className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-foreground truncate">
                            {bobina.codigo}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {bobina.descricao}
                          </p>
                        </div>
                        <Badge className={`${getPrioridadeColor(bobina.prioridade)} text-white border-0 ml-2`}>
                          {getPrioridadeIcon(bobina.prioridade)} {bobina.prioridade.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-primary" />
                          <span>{bobina.peso} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-primary" />
                          <span>{bobina.largura}cm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package2 className="h-4 w-4 text-primary" />
                          <span>{bobina.quantidade} un</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">{bobina.localizacao || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Material:</span>
                          <span className="text-muted-foreground">{bobina.material || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Cor:</span>
                          <span className="text-muted-foreground">{bobina.cor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Comprimento:</span>
                          <span className="text-muted-foreground">{bobina.comprimento}m</span>
                        </div>
                      </div>

                      <div className="border-t border-border/50 pt-3 space-y-2 text-xs text-muted-foreground">
                        {bobina.fornecedor && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span className="truncate">{bobina.fornecedor}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Entrada: {formatDate(bobina.dataEntrada)}</span>
                        </div>
                        {bobina.observacoes && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <span className="font-medium">Obs:</span> {bobina.observacoes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EstoquePorPrioridade;
