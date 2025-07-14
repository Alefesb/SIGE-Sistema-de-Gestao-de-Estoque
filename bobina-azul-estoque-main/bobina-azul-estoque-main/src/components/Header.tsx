
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Sistema de Estoque - Bobinas Plásticas
          </h1>
        </div>
        
        <div className="ml-auto flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
          
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
            <span className="hidden lg:block">Usuário</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
