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
  fuelType: 'Gasolina' | 'Diesel' | 'Etanol' | 'Elétrico';
  currentOdometer: number;
}

export interface User {
  id: string;
  name: string;
  role: 'Requester' | 'Authorizer';
}

export interface TripRequest {
  id: string;
  userId: string;
  vehicleId: string;
  destination: string;
  purpose: string;
  requestDate: string; 
  status: TripRequestStatus;
  approvalDate?: string;
  completedDate?: string;
  startOdometer?: number;
  endOdometer?: number;
  distanceKm?: number;
  fuelLiters?: number;
  notes?: string;
}

export type View = 'dashboard' | 'vehicles' | 'trips' | 'reports';

export interface AppState {
  vehicles: Vehicle[];
  users: User[];
  tripRequests: TripRequest[];
  currentUser: User;
}

export type Action =
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'CREATE_TRIP_REQUEST'; payload: Omit<TripRequest, 'id' | 'requestDate' | 'status'> }
  | { type: 'UPDATE_TRIP_STATUS'; payload: { id: string; status: TripRequestStatus; notes?: string } }
  | { type: 'COMPLETE_TRIP'; payload: { id: string; endOdometer: number; fuelLiters: number; notes?: string } };