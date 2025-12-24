
import React, { useState } from 'react';
import { Property, ServiceRequest, Visit } from '../types';
import { getAIPropertyInsights } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import ServiceDetailModal from './ServiceDetailModal';
import VisitDetailModal from './VisitDetailModal';


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
  const [valorOrcamento, setValorOrcamento] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<(ServiceRequest & { property_address?: string; requester_name?: string }) | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<(Visit & { property_address?: string; prefeito_name?: string }) | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);

  // Estados para Registro de Visita
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitType, setVisitType] = useState<'sem_intercorrencia' | 'com_solicitacao_servico'>('sem_intercorrencia');

  const handleAskAI = async () => {
    setLoadingAI(true);
    const result = await getAIPropertyInsights(property);
    setAiInsight(result || 'Nenhuma análise disponível.');
    setLoadingAI(false);
  };

  const handleFetchAndShowDetails = async (serviceId: string) => {
    setLoadingRequest(true);
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          requester:requester_id(full_name)
        `)
        .eq('id', serviceId)
        .single();

      if (error) throw error;

      const formattedRequest = {
        ...data,
        property_address: property.endereco,
        requester_name: data.requester?.full_name || 'Usuário desconhecido'
      };

      setSelectedRequest(formattedRequest);
    } catch (err) {
      console.error('Erro ao buscar detalhes da requisição:', err);
      alert('Erro ao carregar detalhes.');
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (visitType === 'com_solicitacao_servico' && (!title || !desc)) {
      alert('Preencha o título e a descrição da requisição de serviço.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedPhotoUrls: string[] = [];

      // 1. Upload Photos if any (common for both types)
      if (photoFiles.length > 0) {
        setUploadingPhotos(true);
        for (const file of photoFiles) {
          const fileName = `${Date.now()}_${file.name}`;
          const { error: photoError } = await supabase.storage
            .from('documentos')
            .upload(`photos/${fileName}`, file);

          if (!photoError) {
            const { data: urlData } = supabase.storage
              .from('documentos')
              .getPublicUrl(`photos/${fileName}`);
            uploadedPhotoUrls.push(urlData.publicUrl);
          }
        }
        setUploadingPhotos(false);
      }

      let serviceRequestId = null;

      // 2. Criar requisição de serviço se necessário
      if (visitType === 'com_solicitacao_servico') {
        let documentoUrl = null;

        // Upload PDF if exists
        if (pdfFile) {
          setUploadingPdf(true);
          const fileName = `${Date.now()}_${pdfFile.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documentos')
            .upload(`service-requests/${fileName}`, pdfFile);

          if (uploadError) {
            console.error('Erro ao fazer upload:', uploadError);
          } else {
            const { data: urlData } = supabase.storage
              .from('documentos')
              .getPublicUrl(`service-requests/${fileName}`);
            documentoUrl = urlData.publicUrl;
          }
          setUploadingPdf(false);
        }

        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .insert({
            property_id: property.id,
            requester_id: userId,
            title: title,
            description: desc,
            service_type: serviceType,
            status: 'pendente',
            valor: valorOrcamento ? parseFloat(valorOrcamento.replace(',', '.')) : null,
            documento_url: documentoUrl,
            photos: uploadedPhotoUrls
          })
          .select()
          .single();

        if (serviceError) throw serviceError;
        serviceRequestId = serviceData.id;
      }

      // 3. Registrar a visita
      const { error: visitError } = await supabase
        .from('visits')
        .insert({
          property_id: property.id,
          prefeito_id: userId,
          date: visitDate,
          type: visitType,
          service_request_id: serviceRequestId,
          photos: uploadedPhotoUrls
        });

      if (visitError) throw visitError;

      setSuccessMessage('Visita registrada com sucesso!');
      setTitle('');
      setDesc('');
      setServiceType('reparo');
      setValorOrcamento('');
      setPdfFile(null);
      setPhotoFiles([]);
      setVisitType('sem_intercorrencia');
      setVisitDate(new Date().toISOString().split('T')[0]);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao processar registro:', err);
      alert('Erro ao processar registro. Tente novamente.');
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
          <h3 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-tight">Histórico de Visitas</h3>
        </div>
        <div className="grid grid-cols-[48px_1fr] px-4">
          {property.visitHistory && property.visitHistory.length > 0 ? property.visitHistory.map((item, idx) => {
            const isNoInterruption = item.type === 'sem_intercorrencia';
            return (
              <React.Fragment key={item.id}>
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => {
                    if (item.service_request_id) {
                      handleFetchAndShowDetails(item.service_request_id);
                    } else {
                      setSelectedVisit({
                        ...item,
                        property_address: property.endereco,
                        prefeito_name: property.prefeito
                      });
                    }
                  }}
                >
                  <div className={`relative z-10 rounded-full ${isNoInterruption ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'} p-2 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-md`}>
                    <span className={`material-symbols-outlined ${isNoInterruption ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'} text-[20px]`}>
                      {isNoInterruption ? 'event_available' : 'event_note'}
                    </span>
                  </div>
                  {idx < (property.visitHistory?.length || 0) - 1 && (
                    <div className="w-[2px] bg-gray-200 dark:bg-gray-700 h-full grow -mt-2 pt-2"></div>
                  )}
                </div>
                <div
                  className="flex flex-1 flex-col pb-6 pl-2 pt-1 cursor-pointer group"
                  onClick={() => {
                    if (item.service_request_id) {
                      handleFetchAndShowDetails(item.service_request_id);
                    } else {
                      setSelectedVisit({
                        ...item,
                        property_address: property.endereco,
                        prefeito_name: property.prefeito
                      });
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[#0d141b] dark:text-white text-base font-bold leading-tight transition-colors group-hover:text-primary">
                      {isNoInterruption ? 'Visita sem intercorrência' : 'Visita com solicitação de serviço'}
                    </p>
                    <span className="material-symbols-outlined text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">info</span>
                  </div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </React.Fragment>
            )
          }) : (
            <div className="col-span-2 text-center py-4 text-slate-400 text-sm">Nenhuma visita registrada.</div>
          )}
        </div>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-4"></div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 pb-3 pt-2">
          <h3 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-tight">Histórico de Serviços</h3>
          <button className="text-primary text-sm font-bold hover:bg-primary/5 px-2 py-1 rounded-md transition-colors">Ver Todos</button>
        </div>
        <div className="grid grid-cols-[48px_1fr] px-4">
          {property.maintenanceHistory.length > 0 ? property.maintenanceHistory.map((item, idx) => {
            // Map color classes statically to avoid Tailwind purging issues
            const colorMap: Record<string, { bg: string; border: string; text: string }> = {
              blue: {
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                border: 'border-blue-100 dark:border-blue-800',
                text: 'text-blue-600 dark:text-blue-400'
              },
              orange: {
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                border: 'border-orange-100 dark:border-orange-800',
                text: 'text-orange-600 dark:text-orange-400'
              },
              purple: {
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                border: 'border-purple-100 dark:border-purple-800',
                text: 'text-purple-600 dark:text-purple-400'
              },
              green: {
                bg: 'bg-green-50 dark:bg-green-900/20',
                border: 'border-green-100 dark:border-green-800',
                text: 'text-green-600 dark:text-green-400'
              },
              red: {
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-100 dark:border-red-800',
                text: 'text-red-600 dark:text-red-400'
              },
              cyan: {
                bg: 'bg-cyan-50 dark:bg-cyan-900/20',
                border: 'border-cyan-100 dark:border-cyan-800',
                text: 'text-cyan-600 dark:text-cyan-400'
              },
              slate: {
                bg: 'bg-slate-50 dark:bg-slate-900/20',
                border: 'border-slate-100 dark:border-slate-800',
                text: 'text-slate-600 dark:text-slate-400'
              }
            };
            const colors = colorMap[item.colorClass] || colorMap.blue;

            // Cores do badge baseadas no status
            const statusColors: Record<string, { text: string; bg: string }> = {
              'Concluído': { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
              'Em Andamento': { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              'Paralisado': { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
              'Não Realizado': { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30' },
              'Rejeitado': { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
              'Aprovado': { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
            };
            const badgeColors = statusColors[item.status] || statusColors['Aprovado'];

            return (
              <React.Fragment key={item.id}>
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => handleFetchAndShowDetails(item.id)}
                >
                  <div className={`relative z-10 rounded-full ${colors.bg} border ${colors.border} p-2 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-md`}>
                    <span className={`material-symbols-outlined ${colors.text} text-[20px]`}>{item.icon}</span>
                  </div>
                  {idx < property.maintenanceHistory.length - 1 && (
                    <div className="w-[2px] bg-gray-200 dark:bg-gray-700 h-full grow -mt-2 pt-2"></div>
                  )}
                </div>
                <div
                  className="flex flex-1 flex-col pb-6 pl-2 pt-1 cursor-pointer group"
                  onClick={() => handleFetchAndShowDetails(item.id)}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[#0d141b] dark:text-white text-base font-bold leading-tight group-hover:text-primary transition-colors">{item.title}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${badgeColors.text} ${badgeColors.bg} px-2 py-1 rounded-md`}>{item.status}</span>
                  </div>
                  <p className="text-[#4c739a] dark:text-slate-400 text-sm font-normal leading-relaxed mt-1">{item.description}</p>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-2">{item.date}</p>
                </div>
              </React.Fragment>
            )
          }) : (
            <div className="col-span-2 text-center py-4 text-slate-400 text-sm">Nenhum histórico registrado.</div>
          )}
        </div>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-4"></div>

      <div className="flex flex-col">
        <h3 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight px-4 pb-4">Registro de Visita</h3>

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
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Data da Visita</label>
            <input
              className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary transition-colors"
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Tipo de Visita</label>
            <select
              className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary transition-colors"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as any)}
            >
              <option value="sem_intercorrencia">Visita sem intercorrência</option>
              <option value="com_solicitacao_servico">Visita com solicitação de serviço</option>
            </select>
          </div>

          {visitType === 'com_solicitacao_servico' && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-5">
              <h4 className="text-primary text-sm font-bold uppercase tracking-wider">Detalhes da Requisição</h4>

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

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Valor do Orçamento (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                  <input
                    className="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 pl-10 text-sm text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary transition-colors placeholder-gray-400"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={valorOrcamento}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9,]/g, '');
                      setValorOrcamento(value);
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Nota Fiscal / Orçamento</label>
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-primary/50 transition-all group">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === 'application/pdf') {
                        setPdfFile(file);
                      } else if (file) {
                        alert('Por favor, selecione um arquivo PDF.');
                      }
                    }}
                  />
                  <div className={`p-3 rounded-full group-hover:scale-110 transition-transform duration-300 ${pdfFile ? 'bg-emerald-100' : 'bg-primary/10'}`}>
                    <span className={`material-symbols-outlined text-2xl ${pdfFile ? 'text-emerald-600' : 'text-primary'}`}>
                      {pdfFile ? 'check_circle' : 'upload_file'}
                    </span>
                  </div>
                  {pdfFile ? (
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">description</span>
                      {pdfFile.name}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">Toque para anexar PDF</p>
                  )}
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Fotos</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photoFiles.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotoFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>
            <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-primary/50 transition-all group">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setPhotoFiles(prev => [...prev, ...files]);
                }}
              />
              <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">Toque para adicionar fotos</p>
            </label>
          </div>

          <button
            onClick={handleSubmitRequest}
            disabled={submitting}
            className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">save</span>
                Registrar Visita
              </>
            )}
          </button>
        </div>
      </div>
      <div className="h-6"></div>

      {selectedRequest && (
        <ServiceDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {selectedVisit && (
        <VisitDetailModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
        />
      )}

      {loadingRequest && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[110]">
          <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest">Carregando Detalhes...</p>
          </div>
        </div>
      )}
    </div >
  );
};

export default PropertyDetails;
