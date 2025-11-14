import React, { useState, useEffect } from 'react';
import { Purpose } from '../types';
import Modal from './shared/Modal';
import { PlusIcon, TagIcon } from './Icons';

interface PurposeManagementProps {
  purposes: Purpose[];
  onAddPurpose: (purpose: Omit<Purpose, 'id' | 'created_at'>) => Promise<void>;
  onUpdatePurpose: (id: string, updates: Partial<Omit<Purpose, 'id' | 'created_at'>>) => Promise<void>;
  onDeletePurpose: (id: string) => Promise<void>;
}

const PurposeManagement: React.FC<PurposeManagementProps> = ({ purposes, onAddPurpose, onUpdatePurpose, onDeletePurpose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null);
  const [formData, setFormData] = useState<{ name: string }>({ name: '' });

  useEffect(() => {
    if (editingPurpose) {
      setFormData({ name: editingPurpose.name });
    } else {
      setFormData({ name: '' });
    }
  }, [editingPurpose]);

  const handleOpenModal = (purpose: Purpose | null = null) => {
    setEditingPurpose(purpose);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPurpose(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ name: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || isSubmitting) return;

    setIsSubmitting(true);
    if (editingPurpose) {
      await onUpdatePurpose(editingPurpose.id, formData);
    } else {
      await onAddPurpose(formData);
    }
    setIsSubmitting(false);
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta finalidade? Esta ação não pode ser desfeita.')) {
      await onDeletePurpose(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciar Finalidades</h2>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4"
        >
          <PlusIcon className="mr-2" />
          Adicionar Finalidade
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {purposes.map((purpose) => (
                <tr key={purpose.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{purpose.name}</td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleOpenModal(purpose)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(purpose.id)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {purposes.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg">
              <TagIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Nenhuma finalidade cadastrada</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece adicionando uma nova finalidade para as viagens.</p>
          </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPurpose ? 'Editar Finalidade' : 'Adicionar Nova Finalidade'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Finalidade</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
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

export default PurposeManagement;
