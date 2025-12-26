
import React, { useEffect, useState } from 'react';
import { Visit } from '../types';
import { supabase } from '../services/supabaseClient';

interface VisitDetailModalProps {
    visit: Visit & { property_address?: string; prefeito_name?: string };
    onClose: () => void;
}

const VisitDetailModal: React.FC<VisitDetailModalProps> = ({ visit, onClose }) => {
    const [requestStatus, setRequestStatus] = useState<string | null>(visit.service_requests?.status || null);
    const [requestDetails, setRequestDetails] = useState(visit.service_requests || null);
    const [loadingStatus, setLoadingStatus] = useState(false);

    useEffect(() => {
        const fetchRequestStatus = async () => {
            if (visit.service_request_id && !requestStatus) {
                setLoadingStatus(true);
                console.log('Buscando status para a solicitação:', visit.service_request_id);
                try {
                    const { data, error } = await supabase
                        .from('service_requests')
                        .select('status, title, description, service_type')
                        .eq('id', visit.service_request_id)
                        .maybeSingle();

                    if (error) {
                        console.error('Erro ao buscar status da solicitação:', error);
                    } else if (data) {
                        console.log('Status recuperado:', data.status);
                        setRequestStatus(data.status);
                        setRequestDetails(data);
                    } else {
                        console.log('Nenhuma solicitação encontrada com ID:', visit.service_request_id);
                    }
                } catch (err) {
                    console.error('Erro na busca do status:', err);
                } finally {
                    setLoadingStatus(false);
                }
            }
        };

        fetchRequestStatus();
    }, [visit.service_request_id, requestStatus]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pendente':
                return { label: 'Pendente', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: 'pending' };
            case 'aprovado':
                return { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: 'check_circle' };
            case 'rejeitado':
                return { label: 'Rejeitado', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: 'cancel' };
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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 overflow-hidden">
            <div className="bg-white dark:bg-[#1a2632] w-full max-w-lg sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Detalhes da Visita</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{visit.property_address}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Status Badge e Solicitação */}
                    <div className="flex flex-col gap-3">
                        <div className="flex">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${visit.type === 'sem_intercorrencia'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                }`}>
                                {visit.type === 'sem_intercorrencia' ? 'Sem Intercorrência' : 'Com Solicitação de Serviço'}
                            </span>
                        </div>

                        {visit.service_request_id && (
                            <div className="flex flex-col gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status da Solicitação</span>
                                    {loadingStatus ? (
                                        <div className="flex items-center gap-2">
                                            <div className="size-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            <span className="text-xs text-gray-400">Verificando...</span>
                                        </div>
                                    ) : requestStatus ? (
                                        <div className="flex items-center gap-1.5">
                                            {(() => {
                                                const info = getStatusInfo(requestStatus);
                                                return (
                                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${info.color}`}>
                                                        <span className="material-symbols-outlined text-sm">{info.icon}</span>
                                                        {info.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-500 italic">Informação indisponível</span>
                                    )}
                                </div>

                                {requestDetails && (
                                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-gray-400/80 uppercase">Serviço Solicitado</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{requestDetails.title}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-gray-400/80 uppercase">Tipo</span>
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{getServiceTypeLabel(requestDetails.service_type)}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-gray-400/80 uppercase">Descrição</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{requestDetails.description}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responsável</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">person</span>
                                {visit.prefeito_name || 'Prefeito'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">calendar_today</span>
                                {(() => {
                                    // Corrigir problema de fuso horário separando os componentes da data
                                    const d = new Date(visit.date);
                                    return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
                                })()}
                            </span>
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registros Fotográficos {visit.photos && visit.photos.length > 0 ? `(${visit.photos.length})` : ''}</span>
                        {visit.photos && visit.photos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {visit.photos.map((photo, idx) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-all cursor-zoom-in">
                                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined text-3xl mb-2">no_photography</span>
                                <span className="text-xs font-medium">Nenhuma foto registrada</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a2632]">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisitDetailModal;
