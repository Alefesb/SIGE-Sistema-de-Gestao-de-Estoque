
import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Plus, Package, BarChart3, Menu, X, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  totalBobinas: number;
  totalQuantidade: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  totalBobinas, 
  totalQuantidade 
}) => {
  console.log('Layout component rendering...');
  console.log('Props:', { activeTab, totalBobinas, totalQuantidade });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'adicionar', label: 'Adicionar', icon: Plus },
    { id: 'estoque', label: 'Estoque', icon: Warehouse },
    { id: 'listar', label: 'Listar Todas', icon: Package }
  ];

  const AppSidebar = () => (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Sistema de Estoque</h2>
          <p className="text-sm text-muted-foreground">Fábrica de Plásticos</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-3 w-3" />
              <span>{totalBobinas} tipos</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3 w-3" />
              <span>{totalQuantidade} unidades</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => {
                      console.log('Menu item clicked:', item.id);
                      onTabChange(item.id);
                    }}
                    isActive={activeTab === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  console.log('About to render SidebarProvider...');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Sistema de Estoque</h1>
              <p className="text-xs text-muted-foreground">{totalBobinas} tipos • {totalQuantidade} unidades</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="border-t border-border/40 bg-background p-4">
              <div className="grid grid-cols-2 gap-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      console.log('Mobile menu item clicked:', item.id);
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between border-b border-border/40 px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie o estoque de bobinas da fábrica
                </p>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-4 lg:p-6 pt-20 lg:pt-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40">
          <div className="grid grid-cols-4 p-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  console.log('Bottom nav item clicked:', item.id);
                  onTabChange(item.id);
                }}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
