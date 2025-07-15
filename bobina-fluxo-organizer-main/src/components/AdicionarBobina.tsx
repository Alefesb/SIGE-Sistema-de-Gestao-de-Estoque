
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package } from 'lucide-react';
import { Bobina } from '../types/bobina';

interface AdicionarBobinaProps {
  onAdicionar: (bobina: Omit<Bobina, 'id'>) => void;
}

const AdicionarBobina: React.FC<AdicionarBobinaProps> = ({ onAdicionar }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    descricao: '',
    peso: '',
    largura: '',
    comprimento: '',
    cor: '',
    material: '',
    quantidade: '',
    prioridade: 'media' as 'alta' | 'media' | 'baixa',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaBobina: Omit<Bobina, 'id'> = {
      codigo: formData.cliente, // usando cliente no lugar de codigo
      descricao: formData.descricao,
      peso: parseFloat(formData.peso),
      largura: parseFloat(formData.largura),
      comprimento: parseFloat(formData.comprimento),
      cor: formData.cor,
      material: formData.material,
      quantidade: parseInt(formData.quantidade),
      localizacao: '', // campo removido do form, mas mantido vazio para compatibilidade
      prioridade: formData.prioridade,
      dataEntrada: new Date().toISOString().split('T')[0],
      fornecedor: '', // campo removido do form, mas mantido vazio para compatibilidade
      observacoes: formData.observacoes
    };

    onAdicionar(novaBobina);
    
    // Reset form
    setFormData({
      cliente: '',
      descricao: '',
      peso: '',
      largura: '',
      comprimento: '',
      cor: '',
      material: '',
      quantidade: '',
      prioridade: 'media',
      observacoes: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="pb-20 lg:pb-6">
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Plus className="h-5 w-5" />
            Adicionar Nova Bobina
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="cliente" className="text-sm font-medium">Cliente *</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => handleChange('cliente', e.target.value)}
                  placeholder="Nome do Cliente"
                  required
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="descricao" className="text-sm font-medium">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  placeholder="Bobina PEBD Transparente"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="peso" className="text-sm font-medium">Peso (kg) *</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  value={formData.peso}
                  onChange={(e) => handleChange('peso', e.target.value)}
                  placeholder="25.5"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="largura" className="text-sm font-medium">Largura (cm) *</Label>
                <Input
                  id="largura"
                  type="number"
                  value={formData.largura}
                  onChange={(e) => handleChange('largura', e.target.value)}
                  placeholder="100"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="comprimento" className="text-sm font-medium">Comprimento (m) *</Label>
                <Input
                  id="comprimento"
                  type="number"
                  value={formData.comprimento}
                  onChange={(e) => handleChange('comprimento', e.target.value)}
                  placeholder="500"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cor" className="text-sm font-medium">Cor *</Label>
                <Input
                  id="cor"
                  value={formData.cor}
                  onChange={(e) => handleChange('cor', e.target.value)}
                  placeholder="Transparente"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="material" className="text-sm font-medium">Material</Label>
                <Select value={formData.material} onValueChange={(value) => handleChange('material', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEBD">PEBD (Polietileno de Baixa Densidade)</SelectItem>
                    <SelectItem value="PEAD">PEAD (Polietileno de Alta Densidade)</SelectItem>
                    <SelectItem value="PP">PP (Polipropileno)</SelectItem>
                    <SelectItem value="PET">PET (Polietileno Tereftalato)</SelectItem>
                    <SelectItem value="PVC">PVC (Policloreto de Vinila)</SelectItem>
                    <SelectItem value="PS">PS (Poliestireno)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantidade" className="text-sm font-medium">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => handleChange('quantidade', e.target.value)}
                  placeholder="10"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="prioridade" className="text-sm font-medium">Prioridade *</Label>
                <Select value={formData.prioridade} onValueChange={(value: 'alta' | 'media' | 'baixa') => handleChange('prioridade', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">🔴 Alta</SelectItem>
                    <SelectItem value="media">🟡 Média</SelectItem>
                    <SelectItem value="baixa">🟢 Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="observacoes" className="text-sm font-medium">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais sobre a bobina..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Package className="h-4 w-4 mr-2" />
              Adicionar Bobina ao Estoque
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdicionarBobina;
