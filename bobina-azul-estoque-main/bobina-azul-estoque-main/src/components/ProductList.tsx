
import { useState } from 'react';
import { Search, Filter, Edit, Trash2, Eye, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductList = ({ products, onEdit, onDelete }: ProductListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStock, setFilterStock] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || product.type === filterType;
    
    const matchesStock = filterStock === 'all' || 
                        (filterStock === 'low' && product.quantity <= product.minStock) ||
                        (filterStock === 'normal' && product.quantity > product.minStock);

    return matchesSearch && matchesType && matchesStock;
  });

  const getStockStatus = (product: Product) => {
    if (product.quantity <= product.minStock) {
      return { label: 'Baixo', variant: 'destructive' as const };
    }
    return { label: 'Normal', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
        <p className="text-gray-600">Gerencie seu estoque de bobinas plásticas</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="BOPP">BOPP</SelectItem>
                  <SelectItem value="PE">PE</SelectItem>
                  <SelectItem value="PP">PP</SelectItem>
                  <SelectItem value="PVC">PVC</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStock} onValueChange={setFilterStock}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="normal">Estoque Normal</SelectItem>
                  <SelectItem value="low">Estoque Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          
          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="aspect-video relative bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Eye className="h-12 w-12" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.type} - {product.color}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Largura:</span>
                      <p className="font-medium">{product.width}mm</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Espessura:</span>
                      <p className="font-medium">{product.thickness}μm</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 text-sm">Quantidade:</span>
                      <p className="font-semibold">{product.quantity}</p>
                    </div>
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.label}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500">Localização:</span>
                    <p className="font-medium">{product.location}</p>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500">Preço:</span>
                    <p className="font-semibold text-green-600">
                      R$ {product.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Package className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou adicione novos produtos ao estoque.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
