import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, ArrowRight, Minus, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Bobina {
  id: string;
  codigo: string;
  tipo_plastico: string;
  cor: string;
  espessura: number;
  largura: number;
  peso: number;
  quantidade_estoque: number;
  prioridade: 'alta' | 'media' | 'baixa';
  localizacao?: string;
  fornecedor?: string;
  observacoes?: string;
  em_maquina: boolean;
  data_entrada: string;
  quantidade_usada?: number;
  usuario_adicionou?: string;
  profiles?: {
    username: string;
  };
}

interface Maquina {
  id: string;
  nome: string;
  ativa: boolean;
}

const BobinasManager = () => {
  const [bobinas, setBobinas] = useState<Bobina[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedBobina, setSelectedBobina] = useState<Bobina | null>(null);
  const [filtros, setFiltros] = useState({
    prioridade: 'todos',
    status: 'todos'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBobinas();
    fetchMaquinas();
  }, []);

  const fetchBobinas = async () => {
    const { data, error } = await supabase
      .from('bobinas')
      .select(`
        *,
        profiles!bobinas_usuario_adicionou_fkey(username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar bobinas",
        variant: "destructive",
      });
    } else {
      setBobinas(data || []);
    }
  };

  const fetchMaquinas = async () => {
    const { data, error } = await supabase
      .from('maquinas')
      .select('*')
      .order('nome');

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar máquinas",
        variant: "destructive",
      });
    } else {
      setMaquinas(data || []);
    }
  };

  const handleAddBobina = async (formData: FormData) => {
    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const novaBoina = {
      codigo: formData.get('codigo') as string,
      tipo_plastico: formData.get('tipo_plastico') as string,
      cor: formData.get('cor') as string,
      espessura: parseFloat(formData.get('espessura') as string),
      largura: parseFloat(formData.get('largura') as string),
      peso: parseFloat(formData.get('peso') as string),
      quantidade_estoque: parseInt(formData.get('quantidade') as string),
      prioridade: formData.get('prioridade') as 'alta' | 'media' | 'baixa',
      localizacao: formData.get('localizacao') as string,
      fornecedor: formData.get('fornecedor') as string,
      observacoes: formData.get('observacoes') as string,
      user_id: user.id,
      usuario_adicionou: user.id
    };

    const { error } = await supabase
      .from('bobinas')
      .insert([novaBoina]);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar bobina",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Bobina adicionada com sucesso",
      });
      setIsAddDialogOpen(false);
      fetchBobinas();
    }

    setIsLoading(false);
  };

  const handleTransferToMachine = async (bobina: Bobina, maquinaId: string, quantidade: number) => {
    if (quantidade > bobina.quantidade_estoque) {
      toast({
        title: "Erro",
        description: "Quantidade maior que o estoque disponível",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Atualizar bobina
    const novaQuantidade = bobina.quantidade_estoque - quantidade;
    const { error: updateError } = await supabase
      .from('bobinas')
      .update({
        quantidade_estoque: novaQuantidade,
        em_maquina: novaQuantidade === 0,
        data_para_maquina: new Date().toISOString(),
        quantidade_usada: (bobina.quantidade_usada || 0) + quantidade
      })
      .eq('id', bobina.id);

    // Registrar no histórico
    const { error: historyError } = await supabase
      .from('historico_bobinas')
      .insert([{
        bobina_id: bobina.id,
        maquina_id: maquinaId,
        quantidade_usada: quantidade,
        operador: user.id
      }]);

    if (updateError || historyError) {
      toast({
        title: "Erro",
        description: "Erro ao transferir bobina para máquina",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: `${quantidade} unidades transferidas para a máquina`,
      });
      setIsTransferDialogOpen(false);
      setSelectedBobina(null);
      fetchBobinas();
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    const variants = {
      alta: 'destructive',
      media: 'default',
      baixa: 'secondary'
    } as const;

    return (
      <Badge variant={variants[prioridade as keyof typeof variants]}>
        {prioridade.toUpperCase()}
      </Badge>
    );
  };

  const bobinasFiltradas = bobinas.filter((bobina) => {
    if (filtros.prioridade !== 'todos' && bobina.prioridade !== filtros.prioridade) return false;
    if (filtros.status !== 'todos') {
      if (filtros.status === 'estoque' && bobina.quantidade_estoque === 0) return false;
      if (filtros.status === 'vazio' && bobina.quantidade_estoque > 0) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Bobinas</h1>
          <p className="text-muted-foreground">Controle e monitore o estoque de bobinas</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Bobina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Bobina</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova bobina para adicionar ao estoque
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddBobina(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input id="codigo" name="codigo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select name="prioridade" defaultValue="media">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_plastico">Tipo de Plástico</Label>
                  <Input id="tipo_plastico" name="tipo_plastico" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <Input id="cor" name="cor" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="espessura">Espessura (mm)</Label>
                  <Input id="espessura" name="espessura" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (mm)</Label>
                  <Input id="largura" name="largura" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input id="peso" name="peso" type="number" step="0.01" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input id="quantidade" name="quantidade" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input id="localizacao" name="localizacao" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input id="fornecedor" name="fornecedor" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={3} />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Adicionando..." : "Adicionar Bobina"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={filtros.prioridade} onValueChange={(value) => 
                setFiltros(prev => ({ ...prev, prioridade: value }))
              }>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filtros.status} onValueChange={(value) => 
                setFiltros(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="estoque">Em Estoque</SelectItem>
                  <SelectItem value="vazio">Estoque Vazio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Bobinas */}
      <Card>
        <CardHeader>
          <CardTitle>Bobinas Cadastradas</CardTitle>
          <CardDescription>Total: {bobinasFiltradas.length} bobinas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Dimensões</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Adicionado por</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bobinasFiltradas.map((bobina) => (
                <TableRow key={bobina.id}>
                  <TableCell className="font-medium">{bobina.codigo}</TableCell>
                  <TableCell>
                    <div>
                      <div>{bobina.tipo_plastico}</div>
                      <div className="text-sm text-muted-foreground">{bobina.cor}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {bobina.espessura}mm × {bobina.largura}mm
                  </TableCell>
                  <TableCell>
                    <Badge variant={bobina.quantidade_estoque > 0 ? "default" : "destructive"}>
                      {bobina.quantidade_estoque}
                    </Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(bobina.prioridade)}</TableCell>
                  <TableCell>{bobina.profiles?.username || 'Sistema'}</TableCell>
                  <TableCell>
                    {bobina.quantidade_estoque > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBobina(bobina);
                          setIsTransferDialogOpen(true);
                        }}
                      >
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Para Máquina
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Transferência para Máquina */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir para Máquina</DialogTitle>
            <DialogDescription>
              Bobina: {selectedBobina?.codigo} - Estoque disponível: {selectedBobina?.quantidade_estoque}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const quantidade = parseInt(formData.get('quantidade') as string);
            const maquinaId = formData.get('maquina') as string;
            
            if (selectedBobina) {
              handleTransferToMachine(selectedBobina, maquinaId, quantidade);
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maquina">Máquina</Label>
              <Select name="maquina" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma máquina" />
                </SelectTrigger>
                <SelectContent>
                  {maquinas.map((maquina) => (
                    <SelectItem key={maquina.id} value={maquina.id}>
                      {maquina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade a transferir</Label>
              <Input 
                id="quantidade" 
                name="quantidade" 
                type="number" 
                min="1" 
                max={selectedBobina?.quantidade_estoque} 
                required 
              />
            </div>
            
            <Button type="submit" className="w-full">
              <Minus className="w-4 h-4 mr-2" />
              Transferir
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BobinasManager;