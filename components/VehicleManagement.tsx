
import React, { useState } from 'react';
import { Action, Vehicle } from '../types';
import Modal from './shared/Modal';
import { PlusIcon, CarIcon } from '../constants';

interface VehicleManagementProps {
  vehicles: Vehicle[];
  dispatch: React.Dispatch<Action>;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ vehicles, dispatch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id'>>({
    model: '',
    plate: '',
    year: new Date().getFullYear(),
    fuelType: 'Gasolina',
    currentOdometer: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: name === 'year' || name === 'currentOdometer' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVehicle.model && newVehicle.plate) {
      dispatch({
        type: 'ADD_VEHICLE',
        payload: { ...newVehicle, id: `vehicle-${Date.now()}` },
      });
      setIsModalOpen(false);
      setNewVehicle({ model: '', plate: '', year: new Date().getFullYear(), fuelType: 'Gasolina', currentOdometer: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciar Veículos</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4"
        >
          <PlusIcon className="mr-2" />
          Adicionar Veículo
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Modelo</th>
                <th scope="col" className="px-6 py-3">Placa</th>
                <th scope="col" className="px-6 py-3">Ano</th>
                <th scope="col" className="px-6 py-3">Combustível</th>
                <th scope="col" className="px-6 py-3">Odômetro (km)</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{vehicle.model}</td>
                  <td className="px-6 py-4">{vehicle.plate}</td>
                  <td className="px-6 py-4">{vehicle.year}</td>
                  <td className="px-6 py-4">{vehicle.fuelType}</td>
                  <td className="px-6 py-4">{vehicle.currentOdometer.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {vehicles.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg">
              <CarIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Nenhum veículo cadastrado</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece adicionando um novo veículo.</p>
          </div>
      )}


      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Veículo">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Modelo</label>
            <input type="text" name="model" id="model" value={newVehicle.model} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="plate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Placa</label>
            <input type="text" name="plate" id="plate" value={newVehicle.plate} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ano</label>
            <input type="number" name="year" id="year" value={newVehicle.year} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="currentOdometer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Odômetro Inicial (km)</label>
            <input type="number" name="currentOdometer" id="currentOdometer" value={newVehicle.currentOdometer} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Combustível</label>
            <select name="fuelType" id="fuelType" value={newVehicle.fuelType} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option>Gasolina</option>
              <option>Diesel</option>
              <option>Etanol</option>
              <option>Elétrico</option>
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 mr-2">Cancelar</button>
            <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700">Salvar Veículo</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VehicleManagement;