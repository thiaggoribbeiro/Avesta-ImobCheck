
import React, { useState } from 'react';
import { Property } from '../types';

interface PropertyFormProps {
    onSave: (property: Partial<Property>) => void;
    onCancel: () => void;
    initialData?: Partial<Property>;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState<Partial<Property>>(initialData || {
        nome_completo: '',
        endereco: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        utilizacao: 'COMERCIAL',
        situacao: 'DISPONÍVEL',
        proprietario: 'GRUPO PARVI',
        prefeito: '',
        regiao: '',
        image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="flex flex-col w-full h-full bg-slate-50 dark:bg-slate-900/50">
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Informações Básicas</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Complexo / Unidade</label>
                        <input
                            type="text"
                            name="nome_completo"
                            required
                            value={formData.nome_completo}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            placeholder="Ex: Complexo Agamenon"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Utilização</label>
                            <select
                                name="utilizacao"
                                value={formData.utilizacao}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            >
                                <option value="COMERCIAL">COMERCIAL</option>
                                <option value="RESIDENCIAL">RESIDENCIAL</option>
                                <option value="TERRENO">TERRENO</option>
                                <option value="OUTROS">OUTROS</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Situação</label>
                            <select
                                name="situacao"
                                value={formData.situacao}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            >
                                <option value="DISPONÍVEL">DISPONÍVEL</option>
                                <option value="LOCADO">LOCADO</option>
                                <option value="PROPRIO">PRÓPRIO</option>
                                <option value="EM REFORMA">EM REFORMA</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Localização</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Endereço Completo</label>
                        <input
                            type="text"
                            name="endereco"
                            required
                            value={formData.endereco}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            placeholder="Rua, Número, CEP"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bairro</label>
                            <input
                                type="text"
                                name="bairro"
                                value={formData.bairro}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cidade</label>
                            <input
                                type="text"
                                name="cidade"
                                required
                                value={formData.cidade}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado (UF)</label>
                            <input
                                type="text"
                                name="estado"
                                required
                                maxLength={2}
                                value={formData.estado}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium uppercase"
                                placeholder="PE"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Região</label>
                            <input
                                type="text"
                                name="regiao"
                                value={formData.regiao}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                placeholder="Ex: Nordeste"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gestão</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Proprietário</label>
                            <input
                                type="text"
                                name="proprietario"
                                value={formData.proprietario}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prefeito (Gestor)</label>
                            <input
                                type="text"
                                name="prefeito"
                                value={formData.prefeito}
                                onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 pb-12 flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 h-12 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                    >
                        Salvar Imóvel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PropertyForm;
