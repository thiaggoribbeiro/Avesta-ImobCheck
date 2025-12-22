
import { Property } from './types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    nome_completo: '123 Maple Street',
    endereco: '123 Maple St',
    cidade: 'Springfield',
    estado: 'IL',
    bairro: 'Downtown',
    regiao: 'Central',
    utilizacao: 'Residencial',
    situacao: 'Ocupado',
    proprietario: 'John Doe',
    prefeito: 'Jane Smith',
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
      }
    ]
  },
  {
    id: '2',
    nome_completo: 'The Highland Lofts',
    endereco: '452 Highland Ave',
    cidade: 'Seattle',
    estado: 'WA',
    bairro: 'Highland',
    regiao: 'North',
    utilizacao: 'Residencial',
    situacao: 'Ocupado',
    proprietario: 'Alice Cooper',
    prefeito: 'Bob Dylan',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoXr_5RLr6YstsfH1rfrBn6u9NZ0q4b0Mt9LjfyGZ5iKc_0VKkIPj3ZGQBMZsRP0J8XfUROuirp5bMvCuao6Psnf8h6By9IOpFgd4PCbz_Imef24NJ0GuBFy2bD-L6hAHjbWK__NBPRTz9v7CY1gIgX-FOUWlgult5kpj4ct7Qiln3LfIwSQKTiJM6CKVcSJgawg9_eplrrNsuGydfFCeWNSWK8kscv3QszN4JyKI0S2Cy7HJ2_s-PYN7PEWVYp6clYxcor14C9HhX',
    maintenanceHistory: []
  }
];
