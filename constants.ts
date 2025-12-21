
import { Property } from './types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    name: '123 Maple Street',
    address: '123 Maple St',
    city: 'Springfield',
    state: 'IL',
    units: 1,
    rentPrice: 2400,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2mWIDAy3px9foooz5YZFv38SJAMqrNKV04eeqgGQVZIVIgACEOVW-p3Oamf26JPRbYEF_NKEPoBX0B_vwWC0bBm2HfLdaiKjflwr9_8oimSc5SwmbQJJkY22EDek4EFC-A7MbJop7fJJEA52SWY305l5oYx47guMUquUKtPkIuQsxc25aq4Vo37nppjijFDR41eb70duCApOdedh5M2r-MIsZs0fbvrbyR8icTCTzmMXjcoiTZXO2MSq6Tz05Q6S0CZwq0YEOnIqQ',
    status: 'Ocupado',
    rentalStatus: 'Pago',
    nextInspection: '24 Out',
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
    name: 'The Highland Lofts',
    address: '452 Highland Ave',
    city: 'Seattle',
    state: 'WA',
    units: 12,
    rentPrice: 3200,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoXr_5RLr6YstsfH1rfrBn6u9NZ0q4b0Mt9LjfyGZ5iKc_0VKkIPj3ZGQBMZsRP0J8XfUROuirp5bMvCuao6Psnf8h6By9IOpFgd4PCbz_Imef24NJ0GuBFy2bD-L6hAHjbWK__NBPRTz9v7CY1gIgX-FOUWlgult5kpj4ct7Qiln3LfIwSQKTiJM6CKVcSJgawg9_eplrrNsuGydfFCeWNSWK8kscv3QszN4JyKI0S2Cy7HJ2_s-PYN7PEWVYp6clYxcor14C9HhX',
    status: 'Ocupado',
    rentalStatus: 'Pendente',
    nextInspection: '15 Nov',
    badge: 'Devido Hoje',
    maintenanceHistory: []
  },
  {
    id: '3',
    name: 'Blue Water Complex',
    address: '880 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    units: 45,
    rentPrice: 4500,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzd8JWVwNgTStTqLMLqJCLp1KQLPi2hwhCPtY3bj2SDlyt_nqXjfpHcV-b4LoPFSW2Mgz496lC0sdh8C2Ua_0cWW2rH0tjyxoIGM__jz5La7ybz1f5AapmwX85nP21TlLaqcuw0gZY8PH8cQ-BEFzhdDnAObT_cq7bkZfcLLXC7PYOoGp32DS5C3aq7_t2Yra1vLXsU0TVtBXTTDkXBOdiTGiR-5ey-UB_hI2K9w5YYnULwzf0SlZMtEot6pRPdjrYb2boCnvYLgf-',
    status: 'Ocupado',
    rentalStatus: 'Pago',
    nextInspection: '01 Dez',
    badge: 'Atualizado',
    maintenanceHistory: []
  },
  {
    id: '4',
    name: 'Maple Street Duplex',
    address: '12 Maple St',
    city: 'Austin',
    state: 'TX',
    units: 2,
    rentPrice: 1800,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP8FDtU_l-xcToE3Yg3Z6EA_fpBpNH4bQCFyTYsqpd6C_08ZdP9hW9ff2Gldha2l-207RzlzWpU9T4iCeQDXGsjS0YxqYyDJjO2tevoK0eoniSp0Ex6HSX0AWqbJ6Q0e0dRltv8f90Yh7UtotNqxQlAQ3JOc3Xh1i7mPlGIgicci09E2ISyGImeLPFOl2HdMX2LbX7ScpMamymKtHzq0zkRaQE4D9xosZC1GDASxD5qrKtBWevIbEKnMGOLiVo7f0HmpQsS2X1YIl6',
    status: 'Vago',
    rentalStatus: 'Pendente',
    nextInspection: '10 Nov',
    badge: 'Em Progresso',
    maintenanceHistory: []
  }
];
