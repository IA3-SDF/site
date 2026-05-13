// FormModal.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { X, Save, UploadCloud, AlertCircle } from 'lucide-react';
import RichEditor from '../RichEditor';
import SingleImageUpload from '../uploads/SingleImageUpload';
import MultipleImageUpload from '../uploads/MultipleImageUpload';
import { TABLE_SCHEMAS } from '../../schemas';
import { uploadFile } from '../../config/database';
import { TableName, DatabaseItem, FieldSchema } from '../../types';

// Fonction utilitaire pour comparer les objets (ordre des clés ignoré)
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  return JSON.stringify(obj1, Object.keys(obj1).sort()) === JSON.stringify(obj2, Object.keys(obj2).sort());
};

interface FormModalProps {
  table: TableName;
  item: DatabaseItem | null;
  onClose: () => void;
  onSave: (data: DatabaseItem) => Promise<void>;
}

/**
 * Modal dynamique contenant le formulaire d'édition/création
 */
export default function FormModal({ table, item, onClose, onSave }: FormModalProps) {
  // Préserver l'ID original si c'est une édition
  const initialData = useMemo(() => {
    if (!item) return {} as DatabaseItem;
    // Garder l'id mais permettre modification des autres champs
    return { ...item };
  }, [item]);

  const [formData, setFormData] = useState<DatabaseItem>(initialData || ({} as DatabaseItem));
  const [originalData] = useState<DatabaseItem>(initialData || ({} as DatabaseItem));
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isDirty = !deepEqual(formData, originalData);
  const schema = TABLE_SCHEMAS[table] || [];
  const isProfileTable = table === 'profiles';
  const isEditing = !!item?.id;

  // Valider le formulaire
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    schema.forEach((field: FieldSchema) => {
      const value = formData[field.key];
      
      // Validation des champs requis (sauf si édition de profil avec email)
      if (field.type !== 'select' && field.type !== 'multiple_images') {
        if (value === undefined || value === null || value === '') {
          // Email est géré par Supabase Auth, pas obligatoire en édition
          if (isProfileTable && field.key === 'email' && isEditing) return;
          
          // order est optionnel pour bureau
          if (table === 'bureau' && field.key === 'order') return;
          
          // event_id est optionnel pour albums
          if (table === 'albums' && field.key === 'event_id') return;
          
          errors[field.key] = `Le champ "${field.label}" est requis`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, schema, isProfileTable, isEditing, table]);

  const handleChange = useCallback((key: string, value: any) => {
    setFormData((prev: DatabaseItem) => ({ ...prev, [key]: value }));
    // Effacer l'erreur de validation si elle existe
    if (validationErrors[key]) {
      setValidationErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      const url = await uploadFile(file);
      handleChange(key, url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || "Erreur d'upload du document");
    }
  }, [handleChange]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!isDirty && isEditing) {
      onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // S'assurer que l'ID est présent pour les updates
      const payload: DatabaseItem = { ...formData };
      if (isEditing && item?.id) {
        payload.id = item.id;
      }

      await onSave(payload);
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      setUploadError(error?.message || 'Erreur lors de la sauvegarde dans la base de données');
    } finally {
      setIsSaving(false);
    }
  }, [formData, isDirty, isEditing, item?.id, onClose, onSave, validateForm]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?');
      if (!confirmed) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Vérifier si le formulaire peut être soumis
  const canSubmit = !isSaving && (isDirty || !isEditing);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Modifier' : 'Ajouter'} {table}
            </h2>
            {isEditing && (
              <p className="text-sm text-gray-500 mt-1">ID: {item?.id}</p>
            )}
          </div>
          <button 
            onClick={handleCancel} 
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-white">
          {/* Message d'erreur global */}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{uploadError}</span>
            </div>
          )}

          <div className="space-y-6">
            {schema.map((field: FieldSchema) => {
              const { key, label, type, options } = field;
              const error = validationErrors[key];
              
              const labelClass = "block text-sm font-medium text-gray-700 mb-1";
              const errorClass = "mt-1 text-sm text-red-600";
              const inputClass = `w-full border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} p-3 rounded-lg transition-shadow disabled:bg-gray-100`;
              
              switch (type) {
                case 'text':
                case 'email':
                case 'number':
                case 'date':
                case 'datetime-local':
                  return (
                    <div key={key}>
                      <label className={labelClass}>
                        {label}
                        {!isProfileTable && key !== 'order' && key !== 'event_id' && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type={type}
                        disabled={isProfileTable && key === 'email' && isEditing}
                        value={formData[key] || ''}
                        onChange={(e) => handleChange(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                        className={inputClass}
                        placeholder={`Saisir ${label.toLowerCase()}...`}
                      />
                      {error && <p className={errorClass}>{error}</p>}
                    </div>
                  );
                case 'file_url':
                  return (
                    <div key={key}>
                      <label className={labelClass}>
                        {label}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={formData[key] || ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className={`${inputClass} flex-1`}
                          placeholder="URL du document ou uploader..."
                        />
                        <label className="bg-gray-100 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors shrink-0">
                          <UploadCloud size={20} className="text-gray-600" />
                          <input 
                            type="file" 
                            accept="application/pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, key)} 
                          />
                        </label>
                      </div>
                      {error && <p className={errorClass}>{error}</p>}
                      {formData[key] && (
                        <a 
                          href={formData[key]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          Voir le document actuel →
                        </a>
                      )}
                    </div>
                  );
                case 'select':
                  return (
                    <div key={key}>
                      <label className={labelClass}>
                        {label}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={formData[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Sélectionner...</option>
                        {options?.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {error && <p className={errorClass}>{error}</p>}
                    </div>
                  );
                case 'textarea':
                  return (
                    <div key={key}>
                      <label className={labelClass}>
                        {label}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={formData[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className={inputClass}
                        placeholder={`Saisir ${label.toLowerCase()}...`}
                      />
                      {error && <p className={errorClass}>{error}</p>}
                    </div>
                  );
                case 'rich_text':
                  return (
                    <div key={key} className="col-span-full">
                      <label className={labelClass}>
                        {label}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <RichEditor
                        content={formData[key] || ''}
                        setContent={(val) => handleChange(key, val)}
                      />
                      {error && <p className={errorClass}>{error}</p>}
                    </div>
                  );
                case 'single_image':
                  return (
                    <SingleImageUpload
                      key={key}
                      label={label}
                      url={formData[key]}
                      onUpload={(url) => handleChange(key, url)}
                      onRemove={() => handleChange(key, '')}
                    />
                  );
                case 'multiple_images':
                  return (
                    <MultipleImageUpload
                      key={key}
                      label={label}
                      urls={formData[key] || []}
                      onUpload={(newUrls) => handleChange(key, [...(formData[key] || []), ...newUrls])}
                      onRemove={(index) => {
                        const newArray = [...(formData[key] || [])];
                        newArray.splice(index, 1);
                        handleChange(key, newArray);
                      }}
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            type="button"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          
          <button
            onClick={(e) => {
              // Trigger form submit via le bouton
              const form = (e.target as HTMLElement).closest('div')?.previousElementSibling as HTMLFormElement;
              form?.requestSubmit();
            }}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{isEditing ? 'Mettre à jour' : 'Créer'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}