
import React, { useState, useReducer } from 'react';
import { AppState, Action, View, TripRequest, Vehicle, TripRequestStatus } from './types';
import { INITIAL_STATE } from './constants';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import VehicleManagement from './components/VehicleManagement';
import TripManagement from './components/TripManagement';
import Reports from './components/Reports';

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case 'CREATE_TRIP_REQUEST':
      const newTrip: TripRequest = {
        ...action.payload,
        id: `trip-${Date.now()}`,
        requestDate: new Date().toISOString(),
        status: TripRequestStatus.Pending,
      };
      return { ...state, tripRequests: [...state.tripRequests, newTrip] };
    case 'UPDATE_TRIP_STATUS': {
      const { id, status } = action.payload;
      const tripToUpdate = state.tripRequests.find(trip => trip.id === id);
      if (!tripToUpdate) return state;

      let startOdometer: number | undefined;
      if (status === TripRequestStatus.Approved) {
        const vehicle = state.vehicles.find(v => v.id === tripToUpdate.vehicleId);
        startOdometer = vehicle?.currentOdometer;
      }
      
      return {
        ...state,
        tripRequests: state.tripRequests.map(trip =>
          trip.id === id
            ? { 
                ...trip, 
                status: status, 
                approvalDate: new Date().toISOString(),
                ...(startOdometer !== undefined && { startOdometer }) 
              }
            : trip
        ),
      };
    }
    case 'COMPLETE_TRIP': {
        const { id, endOdometer, fuelLiters, notes } = action.payload;
        const tripToComplete = state.tripRequests.find(trip => trip.id === id);

        if (!tripToComplete || tripToComplete.startOdometer === undefined || endOdometer < tripToComplete.startOdometer) {
            return state; // Or handle error
        }

        const distanceKm = endOdometer - tripToComplete.startOdometer;

        const updatedTripRequests = state.tripRequests.map(trip =>
            trip.id === id
                ? {
                    ...trip,
                    status: TripRequestStatus.Completed,
                    completedDate: new Date().toISOString(),
                    endOdometer,
                    distanceKm,
                    fuelLiters,
                    notes,
                }
                : trip
        );

        const updatedVehicles = state.vehicles.map(vehicle => 
            vehicle.id === tripToComplete.vehicleId
                ? { ...vehicle, currentOdometer: endOdometer }
                : vehicle
        );

        return {
            ...state,
            tripRequests: updatedTripRequests,
            vehicles: updatedVehicles,
        };
    }
    default:
      return state;
  }
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard state={state} onNavigate={setCurrentView} />;
      case 'vehicles':
        return <VehicleManagement vehicles={state.vehicles} dispatch={dispatch} />;
      case 'trips':
        return <TripManagement state={state} dispatch={dispatch} />;
      case 'reports':
        return <Reports state={state} />;
      default:
        return <Dashboard state={state} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 mb-16 md:mb-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;