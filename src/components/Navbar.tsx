'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { Sun, Moon, Globe, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, UserProfile } from '../types';
import ProfileModal from './ProfileModal';
import { getCurrentUserProfile, getMediaUrl } from '../services/supabase';
import { supabase } from '../services/supabase/client';

const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Charger le profil utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        setProfile(userProfile);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const navItems = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.events, path: '/events' },
    { name: t.nav.albums, path: '/albums' },
    { name: t.nav.contact, path: '/contact' },
    { name: t.nav.support, path: '/support' },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
  ];

  // Ouvrir le profil et fermer le menu mobile
  const handleOpenProfile = () => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(true);
  };

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setShowLogoutConfirm(false);
      setIsMobileMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError('Erreur lors de la déconnexion. Veuillez réessayer.');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-subtle">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "anticipate" }}
                className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20"
              >
                A
              </motion.div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-main leading-none">AMESCAO</span>
                <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-primary">Aouda, Togo</span>
              </div>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-lg overflow-hidden group ${
                    pathname === item.path ? 'text-primary' : 'text-muted hover:text-body'
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {pathname === item.path && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-xl z-0"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side buttons (desktop + mobile) */}
            <div className="flex items-center space-x-1">
              {/* Language selector */}
              <div className="relative group">
                <button className="w-10 h-10 rounded-xl hover:bg-secondary transition-all flex items-center justify-center text-muted" aria-label="Sélectionner la langue" aria-haspopup="menu">
                  <Globe size={20} />
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-card rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-subtle p-2 z-50" role="menu">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-secondary transition-all ${
                        language === lang.code ? 'text-primary bg-primary/5' : 'text-muted'
                      }`}
                      role="menuitem"
                      aria-current={language === lang.code ? 'true' : 'false'}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl hover:bg-secondary transition-all flex items-center justify-center text-muted"
                aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* Desktop: Authenticated state */}
              {!loadingProfile && profile ? (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-accent overflow-hidden hover:border-primary transition-all"
                  title={`${profile.name} ${profile.surname}`}
                  aria-label={`Profil de ${profile.name} ${profile.surname}`}
                >
                  {profile.photo ? (
                    <img
                      src={getMediaUrl(profile.photo)}
                      alt={`${profile.name} ${profile.surname}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-xs font-bold">
                      {profile.name?.charAt(0)}{profile.surname?.charAt(0)}
                    </div>
                  )}
                </button>
              ) : (
                /* Desktop: Unauthenticated state */
                !loadingProfile && (
                  <div className="hidden md:flex items-center gap-1.5">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-xs font-bold text-primary border border-primary rounded-lg hover:bg-primary/20 transition-all"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-xs font-bold rounded-lg border transition-all"
                      style={{
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        borderColor: '#059669',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#047857';
                        (e.currentTarget as HTMLElement).style.borderColor = '#047857';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#059669';
                        (e.currentTarget as HTMLElement).style.borderColor = '#059669';
                      }}
                    >
                      S&apos;inscrire
                    </Link>
                  </div>
                )
              )}

              {/* Mobile: menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-xl hover:bg-secondary transition-all flex items-center justify-center text-muted"
                aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden glass border-t border-subtle overflow-y-auto max-h-[calc(100vh-64px)]"
            >
              <div className="px-4 py-6 space-y-6">
                {/* Mobile: Authenticated state */}
                {!loadingProfile && profile ? (
                  <>
                    {/* User profile card */}
                    <div
                      className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20 cursor-pointer hover:border-primary/40 transition-all"
                      onClick={handleOpenProfile}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-primary overflow-hidden flex-shrink-0">
                          {profile.photo ? (
                            <img
                              src={getMediaUrl(profile.photo)}
                              alt={`${profile.name} ${profile.surname}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-sm font-bold">
                              {profile.name?.charAt(0)}{profile.surname?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-heading truncate">
                            {profile.name}
                          </p>
                          <p className="text-xs text-muted truncate">{profile.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Logout button */}
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full px-4 py-2.5 rounded-lg text-xs font-bold text-center bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-2 justify-center"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  /* Mobile: Unauthenticated state */
                  !loadingProfile && (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-lg text-xs font-bold text-center border border-primary text-primary hover:bg-primary/10 transition-all"
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-lg text-xs font-bold text-center border transition-all"
                        style={{
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          borderColor: '#059669',
                        }}
                        onTouchStart={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#047857';
                          (e.currentTarget as HTMLElement).style.borderColor = '#047857';
                        }}
                        onTouchEnd={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#059669';
                          (e.currentTarget as HTMLElement).style.borderColor = '#059669';
                        }}
                      >
                        S&apos;inscrire
                      </Link>
                    </div>
                  )
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-subtle to-transparent" />

                {/* Navigation section */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted px-3">Navigation</p>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={
                        pathname === item.path
                          ? {
                              backgroundColor: '#059669',
                              color: '#ffffff',
                              padding: '0.75rem 1rem',
                              borderRadius: '0.5rem',
                              display: 'block',
                              fontWeight: 'bold',
                              transition: 'all 0.2s',
                              textDecoration: 'none',
                            }
                          : {
                              color: 'inherit',
                              padding: '0.75rem 1rem',
                              borderRadius: '0.5rem',
                              display: 'block',
                              fontWeight: 'bold',
                              transition: 'all 0.2s',
                              textDecoration: 'none',
                            }
                      }
                      onMouseEnter={(e) => {
                        if (pathname !== item.path) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pathname !== item.path) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowLogoutConfirm(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-subtle rounded-2xl shadow-2xl p-6 max-w-sm"
            >
              <h3 id="logout-modal-title" className="text-lg font-black uppercase tracking-wider text-heading mb-2">
                Confirmer la déconnexion
              </h3>
              <p className="text-sm text-muted mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              {logoutError && (
                <p className="text-sm text-red-500 mb-4 bg-red-500/10 p-3 rounded-lg">
                  {logoutError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest border border-subtle text-muted hover:bg-secondary transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  Déconnexion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Navbar;