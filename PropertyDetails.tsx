
import React, { useState } from 'react';
import { Property } from '../types';
import { getAIPropertyInsights } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';


interface PropertyDetailsProps {
  property: Property;
  userId: string;
  onSaveService: (id: string, desc: string, date: string) => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, userId, onSaveService }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [serviceType, setServiceType] = useState<'reparo' | 'reforma' | 'pintura' | 'limpeza' | 'obra' | 'outro'>('reparo');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [valor, setValor] = useState('');
  const [documento, setDocumento] = useState<File | null>(null);


  const handleSubmitRequest = async () => {
    if (!title || !desc) {
      alert('Preencha o título e a descrição da requisição.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          property_id: property.id,
          requester_id: userId,
          title: title,
          description: desc,
          service_type: serviceType,
          valor: valor ? parseFloat(valor.replace(',', '.')) : null,
          documento_url: documento ? documento.name : null, // Por enquanto salvando apenas o nome
          status: 'pendente'
        });

      if (error) throw error;

      setSuccessMessage('Requisição enviada com sucesso! Aguarde a aprovação.');
      setTitle('');
      setDesc('');
      setServiceType('reparo');
      setValor('');
      setDocumento(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao enviar requisição:', err);
      alert('Erro ao enviar requisição. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-5 pb-8">
      <div className="px-4 pt-4">
        <div className="group flex flex-col items-stretch justify-start rounded-xl shadow-sm bg-white dark:bg-[#1a2632] overflow-hidden border border-gray-100 dark:border-gray-700">
          <div
            className="relative w-full bg-center bg-no-repeat aspect-video bg-cover"
            style={{ backgroundImage: `url("${property.image_url || '/assets/default-property.png'}")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-2">
              <h1 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight tracking-tight">{property.endereco}</h1>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {property.nome_completo !== 'NÃO' && (
                <p className="text-[#0d141b] dark:text-white text-sm font-bold truncate">{property.nome_completo}</p>
              )}
              <p className="text-[#4c739a] dark:text-slate-400 text-sm font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">location_on</span>
                {property.bairro}, {property.cidade} - {property.estado}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
        {[
          { label: 'Proprietário', value: property.proprietario, icon: 'person' },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1 rounded-xl bg-white dark:bg-[#1a2632] border border-[#cfdbe7] dark:border-gray-700 p-3 shadow-sm">
            <p className="text-[#4c739a] dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">{item.icon}</span>
              {item.label}
            </p>
            <p className="text-[#0d141b] dark:text-white text-sm font-bold truncate">{item.value || '-'}</p>
          </div>
        ))}

        <div className="flex flex-col gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-3 shadow-sm">
          <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">manage_accounts</span>
            Prefeito (Responsável)
          </p>
          <p className="text-[#0d141b] dark:text-white text-base font-bold truncate">{property.prefeito || 'Não Definido'}</p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 pb-3 pt-2">
          <h3 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-tight">Histórico de Serviços</h3>
          <button className="text-primary text-sm font-bold hover:bg-primary/5 px-2 py-1 rounded-md transition-colors">Ver Todos</button>
        </div>
        <div className="grid grid-cols-[48px_1fr] px-4">
          {property.maintenanceHistory.length > 0 ? property.maintenanceHistory.map((item, idx) => (
            <React.Fragment key={item.id}>
              <div className="flex flex-col items-center">
                <div className={`relative z-10 rounded-full bg-${item.colorClass}-50 dark:bg-${item.colorClass}-900/20 border border-${item.colorClass}-100 dark:border-${item.colorClass}-800 p-2 flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-${item.colorClass}-600 dark:text-${item.colorClass}-400 text-[20px]`}>{item.icon}</span>
                </div>
                {idx < property.maintenanceHistory.length - 1 && (
                  <div className="w-[2px] bg-gray-200 dark:bg-gray-700 h-full grow -mt-2 pt-2"></div>
                )}
              </div>
              <div className="flex flex-1 flex-col pb-6 pl-2 pt-1">
                <div className="flex justify-between items-start">
                  <p className="text-[#0d141b] dark:text-white text-base font-bold leading-tight">{item.title}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md">{item.status}</span>
                </div>
                <p className="text-[#4c739a] dark:text-slate-400 text-sm font-normal leading-relaxed mt-1">{item.description}</p>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-2">{item.date}</p>
              </div>
            </React.Fragment>
          )) : (
            <div className="col-span-2 text-center py-4 text-slate-400 text-sm">Nenhum histórico registrado.</div>
          )}
        </div>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-4"></div>

      <div className="flex flex-col">
        <h3 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight px-4 pb-4">Requisição de Serviço</h3>

        {successMessage && (
          <div className="mx-4 mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <p className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {successMessage}
            </p>
          </div>
        )}

        <div className="mx-4 bg-white dark:bg-[#1a2632] rounded-xl p-5 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Título</label>
            <input
              className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary transition-colors placeholder-gray-400"
              type="text"
              placeholder="Ex: Vazamento no banheiro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Tipo de Serviço</label>
            <select
              className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary transition-colors"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as any)}
            >
              <option value="reparo">Reparo</option>
              <option value="reforma">Reforma</option>
              <option value="pintura">Pintura</option>
              <option value="limpeza">Limpeza</option>
              <option value="obra">Obra</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Descrição</label>
            <textarea
              className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary resize-none transition-colors placeholder-gray-400"
              placeholder="Descreva o problema ou serviço necessário..."
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Custo do Serviço (R$)</label>
              <input
                className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary transition-colors placeholder-gray-400"
                type="text"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Anexar Orçamento / Nota Fiscal (PDF)</label>
              <label className="flex items-center gap-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-gray-500 cursor-pointer overflow-hidden">
                <span className="material-symbols-outlined text-gray-400">picture_as_pdf</span>
                <span className="truncate">{documento ? documento.name : 'Selecionar PDF'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setDocumento(e.target.files ? e.target.files[0] : null)}
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Fotos do Problema</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-primary/50 transition-all group">
              <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">Toque para adicionar fotos</p>
            </div>
          </div>
          <button
            onClick={handleSubmitRequest}
            disabled={submitting}
            className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">send</span>
                Enviar Requisição
              </>
            )}
          </button>
        </div>
      </div>
      <div className="h-6"></div>

    </div >
  );
};

export default PropertyDetails;
