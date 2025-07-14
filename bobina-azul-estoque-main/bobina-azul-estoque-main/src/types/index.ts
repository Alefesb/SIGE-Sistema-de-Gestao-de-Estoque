
export interface Product {
  id: string;
  name: string;
  type: string;
  width: number;
  thickness: number;
  color: string;
  quantity: number;
  minStock: number;
  location: string;
  supplier: string;
  costPrice: number;
  sellPrice: number;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  date: Date;
  user: string;
  observations?: string;
}

export interface Dashboard {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  recentMovements: StockMovement[];
}
