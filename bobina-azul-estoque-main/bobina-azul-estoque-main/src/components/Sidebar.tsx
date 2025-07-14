
import { X, BarChart3, Package, Plus, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '#dashboard', icon: BarChart3, current: true },
  { name: 'Produtos', href: '#products', icon: Package, current: false },
  { name: 'Adicionar Produto', href: '#add-product', icon: Plus, current: false },
  { name: 'Movimentações', href: '#movements', icon: History, current: false },
  { name: 'Configurações', href: '#settings', icon: Settings, current: false },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={onClose}>
          <div className="fixed inset-0 bg-gray-900/80" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">EstoquePro</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={cn(
                          item.current
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-primary',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors duration-200'
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};
