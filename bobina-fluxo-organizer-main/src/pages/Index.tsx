import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AuthPage from "@/components/auth/AuthPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BobinasManager from "@/components/bobinas/BobinasManager";
import ChatSystem from "@/components/chat/ChatSystem";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bobinas");

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'bobinas':
        return <BobinasManager />;
      case 'chat':
        return <ChatSystem />;
      case 'maquinas':
        return <div className="text-center py-20"><h2 className="text-2xl">Módulo de Máquinas em desenvolvimento</h2></div>;
      case 'historico':
        return <div className="text-center py-20"><h2 className="text-2xl">Módulo de Histórico em desenvolvimento</h2></div>;
      case 'configuracoes':
        return <div className="text-center py-20"><h2 className="text-2xl">Configurações em desenvolvimento</h2></div>;
      default:
        return <BobinasManager />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Index;
