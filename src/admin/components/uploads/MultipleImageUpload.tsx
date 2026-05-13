'use client';

import React, { useState } from 'react';
import { Trash2, Plus, UploadCloud } from 'lucide-react';
import { uploadFile } from '../../config/database';

interface MultipleImageUploadProps {
  urls: string[];
  onUpload: (urls: string[]) => void;
  onRemove: (index: number) => void;
  label: string;
}

/**
 * Composant d'upload de plusieurs photos
 */
export default function MultipleImageUpload({ urls = [], onUpload, onRemove, label }: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      try {
        setIsUploading(true);
        const uploadPromises = files.map(file => uploadFile(file));
        const newUrls = await Promise.all(uploadPromises);
        onUpload(newUrls);
      } catch (error) {
        console.error("Erreur d'upload multiple", error);
        alert("Erreur lors de l'envoi d'une ou plusieurs images.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="mb-4">
      <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {urls.map((url, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <img src={url} alt={`Gallery img ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        <label className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-colors ${isUploading ? 'bg-gray-100' : 'hover:bg-gray-50 hover:border-blue-400'}`}>
          <div className="flex flex-col items-center justify-center text-gray-500">
            {isUploading ? (
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus size={32} />
                <span className="text-xs mt-1 font-medium">Ajouter</span>
              </>
            )}
          </div>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
        </label>
      </div>
    </div>
  );
}
