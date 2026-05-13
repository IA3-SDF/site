// page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Calendar, ImageIcon, FileText, Users, UserCircle } from 'lucide-react';

// Imports des composants admin modulaires
import AdminGuard from '@/src/admin/components/AdminGuard';
import Sidebar from '@/src/admin/components/Sidebar';
import Header from '@/src/admin/components/Header';
import MainContent from '@/src/admin/components/MainContent';
import FormModal from '@/src/admin/components/modals/FormModal';

// Imports des hooks et services
import { useAdminData } from '@/src/admin/hooks/useAdminData';
import { logoutUser } from '@/src/admin/config/database';
import { NavItem, TableName, DatabaseItem } from '@/src/admin/types';

const NAVIGATION: NavItem[] = [
  { id: 'events', label: 'Événements', icon: Calendar },
  { id: 'albums', label: 'Albums Photos', icon: ImageIcon },
  { id: 'reports', label: 'Rapports', icon: FileText },
  { id: 'bureau', label: 'Membres du Bureau', icon: Users },
  { id: 'profiles', label: 'Profils Utilisateurs', icon: UserCircle },
];

/**
 * Page Admin - Tableau de bord pour gérer le contenu Supabase
 */
export default function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTable, setActiveTable] = useState<TableName>('events');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DatabaseItem | null>(null);

  // Hook pour gérer les données
  const { data, isLoading, error, onSave, onDelete } = useAdminData(activeTable);

  // Handlers mémoïsés pour éviter les re-renders inutiles
  const handleEdit = useCallback((item: DatabaseItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedItem(null);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      await onDelete(id);
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  }, [onDelete]);

  const handleSaveModal = useCallback(async (savedData: DatabaseItem) => {
    try {
      await onSave(savedData);
    } catch (error: any) {
      console.error('Save error:', error);
      throw error; // Remonter pour que FormModal puisse afficher l'erreur
    }
  }, [onSave]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Délai pour laisser l'animation se terminer avant de reset
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
      window.location.href = '/auth/login';
    } catch (error: any) {
      console.error('Logout error:', error);
      alert(`Erreur lors de la déconnexion: ${error.message}`);
    }
  }, []);

  const handleTableChange = useCallback((tableId: string) => {
    setActiveTable(tableId as TableName);
    // Fermer le modal si ouvert lors du changement de table
    if (isModalOpen) {
      handleCloseModal();
    }
  }, [isModalOpen, handleCloseModal]);

  return (
    <AdminGuard>
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(prev => !prev)}
          activeTable={activeTable}
          onTableChange={handleTableChange}
          navigation={NAVIGATION}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          
          {/* Header */}
          <Header
            activeTable={activeTable}
            navigation={NAVIGATION}
            dataCount={data.length}
          />

          {/* Content Area */}
          <MainContent
            activeTable={activeTable}
            isLoading={isLoading}
            error={error}
            data={data}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </main>

        {/* Form Modal */}
        {isModalOpen && (
          <FormModal 
            table={activeTable}
            item={selectedItem}
            onClose={handleCloseModal}
            onSave={handleSaveModal}
          />
        )}
      </div>
    </AdminGuard>
  );
}