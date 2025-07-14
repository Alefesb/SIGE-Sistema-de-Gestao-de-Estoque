
import { useState } from 'react';
import * as React from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ProductList } from '@/components/ProductList';
import { ProductForm } from '@/components/ProductForm';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import type { Product, StockMovement } from '@/types';

type View = 'dashboard' | 'products' | 'add-product' | 'edit-product';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useLocalStorage<Product[]>('estoque-products', []);
  const [movements, setMovements] = useLocalStorage<StockMovement[]>('estoque-movements', []);
  const { toast } = useToast();

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    
    if (editingProduct) {
      // Update existing product
      const updatedProduct = {
        ...editingProduct,
        ...productData,
        updatedAt: now,
      };
      
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      
      toast({
        title: "Produto atualizado",
        description: `${productData.name} foi atualizado com sucesso.`,
      });
    } else {
      // Create new product
      const newProduct: Product = {
        ...productData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      
      setProducts(prev => [...prev, newProduct]);
      
      // Add initial stock movement
      const initialMovement: StockMovement = {
        id: crypto.randomUUID(),
        productId: newProduct.id,
        type: 'entrada',
        quantity: productData.quantity,
        reason: 'Estoque inicial',
        date: now,
        user: 'Sistema',
        observations: 'Cadastro inicial do produto',
      };
      
      setMovements(prev => [...prev, initialMovement]);
      
      toast({
        title: "Produto adicionado",
        description: `${productData.name} foi adicionado ao estoque.`,
      });
    }
    
    setEditingProduct(null);
    setCurrentView('products');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCurrentView('edit-product');
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setMovements(prev => prev.filter(m => m.productId !== productId));
      
      toast({
        title: "Produto excluído",
        description: `${product.name} foi removido do estoque.`,
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (view: View) => {
    setCurrentView(view);
    setEditingProduct(null);
  };

  // Update navigation based on hash
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      switch (hash) {
        case 'dashboard':
          setCurrentView('dashboard');
          break;
        case 'products':
          setCurrentView('products');
          break;
        case 'add-product':
          setCurrentView('add-product');
          break;
        default:
          setCurrentView('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} movements={movements} />;
      case 'products':
        return (
          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        );
      case 'add-product':
      case 'edit-product':
        return (
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => setCurrentView('products')}
          />
        );
      default:
        return <Dashboard products={products} movements={movements} />;
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {renderCurrentView()}
      </div>
    </Layout>
  );
};

export default Index;
