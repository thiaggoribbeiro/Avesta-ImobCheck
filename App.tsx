
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
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingProperties, setFetchingProperties] = useState(false);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const checkUser = async () => {
      // Safety timeout to ensure loading spinner disappears even if Supabase hangs
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 60000);

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
            setCurrentView('list');
          } else if (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
          }
        } else {
          setCurrentView('login');
        }
      } catch (err) {
        console.error('Erro na verificação de usuário:', err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile);
          setCurrentView('list');
        }
      } else {
        setUser(null);
        setCurrentView('login');
        setProperties([]);
      }
    });

    return () => {
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
    await supabase.auth.signOut();
  };

  const handleSaveService = (propertyId: string, description: string, date: string) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const newRecord = {
          id: `m${Date.now()}`,
          type: 'other' as const,
          title: 'Novo Registro',
          description,
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Concluído' as const,
          icon: 'build',
          colorClass: 'blue'
        };
        return {
          ...p,
          maintenanceHistory: [newRecord, ...p.maintenanceHistory]
        };
      }
      return p;
    }));
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

      const { data, error } = await query;

      const formattedProperties: Property[] = (data || []).map(p => ({
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
        maintenanceHistory: []
      }));

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
            onClick={handleLogout}
            className="flex items-center justify-center rounded-full size-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
          <button className="flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
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
      onNavigate={(view) => setCurrentView(view as View)}
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

      {currentView === 'settings' && user && (
        <UserManagement currentUser={user} />
      )}

      {currentView === 'services' && user && (
        <ServiceRequests currentUser={user} />
      )}

      {currentView === 'dashboard' && user && (
        <Dashboard currentUser={user} />
      )}
    </Layout>
  );
};

export default App;
