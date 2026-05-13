// Sidebar.tsx
'use client';

import React from 'react';
import { Menu, LogOut, ChevronRight } from 'lucide-react';
import { NavItem, TableName } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTable: TableName;
  onTableChange: (tableId: TableName) => void;
  navigation: NavItem[];
  onLogout: () => void;
}

/**
 * Barre latérale du tableau de bord admin
 */
export default function Sidebar({
  isOpen,
  onToggle,
  activeTable,
  onTableChange,
  navigation,
  onLogout
}: SidebarProps) {
  return (
    <aside 
      className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out relative z-20 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {isOpen && (
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent truncate">
            Admin Panel
          </span>
        )}
        <button 
          onClick={onToggle}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-auto"
          type="button"
          aria-label={isOpen ? 'Réduire le menu' : 'Étendre le menu'}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {navigation.map((nav) => {
          const Icon = nav.icon;
          const isActive = activeTable === nav.id;
          
          return (
            <button
              key={nav.id}
              onClick={() => onTableChange(nav.id)}
              title={!isOpen ? nav.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              type="button"
            >
              <Icon size={22} className={`shrink-0 ${isActive ? 'text-white' : ''}`} />
              
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'
              }`}>
                {nav.label}
              </span>
              
              {isOpen && isActive && (
                <ChevronRight size={16} className="ml-auto opacity-50" />
              )}
            </button>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          type="button"
        >
          <LogOut size={22} className="shrink-0 text-red-400" />
          {isOpen && <span className="font-medium text-red-400">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}