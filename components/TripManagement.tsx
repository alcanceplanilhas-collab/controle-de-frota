
import React, { useState } from 'react';
import { AppState, Action, TripRequest, TripRequestStatus, Vehicle, User } from '../types';
import Modal from './shared/Modal';
import { PlusIcon } from '../constants';

const statusColors: { [key in TripRequestStatus]: string } = {
    [TripRequestStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [TripRequestStatus.Approved]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [TripRequestStatus.InUse]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
    [TripRequestStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [TripRequestStatus.Denied]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const TripCard: React.FC<{
    trip: TripRequest;
    vehicle?: Vehicle;
    user?: User;
    currentUser: User;
    onAction: (id: string, action: 'approve' | 'deny' | 'complete' | 'start_trip', data?: any) => void;
}> = ({ trip, vehicle, user, currentUser, onAction }) => {
    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{vehicle?.model} ({vehicle?.plate})</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">para {user?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[trip.status]}`}>{trip.status}</span>
            </div>
            <div>
                <p><span className="font-semibold">Destino:</span> {trip.destination}</p>
                <p><span className="font-semibold">Finalidade:</span> {trip.purpose}</p>
                 {trip.startOdometer && <p className="text-sm"><span className="font-semibold">Odômetro Inicial:</span> {trip.startOdometer.toLocaleString('pt-BR')} km</p>}
            </div>
            <p className="text-xs text-slate-400">Requisitado em: {new Date(trip.requestDate).toLocaleString()}</p>
            {trip.status === TripRequestStatus.Pending && currentUser.role === 'Authorizer' && (
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


const TripManagement: React.FC<{ state: AppState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [currentTrip, setCurrentTrip] = useState<TripRequest | null>(null);
    const [newRequest, setNewRequest] = useState({ userId: '', vehicleId: '', destination: '', purpose: '' });
    const [completionData, setCompletionData] = useState({ endOdometer: 0, fuelLiters: 0, notes: '' });

    const handleAction = (id: string, action: 'approve' | 'deny' | 'complete' | 'start_trip', data?: any) => {
        if (action === 'approve') {
            dispatch({ type: 'UPDATE_TRIP_STATUS', payload: { id, status: TripRequestStatus.Approved } });
        } else if (action === 'deny') {
            dispatch({ type: 'UPDATE_TRIP_STATUS', payload: { id, status: TripRequestStatus.Denied } });
        } else if (action === 'complete') {
            const tripToComplete = state.tripRequests.find(t => t.id === id);
            if(tripToComplete) {
                setCurrentTrip(tripToComplete);
                setCompletionData({ endOdometer: tripToComplete.startOdometer || 0, fuelLiters: 0, notes: '' });
                setIsCompleteModalOpen(true);
            }
        }
    };
    
    const handleRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'CREATE_TRIP_REQUEST', payload: newRequest });
        setIsRequestModalOpen(false);
        setNewRequest({ userId: '', vehicleId: '', destination: '', purpose: '' });
    };
    
    const handleCompletionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(currentTrip) {
            dispatch({ type: 'COMPLETE_TRIP', payload: { id: currentTrip.id, ...completionData } });
            setIsCompleteModalOpen(false);
            setCurrentTrip(null);
            setCompletionData({ endOdometer: 0, fuelLiters: 0, notes: '' });
        }
    };

    const sortedTrips = [...state.tripRequests].sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciar Viagens</h2>
                <button onClick={() => setIsRequestModalOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
                    <PlusIcon className="mr-2"/>Nova Requisição
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedTrips.map(trip => (
                    <TripCard
                        key={trip.id}
                        trip={trip}
                        vehicle={state.vehicles.find(v => v.id === trip.vehicleId)}
                        user={state.users.find(u => u.id === trip.userId)}
                        currentUser={state.currentUser}
                        onAction={handleAction}
                    />
                ))}
            </div>

            {/* New Request Modal */}
            <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Nova Requisição de Veículo">
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                    {/* Form fields for new request */}
                    <div><label className="block text-sm font-medium">Usuário</label><select value={newRequest.userId} onChange={e => setNewRequest({...newRequest, userId: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm"> <option value="">Selecione...</option> {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)} </select></div>
                    <div><label className="block text-sm font-medium">Veículo</label><select value={newRequest.vehicleId} onChange={e => setNewRequest({...newRequest, vehicleId: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm"> <option value="">Selecione...</option> {state.vehicles.map(v => <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>)} </select></div>
                    <div><label className="block text-sm font-medium">Destino</label><input type="text" value={newRequest.destination} onChange={e => setNewRequest({...newRequest, destination: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm" /></div>
                    <div><label className="block text-sm font-medium">Finalidade</label><input type="text" value={newRequest.purpose} onChange={e => setNewRequest({...newRequest, purpose: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm" /></div>
                    <div className="flex justify-end pt-4"><button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md">Enviar</button></div>
                </form>
            </Modal>
            
            {/* Complete Trip Modal */}
            <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title="Finalizar Viagem">
                <form onSubmit={handleCompletionSubmit} className="space-y-4">
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                        Odômetro Inicial: {currentTrip?.startOdometer?.toLocaleString('pt-BR')} km
                    </p>
                    <div><label className="block text-sm font-medium">Quilometragem Final (km)</label><input type="number" step="1" min={currentTrip?.startOdometer || 0} value={completionData.endOdometer} onChange={e => setCompletionData({...completionData, endOdometer: parseInt(e.target.value)})} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm" /></div>
                    <div><label className="block text-sm font-medium">Combustível Abastecido (Litros)</label><input type="number" step="0.1" value={completionData.fuelLiters} onChange={e => setCompletionData({...completionData, fuelLiters: parseFloat(e.target.value)})} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm" /></div>
                    <div><label className="block text-sm font-medium">Notas</label><textarea value={completionData.notes} onChange={e => setCompletionData({...completionData, notes: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm" /></div>
                    <div className="flex justify-end pt-4"><button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md">Salvar</button></div>
                </form>
            </Modal>
        </div>
    );
};

export default TripManagement;