
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, MapPin, Calendar, User, Package2, Ruler, Weight } from 'lucide-react';
import { Bobina, PrioridadeFilter } from '../types/bobina';

interface ListaBobinasProps {
  bobinas: Bobina[];
  filtro: PrioridadeFilter;
  onFiltroChange: (filtro: PrioridadeFilter) => void;
  onRemover: (id: string) => void;
}

const ListaBobinas: React.FC<ListaBobinasProps> = ({ 
  bobinas, 
  filtro, 
  onFiltroChange, 
  onRemover 
}) => {
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

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="flex items-center gap-2 text-foreground">
              <Package2 className="h-5 w-5" />
              Estoque de Bobinas ({bobinas.length})
            </span>
            <Select value={filtro} onValueChange={onFiltroChange}>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Prioridades</SelectItem>
                <SelectItem value="alta">🔴 Alta Prioridade</SelectItem>
                <SelectItem value="media">🟡 Média Prioridade</SelectItem>
                <SelectItem value="baixa">🟢 Baixa Prioridade</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
      </Card>

      {bobinas.length === 0 ? (
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma bobina encontrada
            </h3>
            <p className="text-muted-foreground text-center">
              {filtro === 'todas' 
                ? 'Adicione sua primeira bobina ao estoque!' 
                : `Não há bobinas com prioridade ${filtro}.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bobinas.map((bobina) => (
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
                  <div className="flex flex-col items-end gap-2 ml-2">
                    <Badge className={`${getPrioridadeColor(bobina.prioridade)} text-white border-0`}>
                      {getPrioridadeIcon(bobina.prioridade)} {bobina.prioridade.toUpperCase()}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemover(bobina.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
                    <span className="truncate">{bobina.localizacao}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Material:</span>
                    <span className="text-muted-foreground">{bobina.material}</span>
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
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span className="truncate">{bobina.fornecedor}</span>
                  </div>
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
};

export default ListaBobinas;
