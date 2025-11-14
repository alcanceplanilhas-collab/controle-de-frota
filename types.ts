export enum TripRequestStatus {
  Pending = 'Pendente',
  Approved = 'Aprovado',
  InUse = 'Em Uso',
  Completed = 'Concluído',
  Denied = 'Negado',
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: number;
  fuel_type: 'Gasolina' | 'Flex'| 'Diesel' | 'Etanol' | 'Elétrico';
  current_odometer: number;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Administrador' | 'Operador';
  is_active: boolean;
  created_at: string;
}

export interface Purpose {
  id: string;
  name: string;
  created_at: string;
}

export interface TripRequest {
  id: string;
  user_id: string;
  vehicle_id: string;
  destination: string;
  purpose_id: string;
  request_date: string; 
  status: TripRequestStatus;
  approval_date?: string;
  completed_date?: string;
  start_odometer?: number;
  end_odometer?: number;
  distance_km?: number;
  fuel_liters?: number;
  notes?: string;
  created_at: string;
  fuel_type_refilled?: string;
  refuel_cost?: number;
  // Joined data from Supabase
  vehicles?: { model: string; plate: string };
  users?: { name: string };
  purposes?: { name: string };
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  maintenance_date: string;
  description: string;
  cost: number;
  created_at: string;
  // Joined data from Supabase
  vehicles?: { model: string; plate: string };
}

export interface Parameter {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  responsavel: string;
  is_active: boolean;
  logo?: string; // Stored as base64 text
  precos_combustiveis: {
    Gasolina?: number;
    Etanol?: number;
    Diesel?: number;
  };
  created_at: string;
}

export type View = 'dashboard' | 'vehicles' | 'trips' | 'reports' | 'users' | 'purposes' | 'maintenance' | 'parameters';