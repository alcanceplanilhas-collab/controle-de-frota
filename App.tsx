import React, { useState, useEffect, useCallback } from 'react';
import { View, TripRequest, Vehicle, TripRequestStatus, User, Purpose, Maintenance, Parameter } from './types';
import { supabase } from './supabase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import VehicleManagement from './components/VehicleManagement';
import TripManagement from './components/TripManagement';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import PurposeManagement from './components/PurposeManagement';
import MaintenanceManagement from './components/MaintenanceManagement';
import ParameterManagement from './components/ParameterManagement';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [parameter, setParameter] = useState<Parameter | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && mediaQuery.matches);
      root.classList.toggle('dark', isDark);
    };

    applyTheme();
    localStorage.setItem('theme', theme);
    
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      // Parallelize fetches
      const [vehiclesRes, usersRes, tripRequestsRes, purposesRes, maintenanceRes, parameterRes] = await Promise.all([
        supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('name', { ascending: true }),
        supabase.from('trip_requests').select('*, vehicles(model, plate), users(name), purposes(name)').order('request_date', { ascending: false }),
        supabase.from('purposes').select('*').order('name', { ascending: true }),
        supabase.from('maintenance').select('*, vehicles(model, plate)').order('maintenance_date', { ascending: false }),
        supabase.from('parameters').select('*').maybeSingle(),
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (usersRes.error) throw usersRes.error;
      if (tripRequestsRes.error) throw tripRequestsRes.error;
      if (purposesRes.error) throw purposesRes.error;
      if (maintenanceRes.error) throw maintenanceRes.error;
      if (parameterRes.error) throw parameterRes.error;
      
      setVehicles(vehiclesRes.data);
      setUsers(usersRes.data);
      setTripRequests(tripRequestsRes.data as TripRequest[]);
      setPurposes(purposesRes.data);
      setMaintenance(maintenanceRes.data as Maintenance[]);
      setParameter(parameterRes.data);

      // Set current user (e.g., first active administrator found, fallback to any active user)
      setCurrentUser(usersRes.data.find(u => u.role === 'Administrador' && u.is_active) || usersRes.data.find(u => u.is_active) || null);

    } catch (err: any) {
      console.error(err);
      setError('Falha ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supabase) {
      fetchData();
    }
  }, [fetchData]);

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at'>) => {
    if (!supabase) return;
    const { error } = await supabase.from('vehicles').insert(vehicleData);
    if (error) {
      setError(error.message);
    } else {
      await fetchData();
    }
  };

    const updateVehicle = async (id: string, updates: Partial<Omit<Vehicle, 'id' | 'created_at'>>) => {
      if (!supabase) return;
      const { error } = await supabase.from('vehicles').update(updates).eq('id', id);
      if (error) {
          setError(error.message);
      } else {
          await fetchData();
      }
    };

    const deleteVehicle = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) {
            if (error.code === '23503') { // foreign_key_violation
                setError('Não é possível excluir o veículo, pois ele está associado a uma ou mais viagens.');
            } else {
                setError(error.message);
            }
        } else {
            await fetchData();
        }
    };

    const addMaintenance = async (maintenanceData: Omit<Maintenance, 'id' | 'created_at'>) => {
      if (!supabase) return;
      const { error } = await supabase.from('maintenance').insert(maintenanceData);
      if (error) {
        setError(error.message);
      } else {
        await fetchData();
      }
    };
  
    const updateMaintenance = async (id: string, updates: Partial<Omit<Maintenance, 'id' | 'created_at'>>) => {
      if (!supabase) return;
      const { error } = await supabase.from('maintenance').update(updates).eq('id', id);
      if (error) {
          setError(error.message);
      } else {
          await fetchData();
      }
    };
  
    const deleteMaintenance = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('maintenance').delete().eq('id', id);
        if (error) {
            setError(error.message);
        } else {
            await fetchData();
        }
    };

  const addUser = async (userData: Omit<User, 'id' | 'created_at' | 'is_active'>) => {
    if (!supabase) return;
    const { error } = await supabase.from('users').insert({ ...userData, is_active: true });
    if (error) {
      setError(error.message);
    } else {
      await fetchData();
    }
  };

  const updateUser = async (id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>) => {
      if (!supabase) return;
      const { error } = await supabase.from('users').update(updates).eq('id', id);
      if (error) {
          setError(error.message);
      } else {
          await fetchData();
      }
  };
    
  const addPurpose = async (purposeData: Omit<Purpose, 'id' | 'created_at'>) => {
    if (!supabase) return;
    const { error } = await supabase.from('purposes').insert(purposeData);
    if (error) setError(error.message);
    else await fetchData();
  };

  const updatePurpose = async (id: string, updates: Partial<Omit<Purpose, 'id' | 'created_at'>>) => {
      if (!supabase) return;
      const { error } = await supabase.from('purposes').update(updates).eq('id', id);
      if (error) setError(error.message);
      else await fetchData();
  };

  const deletePurpose = async (id: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('purposes').delete().eq('id', id);
      if (error) {
          if (error.code === '23503') {
              setError('Não é possível excluir a finalidade, pois ela está associada a uma ou mais viagens.');
          } else {
              setError(error.message);
          }
      } else {
          await fetchData();
      }
  };
  
  const addOrUpdateParameter = async (parameterData: Omit<Parameter, 'id' | 'created_at'>) => {
    if (!supabase) return;
    // Use upsert to either create the record if it doesn't exist or update it if it does.
    // This assumes the `id` from the existing parameter is passed, or is null/undefined for a new one.
    const recordToUpsert = parameter ? { ...parameterData, id: parameter.id } : parameterData;
    
    const { error } = await supabase.from('parameters').upsert(recordToUpsert);

    if (error) {
        setError(error.message);
    } else {
        await fetchData();
    }
  };

  const createTripRequest = async (requestData: Omit<TripRequest, 'id' | 'created_at' | 'request_date' | 'status'>) => {
    if (!supabase) return;
    const newTrip = {
      ...requestData,
      request_date: new Date().toISOString(),
      status: TripRequestStatus.Pending,
    };
    const { error } = await supabase.from('trip_requests').insert(newTrip);
    if (error) setError(error.message);
    else await fetchData();
  };

  const updateTripStatus = async (id: string, status: TripRequestStatus) => {
      if (!supabase) return;
      const tripToUpdate = tripRequests.find(trip => trip.id === id);
      if (!tripToUpdate) return;
  
      let updates: Partial<TripRequest> = { status };
  
      if (status === TripRequestStatus.Approved) {
        const vehicle = vehicles.find(v => v.id === tripToUpdate.vehicle_id);
        updates.start_odometer = vehicle?.current_odometer;
        updates.approval_date = new Date().toISOString();
      }
      
      const { error } = await supabase.from('trip_requests').update(updates).eq('id', id);
      if (error) setError(error.message);
      else await fetchData();
  };

  const completeTrip = async (payload: { id: string; end_odometer: number; fuel_liters: number; notes?: string; fuel_type_refilled?: string; }) => {
    if (!supabase) return;
    const { id, end_odometer, fuel_liters, notes, fuel_type_refilled } = payload;
    const trip = tripRequests.find(t => t.id === id);

    if (!trip || trip.start_odometer === undefined || end_odometer < trip.start_odometer) {
        setError("Odômetro final inválido.");
        return;
    }
    const distance_km = end_odometer - trip.start_odometer;
    
    let refuel_cost = 0;
    if (fuel_liters > 0 && fuel_type_refilled && parameter?.precos_combustiveis) {
      const price = parameter.precos_combustiveis[fuel_type_refilled as keyof typeof parameter.precos_combustiveis] || 0;
      refuel_cost = fuel_liters * price;
    }

    // In a real app, this should be a transaction (RPC function in Supabase)
    const { error: tripError } = await supabase.from('trip_requests').update({
        status: TripRequestStatus.Completed,
        completed_date: new Date().toISOString(),
        end_odometer, distance_km, fuel_liters, notes,
        fuel_type_refilled, refuel_cost
    }).eq('id', id);

    if (tripError) { setError(tripError.message); return; }

    const { error: vehicleError } = await supabase.from('vehicles').update({ current_odometer: end_odometer }).eq('id', trip.vehicle_id);
    
    if (vehicleError) setError(vehicleError.message);
    
    await fetchData();
  };

  if (!supabase) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Erro de Configuração</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            O cliente Supabase não está configurado. Por favor, adicione as variáveis de ambiente <code className="bg-slate-200 dark:bg-slate-700 p-1 rounded">SUPABASE_URL</code> e <code className="bg-slate-200 dark:bg-slate-700 p-1 rounded">SUPABASE_ANON_KEY</code> no seu ambiente ou atualize o arquivo <code className="bg-slate-200 dark:bg-slate-700 p-1 rounded">supabase.ts</code>.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) return <div className="text-center p-10">Carregando...</div>;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard vehicles={vehicles} tripRequests={tripRequests} users={users} onNavigate={setCurrentView} />;
      case 'vehicles':
        return <VehicleManagement vehicles={vehicles} onAddVehicle={addVehicle} onUpdateVehicle={updateVehicle} onDeleteVehicle={deleteVehicle} />;
      case 'trips':
        return <TripManagement vehicles={vehicles} users={users} purposes={purposes} tripRequests={tripRequests} currentUser={currentUser} createTripRequest={createTripRequest} updateTripStatus={updateTripStatus} completeTrip={completeTrip} />;
      case 'users':
        return <UserManagement users={users} onAddUser={addUser} onUpdateUser={updateUser} />;
      case 'purposes':
        return <PurposeManagement purposes={purposes} onAddPurpose={addPurpose} onUpdatePurpose={updatePurpose} onDeletePurpose={deletePurpose} />;
      case 'maintenance':
        return <MaintenanceManagement maintenance={maintenance} vehicles={vehicles} onAddMaintenance={addMaintenance} onUpdateMaintenance={updateMaintenance} onDeleteMaintenance={deleteMaintenance} />;
      case 'parameters':
        return <ParameterManagement parameter={parameter} onSave={addOrUpdateParameter} />;
      case 'reports':
        return <Reports vehicles={vehicles} users={users} purposes={purposes} tripRequests={tripRequests} maintenance={maintenance} />;
      default:
        return <Dashboard vehicles={vehicles} tripRequests={tripRequests} users={users} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={currentView} onNavigate={setCurrentView} theme={theme} setTheme={setTheme} parameter={parameter} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 mb-16 md:mb-0">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm0-4a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1z"/></svg>
              </div>
              <div className="flex-grow">
                <p className="font-bold">Ocorreu um erro</p>
                <p className="text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-4 self-start text-red-500 hover:text-red-700 font-bold" aria-label="Fechar">
                 <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;