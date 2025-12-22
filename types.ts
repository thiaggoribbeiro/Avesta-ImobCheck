
export type View = 'login' | 'list' | 'details' | 'settings' | 'services' | 'dashboard' | 'add-property';

export interface MaintenanceRecord {
  id: string;
  type: 'hvac' | 'plumbing' | 'pest_control' | 'other';
  title: string;
  description: string;
  date: string;
  status: 'Concluído' | 'Pendente' | 'Em Andamento' | 'Não Realizado' | 'Aprovado';
  icon: string;
  colorClass: string;
}

export interface Property {
  id: string;
  utilizacao: string;
  situacao: string;
  nome_completo: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  regiao: string;
  proprietario: string;
  prefeito: string; // Adicionado responsável pelo checklist
  image_url: string;
  maintenanceHistory: MaintenanceRecord[];
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'gestor' | 'prefeito';
  states: string[];
}

export interface ServiceRequest {
  id: string;
  property_id: string;
  requester_id: string;
  title: string;
  description: string;
  service_type: 'reparo' | 'reforma' | 'pintura' | 'limpeza' | 'obra' | 'outro';
  photos: string[];
  status: 'pendente' | 'aprovado' | 'rejeitado';
  status_execucao?: 'em_andamento' | 'concluido' | 'nao_realizado';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  valor?: number;
  documento_url?: string;
  created_at: string;
  updated_at: string;
}
