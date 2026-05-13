'use client';

import React, { useState } from 'react';
import { Trash2, UploadCloud } from 'lucide-react';
import { uploadFile } from '../../config/database';

interface SingleImageUploadProps {
  url?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  label: string;
}

/**
 * Composant d'upload de photo unique
 */
export default function SingleImageUpload({ url, onUpload, onRemove, label }: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const uploadedUrl = await uploadFile(file);
        onUpload(uploadedUrl);
      } catch (error) {
        console.error("Erreur d'upload", error);
        alert("Erreur lors de l'envoi de l'image.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="mb-4">
      <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>
      {url ? (
        <div className="relative group w-40 h-40 rounded-xl overflow-hidden shadow-md border border-gray-200">
          <img src={url} alt="Aperçu" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              type="button"
              onClick={onRemove}
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
              title="Supprimer la photo"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-colors ${isUploading ? 'bg-gray-100' : 'hover:bg-gray-50 hover:border-blue-400'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
            {isUploading ? (
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            ) : (
              <>
                <UploadCloud size={28} className="mb-2" />
                <span className="text-xs font-medium text-center px-2">Ajouter photo</span>
              </>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
        </label>
      )}
    </div>
  );
}
