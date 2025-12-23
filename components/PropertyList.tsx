
import React, { useState } from 'react';
import { Property } from '../types';


interface PropertyListProps {
  properties: Property[];
  onSelect: (p: Property) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = properties
    .filter(p =>
      p.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.endereco.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.endereco.trim().localeCompare(b.endereco.trim(), 'pt-BR'));

  return (
    <div className="flex flex-col w-full">
      <div className="px-6 py-4 z-10 sticky top-0 bg-background-light dark:bg-background-dark/95 backdrop-blur-sm">
        <label className="flex flex-col h-12 w-full">
          <div className="flex w-full flex-1 items-center rounded-xl h-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="text-slate-400 dark:text-slate-500 flex items-center justify-center pl-4">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 bg-transparent text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none h-full placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 text-base font-medium"
              placeholder="Buscar endereço ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </label>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {filteredProperties.map(property => (
          <div
            key={property.id}
            onClick={() => onSelect(property)}
            className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700 active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/30"
          >
            <div className="flex items-center">
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-slate-900 dark:text-white text-base font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {property.endereco}
                  </p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-1 mb-1">
                  {property.nome_completo !== 'NÃO' ? property.nome_completo : 'Imóvel Individual'}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-normal line-clamp-1">
                  {property.cidade}, {property.estado} • {property.utilizacao}
                </p>
              </div>
              <div className="shrink-0 self-center pl-4">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            </div>
          </div>
        ))}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">search_off</span>
            <p className="text-slate-400 dark:text-slate-600 font-medium">Nenhum imóvel encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
