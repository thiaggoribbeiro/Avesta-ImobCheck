
import React, { useState, useEffect } from 'react';
import { ServiceRequest, User } from '../types';
import { supabase } from '../services/supabaseClient';

interface ServiceRequestsProps {
    currentUser: User;
}

const ServiceRequests: React.FC<ServiceRequestsProps> = ({ currentUser }) => {
    const [requests, setRequests] = useState<(ServiceRequest & { property_address?: string; requester_name?: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pendente' | 'aprovado' | 'finalizado' | 'rejeitado' | 'todos'>('pendente');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showObservationModal, setShowObservationModal] = useState<{ requestId: string; status: 'nao_realizado' | 'paralisado' } | null>(null);
    const [observationText, setObservationText] = useState('');
    const [categoryCounts, setCategoryCounts] = useState<{ pendente: number; aprovado: number; rejeitado: number; finalizado: number }>({ pendente: 0, aprovado: 0, rejeitado: 0, finalizado: 0 });

    useEffect(() => {
        fetchRequests();
        fetchCategoryCounts();
    }, [filter]);

    const fetchCategoryCounts = async () => {
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

            // For prefeitos: count their recent approved/rejected requests
            if (currentUser.role === 'prefeito') {
                const [aprovadosRes, rejeitadosRes] = await Promise.all([
                    supabase
                        .from('service_requests')
                        .select('*', { count: 'exact', head: true })
                        .eq('requester_id', currentUser.id)
                        .eq('status', 'aprovado')
                        .eq('status_execucao', 'em_andamento')
                        .gte('approved_at', sevenDaysAgo),
                    supabase
                        .from('service_requests')
                        .select('*', { count: 'exact', head: true })
                        .eq('requester_id', currentUser.id)
                        .eq('status', 'rejeitado')
                        .gte('approved_at', sevenDaysAgo)
                ]);

                setCategoryCounts(prev => ({
                    ...prev,
                    aprovado: aprovadosRes.count || 0,
                    rejeitado: rejeitadosRes.count || 0
                }));
            } else {
                // For gestores: count pending and recently updated
                const [pendentesRes, atualizadosRes] = await Promise.all([
                    supabase
                        .from('service_requests')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'pendente'),
                    supabase
                        .from('service_requests')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'aprovado')
                        .in('status_execucao', ['concluido', 'nao_realizado', 'paralisado'])
                        .gte('updated_at', sevenDaysAgo)
                ]);

                setCategoryCounts(prev => ({
                    ...prev,
                    pendente: pendentesRes.count || 0,
                    finalizado: atualizadosRes.count || 0
                }));
            }
        } catch (err) {
            console.error('Erro ao buscar contagens:', err);
        }
    };

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


            if (filter === 'pendente') {
                query = query.eq('status', 'pendente');
            } else if (filter === 'aprovado') {
                query = query.eq('status', 'aprovado').eq('status_execucao', 'em_andamento');
            } else if (filter === 'finalizado') {
                query = query.eq('status', 'aprovado').in('status_execucao', ['concluido', 'nao_realizado', 'paralisado']);
            } else if (filter === 'rejeitado') {
                query = query.eq('status', 'rejeitado');
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
                    status_execucao: 'em_andamento',
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

    const handleUpdateExecutionStatus = async (requestId: string, newExecStatus: 'concluido' | 'nao_realizado' | 'paralisado', observacao?: string) => {
        setProcessingId(requestId);
        try {
            const updateData: any = {
                status_execucao: newExecStatus,
                updated_at: new Date().toISOString()
            };
            if (observacao) {
                updateData.observacao_execucao = observacao;
            }
            const { error } = await supabase
                .from('service_requests')
                .update(updateData)
                .eq('id', requestId);

            if (error) throw error;
            setShowObservationModal(null);
            setObservationText('');
            fetchRequests();
        } catch (err) {
            console.error('Erro ao atualizar status de execução:', err);
            alert('Erro ao atualizar status');
        } finally {
            setProcessingId(null);
        }
    };

    const openObservationModal = (requestId: string, status: 'nao_realizado' | 'paralisado') => {
        setShowObservationModal({ requestId, status });
        setObservationText('');
    };

    const confirmObservationStatus = () => {
        if (!showObservationModal) return;
        if (!observationText.trim()) {
            alert('Por favor, informe o motivo.');
            return;
        }
        handleUpdateExecutionStatus(showObservationModal.requestId, showObservationModal.status, observationText.trim());
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'aprovado': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'rejeitado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'em_andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'concluido': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'nao_realizado': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
            case 'paralisado': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pendente': return 'Pendente';
            case 'aprovado': return 'Aprovado';
            case 'rejeitado': return 'Rejeitado';
            case 'em_andamento': return 'Em Andamento';
            case 'concluido': return 'Concluído';
            case 'nao_realizado': return 'Não Realizado';
            case 'paralisado': return 'Paralisado';
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
        <>
            <div className="flex flex-col w-full px-4 py-4 gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Requisições de Serviço</h2>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 overflow-x-auto pb-2 pt-3 -mt-1" style={{ overflow: 'visible' }}>
                    {(['pendente', 'aprovado', 'finalizado', 'rejeitado', 'todos'] as const).map((f) => {
                        const count = f === 'todos' ? 0 : categoryCounts[f] || 0;
                        const showBadge = currentUser.role === 'prefeito'
                            ? (f === 'aprovado' || f === 'rejeitado') && count > 0
                            : (f === 'pendente' || f === 'finalizado') && count > 0;

                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`relative px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {f === 'pendente' ? 'Pendentes' : f === 'aprovado' ? 'Aprovados' : f === 'finalizado' ? 'Finalizados' : f === 'rejeitado' ? 'Rejeitados' : 'Todos'}
                                {showBadge && (
                                    <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                        {count > 99 ? '99+' : count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
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
                                            <div className="flex gap-1.5 flex-wrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(request.status)}`}>
                                                    {getStatusLabel(request.status)}
                                                </span>
                                                {request.status === 'aprovado' && request.status_execucao && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(request.status_execucao)}`}>
                                                        {getStatusLabel(request.status_execucao)}
                                                    </span>
                                                )}
                                            </div>
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

                                {request.status === 'aprovado' && request.status_execucao === 'em_andamento' && currentUser.role === 'prefeito' && (
                                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateExecutionStatus(request.id, 'concluido')}
                                                disabled={processingId === request.id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {processingId === request.id ? (
                                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-lg">task_alt</span>
                                                        Finalizado
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openObservationModal(request.id, 'nao_realizado')}
                                                disabled={processingId === request.id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-lg">block</span>
                                                Não Realizado
                                            </button>
                                            <button
                                                onClick={() => openObservationModal(request.id, 'paralisado')}
                                                disabled={processingId === request.id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-lg">pause_circle</span>
                                                Paralisado
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {request.status === 'rejeitado' && request.rejection_reason && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                                        <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Motivo da rejeição:</p>
                                        <p className="text-sm text-red-700 dark:text-red-300">{request.rejection_reason}</p>
                                    </div>
                                )}

                                {(request.status_execucao === 'nao_realizado' || request.status_execucao === 'paralisado') && request.observacao_execucao && (
                                    <div className={`mt-3 p-3 rounded-lg border ${request.status_execucao === 'paralisado'
                                        ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'
                                        : 'bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-700'
                                        }`}>
                                        <p className={`text-xs font-bold mb-1 ${request.status_execucao === 'paralisado'
                                            ? 'text-orange-600 dark:text-orange-400'
                                            : 'text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {request.status_execucao === 'paralisado' ? 'Motivo da paralisação:' : 'Motivo:'}
                                        </p>
                                        <p className={`text-sm ${request.status_execucao === 'paralisado'
                                            ? 'text-orange-700 dark:text-orange-300'
                                            : 'text-slate-700 dark:text-slate-300'
                                            }`}>{request.observacao_execucao}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Observação */}
            {showObservationModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            {showObservationModal.status === 'paralisado' ? 'Motivo da Paralisação' : 'Motivo'}
                        </h3>
                        <textarea
                            className="w-full h-32 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Descreva o motivo..."
                            value={observationText}
                            onChange={(e) => setObservationText(e.target.value)}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowObservationModal(null)}
                                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmObservationStatus}
                                disabled={processingId !== null}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-white transition-colors disabled:opacity-50 ${showObservationModal.status === 'paralisado'
                                    ? 'bg-orange-500 hover:bg-orange-600'
                                    : 'bg-slate-500 hover:bg-slate-600'
                                    }`}
                            >
                                {processingId !== null ? (
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    'Confirmar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceRequests;
