import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Package, Activity, MessageSquare, Plus, Bell } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import InventoryManagement from '@/components/InventoryManagement';
import MachineManagement from '@/components/MachineManagement';
import HistoryView from '@/components/HistoryView';
import ChatSystem from '@/components/ChatSystem';
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBobinas: 0,
    totalMaquinas: 0,
    bobinasEmUso: 0,
    usuariosOnline: 0
  });
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    fetchStats();
    
    // Real-time updates for bobinas
    const bobinasChannel = supabase
      .channel('dashboard-bobinas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bobinas' }, () => {
        fetchStats();
      })
      .subscribe();

    // Real-time updates for machines
    const maquinasChannel = supabase
      .channel('dashboard-maquinas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maquinas' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bobinasChannel);
      supabase.removeChannel(maquinasChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const [bobinasRes, maquinasRes, profilesRes] = await Promise.all([
        supabase.from('bobinas').select('em_maquina', { count: 'exact' }),
        supabase.from('maquinas').select('ativa', { count: 'exact' }),
        supabase.from('profiles').select('status', { count: 'exact' })
      ]);

      const bobinasEmUso = bobinasRes.data?.filter(b => b.em_maquina).length || 0;
      const usuariosOnline = profilesRes.data?.filter(p => p.status === 'online').length || 0;

      setStats({
        totalBobinas: bobinasRes.count || 0,
        totalMaquinas: maquinasRes.count || 0,
        bobinasEmUso,
        usuariosOnline
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">SIGE - Sistema de Gestão de Estoque</h1>
            <p className="text-muted-foreground">Bem-vindo ao painel de controle</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <UserProfile />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Bobinas"
            value={stats.totalBobinas}
            icon={Package}
            color="primary"
            description="Bobinas no estoque"
          />
          <StatCard
            title="Máquinas"
            value={stats.totalMaquinas}
            icon={Activity}
            color="accent"
            description="Máquinas cadastradas"
          />
          <StatCard
            title="Em Produção"
            value={stats.bobinasEmUso}
            icon={Package}
            color="success"
            description="Bobinas em uso"
          />
          <StatCard
            title="Usuários Online"
            value={stats.usuariosOnline}
            icon={Users}
            color="online"
            description="Conectados agora"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="inventory">Estoque</TabsTrigger>
            <TabsTrigger value="machines">Máquinas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="machines" className="space-y-4">
            <MachineManagement />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <HistoryView />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <ChatSystem />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;