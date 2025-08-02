import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Settings, User, Package, Edit, Trash2, Power, PowerOff } from 'lucide-react';

interface Machine {
  id: string;
  nome: string;
  ativa: boolean;
  operador?: string;
  bobina_atual?: string;
  created_at: string;
  updated_at: string;
}

interface Bobina {
  id: string;
  codigo: string;
  tipo_plastico: string;
  cor: string;
  em_maquina: boolean;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
}

const MachineManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [bobinas, setBobinas] = useState<Bobina[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    operador: '',
    bobina_atual: ''
  });

  useEffect(() => {
    fetchData();

    // Real-time updates
    const machinesChannel = supabase
      .channel('machines-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maquinas' }, () => {
        fetchMachines();
      })
      .subscribe();

    const bobinasChannel = supabase
      .channel('bobinas-updates-machines')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bobinas' }, () => {
        fetchBobinas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(machinesChannel);
      supabase.removeChannel(bobinasChannel);
    };
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchMachines(), fetchBobinas(), fetchProfiles()]);
  };

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maquinas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMachines(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar máquinas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBobinas = async () => {
    try {
      const { data, error } = await supabase
        .from('bobinas')
        .select('id, codigo, tipo_plastico, cor, em_maquina')
        .eq('em_maquina', false);

      if (error) throw error;
      setBobinas(data || []);
    } catch (error: any) {
      console.error('Error fetching bobinas:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, username');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const machineData = {
        nome: formData.nome,
        operador: formData.operador || null,
        bobina_atual: formData.bobina_atual || null,
        ativa: false
      };

      if (editingMachine) {
        const { error } = await supabase
          .from('maquinas')
          .update(machineData)
          .eq('id', editingMachine.id);

        if (error) throw error;

        toast({
          title: 'Máquina atualizada com sucesso!',
          description: `Máquina ${formData.nome} foi atualizada.`,
        });
      } else {
        const { error } = await supabase
          .from('maquinas')
          .insert(machineData);

        if (error) throw error;

        toast({
          title: 'Máquina adicionada com sucesso!',
          description: `Máquina ${formData.nome} foi adicionada.`,
        });
      }

      // Update bobina status if assigned
      if (formData.bobina_atual) {
        await supabase
          .from('bobinas')
          .update({ em_maquina: true })
          .eq('id', formData.bobina_atual);
      }

      // If editing and previously had a bobina, free it
      if (editingMachine?.bobina_atual && formData.bobina_atual !== editingMachine.bobina_atual) {
        await supabase
          .from('bobinas')
          .update({ em_maquina: false })
          .eq('id', editingMachine.bobina_atual);
      }

      resetForm();
      setIsAddDialogOpen(false);
      setEditingMachine(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar máquina',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (machine: Machine) => {
    if (!confirm(`Deseja realmente excluir a máquina ${machine.nome}?`)) return;

    try {
      // Free the bobina if assigned
      if (machine.bobina_atual) {
        await supabase
          .from('bobinas')
          .update({ em_maquina: false })
          .eq('id', machine.bobina_atual);
      }

      const { error } = await supabase
        .from('maquinas')
        .delete()
        .eq('id', machine.id);

      if (error) throw error;

      toast({
        title: 'Máquina removida',
        description: `Máquina ${machine.nome} foi removida.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover máquina',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleMachineStatus = async (machine: Machine) => {
    try {
      const { error } = await supabase
        .from('maquinas')
        .update({ ativa: !machine.ativa })
        .eq('id', machine.id);

      if (error) throw error;

      toast({
        title: `Máquina ${machine.ativa ? 'desativada' : 'ativada'}`,
        description: `${machine.nome} foi ${machine.ativa ? 'desativada' : 'ativada'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status da máquina',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      operador: '',
      bobina_atual: ''
    });
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      nome: machine.nome,
      operador: machine.operador || '',
      bobina_atual: machine.bobina_atual || ''
    });
    setIsAddDialogOpen(true);
  };

  const getOperatorName = (operatorId: string | undefined) => {
    if (!operatorId) return 'Não definido';
    const profile = profiles.find(p => p.user_id === operatorId);
    return profile?.full_name || profile?.username || 'Usuário não encontrado';
  };

  const getBobinaInfo = (bobinaId: string | undefined) => {
    if (!bobinaId) return null;
    // We need to fetch current bobina info including those em_maquina = true
    return null; // For now, we'll show just the ID
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Máquinas</h2>
          <p className="text-muted-foreground">Gerencie máquinas e operadores</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-accent hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Máquina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMachine ? 'Editar Máquina' : 'Adicionar Nova Máquina'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Máquina *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                  placeholder="Ex: Máquina 01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="operador">Operador</Label>
                <Select value={formData.operador} onValueChange={(value) => setFormData(prev => ({ ...prev, operador: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um operador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum operador</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        {profile.full_name || profile.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bobina_atual">Bobina</Label>
                <Select value={formData.bobina_atual} onValueChange={(value) => setFormData(prev => ({ ...prev, bobina_atual: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma bobina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma bobina</SelectItem>
                    {bobinas.map((bobina) => (
                      <SelectItem key={bobina.id} value={bobina.id}>
                        {bobina.codigo} - {bobina.tipo_plastico} ({bobina.cor})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-accent hover:opacity-90">
                  {editingMachine ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingMachine(null);
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

      {/* Machines Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {machines.map((machine) => (
          <Card key={machine.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{machine.nome}</CardTitle>
                  <Badge variant={machine.ativa ? "default" : "secondary"} className={machine.ativa ? "bg-success" : ""}>
                    {machine.ativa ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleMachineStatus(machine)}
                    className="h-8 w-8"
                  >
                    {machine.ativa ? (
                      <PowerOff className="h-4 w-4 text-destructive" />
                    ) : (
                      <Power className="h-4 w-4 text-success" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(machine)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(machine)}
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
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{getOperatorName(machine.operador)}</span>
                </div>
                
                {machine.bobina_atual ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Bobina em uso</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Sem bobina</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Criada em: {new Date(machine.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {machines.length === 0 && (
        <Card className="p-8 text-center">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma máquina cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Adicione sua primeira máquina para começar a produção
          </p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-accent hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Máquina
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MachineManagement;