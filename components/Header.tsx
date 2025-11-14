import React, { useState, useEffect, useRef } from 'react';
import { View, Parameter } from '../types';
import { DashboardIcon, CarIcon, ClipboardListIcon, ChartBarIcon, UsersIcon, TagIcon, WrenchScrewdriverIcon, SunIcon, MoonIcon, DesktopIcon, CogIcon } from './Icons';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  theme: string;
  setTheme: (theme: string) => void;
  parameter: Parameter | null;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, theme, setTheme, parameter }) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  
  const navItems: { view: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { view: 'vehicles', label: 'Veículos', icon: CarIcon },
    { view: 'trips', label: 'Viagens', icon: ClipboardListIcon },
    { view: 'maintenance', label: 'Manutenção', icon: WrenchScrewdriverIcon },
    { view: 'reports', label: 'Relatórios', icon: ChartBarIcon },
    { view: 'parameters', label: 'Parâmetros', icon: CogIcon },
    { view: 'users', label: 'Usuários', icon: UsersIcon },
    { view: 'purposes', label: 'Finalidades', icon: TagIcon },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {parameter?.logo && (
                <img src={parameter.logo} alt="Logo da Empresa" className="h-10 mr-4 object-contain" />
             )}
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Controle de Frota</h1>
          </div>
          
          <div className="flex items-center">
            <nav className="hidden md:flex space-x-2">
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
            {/* Theme Toggle */}
            <div ref={themeMenuRef} className="relative ml-4">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
                aria-label="Toggle theme"
              >
                {theme === 'light' && <SunIcon className="w-5 h-5" />}
                {theme === 'dark' && <MoonIcon className="w-5 h-5" />}
                {theme === 'system' && <DesktopIcon className="w-5 h-5" />}
              </button>
              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20">
                  <button onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <SunIcon className="w-4 h-4 mr-3" /> Light
                  </button>
                  <button onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <MoonIcon className="w-4 h-4 mr-3" /> Dark
                  </button>
                  <button onClick={() => { setTheme('system'); setIsThemeMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <DesktopIcon className="w-4 h-4 mr-3" /> System
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 fixed bottom-0 left-0 right-0 z-10">
        <div className="grid grid-cols-4">
          {navItems.slice(0, 4).map((item) => {
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
        <div className="grid grid-cols-4">
          {navItems.slice(4).map((item) => {
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