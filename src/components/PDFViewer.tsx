'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  url: string | null;
  title: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
  useEffect(() => {
    if (url) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [url]);

  return (
    <AnimatePresence>
      {url && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-5xl h-full rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 sm:px-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {title}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Rapport Officiel AMESCAO
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <a 
                  href={url} 
                  download 
                  className="hidden sm:flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                >
                  <Download size={18} /> Télécharger
                </a>
                <button 
                  onClick={onClose}
                  className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 overflow-hidden">
              <iframe 
                src={`${url}#toolbar=0`} 
                className="w-full h-full rounded-2xl border-none shadow-inner"
                title={title}
              />
            </div>

            {/* Footer Mobile */}
            <div className="sm:hidden p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <a 
                href={url} 
                download 
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20"
              >
                <Download size={20} /> Télécharger le PDF
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PDFViewer;
