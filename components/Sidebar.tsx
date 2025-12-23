
import React from 'react';

interface SidebarProps {
    onLogout: () => void;
    activeView: string;
    userRole: 'admin' | 'gestor' | 'prefeito';
    onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, activeView, userRole, onNavigate }) => {
    const allNavItems = [
        { id: 'list', icon: 'business', label: 'Imóveis', visibleTo: ['admin', 'gestor', 'prefeito'] },
        { id: 'services', icon: 'build', label: 'Serviços', visibleTo: ['admin', 'gestor', 'prefeito'] },
        { id: 'dashboard', icon: 'analytics', label: 'Dashboard', visibleTo: ['admin', 'gestor', 'prefeito'] },
        { id: 'settings', icon: 'settings', label: 'Configurações', visibleTo: ['admin', 'gestor'] },
    ];


    // Filter items based on user role
    const navItems = allNavItems.filter(item => item.visibleTo.includes(userRole));

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeView === item.id || (item.id === 'list' && activeView === 'details')
                            ? 'text-primary'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Desktop Sidebar (Optional enhancement later, keeping within mobile-first constraints for now) */}
        </>
    );
};

export default Sidebar;
