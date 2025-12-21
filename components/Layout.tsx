
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
    title: string;
    userName?: string;
    showBack?: boolean;
    onBack?: () => void;
    onLogout: () => void;
    activeView: string;
    userRole: 'admin' | 'gestor' | 'prefeito';
    onNavigate: (view: string) => void;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
    title,
    userName,
    showBack,
    onBack,
    onLogout,
    activeView,
    userRole,
    onNavigate,
    actions,
    children
}) => {
    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl border-x border-slate-200 dark:border-slate-800">
            <Navbar
                title={title}
                userName={userName}
                showBack={showBack}
                onBack={onBack}
                actions={actions}
            />

            <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {children}
            </main>

            <Sidebar
                onLogout={onLogout}
                activeView={activeView}
                userRole={userRole}
                onNavigate={onNavigate}
            />
        </div>
    );
};

export default Layout;
