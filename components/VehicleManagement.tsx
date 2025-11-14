
import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import Modal from './shared/Modal';
import { PlusIcon, CarIcon } from './Icons';

interface VehicleManagementProps {
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => Promise<void>;
  onUpdateVehicle: (id: string, updates: Partial<Omit<Vehicle, 'id' | 'created_at'>>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ vehicles, onAddVehicle, onUpdateVehicle, onDeleteVehicle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const initialFormState: Omit<Vehicle, 'id' | 'created_at'> = {
    model: '',
    plate: '',
    year: new Date().getFullYear(),
    fuel_type: 'Gasolina',
    current_odometer: 0,
    is_active: true,
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editingVehicle) {
      const { id, created_at, ...dataToEdit } = editingVehicle;
      setFormData(dataToEdit);
    } else {
      setFormData(initialFormState);
    }
  }, [editingVehicle]);

  const handleOpenModal = (vehicle: Vehicle | null = null) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'year' || name === 'current_odometer' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.model && formData.plate && !isSubmitting) {
      setIsSubmitting(true);
      if (editingVehicle) {
        await onUpdateVehicle(editingVehicle.id, formData);
      } else {
        await onAddVehicle(formData);
      }
      setIsSubmitting(false);
      handleCloseModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
      await onDeleteVehicle(id);
    }
  };

  const handleToggleActive = async (vehicle: Vehicle) => {
    await onUpdateVehicle(vehicle.id, { is_active: !vehicle.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciar Veículos</h2>
        <button
          onClick={() => handleOpenModal()}
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
                <th scope="col" className="px-6 py-3">Odômetro (km)</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{vehicle.model}</td>
                  <td className="px-6 py-4">{vehicle.plate}</td>
                  <td className="px-6 py-4">{vehicle.current_odometer.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vehicle.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {vehicle.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleOpenModal(vehicle)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                    <button onClick={() => handleToggleActive(vehicle)} className={`font-medium ${vehicle.is_active ? 'text-red-600 dark:text-red-400 hover:underline' : 'text-green-600 dark:text-green-400 hover:underline'}`}>
                        {vehicle.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => handleDelete(vehicle.id)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Excluir</button>
                  </td>
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Modelo</label>
            <input type="text" name="model" id="model" value={formData.model} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="plate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Placa</label>
            <input type="text" name="plate" id="plate" value={formData.plate} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ano</label>
            <input type="number" name="year" id="year" value={formData.year} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="current_odometer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Odômetro Atual (km)</label>
            <input type="number" name="current_odometer" id="current_odometer" value={formData.current_odometer} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="fuel_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Combustível</label>
            <select name="fuel_type" id="fuel_type" value={formData.fuel_type} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option>Gasolina</option>
              <option>Flex</option>
              <option>Diesel</option>
              <option>Etanol</option>
              <option>Elétrico</option>
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleCloseModal} className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 mr-2">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VehicleManagement;