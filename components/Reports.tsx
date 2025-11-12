
import React, { useMemo } from 'react';
import { AppState, TripRequestStatus } from '../types';

interface ReportData {
  id: string;
  name: string;
  totalKm: number;
  totalLiters: number;
  tripCount: number;
  avgConsumption: number;
}

const Reports: React.FC<{ state: AppState }> = ({ state }) => {
  const { vehicles, users, tripRequests } = state;

  const completedTrips = useMemo(() => {
    return tripRequests.filter(trip => trip.status === TripRequestStatus.Completed && trip.distanceKm && trip.fuelLiters);
  }, [tripRequests]);

  const reportByVehicle: ReportData[] = useMemo(() => {
    const vehicleMap = new Map<string, { totalKm: number; totalLiters: number; tripCount: number }>();
    completedTrips.forEach(trip => {
      const stats = vehicleMap.get(trip.vehicleId) || { totalKm: 0, totalLiters: 0, tripCount: 0 };
      stats.totalKm += trip.distanceKm!;
      stats.totalLiters += trip.fuelLiters!;
      stats.tripCount++;
      vehicleMap.set(trip.vehicleId, stats);
    });

    return Array.from(vehicleMap.entries()).map(([vehicleId, stats]) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const avgConsumption = stats.totalLiters > 0 ? stats.totalKm / stats.totalLiters : 0;
      return {
        id: vehicleId,
        name: `${vehicle?.model} (${vehicle?.plate})`,
        ...stats,
        avgConsumption,
      };
    });
  }, [completedTrips, vehicles]);

  const reportByUser: ReportData[] = useMemo(() => {
    const userMap = new Map<string, { totalKm: number; totalLiters: number; tripCount: number }>();
    completedTrips.forEach(trip => {
      const stats = userMap.get(trip.userId) || { totalKm: 0, totalLiters: 0, tripCount: 0 };
      stats.totalKm += trip.distanceKm!;
      stats.totalLiters += trip.fuelLiters!;
      stats.tripCount++;
      userMap.set(trip.userId, stats);
    });

    return Array.from(userMap.entries()).map(([userId, stats]) => {
      const user = users.find(u => u.id === userId);
      const avgConsumption = stats.totalLiters > 0 ? stats.totalKm / stats.totalLiters : 0;
      return {
        id: userId,
        name: user?.name || 'Usuário Desconhecido',
        ...stats,
        avgConsumption,
      };
    });
  }, [completedTrips, users]);
  
  const ReportTable: React.FC<{ data: ReportData[]; title: string; col1Header: string }> = ({ data, title, col1Header }) => (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-3">{col1Header}</th>
              <th scope="col" className="px-6 py-3 text-right">Viagens</th>
              <th scope="col" className="px-6 py-3 text-right">Distância Total (km)</th>
              <th scope="col" className="px-6 py-3 text-right">Combustível Total (L)</th>
              <th scope="col" className="px-6 py-3 text-right">Consumo Médio (km/L)</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.name}</td>
                <td className="px-6 py-4 text-right">{item.tripCount}</td>
                <td className="px-6 py-4 text-right">{item.totalKm.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">{item.totalLiters.toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-semibold">{item.avgConsumption.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {data.length === 0 && <p className="text-center py-4 text-slate-500">Nenhum dado para exibir.</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Relatórios de Consumo</h2>
      <ReportTable data={reportByVehicle} title="Totalizador por Veículo" col1Header="Veículo" />
      <ReportTable data={reportByUser} title="Totalizador por Usuário" col1Header="Usuário" />
    </div>
  );
};

export default Reports;
