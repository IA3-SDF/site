'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Calendar, MapPin, Share2 } from 'lucide-react';
import { EventData } from '../types';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { getMediaUrl, renderBlocksToText } from '../services/strapi';

interface EventModalProps {
  event: EventData | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /* Bloquer le scroll du body */
  useEffect(() => {
    if (event) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [event]);

  /* Fermer avec Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {event && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#1A1A1A]' : 'bg-[#FFFFFF]'
            }`}
          >

            {/* ── IMAGE EN HAUT ── */}
            <div className="relative w-full h-56 sm:h-72 overflow-hidden">
              {getMediaUrl(event.main_photo) ? (
                <Image
                  src={getMediaUrl(event.main_photo)}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-stone-100'}`}>
                  <Calendar size={48} className="opacity-20" />
                </div>
              )}
              {/* Fondu bas sur l'image */}
              <div className={`absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t ${isDark ? 'from-zinc-900' : 'from-white'} to-transparent`} />
            </div>

            {/* Bouton fermer — toujours visible */}
            <button
              onClick={onClose}
              aria-label="Fermer"
              className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
                isDark
                  ? 'bg-[#2A2A2A] text-[#9CA3AF] hover:bg-[#374151]'
                  : 'bg-[#FFFFFF] text-[#6B7280] hover:bg-[#F9FAFB]'
              }`}
            >
              <X size={18} />
            </button>

            {/* ── CONTENU ── */}
            <div className="px-6 sm:px-10 pb-8 -mt-6 relative z-10">

              {/* Meta : date + lieu */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                  <Calendar size={13} className="text-emerald-500" />
                  {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {event.location && (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                    <MapPin size={13} className="text-emerald-500" />
                    {event.location}
                  </span>
                )}
              </div>

              {/* Titre */}
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-5 ${isDark ? 'text-[#F5F5F5]' : 'text-[#1A1A1A]'}`}>
                {event.title}
              </h2>

              {/* Séparateur */}
              <div className="w-10 h-[3px] bg-emerald-500 rounded-full mb-5" />

              {/* Contenu texte — hauteur naturelle, pas de scroll interne */}
              <p className={`text-base leading-relaxed text-justify ${isDark ? 'text-[#D1D5DB]' : 'text-[#374151]'}`}>
                {renderBlocksToText(event.content)}
              </p>

              {/* Footer */}
              <div className={`mt-8 pt-6 border-t flex items-center justify-between gap-4 ${isDark ? 'border-[#2A2A2A]' : 'border-[#E5E7EB]'}`}>
                <button
                  className={`p-3 rounded-2xl transition-all hover:scale-105 ${isDark ? 'bg-[#2A2A2A] text-[#D1D5DB] hover:bg-[#374151]' : 'bg-[#F9FAFB] text-[#374151] hover:bg-[#E5E7EB]'}`}
                  aria-label="Partager"
                >
                  <Share2 size={18} />
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5"
                >
                  {t.events.close}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EventModal;