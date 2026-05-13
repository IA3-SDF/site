// Header.tsx
'use client';

import React from 'react';
import { NavItem, TableName } from '../types';

interface HeaderProps {
  activeTable: TableName;
  navigation: NavItem[];
  dataCount: number;
}

/**
 * En-tête du tableau de bord
 */
export default function Header({ activeTable, navigation, dataCount }: HeaderProps) {
  const activeNav = navigation.find(n => n.id === activeTable);
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm shrink-0">
      <h1 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
        {activeNav?.label || activeTable}
        <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full font-medium">
          {dataCount}
        </span>
      </h1>
    </header>
  );
}