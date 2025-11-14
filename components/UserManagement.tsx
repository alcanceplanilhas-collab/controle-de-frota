import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Modal from './shared/Modal';
import { PlusIcon, UsersIcon } from './Icons';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'created_at' | 'is_active'>) => Promise<void>;
  onUpdateUser: (id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{ name: string; role: 'Administrador' | 'Operador' }>({ name: '', role: 'Operador' });

  useEffect(() => {
    if (editingUser) {
      setFormData({ name: editingUser.name, role: editingUser.role });
    } else {
      setFormData({ name: '', role: 'Operador' });
    }
  }, [editingUser]);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || isSubmitting) return;
    
    setIsSubmitting(true);
    if (editingUser) {
      await onUpdateUser(editingUser.id, formData);
    } else {
      await onAddUser(formData);
    }
    setIsSubmitting(false);
    handleCloseModal();
  };

  const handleToggleActive = async (user: User) => {
      await onUpdateUser(user.id, { is_active: !user.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciar Usuários</h2>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4"
        >
          <PlusIcon className="mr-2" />
          Adicionar Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Função</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{user.name}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(user)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                    <button onClick={() => handleToggleActive(user)} className={`font-medium ${user.is_active ? 'text-red-600 dark:text-red-400 hover:underline' : 'text-green-600 dark:text-green-400 hover:underline'}`}>
                        {user.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {users.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg">
              <UsersIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Nenhum usuário cadastrado</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece adicionando um novo usuário.</p>
          </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Função</label>
            <select name="role" id="role" value={formData.role} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="Operador">Operador</option>
              <option value="Administrador">Administrador</option>
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

export default UserManagement;