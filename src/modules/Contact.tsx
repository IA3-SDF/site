'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { translations, Language } from '../types';
import { useLanguage } from '../components/LanguageContext';
import { useTheme } from '../components/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Merci pour votre message ! Nous vous contacterons bientôt.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0A0A0A] text-[#F5F5F5]' : 'bg-[#FEFEFE] text-[#1A1A1A]'}`}>
      <Navbar />
      
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">{t.contact.title}</h1>
            <p className="text-xl text-zinc-500">Nous sommes à votre écoute pour toute question ou suggestion.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Email</h3>
                    <p className="text-zinc-500">amescao2026@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Téléphone</h3>
                    <p className="text-zinc-500">+228 90 00 00 00</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Siège Social</h3>
                    <p className="text-zinc-500">Canton d&apos;Aouda, Togo</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-emerald-600 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Horaires d&apos;ouverture</h3>
                <p className="opacity-90 mb-2">Lundi - Vendredi : 08h00 - 17h00</p>
                <p className="opacity-90">Samedi : 09h00 - 12h00</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl shadow-black/5"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest mb-2 opacity-60">{t.contact.formName}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-[#F9FAFB] dark:bg-[#1A1A1A] border-none rounded-2xl focus:ring-2 focus:ring-[#059669] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest mb-2 opacity-60">{t.contact.formEmail}</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 bg-[#F9FAFB] dark:bg-[#1A1A1A] border-none rounded-2xl focus:ring-2 focus:ring-[#059669] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest mb-2 opacity-60">{t.contact.formMessage}</label>
                  <textarea 
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-6 py-4 bg-[#F9FAFB] dark:bg-[#1A1A1A] border-none rounded-2xl focus:ring-2 focus:ring-[#059669] transition-all resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  {t.contact.formSubmit} <Send size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
