'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary border-t border-subtle pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="font-bold text-xl tracking-tight text-main">AMESCAO</span>
            </div>
            <p className="text-muted max-w-md mb-8">
              {t.home.heroSubtitle}
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="p-2 rounded-full bg-card shadow-sm hover:text-primary transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-card shadow-sm hover:text-primary transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-card shadow-sm hover:text-primary transition-colors">
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-main">{t.nav.contact}</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-muted">
                <Mail size={18} className="text-primary" />
                <span>amescao2026@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3 text-muted">
                <Phone size={18} className="text-primary" />
                <span>+228 92 85 92 00</span>
              </li>
              <li className="flex items-center space-x-3 text-muted">
                <MapPin size={18} className="text-primary" />
                <span>Aouda, Canton d&apos;Aouda, Togo</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-main">Liens Rapides</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted hover:text-primary transition-colors">{t.nav.home}</Link></li>
              <li><Link href="/events" className="text-muted hover:text-primary transition-colors">{t.nav.events}</Link></li>
              <li><Link href="/albums" className="text-muted hover:text-primary transition-colors">{t.nav.albums}</Link></li>
              <li><Link href="/support" className="text-muted hover:text-primary transition-colors">{t.nav.support}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-subtle text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} AMESCAO. Tous droits réservés. |Félix kpanoga| </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
