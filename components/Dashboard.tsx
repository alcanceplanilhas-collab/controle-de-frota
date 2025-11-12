import React from 'react';
import { AppState, TripRequestStatus, View } from '../types';
import { CarIcon, ClipboardListIcon } from '../constants';

interface DashboardProps {
  state: AppState;
  onNavigate: (view: View) => void;
}

// Fix: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`rounded-full p-3 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const { vehicles, tripRequests } = state;

  const pendingRequests = tripRequests.filter(r => r.status === TripRequestStatus.Pending).length;
  const activeTrips = tripRequests.filter(r => r.status === TripRequestStatus.Approved || r.status === TripRequestStatus.InUse).length;
  const totalVehicles = vehicles.length;

  const latestCompletedTrips = tripRequests
    .filter(r => r.status === TripRequestStatus.Completed)
    .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
    .slice(0, 5);

  const findVehicle = (id: string) => vehicles.find(v => v.id === id);
  const findUser = (id: string) => state.users.find(u => u.id === id);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Veículos Totais" value={totalVehicles} icon={<CarIcon className="w-6 h-6 text-white" />} color="bg-blue-500" />
        <StatCard title="Viagens Ativas" value={activeTrips} icon={<ClipboardListIcon className="w-6 h-6 text-white" />} color="bg-green-500" />
        <StatCard title="Requisições Pendentes" value={pendingRequests} icon={<ClipboardListIcon className="w-6 h-6 text-white" />} color="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Últimas Viagens Concluídas</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Veículo</th>
                            <th scope="col" className="px-6 py-3">Usuário</th>
                            <th scope="col" className="px-6 py-3">Distância</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestCompletedTrips.length > 0 ? latestCompletedTrips.map(trip => {
                            const vehicle = findVehicle(trip.vehicleId);
                            const user = findUser(trip.userId);
                            return (
                                <tr key={trip.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{vehicle?.model} ({vehicle?.plate})</td>
                                    <td className="px-6 py-4">{user?.name}</td>
                                    <td className="px-6 py-4">{trip.distanceKm?.toFixed(2)} km</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={3} className="text-center py-4">Nenhuma viagem concluída ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => onNavigate('trips')} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Nova Requisição
                </button>
                <button onClick={() => onNavigate('vehicles')} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                    Adicionar Veículo
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;