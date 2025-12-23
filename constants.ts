
import { Property } from './types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    utilizacao: 'Residencial',
    situacao: 'Ocupado',
    nome_completo: 'Edifício Maple Street',
    endereco: '123 Maple St',
    bairro: 'Centro',
    cidade: 'Springfield',
    estado: 'IL',
    regiao: 'Centro-Oeste',
    proprietario: 'João Silva',
    prefeito: 'Carlos Santos',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2mWIDAy3px9foooz5YZFv38SJAMqrNKV04eeqgGQVZIVIgACEOVW-p3Oamf26JPRbYEF_NKEPoBX0B_vwWC0bBm2HfLdaiKjflwr9_8oimSc5SwmbQJJkY22EDek4EFC-A7MbJop7fJJEA52SWY305l5oYx47guMUquUKtPkIuQsxc25aq4Vo37nppjijFDR41eb70duCApOdedh5M2r-MIsZs0fbvrbyR8icTCTzmMXjcoiTZXO2MSq6Tz05Q6S0CZwq0YEOnIqQ',
    maintenanceHistory: [
      {
        id: 'm1',
        type: 'hvac',
        title: 'Manutenção HVAC',
        description: 'Substituição anual de filtro e verificação do sistema realizada pelo fornecedor.',
        date: '24 Out, 2023',
        status: 'Concluído',
        icon: 'hvac',
        colorClass: 'blue'
      },
      {
        id: 'm2',
        type: 'plumbing',
        title: 'Reparo Hidráulico',
        description: 'Vazamento na pia da cozinha reparado. Sifão sob a pia substituído.',
        date: '12 Set, 2023',
        status: 'Concluído',
        icon: 'plumbing',
        colorClass: 'orange'
      },
      {
        id: 'm3',
        type: 'pest_control',
        title: 'Controle de Pragas',
        description: 'Pulverização preventiva trimestral exterior/interior.',
        date: '05 Ago, 2023',
        status: 'Concluído',
        icon: 'pest_control',
        colorClass: 'purple'
      }
    ]
  },
  {
    id: '2',
    utilizacao: 'Comercial',
    situacao: 'Ocupado',
    nome_completo: 'The Highland Lofts',
    endereco: '452 Highland Ave',
    bairro: 'Downtown',
    cidade: 'Seattle',
    estado: 'WA',
    regiao: 'Noroeste',
    proprietario: 'Maria Oliveira',
    prefeito: 'Ana Costa',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoXr_5RLr6YstsfH1rfrBn6u9NZ0q4b0Mt9LjfyGZ5iKc_0VKkIPj3ZGQBMZsRP0J8XfUROuirp5bMvCuao6Psnf8h6By9IOpFgd4PCbz_Imef24NJ0GuBFy2bD-L6hAHjbWK__NBPRTz9v7CY1gIgX-FOUWlgult5kpj4ct7Qiln3LfIwSQKTiJM6CKVcSJgawg9_eplrrNsuGydfFCeWNSWK8kscv3QszN4JyKI0S2Cy7HJ2_s-PYN7PEWVYp6clYxcor14C9HhX',
    maintenanceHistory: []
  },
  {
    id: '3',
    utilizacao: 'Misto',
    situacao: 'Ocupado',
    nome_completo: 'Blue Water Complex',
    endereco: '880 Ocean Drive',
    bairro: 'Oceanfront',
    cidade: 'Miami',
    estado: 'FL',
    regiao: 'Sudeste',
    proprietario: 'Pedro Mendes',
    prefeito: 'Lucia Ferreira',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzd8JWVwNgTStTqLMLqJCLp1KQLPi2hwhCPtY3bj2SDlyt_nqXjfpHcV-b4LoPFSW2Mgz496lC0sdh8C2Ua_0cWW2rH0tjyxoIGM__jz5La7ybz1f5AapmwX85nP21TlLaqcuw0gZY8PH8cQ-BEFzhdDnAObT_cq7bkZfcLLXC7PYOoGp32DS5C3aq7_t2Yra1vLXsU0TVtBXTTDkXBOdiTGiR-5ey-UB_hI2K9w5YYnULwzf0SlZMtEot6pRPdjrYb2boCnvYLgf-',
    maintenanceHistory: []
  },
  {
    id: '4',
    utilizacao: 'Residencial',
    situacao: 'Vago',
    nome_completo: 'Maple Street Duplex',
    endereco: '12 Maple St',
    bairro: 'Subúrbio',
    cidade: 'Austin',
    estado: 'TX',
    regiao: 'Sul',
    proprietario: 'Roberto Lima',
    prefeito: 'Fernanda Souza',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP8FDtU_l-xcToE3Yg3Z6EA_fpBpNH4bQCFyTYsqpd6C_08ZdP9hW9ff2Gldha2l-207RzlzWpU9T4iCeQDXGsjS0YxqYyDJjO2tevoK0eoniSp0Ex6HSX0AWqbJ6Q0e0dRltv8f90Z8icTCTzmMXjcoiTZXO2MSq6Tz05Q6S0CZwq0YEOnIqQ',
    maintenanceHistory: []
  }
];
