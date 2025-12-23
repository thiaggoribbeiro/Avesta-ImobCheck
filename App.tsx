
import React, { useState, useEffect } from 'react';
import { View, Property, User } from './types';
import { MOCK_PROPERTIES } from './constants';


import Login from './components/Login';
import PropertyList from './components/PropertyList';
import PropertyDetails from './components/PropertyDetails';
import UserManagement from './components/UserManagement';
import ServiceRequests from './components/ServiceRequests';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import PropertyForm from './components/PropertyForm';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      const timeoutId = setTimeout(() => {
        if (mounted) setLoading(false);
      }, 15000); // 15s timeout para o check inicial

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const profileFetch = supabase.from('profiles').select('*').eq('id', session.user.id).single();
          const profileTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout Profile')), 20000));

          const { data: profile } = await Promise.race([profileFetch, profileTimeout]) as any;

          if (profile && mounted) {
            setUser(profile);
            setCurrentView('list');
          }
        } else if (mounted) {
          setCurrentView('login');
        }
      } catch (err) {
        console.error('App Profile Load Error:', err);
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        if (currentView === 'login' || !user) {
          try {
            const profileFetch = supabase.from('profiles').select('*').eq('id', session.user.id).single();
            const profileTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout Auth Update')), 20000));

            const { data: profile } = await Promise.race([profileFetch, profileTimeout]) as any;

            if (profile && mounted) {
              setUser(profile);
              setCurrentView('list');
            }
          } catch (err) {
            console.error('Auth State Profile Load Error:', err);
          }
        }
      } else if (mounted) {
        setUser(null);
        setCurrentView('login');
        setProperties([]);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    // handleLogin is now handled by onAuthStateChange in useEffect
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView('details');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedProperty(null);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        // Force logout even if there's an error
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      // Force state cleanup regardless of API response
      setUser(null);
      setProperties([]);
      setSelectedProperty(null);
      setCurrentView('login');
      setLoading(false);
    }
  };

  const handleSaveService = (propertyId: string, description: string, date: string) => {
    // ... logic for local update if needed
  };

  const handleSaveProperty = async (propertyData: Partial<Property>) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      console.log('Imóvel salvo com sucesso!');
      await fetchProperties(); // Atualiza a lista
      setCurrentView('list');
    } catch (err) {
      console.error('Erro ao salvar imóvel:', err);
      alert('Erro ao salvar imóvel. Verifique os dados ou sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    if (!user) return;
    setFetchingProperties(true);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .order('nome_completo', { ascending: true });

      // Apply state-based filtering for non-admin users
      if (user.role !== 'admin' && user.states && user.states.length > 0) {
        query = query.in('estado', user.states);
      } else if (user.role !== 'admin') {
        // If user is not admin and has no states, they shouldn't see anything or we handle as needed
        // For now, let's assume they see nothing to be safe if states are not defined
        setProperties([]);
        setFetchingProperties(false);
        return;
      }

      const { data: propertiesData, error: propertiesError } = await query;
      if (propertiesError) throw propertiesError;

      // Buscar requisições aprovadas para compor o histórico
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('status', 'aprovado')
        .order('approved_at', { ascending: false });

      if (servicesError) {
        console.error('Erro ao buscar serviços aprovados:', servicesError);
      }

      const getServiceMeta = (type: string) => {
        switch (type) {
          case 'reparo': return { icon: 'build', color: 'blue' };
          case 'reforma': return { icon: 'construction', color: 'orange' };
          case 'pintura': return { icon: 'format_paint', color: 'green' };
          case 'limpeza': return { icon: 'cleaning_services', color: 'cyan' };
          case 'obra': return { icon: 'engineering', color: 'purple' };
          default: return { icon: 'miscellaneous_services', color: 'slate' };
        }
      };

      const formattedProperties: Property[] = (propertiesData || []).map(p => {
        const propertyServices = (servicesData || [])
          .filter(s => s.property_id === p.id)
          .map(s => {
            const meta = getServiceMeta(s.service_type);
            return {
              id: s.id,
              type: 'other' as const,
              title: s.title,
              description: s.description,
              date: new Date(s.approved_at || s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
              status: (s.status_execucao === 'em_andamento' ? 'Em Andamento' :
                s.status_execucao === 'concluido' ? 'Concluído' :
                  s.status_execucao === 'nao_realizado' ? 'Não Realizado' : 'Aprovado') as any,
              icon: meta.icon,
              colorClass: meta.color
            };
          });

        return {
          id: p.id,
          utilizacao: p.utilizacao,
          situacao: p.situacao,
          nome_completo: p.nome_completo,
          endereco: p.endereco,
          bairro: p.bairro,
          cidade: p.cidade,
          estado: p.estado,
          regiao: p.regiao,
          proprietario: p.proprietario,
          prefeito: p.prefeito,
          image_url: p.image_url || '/assets/default-property.png',
          maintenanceHistory: propertyServices
        };
      });

      setProperties(formattedProperties);
    } catch (err) {
      console.error('Erro ao buscar imóveis:', err);
    } finally {
      setFetchingProperties(false);
    }
  };

  useEffect(() => {
    if (user && currentView === 'list' && properties.length === 0) {
      fetchProperties();
    }
  }, [user, currentView]);

  // Fetch notifications based on user role
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      let count = 0;
      const lastSeenKey = `notifications_last_seen_${user.id}`;
      const lastSeen = localStorage.getItem(lastSeenKey);
      const lastSeenDate = lastSeen ? new Date(lastSeen).toISOString() : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      if (user.role === 'admin' || user.role === 'gestor') {
        // For gestores: count pending requests + recently updated execution status
        const { count: pendingCount } = await supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente')
          .gte('created_at', lastSeenDate);

        const { count: updatedCount } = await supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'aprovado')
          .in('status_execucao', ['paralisado', 'concluido', 'nao_realizado'])
          .gte('updated_at', lastSeenDate);

        count = (pendingCount || 0) + (updatedCount || 0);
      } else if (user.role === 'prefeito') {
        // For prefeitos: count their approved/rejected requests since last seen
        const { count: responseCount } = await supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('requester_id', user.id)
          .in('status', ['aprovado', 'rejeitado'])
          .gte('approved_at', lastSeenDate);

        count = responseCount || 0;
      }

      setNotificationCount(count);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  // Mark notifications as seen when navigating to services
  const handleNavigate = (view: string) => {
    if (view === 'services' && user) {
      const lastSeenKey = `notifications_last_seen_${user.id}`;
      localStorage.setItem(lastSeenKey, new Date().toISOString());
      setNotificationCount(0);
    }
    setCurrentView(view as View);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-slate-50 overflow-hidden">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  const getLayoutProps = () => {
    if (currentView === 'details' && selectedProperty) {
      return {
        title: 'Detalhes do Imóvel',
        showBack: true,
        onBack: handleBack,
      };
    }
    if (currentView === 'settings') {
      return {
        title: 'Configurações',
        showBack: true,
        onBack: () => setCurrentView('list'),
      };
    }
    if (currentView === 'services') {
      return {
        title: 'Serviços',
        showBack: true,
        onBack: () => setCurrentView('list'),
      };
    }
    if (currentView === 'add-property') {
      return {
        title: 'Novo Imóvel',
        showBack: true,
        onBack: () => setCurrentView('list'),
      };
    }
    if (currentView === 'dashboard') {
      return {
        title: 'Dashboard',
        showBack: true,
        onBack: () => setCurrentView('list'),
      };
    }
    return {
      title: 'Imóveis',
      showBack: false,
      actions: (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('services')}
            className="relative flex items-center justify-center rounded-full size-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center rounded-full size-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
          {(user?.role === 'admin' || user?.role === 'gestor') && (
            <button
              onClick={() => setCurrentView('add-property')}
              className="flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-2xl">add</span>
            </button>
          )}
        </div>
      )
    };
  };

  const layoutProps = getLayoutProps();

  if (currentView === 'login') {
    return <Login onLogin={() => { }} />;
  }


  return (
    <Layout
      {...layoutProps}
      userName={user?.full_name}
      onLogout={handleLogout}
      activeView={currentView}
      userRole={user?.role || 'prefeito'}
      onNavigate={handleNavigate}
    >
      {currentView === 'list' && (
        <PropertyList
          properties={properties}
          onSelect={handleSelectProperty}
        />
      )}

      {currentView === 'details' && selectedProperty && user && (
        <PropertyDetails
          property={properties.find(p => p.id === selectedProperty.id) || selectedProperty}
          userId={user.id}
          onSaveService={handleSaveService}
        />
      )}

      {currentView === 'settings' && (
        <div className="flex flex-col items-center justify-center h-64 px-12 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">settings</span>
          <p className="text-slate-400 dark:text-slate-500 font-medium">As configurações estarão disponíveis em breve.</p>
        </div>
      )}

      {currentView === 'services' && user && (
        <ServiceRequests currentUser={user} />
      )}

      {currentView === 'add-property' && (
        <PropertyForm
          onSave={handleSaveProperty}
          onCancel={() => setCurrentView('list')}
        />
      )}

      {currentView === 'dashboard' && user && (
        <Dashboard currentUser={user} />
      )}
    </Layout>
  );
};

export default App;
