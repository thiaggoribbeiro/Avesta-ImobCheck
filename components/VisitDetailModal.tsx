
import React from 'react';
import { Visit } from '../types';

interface VisitDetailModalProps {
    visit: Visit & { property_address?: string; prefeito_name?: string };
    onClose: () => void;
}

const VisitDetailModal: React.FC<VisitDetailModalProps> = ({ visit, onClose }) => {
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
                    {/* Status Badge */}
                    <div className="flex">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${visit.type === 'sem_intercorrencia'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                            {visit.type === 'sem_intercorrencia' ? 'Sem Intercorrência' : 'Com Solicitação de Serviço'}
                        </span>
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
                                {new Date(visit.date).toLocaleDateString('pt-BR')}
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
