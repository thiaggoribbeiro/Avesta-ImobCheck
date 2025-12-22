
import React, { useState, useEffect } from 'react';
import { ServiceRequest, User } from '../types';
import { supabase } from '../services/supabaseClient';

interface ServiceRequestsProps {
    currentUser: User;
}

const ServiceRequests: React.FC<ServiceRequestsProps> = ({ currentUser }) => {
    const [requests, setRequests] = useState<(ServiceRequest & { property_address?: string; requester_name?: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pendente' | 'aprovado' | 'rejeitado' | 'todos'>('pendente');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);

        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 60000);

        try {
            let query = supabase
                .from('service_requests')
                .select(`
                    *,
                    property:property_id(endereco),
                    requester:requester_id(full_name)
                `)
                .order('created_at', { ascending: false });

            // Prefeitos only see their own requests
            if (currentUser.role === 'prefeito') {
                query = query.eq('requester_id', currentUser.id);
            }

            if (filter !== 'todos') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            const formattedRequests = (data || []).map((r: any) => ({
                ...r,
                property_address: r.property?.endereco || 'Endereço não disponível',
                requester_name: r.requester?.full_name || 'Usuário desconhecido'
            }));

            setRequests(formattedRequests);
        } catch (err) {
            console.error('Erro ao buscar requisições:', err);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        setProcessingId(requestId);
        try {
            const { error } = await supabase
                .from('service_requests')
                .update({
                    status: 'aprovado',
                    approved_by: currentUser.id,
                    approved_at: new Date().toISOString()
                })
                .eq('id', requestId);

            if (error) throw error;
            fetchRequests();
        } catch (err) {
            console.error('Erro ao aprovar requisição:', err);
            alert('Erro ao aprovar requisição');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        const reason = prompt('Motivo da rejeição (opcional):');

        setProcessingId(requestId);
        try {
            const { error } = await supabase
                .from('service_requests')
                .update({
                    status: 'rejeitado',
                    approved_by: currentUser.id,
                    approved_at: new Date().toISOString(),
                    rejection_reason: reason || null
                })
                .eq('id', requestId);

            if (error) throw error;
            fetchRequests();
        } catch (err) {
            console.error('Erro ao rejeitar requisição:', err);
            alert('Erro ao rejeitar requisição');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'aprovado': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'rejeitado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'concluido': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pendente': return 'Pendente';
            case 'aprovado': return 'Aprovado';
            case 'rejeitado': return 'Rejeitado';
            case 'concluido': return 'Concluído';
            default: return status;
        }
    };

    const getServiceTypeLabel = (type: string) => {
        switch (type) {
            case 'reparo': return 'Reparo';
            case 'reforma': return 'Reforma';
            case 'pintura': return 'Pintura';
            case 'limpeza': return 'Limpeza';
            case 'obra': return 'Obra';
            case 'outro': return 'Outro';
            default: return type || 'Não especificado';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full px-4 py-4 gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Requisições de Serviço</h2>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['pendente', 'aprovado', 'rejeitado', 'todos'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filter === f
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {f === 'pendente' ? 'Pendentes' : f === 'aprovado' ? 'Aprovados' : f === 'rejeitado' ? 'Rejeitados' : 'Todos'}
                    </button>
                ))}
            </div>

            {/* Lista de Requisições */}
            <div className="space-y-3">
                {requests.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">inbox</span>
                        <p className="text-slate-400 dark:text-slate-600 font-medium">Nenhuma requisição {filter !== 'todos' ? filter : ''} encontrada.</p>
                    </div>
                ) : (
                    requests.map(request => (
                        <div
                            key={request.id}
                            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="text-slate-900 dark:text-white font-bold truncate">{request.title}</h3>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(request.status)}`}>
                                            {getStatusLabel(request.status)}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{request.property_address}</p>
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                    {formatDate(request.created_at)}
                                </span>
                            </div>

                            <div className="mb-3">
                                <p className="text-slate-600 dark:text-slate-300 text-sm">{request.description || 'Sem descrição'}</p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-3">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    {request.requester_name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">category</span>
                                    {getServiceTypeLabel(request.service_type)}
                                </span>
                            </div>

                            {request.status === 'pendente' && currentUser.role !== 'prefeito' && (
                                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        disabled={processingId === request.id}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {processingId === request.id ? (
                                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                                Aprovar
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        disabled={processingId === request.id}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {processingId === request.id ? (
                                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">cancel</span>
                                                Rejeitar
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {request.status === 'rejeitado' && request.rejection_reason && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                                    <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Motivo da rejeição:</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">{request.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ServiceRequests;
