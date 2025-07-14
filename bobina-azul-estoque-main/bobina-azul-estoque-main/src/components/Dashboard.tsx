
import { Package, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product, StockMovement } from '@/types';

interface DashboardProps {
  products: Product[];
  movements: StockMovement[];
}

export const Dashboard = ({ products, movements }: DashboardProps) => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.quantity * product.costPrice), 0);
  const lowStockItems = products.filter(product => product.quantity <= product.minStock).length;
  const recentMovements = movements.slice(0, 5);

  const stats = [
    {
      name: 'Total de Produtos',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Valor Total do Estoque',
      value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Produtos em Baixa',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Movimentações Hoje',
      value: movements.filter(m => 
        new Date(m.date).toDateString() === new Date().toDateString()
      ).length,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral do seu estoque de bobinas plásticas</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Baixa no Estoque</CardTitle>
            <CardDescription>Produtos que precisam de reposição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products
                .filter(product => product.quantity <= product.minStock)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.type}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {product.quantity} / {product.minStock}
                      </Badge>
                    </div>
                  </div>
                ))}
              {products.filter(product => product.quantity <= product.minStock).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Todos os produtos estão com estoque adequado!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimentações Recentes</CardTitle>
            <CardDescription>Últimas entradas e saídas do estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMovements.map((movement) => {
                const product = products.find(p => p.id === movement.productId);
                return (
                  <div key={movement.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product?.name}</p>
                      <p className="text-sm text-gray-500">{movement.reason}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={movement.type === 'entrada' ? 'default' : 'secondary'}>
                        {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(movement.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {recentMovements.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma movimentação recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
