
import React, { useState, useEffect } from 'react';
import { User, ServiceRequest } from '../types';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
    currentUser: User;
}

interface DashboardStats {
    total: number;
    pendente: number;
    aprovado: number;
    rejeitado: number;
    concluido: number;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
    const [stats, setStats] = useState<DashboardStats>({ total: 0, pendente: 0, aprovado: 0, rejeitado: 0, concluido: 0 });
    const [recentRequests, setRecentRequests] = useState<(ServiceRequest & { property_address?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);

        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 30000);

        try {
            // Build query based on role
            let query = supabase
                .from('service_requests')
                .select(`
                    *,
                    property:property_id(endereco)
                `);

            // Prefeitos only see their own requests
            if (currentUser.role === 'prefeito') {
                query = query.eq('requester_id', currentUser.id);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            const requests = data || [];

            // Calculate stats
            const newStats: DashboardStats = {
                total: requests.length,
                pendente: requests.filter(r => r.status === 'pendente').length,
                aprovado: requests.filter(r => r.status === 'aprovado').length,
                rejeitado: requests.filter(r => r.status === 'rejeitado').length,
                concluido: requests.filter(r => r.status === 'concluido').length,
            };

            setStats(newStats);
            setRecentRequests(requests.slice(0, 5).map((r: any) => ({
                ...r,
                property_address: r.property?.endereco || 'Endereço não disponível'
            })));
        } catch (err) {
            console.error('Erro ao buscar dados do dashboard:', err);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'bg-amber-500';
            case 'aprovado': return 'bg-emerald-500';
            case 'rejeitado': return 'bg-red-500';
            case 'concluido': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pendente': return 'Pendentes';
            case 'aprovado': return 'Aprovados';
            case 'rejeitado': return 'Rejeitados';
            case 'concluido': return 'Concluídos';
            default: return status;
        }
    };

    const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className={`${color} p-3 rounded-xl text-white`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full px-4 py-4 gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total" value={stats.total} color="bg-slate-600" icon="inventory_2" />
                <StatCard label="Pendentes" value={stats.pendente} color="bg-amber-500" icon="pending" />
                <StatCard label="Aprovados" value={stats.aprovado} color="bg-emerald-500" icon="check_circle" />
                <StatCard label="Rejeitados" value={stats.rejeitado} color="bg-red-500" icon="cancel" />
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">Distribuição de Status</p>
                <div className="h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex">
                    {stats.total > 0 && (
                        <>
                            <div
                                className="bg-amber-500 transition-all"
                                style={{ width: `${(stats.pendente / stats.total) * 100}%` }}
                                title={`Pendentes: ${stats.pendente}`}
                            />
                            <div
                                className="bg-emerald-500 transition-all"
                                style={{ width: `${(stats.aprovado / stats.total) * 100}%` }}
                                title={`Aprovados: ${stats.aprovado}`}
                            />
                            <div
                                className="bg-red-500 transition-all"
                                style={{ width: `${(stats.rejeitado / stats.total) * 100}%` }}
                                title={`Rejeitados: ${stats.rejeitado}`}
                            />
                            <div
                                className="bg-blue-500 transition-all"
                                style={{ width: `${(stats.concluido / stats.total) * 100}%` }}
                                title={`Concluídos: ${stats.concluido}`}
                            />
                        </>
                    )}
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-amber-500"></span> Pendente</span>
                    <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-emerald-500"></span> Aprovado</span>
                    <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-red-500"></span> Rejeitado</span>
                    <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-blue-500"></span> Concluído</span>
                </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">Requisições Recentes</p>
                {recentRequests.length === 0 ? (
                    <p className="text-center text-slate-400 dark:text-slate-600 py-4">Nenhuma requisição encontrada.</p>
                ) : (
                    <div className="space-y-3">
                        {recentRequests.map(request => (
                            <div key={request.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <div className={`size-2 rounded-full ${getStatusColor(request.status)}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{request.title}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{request.property_address}</p>
                                </div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                                    {request.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
