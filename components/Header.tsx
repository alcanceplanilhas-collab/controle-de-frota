import React from 'react';
import { View } from '../types';
import { DashboardIcon, CarIcon, ClipboardListIcon, ChartBarIcon } from '../constants';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  // Fix: Stored icon components instead of elements to avoid React.cloneElement, which was causing a TypeScript error.
  const navItems: { view: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { view: 'vehicles', label: 'Veículos', icon: CarIcon },
    { view: 'trips', label: 'Viagens', icon: ClipboardListIcon },
    { view: 'reports', label: 'Relatórios', icon: ChartBarIcon },
  ];

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Fuel Control Pro</h1>
          </div>
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentView === item.view
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors duration-200 ${
                  currentView === item.view
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Header;
