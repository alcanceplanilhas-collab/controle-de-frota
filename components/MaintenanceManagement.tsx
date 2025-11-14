import React, { useState, useEffect } from 'react';
import { Maintenance, Vehicle } from '../types';
import Modal from './shared/Modal';
import { PlusIcon, WrenchScrewdriverIcon } from './Icons';

interface MaintenanceManagementProps {
  maintenance: Maintenance[];
  vehicles: Vehicle[];
  onAddMaintenance: (maintenance: Omit<Maintenance, 'id' | 'created_at'>) => Promise<void>;
  onUpdateMaintenance: (id: string, updates: Partial<Omit<Maintenance, 'id' | 'created_at'>>) => Promise<void>;
  onDeleteMaintenance: (id: string) => Promise<void>;
}

const MaintenanceManagement: React.FC<MaintenanceManagementProps> = ({ maintenance, vehicles, onAddMaintenance, onUpdateMaintenance, onDeleteMaintenance }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);

  const initialFormState: Omit<Maintenance, 'id' | 'created_at'> = {
    vehicle_id: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    description: '',
    cost: 0,
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editingMaintenance) {
      const { id, created_at, vehicles, ...dataToEdit } = editingMaintenance;
      setFormData({
        ...dataToEdit,
        // The date from Supabase is already in YYYY-MM-DD format, which the input expects.
        // No conversion is needed, preventing timezone issues.
        maintenance_date: dataToEdit.maintenance_date.split('T')[0],
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingMaintenance]);

  const handleOpenModal = (maintenanceItem: Maintenance | null = null) => {
    setEditingMaintenance(maintenanceItem);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaintenance(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'cost' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.vehicle_id && formData.description && formData.maintenance_date && !isSubmitting) {
      setIsSubmitting(true);
      if (editingMaintenance) {
        await onUpdateMaintenance(editingMaintenance.id, formData);
      } else {
        await onAddMaintenance(formData);
      }
      setIsSubmitting(false);
      handleCloseModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de manutenção?')) {
      await onDeleteMaintenance(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciar Manutenções</h2>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4"
        >
          <PlusIcon className="mr-2" />
          Adicionar Manutenção
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Veículo</th>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3">Descrição</th>
                <th scope="col" className="px-6 py-3 text-right">Custo (R$)</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((item) => (
                <tr key={item.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{item.vehicles?.model} ({item.vehicles?.plate})</td>
                  {/* Correctly parse date in local timezone to prevent off-by-one day errors */}
                  <td className="px-6 py-4">{new Date(item.maintenance_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4 text-right">{item.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleOpenModal(item)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {maintenance.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg">
              <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Nenhum registro de manutenção</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece adicionando um novo registro de manutenção.</p>
          </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMaintenance ? 'Editar Manutenção' : 'Adicionar Manutenção'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicle_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
            <select name="vehicle_id" id="vehicle_id" value={formData.vehicle_id} onChange={handleInputChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="">Selecione um veículo...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="maintenance_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Manutenção</label>
            <input type="date" name="maintenance_date" id="maintenance_date" value={formData.maintenance_date} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Custo (R$)</label>
            <input type="number" name="cost" id="cost" value={formData.cost} onChange={handleInputChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
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

export default MaintenanceManagement;