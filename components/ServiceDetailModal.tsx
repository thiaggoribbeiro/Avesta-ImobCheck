
import React from 'react';
import { ServiceRequest } from '../types';

interface ServiceDetailModalProps {
    request: ServiceRequest & { property_address?: string; requester_name?: string };
    onClose: () => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ request, onClose }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
            case 'aprovado': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
            case 'rejeitado': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
            case 'em_andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
            case 'concluido': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
            case 'nao_realizado': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
            case 'paralisado': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 overflow-hidden">
            <div className="bg-white dark:bg-[#1a2632] w-full max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{request.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{request.property_address}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(request.status)}`}>
                            {getStatusLabel(request.status)}
                        </span>
                        {request.status === 'aprovado' && request.status_execucao && (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(request.status_execucao)}`}>
                                {getStatusLabel(request.status_execucao)}
                            </span>
                        )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Solicitante</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">person</span>
                                {request.requester_name || 'Desconhecido'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">category</span>
                                {getServiceTypeLabel(request.service_type)}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">calendar_today</span>
                                {new Date(request.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        {request.valor && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor</span>
                                <span className="text-sm font-bold text-primary flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">payments</span>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(request.valor)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</span>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {request.description || 'Nenhuma descrição fornecida.'}
                            </p>
                        </div>
                    </div>

                    {/* Documents & Photos */}
                    <div className="space-y-4">
                        {request.documento_url && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Documento / Orçamento</span>
                                <a
                                    href={request.documento_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all group"
                                >
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-primary">Ver PDF Anexo</span>
                                        <span className="text-[10px] text-primary/60">Nota Fiscal ou Orçamento</span>
                                    </div>
                                    <span className="material-symbols-outlined ml-auto text-primary">open_in_new</span>
                                </a>
                            </div>
                        )}

                        {request.photos && request.photos.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fotos ({request.photos.length})</span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {request.photos.map((photo, idx) => (
                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:ring-2 hover:ring-primary/50 transition-all cursor-zoom-in">
                                            <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rejection / Execution Reasons */}
                    {request.status === 'rejeitado' && request.rejection_reason && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">Motivo da Rejeição</h4>
                            <p className="text-sm text-red-800 dark:text-red-300">{request.rejection_reason}</p>
                            <p className="text-[10px] text-red-600/60 mt-2">Rejeitado em {request.approved_at ? new Date(request.approved_at).toLocaleDateString('pt-BR') : 'Data não disponível'}</p>
                        </div>
                    )}

                    {request.observacao_execucao && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                            <h4 className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-2">Observação da Execução</h4>
                            <p className="text-sm text-orange-800 dark:text-orange-300">{request.observacao_execucao}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
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

export default ServiceDetailModal;
