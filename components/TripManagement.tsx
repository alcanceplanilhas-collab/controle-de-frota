import React, { useState } from 'react';
import { TripRequest, TripRequestStatus, Vehicle, User, Purpose } from '../types';
import Modal from './shared/Modal';
import { PlusIcon } from './Icons';

const statusColors: { [key in TripRequestStatus]: string } = {
    [TripRequestStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [TripRequestStatus.Approved]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [TripRequestStatus.InUse]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
    [TripRequestStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [TripRequestStatus.Denied]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

interface TripManagementProps {
    vehicles: Vehicle[];
    users: User[];
    purposes: Purpose[];
    tripRequests: TripRequest[];
    currentUser: User | null;
    createTripRequest: (request: Omit<TripRequest, 'id' | 'created_at' | 'request_date' | 'status'>) => Promise<void>;
    updateTripStatus: (id: string, status: TripRequestStatus) => Promise<void>;
    completeTrip: (payload: { id: string; end_odometer: number; fuel_liters: number; notes?: string; fuel_type_refilled?: string; }) => Promise<void>;
}

const TripCard: React.FC<{
    trip: TripRequest;
    currentUser: User | null;
    onAction: (id: string, action: 'approve' | 'deny' | 'complete' | 'start_trip', data?: any) => void;
}> = ({ trip, currentUser, onAction }) => {
    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{trip.vehicles?.model} ({trip.vehicles?.plate})</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">para {trip.users?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[trip.status]}`}>{trip.status}</span>
            </div>
            <div>
                <p><span className="font-semibold">Destino:</span> {trip.destination}</p>
                <p><span className="font-semibold">Finalidade:</span> {trip.purposes?.name}</p>
                 {trip.start_odometer && <p className="text-sm"><span className="font-semibold">Odômetro Inicial:</span> {trip.start_odometer.toLocaleString('pt-BR')} km</p>}
            </div>
            <p className="text-xs text-slate-400">Requisitado em: {new Date(trip.request_date).toLocaleString()}</p>
            {trip.status === TripRequestStatus.Pending && currentUser?.role === 'Administrador' && (
                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={() => onAction(trip.id, 'approve')} className="w-full bg-green-500 text-white text-sm py-1 px-3 rounded hover:bg-green-600">Aprovar</button>
                    <button onClick={() => onAction(trip.id, 'deny')} className="w-full bg-red-500 text-white text-sm py-1 px-3 rounded hover:bg-red-600">Negar</button>
                </div>
            )}
            {trip.status === TripRequestStatus.Approved && (
                 <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                     <button onClick={() => onAction(trip.id, 'complete')} className="w-full bg-indigo-500 text-white text-sm py-1 px-3 rounded hover:bg-indigo-600">Finalizar Viagem</button>
                </div>
            )}
        </div>
    );
};


const TripManagement: React.FC<TripManagementProps> = ({ vehicles, users, purposes, tripRequests, currentUser, createTripRequest, updateTripStatus, completeTrip }) => {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTrip, setCurrentTrip] = useState<TripRequest | null>(null);
    const [newRequest, setNewRequest] = useState({ user_id: '', vehicle_id: '', destination: '', purpose_id: '' });
    const [completionData, setCompletionData] = useState({ end_odometer: 0, fuel_liters: 0, notes: '', fuel_type_refilled: '' });
    
    const activeUsers = users.filter(u => u.is_active);
    const activeVehicles = vehicles.filter(v => v.is_active);
    
    const handleAction = (id: string, action: 'approve' | 'deny' | 'complete' | 'start_trip') => {
        if (action === 'approve') {
            updateTripStatus(id, TripRequestStatus.Approved);
        } else if (action === 'deny') {
            updateTripStatus(id, TripRequestStatus.Denied);
        } else if (action === 'complete') {
            const tripToComplete = tripRequests.find(t => t.id === id);
            if(tripToComplete) {
                setCurrentTrip(tripToComplete);
                setCompletionData({ end_odometer: tripToComplete.start_odometer || 0, fuel_liters: 0, notes: '', fuel_type_refilled: '' });
                setIsCompleteModalOpen(true);
            }
        }
    };
    
    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        await createTripRequest(newRequest);
        setIsRequestModalOpen(false);
        setNewRequest({ user_id: '', vehicle_id: '', destination: '', purpose_id: '' });
        setIsSubmitting(false);
    };
    
    const handleCompletionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(currentTrip && !isSubmitting) {
            setIsSubmitting(true);
            await completeTrip({ id: currentTrip.id, ...completionData });
            setIsCompleteModalOpen(false);
            setCurrentTrip(null);
            setCompletionData({ end_odometer: 0, fuel_liters: 0, notes: '', fuel_type_refilled: '' });
            setIsSubmitting(false);
        }
    };

    const handleCloseCompleteModal = () => {
        setIsCompleteModalOpen(false);
        setCurrentTrip(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciar Viagens</h2>
                <button onClick={() => setIsRequestModalOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
                    <PlusIcon className="mr-2"/>Nova Requisição
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tripRequests.map(trip => (
                    <TripCard
                        key={trip.id}
                        trip={trip}
                        currentUser={currentUser}
                        onAction={handleAction}
                    />
                ))}
            </div>

            {/* New Request Modal */}
            <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Nova Requisição de Veículo">
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="user_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Usuário</label>
                        <select id="user_id" name="user_id" value={newRequest.user_id} onChange={e => setNewRequest({...newRequest, user_id: e.target.value})} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="">Selecione...</option>
                            {activeUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="vehicle_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
                        <select id="vehicle_id" name="vehicle_id" value={newRequest.vehicle_id} onChange={e => setNewRequest({...newRequest, vehicle_id: e.target.value})} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="">Selecione...</option>
                            {activeVehicles.map(v => <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="destination" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Destino</label>
                        <input id="destination" name="destination" type="text" value={newRequest.destination} onChange={e => setNewRequest({...newRequest, destination: e.target.value})} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="purpose_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Finalidade</label>
                         <select id="purpose_id" name="purpose_id" value={newRequest.purpose_id} onChange={e => setNewRequest({...newRequest, purpose_id: e.target.value})} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="">Selecione...</option>
                            {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => setIsRequestModalOpen(false)} className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 mr-2">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSubmitting ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </form>
            </Modal>
            
            {/* Complete Trip Modal */}
            <Modal isOpen={isCompleteModalOpen} onClose={handleCloseCompleteModal} title="Finalizar Viagem">
                <form onSubmit={handleCompletionSubmit} className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Odômetro Inicial: {currentTrip?.start_odometer?.toLocaleString('pt-BR')} km
                    </p>
                    <div>
                        <label htmlFor="end_odometer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quilometragem Final (km)</label>
                        <input id="end_odometer" name="end_odometer" type="number" step="1" min={currentTrip?.start_odometer || 0} value={completionData.end_odometer} onChange={e => setCompletionData({...completionData, end_odometer: parseInt(e.target.value) || 0})} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="fuel_liters" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Combustível Abastecido (Litros)</label>
                        <input id="fuel_liters" name="fuel_liters" type="number" step="0.01" min="0" value={completionData.fuel_liters} onChange={e => setCompletionData({...completionData, fuel_liters: parseFloat(e.target.value) || 0})} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    {completionData.fuel_liters > 0 && (
                        <div>
                            <label htmlFor="fuel_type_refilled" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Combustível</label>
                            <select 
                                id="fuel_type_refilled" 
                                name="fuel_type_refilled" 
                                value={completionData.fuel_type_refilled} 
                                onChange={e => setCompletionData({...completionData, fuel_type_refilled: e.target.value})} 
                                required 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="">Selecione...</option>
                                <option>Gasolina</option>
                                <option>Etanol</option>
                                <option>Diesel</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notas (Opcional)</label>
                        <textarea id="notes" name="notes" value={completionData.notes} onChange={e => setCompletionData({...completionData, notes: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" rows={3}/>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={handleCloseCompleteModal} className="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 mr-2">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TripManagement;