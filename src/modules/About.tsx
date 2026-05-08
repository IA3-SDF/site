'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { translations, AboutData } from '../types';
import { useLanguage } from '../components/LanguageContext';
import { useTheme } from '../components/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import { BookOpen, Target, Users, Award } from 'lucide-react';

export default function About() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = translations[language];

  const sections = [
    { icon: <BookOpen className="text-emerald-600" />, title: t.contact.historyTitle, content: "L&apos;AMESCAO est née d&apos;une volonté commune des jeunes du Canton d&apos;Aouda de se regrouper pour porter des projets d&apos;envergure. Depuis sa création, elle a su s&apos;imposer comme un acteur incontournable du développement local." },
    { icon: <Target className="text-emerald-600" />, title: t.contact.missionTitle, content: "Notre mission est d&apos;accompagner la jeunesse dans son parcours éducatif et professionnel, tout en préservant et valorisant notre riche patrimoine culturel." },
    { icon: <Users className="text-emerald-600" />, title: t.contact.partnersTitle, content: "Nous travaillons main dans la main avec les autorités locales, les institutions éducatives et les partenaires internationaux pour maximiser notre impact." },
    { icon: <Award className="text-emerald-600" />, title: t.contact.achievementsTitle, content: "Plusieurs bourses d&apos;études octroyées, des bibliothèques équipées et des festivals culturels organisés avec succès." }
  ];

  return (
    <div className="min-h-screen bg-app text-body">
      <Navbar />
      
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter"
          >
            {t.home.presentationTitle}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl leading-relaxed text-zinc-500 dark:text-zinc-400"
          >
            <p>{t.home.presentationText}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-app">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h3 className="text-xl font-bold mb-4">{section.title}</h3>
              <p className="text-muted text-sm leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

