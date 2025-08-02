import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { History, Package, User, Calendar, Search, Filter, Download, RefreshCw } from 'lucide-react';

interface HistoryRecord {
  id: string;
  bobina_id: string;
  maquina_id: string;
  quantidade_usada: number;
  data_uso: string;
  operador: string;
  observacoes?: string;
  // Join data
  bobina_codigo?: string;
  bobina_tipo?: string;
  bobina_cor?: string;
  maquina_nome?: string;
  operador_nome?: string;
}

const HistoryView = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [machineFilter, setMachineFilter] = useState('all');
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
    fetchMachines();

    // Real-time updates
    const channel = supabase
      .channel('history-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historico_bobinas' }, () => {
        fetchHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('historico_bobinas')
        .select(`
          *,
          bobinas:bobina_id (codigo, tipo_plastico, cor),
          maquinas:maquina_id (nome),
          profiles:operador (full_name, username)
        `)
        .order('data_uso', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform the data to flatten the joined fields
      const transformedData = data?.map(record => ({
        ...record,
        bobina_codigo: record.bobinas?.codigo,
        bobina_tipo: record.bobinas?.tipo_plastico,
        bobina_cor: record.bobinas?.cor,
        maquina_nome: record.maquinas?.nome,
        operador_nome: record.profiles?.full_name || record.profiles?.username
      })) || [];

      setHistory(transformedData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar histórico',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('maquinas')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setMachines(data || []);
    } catch (error: any) {
      console.error('Error fetching machines:', error);
    }
  };

  const getDateFilteredHistory = () => {
    const now = new Date();
    let filteredHistory = history;

    switch (dateFilter) {
      case 'today':
        filteredHistory = history.filter(record => {
          const recordDate = new Date(record.data_uso);
          return recordDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredHistory = history.filter(record => {
          const recordDate = new Date(record.data_uso);
          return recordDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredHistory = history.filter(record => {
          const recordDate = new Date(record.data_uso);
          return recordDate >= monthAgo;
        });
        break;
      default:
        break;
    }

    if (machineFilter !== 'all') {
      filteredHistory = filteredHistory.filter(record => record.maquina_id === machineFilter);
    }

    if (searchTerm) {
      filteredHistory = filteredHistory.filter(record =>
        record.bobina_codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.maquina_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.operador_nome?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredHistory;
  };

  const exportToCSV = () => {
    const filteredData = getDateFilteredHistory();
    const csvHeader = 'Data,Bobina,Tipo,Cor,Máquina,Operador,Quantidade Usada,Observações\n';
    const csvContent = filteredData.map(record => {
      const date = new Date(record.data_uso).toLocaleDateString('pt-BR');
      const bobina = record.bobina_codigo || 'N/A';
      const tipo = record.bobina_tipo || 'N/A';
      const cor = record.bobina_cor || 'N/A';
      const maquina = record.maquina_nome || 'N/A';
      const operador = record.operador_nome || 'N/A';
      const quantidade = record.quantidade_usada;
      const obs = record.observacoes || '';
      
      return `${date},${bobina},${tipo},${cor},${maquina},${operador},${quantidade},"${obs}"`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Exportação concluída',
      description: 'Histórico exportado para CSV com sucesso.',
    });
  };

  const filteredHistory = getDateFilteredHistory();

  const getTotalUsage = () => {
    return filteredHistory.reduce((total, record) => total + record.quantidade_usada, 0);
  };

  const getUniqueOperators = () => {
    const operators = new Set(filteredHistory.map(record => record.operador_nome).filter(Boolean));
    return operators.size;
  };

  const getUniqueMachines = () => {
    const machines = new Set(filteredHistory.map(record => record.maquina_nome).filter(Boolean));
    return machines.size;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Histórico de Produção</h2>
          <p className="text-muted-foreground">Acompanhe o uso de materiais e produção</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Registros</p>
                <p className="text-xl font-bold">{filteredHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Material Usado</p>
                <p className="text-xl font-bold">{getTotalUsage()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Operadores</p>
                <p className="text-xl font-bold">{getUniqueOperators()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Máquinas</p>
                <p className="text-xl font-bold">{getUniqueMachines()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por bobina, máquina ou operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mês</SelectItem>
          </SelectContent>
        </Select>
        <Select value={machineFilter} onValueChange={setMachineFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por máquina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as máquinas</SelectItem>
            {machines.map((machine) => (
              <SelectItem key={machine.id} value={machine.id}>
                {machine.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* History Cards */}
      <div className="space-y-4">
        {filteredHistory.map((record) => (
          <Card key={record.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-6 md:items-center">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-medium">{record.bobina_codigo || 'Bobina removida'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.bobina_tipo} - {record.bobina_cor}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Máquina</div>
                  <div className="font-medium">{record.maquina_nome || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Operador</div>
                  <div className="font-medium">{record.operador_nome || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Quantidade</div>
                  <Badge variant="outline" className="font-medium">
                    {record.quantidade_usada}
                  </Badge>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Data</div>
                  <div className="font-medium">
                    {new Date(record.data_uso).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(record.data_uso).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              
              {record.observacoes && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm text-muted-foreground">Observações:</div>
                  <div className="text-sm mt-1">{record.observacoes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <Card className="p-8 text-center">
          <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum registro encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm || dateFilter !== 'all' || machineFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'O histórico de produção aparecerá aqui quando houver atividade'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default HistoryView;