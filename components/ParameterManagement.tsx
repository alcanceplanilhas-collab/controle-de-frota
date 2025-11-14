import React, { useState, useEffect } from 'react';
import { Parameter } from '../types';
import { CogIcon } from './Icons';

interface ParameterManagementProps {
  parameter: Parameter | null;
  onSave: (parameter: Omit<Parameter, 'id' | 'created_at'>) => Promise<void>;
}

const ParameterManagement: React.FC<ParameterManagementProps> = ({ parameter, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormState: Omit<Parameter, 'id' | 'created_at'> = {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    responsavel: '',
    is_active: true,
    logo: '',
    precos_combustiveis: {
        Gasolina: 0,
        Etanol: 0,
        Diesel: 0,
    },
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (parameter) {
      const { id, created_at, ...dataToEdit } = parameter;
      setFormData({
          ...initialFormState,
          ...dataToEdit,
          precos_combustiveis: {
            ...initialFormState.precos_combustiveis,
            ...(dataToEdit.precos_combustiveis || {}),
          },
          logo: dataToEdit.logo || '',
      });
    } else {
        setFormData(initialFormState);
    }
  }, [parameter]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : 
               type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        precos_combustiveis: {
            ...prev.precos_combustiveis,
            [name]: parseFloat(value) || 0,
        }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, logo: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <CogIcon className="w-8 h-8 mr-3 text-slate-500" />
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Parâmetros da Empresa</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="razao_social" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Razão Social</label>
                        <input type="text" name="razao_social" id="razao_social" value={formData.razao_social} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                     <div>
                        <label htmlFor="nome_fantasia" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Fantasia</label>
                        <input type="text" name="nome_fantasia" id="nome_fantasia" value={formData.nome_fantasia} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                     <div>
                        <label htmlFor="cnpj" className="block text-sm font-medium text-slate-700 dark:text-slate-300">CNPJ</label>
                        <input type="text" name="cnpj" id="cnpj" value={formData.cnpj} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="endereco" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Endereço</label>
                        <input type="text" name="endereco" id="endereco" value={formData.endereco} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="telefone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                        <input type="text" name="telefone" id="telefone" value={formData.telefone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="responsavel" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Responsável</label>
                        <input type="text" name="responsavel" id="responsavel" value={formData.responsavel} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                     <div className="flex items-center pt-2">
                        <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500" />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900 dark:text-slate-200">Parâmetros Ativos</label>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Preços dos Combustíveis (R$/litro)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="preco_gasolina" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gasolina</label>
                        <input type="number" name="Gasolina" id="preco_gasolina" value={formData.precos_combustiveis.Gasolina || ''} onChange={handlePriceChange} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="preco_etanol" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Etanol (Álcool)</label>
                        <input type="number" name="Etanol" id="preco_etanol" value={formData.precos_combustiveis.Etanol || ''} onChange={handlePriceChange} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="preco_diesel" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Diesel</label>
                        <input type="number" name="Diesel" id="preco_diesel" value={formData.precos_combustiveis.Diesel || ''} onChange={handlePriceChange} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
            </div>


            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Logo da Empresa</label>
                <div className="mt-2 flex items-center space-x-6">
                    <div className="shrink-0">
                        {formData.logo ? (
                            <img className="h-16 w-32 object-contain" src={formData.logo} alt="Logo Atual" />
                        ) : (
                            <div className="h-16 w-32 bg-slate-100 dark:bg-slate-700 flex items-center justify-center rounded">
                                <span className="text-xs text-slate-500">Sem Logo</span>
                            </div>
                        )}
                    </div>
                    <label className="block">
                        <span className="sr-only">Escolha a logo</span>
                        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    </label>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-8">
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ParameterManagement;