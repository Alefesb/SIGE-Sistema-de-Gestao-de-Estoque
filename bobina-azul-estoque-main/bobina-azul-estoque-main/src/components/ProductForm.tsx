
import { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/types';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    type: product?.type || '',
    width: product?.width || 0,
    thickness: product?.thickness || 0,
    color: product?.color || '',
    quantity: product?.quantity || 0,
    minStock: product?.minStock || 0,
    location: product?.location || '',
    supplier: product?.supplier || '',
    costPrice: product?.costPrice || 0,
    sellPrice: product?.sellPrice || 0,
    description: product?.description || '',
    image: product?.image || '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {product ? 'Editar Produto' : 'Adicionar Produto'}
        </h2>
        <p className="text-gray-600">
          {product ? 'Edite as informações do produto' : 'Cadastre uma nova bobina plástica no estoque'}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label>Foto do Produto</Label>
              <div className="mt-2">
                {formData.image ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Adicionar foto</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {formData.image ? 'Trocar foto' : 'Adicionar foto'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Bobina BOPP Transparente"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Plástico *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOPP">BOPP (Polipropileno Biorientado)</SelectItem>
                      <SelectItem value="PE">PE (Polietileno)</SelectItem>
                      <SelectItem value="PP">PP (Polipropileno)</SelectItem>
                      <SelectItem value="PVC">PVC (Policloreto de Vinila)</SelectItem>
                      <SelectItem value="PET">PET (Politereftalato de Etileno)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Cor *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Ex: Transparente, Azul, Branco"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>

              {/* Technical Specs */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="width">Largura (mm) *</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: Number(e.target.value) }))}
                    placeholder="Ex: 500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="thickness">Espessura (μm) *</Label>
                  <Input
                    id="thickness"
                    type="number"
                    value={formData.thickness}
                    onChange={(e) => setFormData(prev => ({ ...prev, thickness: Number(e.target.value) }))}
                    placeholder="Ex: 20"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Localização *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Galpão A - Prateleira 3"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Stock and Pricing */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="minStock">Estoque Mínimo *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="sellPrice">Preço de Venda (R$)</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, sellPrice: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Informações adicionais sobre o produto..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {product ? 'Salvar Alterações' : 'Adicionar Produto'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
