'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '../types'
import { getCurrentUserProfile, updateUserProfile, getMediaUrl } from '../services/supabase'
import { supabase } from '../services/supabase/client'
import { X, Edit2, Save, LogOut, AlertTriangle, CheckCircle, Camera, Trash2, UploadCloud } from 'lucide-react'
import { uploadFile } from '../admin/config/database'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    if (isOpen && !profile) {
      fetchProfile()
    }
  }, [isOpen])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const userProfile = await getCurrentUserProfile()
      setProfile(userProfile)
      if (userProfile) {
        setEditedProfile(userProfile)
      }
    } catch (error) {
      showNotification('error', 'Impossible de charger le profil')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setProfile(null)
      onClose()
      window.location.href = '/auth/login'
    } else {
      showNotification('error', 'Erreur lors de la déconnexion')
    }
    setShowLogoutConfirm(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setNotification(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profile) {
      setEditedProfile(profile)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const success = await updateUserProfile(editedProfile)
    if (success) {
      const updatedProfile = await getCurrentUserProfile()
      setProfile(updatedProfile)
      setIsEditing(false)
      showNotification('success', 'Profil mis à jour avec succès')
    } else {
      showNotification('error', 'Erreur lors de la mise à jour')
    }
    setIsSaving(false)
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploadingPhoto(true)
        const uploadedUrl = await uploadFile(file)
        setEditedProfile(prev => ({ ...prev, photo: uploadedUrl }))
        showNotification('success', 'Photo téléchargée avec succès')
      } catch (error) {
        console.error("Erreur d'upload", error)
        showNotification('error', "Erreur lors du téléchargement de la photo")
      } finally {
        setIsUploadingPhoto(false)
      }
    }
  }

  const handleRemovePhoto = () => {
    setEditedProfile(prev => ({ ...prev, photo: undefined }))
  }

  // Variantes d'animation pour le drawer latéral droit
  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop assombri */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Sidebar droit */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto"
          >
            <div className="p-6 flex flex-col min-h-full">
              {/* En-tête avec bouton fermer */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted"
                  aria-label="Fermer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Notification toast */}
              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${
                      notification.type === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
                    }`}
                  >
                    {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    {notification.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="flex-1 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/30 border-t-primary" />
                </div>
              ) : profile ? (
                <>
                  {/* Photo de profil - Mode affichage ou édition */}
                  <div className="flex justify-center mt-4 mb-6">
                    <div className="relative group">
                      {editedProfile.photo || profile.photo ? (
                        <img
                          src={getMediaUrl(editedProfile.photo || profile.photo || '')}
                          alt={`${profile.name} ${profile.surname}`}
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-xl"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-5xl font-black shadow-xl">
                          {profile.name?.charAt(0)}{profile.surname?.charAt(0)}
                        </div>
                      )}
                      
                      {/* Overlay et bouton d'édition - visible en mode édition */}
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <label className="cursor-pointer p-3 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors transform hover:scale-110">
                            <Camera size={20} />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handlePhotoUpload}
                              disabled={isUploadingPhoto}
                            />
                          </label>
                        </div>
                      )}

                      {/* Indicateur de chargement */}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    // Mode édition
                    <div className="space-y-5 mt-4">
                      {/* Section Photo */}
                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-muted mb-3">Photo de profil</label>
                        <div className="flex items-center gap-3">
                          {editedProfile.photo || profile.photo ? (
                            <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-primary shadow-md">
                              <img 
                                src={getMediaUrl(editedProfile.photo || profile.photo || '')} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={handleRemovePhoto}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                  title="Supprimer la photo"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-secondary/50 border-2 border-dashed border-subtle flex items-center justify-center text-muted">
                              <span className="text-xs font-black">Aucune</span>
                            </div>
                          )}
                          <label className={`flex-1 flex flex-col items-center justify-center py-3 px-4 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer transition-all ${
                            isUploadingPhoto ? 'bg-primary/10' : 'hover:bg-primary/5 hover:border-primary'
                          }`}>
                            <div className="flex flex-col items-center gap-1">
                              {isUploadingPhoto ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                  <span className="text-xs font-medium text-muted">Envoi...</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud size={20} className="text-primary" />
                                  <span className="text-xs font-medium text-primary">Changer photo</span>
                                </>
                              )}
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handlePhotoUpload}
                              disabled={isUploadingPhoto}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-muted mb-2">Nom</label>
                        <input
                          type="text"
                          value={editedProfile.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-muted mb-2">Prénom</label>
                        <input
                          type="text"
                          value={editedProfile.surname || ''}
                          onChange={(e) => handleInputChange('surname', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-muted mb-2">Email</label>
                        <input
                          type="email"
                          value={editedProfile.email || ''}
                          disabled
                          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-subtle text-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted/70 mt-1">L&apos;adresse email ne peut pas être modifiée</p>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage - infos principales
                    <div className="text-center space-y-3 mt-2">
                      <div>
                        <h3 className="text-xl font-bold text-heading">
                          {profile.name} {profile.surname}
                        </h3>
                        <p className="text-muted text-sm break-all">{profile.email}</p>
                      </div>

                      {/* Rôle optionnel */}
                      {profile.role && profile.role !== 'member' && (
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wide">
                          {profile.role === 'admin' ? 'Administrateur' : profile.role === 'moderator' ? 'Modérateur' : profile.role}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions - espacement automatique pour pousser les boutons en bas */}
                  <div className="mt-auto pt-8 space-y-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-wide hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Enregistrer
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="w-full py-3 rounded-xl border border-subtle text-body font-black uppercase tracking-wide hover:bg-secondary transition-all"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Bouton modification (icône + texte) */}
                        <button
                          onClick={handleEdit}
                          className="w-full py-3 rounded-xl border border-subtle text-body font-black uppercase tracking-wide hover:bg-secondary transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 size={18} />
                          Modifier mon profil
                        </button>

                        {/* Bouton déconnexion rouge */}
                        <button
                          onClick={handleLogoutClick}
                          className="w-full py-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 font-black uppercase tracking-wide hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 border border-red-500/20"
                        >
                          <LogOut size={18} />
                          Déconnexion
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <p className="text-muted mb-4">Impossible de charger le profil</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-wide"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Popup de confirmation de déconnexion */}
          <AnimatePresence>
            {showLogoutConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
                onClick={() => setShowLogoutConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm mx-4 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
                    <AlertTriangle size={28} />
                    <h3 className="text-xl font-black">Déconnexion</h3>
                  </div>
                  <p className="text-body mb-6">
                    Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 py-2 rounded-xl border border-subtle text-body font-medium hover:bg-secondary transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={confirmLogout}
                      className="flex-1 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}