import { AppState, TripRequestStatus, User } from './types';

const USERS: User[] = [
  { id: 'user-1', name: 'Alice', role: 'Requester' },
  { id: 'user-2', name: 'Beto', role: 'Authorizer' },
  { id: 'user-3', name: 'Carlos', role: 'Requester' },
];

export const INITIAL_STATE: AppState = {
  currentUser: USERS[1], // Beto is the authorizer
  users: USERS,
  vehicles: [
    { id: 'vehicle-1', model: 'Toyota Corolla', plate: 'ABC-1234', year: 2022, fuelType: 'Gasolina', currentOdometer: 55150 },
    { id: 'vehicle-2', model: 'Ford Ranger', plate: 'DEF-5678', year: 2023, fuelType: 'Diesel', currentOdometer: 25000 },
    { id: 'vehicle-3', model: 'Honda Civic', plate: 'GHI-9012', year: 2021, fuelType: 'Gasolina', currentOdometer: 78000 },
  ],
  tripRequests: [
    {
      id: 'trip-1',
      userId: 'user-1',
      vehicleId: 'vehicle-1',
      destination: 'Cliente A',
      purpose: 'Reunião de Vendas',
      requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: TripRequestStatus.Completed,
      approvalDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      completedDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      startOdometer: 55000,
      endOdometer: 55150,
      distanceKm: 150,
      fuelLiters: 12.5,
      notes: 'Viagem tranquila.',
    },
    {
      id: 'trip-2',
      userId: 'user-3',
      vehicleId: 'vehicle-2',
      destination: 'Fornecedor B',
      purpose: 'Retirada de material',
      requestDate: new Date().toISOString(),
      status: TripRequestStatus.Pending,
    },
     {
      id: 'trip-3',
      userId: 'user-1',
      vehicleId: 'vehicle-3',
      destination: 'Centro de Treinamento',
      purpose: 'Curso de capacitação',
      requestDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: TripRequestStatus.Approved,
      startOdometer: 78000,
    },
  ],
};


export const DashboardIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

export const CarIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14h-4v-2h4v2zm-6 0H7v-2h4v2zm6.9-4.5l-1.4-1.4A5.5 5.5 0 0012 6.5c-1.8 0-3.4.9-4.5 2.2l-1.4 1.4C2.9 14.6 1 18.2 1 22h22c0-3.8-1.9-7.4-5.1-9.5zM5 20h14v-1H5v1zm14-3H5a1 1 0 01-1-1v-2h16v2a1 1 0 01-1 1z" />
  </svg>
);


export const ClipboardListIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

export const ChartBarIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);