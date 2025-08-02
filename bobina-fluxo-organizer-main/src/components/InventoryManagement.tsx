import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, Calendar, MapPin, Palette, Edit, Trash2, Search, Filter } from 'lucide-react';

interface Bobina {
  id: string;
  codigo: string;
  tipo_plastico: string;
  cor: string;
  peso: number;
  largura: number;
  espessura: number;
  quantidade_estoque: number;
  quantidade_usada: number;
  localizacao?: string;
  fornecedor?: string;
  data_entrada: string;
  data_validade?: string;
  em_maquina: boolean;
  observacoes?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  foto_url?: string;
}

const InventoryManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bobinas, setBobinas] = useState<Bobina[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBobina, setEditingBobina] = useState<Bobina | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    tipo_plastico: '',
    cor: '',
    peso: '',
    largura: '',
    espessura: '',
    quantidade_estoque: '',
    localizacao: '',
    fornecedor: '',
    data_validade: '',
    observacoes: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta'
  });

  useEffect(() => {
    fetchBobinas();

    // Real-time updates
    const channel = supabase
      .channel('bobinas-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bobinas' }, () => {
        fetchBobinas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBobinas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bobinas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBobinas(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar bobinas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const bobinData = {
        ...formData,
        peso: parseFloat(formData.peso),
        largura: parseFloat(formData.largura),
        espessura: parseFloat(formData.espessura),
        quantidade_estoque: parseInt(formData.quantidade_estoque),
        user_id: user.id,
        data_validade: formData.data_validade || null,
      };

      if (editingBobina) {
        const { error } = await supabase
          .from('bobinas')
          .update(bobinData)
          .eq('id', editingBobina.id);

        if (error) throw error;

        toast({
          title: 'Bobina atualizada com sucesso!',
          description: `Bobina ${formData.codigo} foi atualizada.`,
        });
      } else {
        const { error } = await supabase
          .from('bobinas')
          .insert(bobinData);

        if (error) throw error;

        toast({
          title: 'Bobina adicionada com sucesso!',
          description: `Bobina ${formData.codigo} foi adicionada ao estoque.`,
        });
      }

      resetForm();
      setIsAddDialogOpen(false);
      setEditingBobina(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar bobina',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (bobina: Bobina) => {
    if (!confirm(`Deseja realmente excluir a bobina ${bobina.codigo}?`)) return;

    try {
      const { error } = await supabase
        .from('bobinas')
        .delete()
        .eq('id', bobina.id);

      if (error) throw error;

      toast({
        title: 'Bobina removida',
        description: `Bobina ${bobina.codigo} foi removida do estoque.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover bobina',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      tipo_plastico: '',
      cor: '',
      peso: '',
      largura: '',
      espessura: '',
      quantidade_estoque: '',
      localizacao: '',
      fornecedor: '',
      data_validade: '',
      observacoes: '',
      prioridade: 'media'
    });
  };

  const handleEdit = (bobina: Bobina) => {
    setEditingBobina(bobina);
    setFormData({
      codigo: bobina.codigo,
      tipo_plastico: bobina.tipo_plastico,
      cor: bobina.cor,
      peso: bobina.peso.toString(),
      largura: bobina.largura.toString(),
      espessura: bobina.espessura.toString(),
      quantidade_estoque: bobina.quantidade_estoque.toString(),
      localizacao: bobina.localizacao || '',
      fornecedor: bobina.fornecedor || '',
      data_validade: bobina.data_validade ? new Date(bobina.data_validade).toISOString().split('T')[0] : '',
      observacoes: bobina.observacoes || '',
      prioridade: bobina.prioridade
    });
    setIsAddDialogOpen(true);
  };

  const filteredBobinas = bobinas.filter(bobina => {
    const matchesSearch = bobina.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bobina.tipo_plastico.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bobina.cor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || bobina.prioridade === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'destructive';
      case 'media': return 'warning';
      case 'baixa': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return 'Média';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Estoque</h2>
          <p className="text-muted-foreground">Gerencie bobinas e materiais</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Bobina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBobina ? 'Editar Bobina' : 'Adicionar Nova Bobina'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_plastico">Tipo de Plástico *</Label>
                  <Input
                    id="tipo_plastico"
                    value={formData.tipo_plastico}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_plastico: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor *</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg) *</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.01"
                    value={formData.peso}
                    onChange={(e) => setFormData(prev => ({ ...prev, peso: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (mm) *</Label>
                  <Input
                    id="largura"
                    type="number"
                    step="0.01"
                    value={formData.largura}
                    onChange={(e) => setFormData(prev => ({ ...prev, largura: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="espessura">Espessura (mm) *</Label>
                  <Input
                    id="espessura"
                    type="number"
                    step="0.001"
                    value={formData.espessura}
                    onChange={(e) => setFormData(prev => ({ ...prev, espessura: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade_estoque">Quantidade em Estoque *</Label>
                  <Input
                    id="quantidade_estoque"
                    type="number"
                    value={formData.quantidade_estoque}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantidade_estoque: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select value={formData.prioridade} onValueChange={(value: 'baixa' | 'media' | 'alta') => setFormData(prev => ({ ...prev, prioridade: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="data_validade">Data de Validade</Label>
                  <Input
                    id="data_validade"
                    type="date"
                    value={formData.data_validade}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_validade: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  {editingBobina ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingBobina(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, tipo ou cor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as prioridades</SelectItem>
            <SelectItem value="alta">Alta prioridade</SelectItem>
            <SelectItem value="media">Média prioridade</SelectItem>
            <SelectItem value="baixa">Baixa prioridade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bobinas Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBobinas.map((bobina) => (
          <Card key={bobina.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{bobina.codigo}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(bobina.prioridade) as any}>
                      {getPriorityLabel(bobina.prioridade)}
                    </Badge>
                    {bobina.em_maquina && (
                      <Badge variant="outline" className="text-success border-success">
                        Em Uso
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(bobina)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(bobina)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{bobina.tipo_plastico}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span>{bobina.cor}</span>
                </div>
                {bobina.localizacao && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{bobina.localizacao}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Peso:</span>
                  <div className="font-medium">{bobina.peso} kg</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estoque:</span>
                  <div className="font-medium">{bobina.quantidade_estoque}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Largura:</span>
                  <div className="font-medium">{bobina.largura} mm</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Espessura:</span>
                  <div className="font-medium">{bobina.espessura} mm</div>
                </div>
              </div>
              {bobina.data_validade && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Validade: {new Date(bobina.data_validade).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBobinas.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma bobina encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterPriority !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Adicione sua primeira bobina ao estoque'}
          </p>
          {!searchTerm && filterPriority === 'all' && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Bobina
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default InventoryManagement;