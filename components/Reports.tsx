import React, { useMemo, useState } from 'react';
import { TripRequest, TripRequestStatus, Vehicle, User, Purpose, Maintenance } from '../types';

interface ReportData {
  id: string;
  name: string;
  totalKm: number;
  totalLiters: number;
  tripCount: number;
  totalCost: number;
}

interface ReportTotals {
    tripCount: number;
    totalKm: number;
    totalLiters: number;
    totalCost: number;
}

interface ReportsProps {
  vehicles: Vehicle[];
  users: User[];
  purposes: Purpose[];
  tripRequests: TripRequest[];
  maintenance: Maintenance[];
}

const Reports: React.FC<ReportsProps> = ({ vehicles, users, purposes, tripRequests, maintenance }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState('all');

  const completedTrips = useMemo(() => {
    return tripRequests.filter(trip => {
      if (trip.status !== TripRequestStatus.Completed || !trip.completed_date) {
        return false;
      }
      
      const tripDate = trip.completed_date.substring(0, 10);

      if (startDate && tripDate < startDate) return false;
      if (endDate && tripDate > endDate) return false;
      if (selectedUserId !== 'all' && trip.user_id !== selectedUserId) return false;

      return true;
    });
  }, [tripRequests, startDate, endDate, selectedUserId]);

  const reportByVehicle: ReportData[] = useMemo(() => {
    const vehicleMap = new Map<string, { totalKm: number; totalLiters: number; tripCount: number; totalCost: number }>();
    completedTrips.forEach(trip => {
      const stats = vehicleMap.get(trip.vehicle_id) || { totalKm: 0, totalLiters: 0, tripCount: 0, totalCost: 0 };
      stats.totalKm += trip.distance_km || 0;
      stats.totalLiters += trip.fuel_liters || 0;
      stats.totalCost += trip.refuel_cost || 0;
      stats.tripCount++;
      vehicleMap.set(trip.vehicle_id, stats);
    });

    return Array.from(vehicleMap.entries()).map(([vehicleId, stats]) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      return {
        id: vehicleId,
        name: vehicle ? `${vehicle.model} (${vehicle.plate})` : 'Veículo Desconhecido',
        ...stats,
      };
    });
  }, [completedTrips, vehicles]);

  const reportByUser: ReportData[] = useMemo(() => {
    const userMap = new Map<string, { totalKm: number; totalLiters: number; tripCount: number; totalCost: number }>();
    completedTrips.forEach(trip => {
      const stats = userMap.get(trip.user_id) || { totalKm: 0, totalLiters: 0, tripCount: 0, totalCost: 0 };
      stats.totalKm += trip.distance_km || 0;
      stats.totalLiters += trip.fuel_liters || 0;
      stats.totalCost += trip.refuel_cost || 0;
      stats.tripCount++;
      userMap.set(trip.user_id, stats);
    });

    return Array.from(userMap.entries()).map(([userId, stats]) => {
      const user = users.find(u => u.id === userId);
      return {
        id: userId,
        name: user?.name || 'Usuário Desconhecido',
        ...stats,
      };
    });
  }, [completedTrips, users]);

  const reportByPurpose: ReportData[] = useMemo(() => {
    const purposeMap = new Map<string, { totalKm: number; totalLiters: number; tripCount: number; totalCost: number }>();
    completedTrips.forEach(trip => {
      if (!trip.purpose_id) return;
      const stats = purposeMap.get(trip.purpose_id) || { totalKm: 0, totalLiters: 0, tripCount: 0, totalCost: 0 };
      stats.totalKm += trip.distance_km || 0;
      stats.totalLiters += trip.fuel_liters || 0;
      stats.totalCost += trip.refuel_cost || 0;
      stats.tripCount++;
      purposeMap.set(trip.purpose_id, stats);
    });

    return Array.from(purposeMap.entries()).map(([purposeId, stats]) => {
      const purpose = purposes.find(p => p.id === purposeId);
      return {
        id: purposeId,
        name: purpose?.name || 'Finalidade Desconhecida',
        ...stats,
      };
    });
  }, [completedTrips, purposes]);

  const calculateTotals = (data: ReportData[]): ReportTotals => {
    return data.reduce((acc, item) => {
        acc.tripCount += item.tripCount;
        acc.totalKm += item.totalKm;
        acc.totalLiters += item.totalLiters;
        acc.totalCost += item.totalCost;
        return acc;
    }, { tripCount: 0, totalKm: 0, totalLiters: 0, totalCost: 0 });
  };

  const vehicleTotals = useMemo(() => calculateTotals(reportByVehicle), [reportByVehicle]);
  const userTotals = useMemo(() => calculateTotals(reportByUser), [reportByUser]);
  const purposeTotals = useMemo(() => calculateTotals(reportByPurpose), [reportByPurpose]);
  
  const filteredMaintenance = useMemo(() => {
    return maintenance.filter(item => {
        const itemDate = item.maintenance_date.substring(0, 10);
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        if (selectedVehicleId !== 'all' && item.vehicle_id !== selectedVehicleId) return false;
        return true;
    });
  }, [maintenance, startDate, endDate, selectedVehicleId]);

  const totalMaintenanceCost = useMemo(() => {
      return filteredMaintenance.reduce((acc, item) => acc + item.cost, 0);
  }, [filteredMaintenance]);

  const ReportTable: React.FC<{ data: ReportData[]; title: string; col1Header: string; totals: ReportTotals }> = ({ data, title, col1Header, totals }) => (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-3">{col1Header}</th>
              <th scope="col" className="px-6 py-3 text-right">Viagens</th>
              <th scope="col" className="px-6 py-3 text-right">Distância Total (km)</th>
              <th scope="col" className="px-6 py-3 text-right">Total Abastecido (L)</th>
              <th scope="col" className="px-6 py-3 text-right">Custo Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.name}</td>
                <td className="px-6 py-4 text-right">{item.tripCount}</td>
                <td className="px-6 py-4 text-right">{item.totalKm.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">{item.totalLiters.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">{item.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            ))}
          </tbody>
           {data.length > 0 && (
            <tfoot className="bg-slate-50 dark:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200">
              <tr>
                <td className="px-6 py-3 text-left">Total</td>
                <td className="px-6 py-3 text-right">{totals.tripCount}</td>
                <td className="px-6 py-3 text-right">{totals.totalKm.toFixed(2)}</td>
                <td className="px-6 py-3 text-right">{totals.totalLiters.toFixed(2)}</td>
                <td className="px-6 py-3 text-right">{totals.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            </tfoot>
           )}
        </table>
      </div>
       {data.length === 0 && <p className="text-center py-4 text-slate-500">Nenhum dado para exibir neste período.</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Relatórios</h2>
      
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Filtros Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data Inicial</label>
            <input 
              type="date" 
              id="start_date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data Final</label>
            <input 
              type="date" 
              id="end_date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
           <div className="lg:col-span-1">
             <label htmlFor="user_filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Usuário (Consumo)</label>
             <select id="user_filter" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="all">Todos os Usuários</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
             </select>
          </div>
           <button 
            onClick={() => { setStartDate(''); setEndDate(''); setSelectedUserId('all'); }}
            className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-2 px-4 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors h-10"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Detailed Trip History */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Histórico Detalhado de Viagens</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Veículo</th>
                <th scope="col" className="px-6 py-3">Usuário</th>
                <th scope="col" className="px-6 py-3">Data Conclusão</th>
                <th scope="col" className="px-6 py-3">Destino</th>
                <th scope="col" className="px-6 py-3 text-right">Distância (km)</th>
                <th scope="col" className="px-6 py-3 text-right">Abastecido (L)</th>
                <th scope="col" className="px-6 py-3 text-right">Custo (R$)</th>
              </tr>
            </thead>
            <tbody>
              {completedTrips.map(trip => (
                <tr key={trip.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{trip.vehicles?.model} ({trip.vehicles?.plate})</td>
                  <td className="px-6 py-4">{trip.users?.name}</td>
                  <td className="px-6 py-4">{new Date(trip.completed_date!).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">{trip.destination}</td>
                  <td className="px-6 py-4 text-right">{(trip.distance_km || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">{(trip.fuel_liters || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">{(trip.refuel_cost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {completedTrips.length === 0 && <p className="text-center py-4 text-slate-500">Nenhuma viagem concluída para exibir neste período.</p>}
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-4 border-t border-slate-200 dark:border-slate-700">Resumos Agrupados</h3>
        <ReportTable data={reportByVehicle} title="Consumo por Veículo" col1Header="Veículo" totals={vehicleTotals} />
        <ReportTable data={reportByUser} title="Consumo por Usuário" col1Header="Usuário" totals={userTotals} />
        <ReportTable data={reportByPurpose} title="Consumo por Finalidade" col1Header="Finalidade" totals={purposeTotals} />
      </div>
      
      {/* Maintenance Report */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Relatório de Manutenção</h3>
            <div>
                <label htmlFor="vehicle_filter" className="sr-only">Filtrar por Veículo</label>
                 <select id="vehicle_filter" value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} className="block w-full sm:w-64 pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option value="all">Todos os Veículos</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>)}
                 </select>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Veículo</th>
                        <th scope="col" className="px-6 py-3">Data</th>
                        <th scope="col" className="px-6 py-3">Descrição</th>
                        <th scope="col" className="px-6 py-3 text-right">Custo</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMaintenance.map(item => (
                        <tr key={item.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.vehicles?.model} ({item.vehicles?.plate})</td>
                            <td className="px-6 py-4">{new Date(item.maintenance_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4">{item.description}</td>
                            <td className="px-6 py-4 text-right">{item.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        </tr>
                    ))}
                </tbody>
                {filteredMaintenance.length > 0 && (
                    <tfoot className="bg-slate-50 dark:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                        <tr>
                            <td colSpan={3} className="px-6 py-3 text-right">Custo Total</td>
                            <td className="px-6 py-3 text-right">{totalMaintenanceCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
        {filteredMaintenance.length === 0 && <p className="text-center py-4 text-slate-500">Nenhum registro de manutenção para exibir neste período/veículo.</p>}
      </div>
    </div>
  );
};

export default Reports;