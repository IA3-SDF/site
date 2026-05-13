// CardItem.tsx
'use client';

import React, { useState } from 'react';
import { Trash2, FileText, Calendar, ImageIcon, User } from 'lucide-react';
import { DatabaseItem } from '../types';

interface CardItemProps {
  item: DatabaseItem;
  onEdit: (item: DatabaseItem) => void;
  onDelete: (id: string) => void;
}

/**
 * Carte d'affichage d'un élément (utilisée dans la grille)
 */
export default function CardItem({ item, onEdit, onDelete }: CardItemProps) {
  const [imageError, setImageError] = useState(false);

  // Extraire les infos principales avec fallback
  const title = item.title || item.name || item.event_title || 'Sans titre';
  const subtitle = item.role || item.date || item.event_date || item.email || '';
  
  // Déterminer l'image à afficher (priorité: cover_photo > photo > photos[0])
  const getPhotoUrl = (): string | null => {
    if (item.cover_photo && typeof item.cover_photo === 'string') return item.cover_photo;
    if (item.photo && typeof item.photo === 'string') return item.photo;
    if (Array.isArray(item.photos) && item.photos.length > 0 && typeof item.photos[0] === 'string') {
      return item.photos[0];
    }
    if (Array.isArray(item.other_photos) && item.other_photos.length > 0 && typeof item.other_photos[0] === 'string') {
      return item.other_photos[0];
    }
    return null;
  };

  const photo = getPhotoUrl();

  // Formater la date si c'est un timestamp ISO
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Retourner tel quel si invalide
      return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: dateStr.includes('T') ? '2-digit' : undefined,
        minute: dateStr.includes('T') ? '2-digit' : undefined
      });
    } catch {
      return dateStr;
    }
  };

  const displaySubtitle = subtitle && (subtitle.includes('T') || subtitle.match(/^\d{4}-\d{2}-\d{2}/))
    ? formatDate(subtitle) 
    : subtitle;

  // Déterminer l'icône de fallback selon le type de contenu
  const getFallbackIcon = () => {
    if (item.date || item.event_date) return <Calendar size={24} />;
    if (item.email) return <User size={24} />;
    if (item.photos || item.other_photos || item.cover_photo) return <ImageIcon size={24} />;
    return <FileText size={24} />;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      onDelete(item.id);
    }
  };

  return (
    <div 
      className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex justify-between items-center group cursor-pointer"
      onClick={() => onEdit(item)}
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        {/* Image ou icône */}
        {photo && !imageError ? (
          <img 
            src={photo} 
            alt={title} 
            className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            {getFallbackIcon()}
          </div>
        )}

        {/* Info texte */}
        <div className="truncate flex-1 min-w-0">
          <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate text-sm">
            {title}
          </p>
          {displaySubtitle && (
            <p className="text-sm text-gray-500 truncate">
              {displaySubtitle}
            </p>
          )}
          {item.surname && item.name !== item.surname && (
            <p className="text-xs text-gray-400 truncate">
              {item.surname} {item.name}
            </p>
          )}
        </div>
      </div>

      {/* Bouton supprimer */}
      <button
        onClick={handleDelete}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2 focus:opacity-100"
        title="Supprimer"
        type="button"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}