'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { getAlbums, getMediaUrl } from '../services/strapi';
import { AlbumData, translations } from '../types';
import { useLanguage } from '../components/LanguageContext';
import { useTheme } from '../components/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, MapPin, Grid, Calendar } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   TYPES LOCAUX
──────────────────────────────────────────────────────────────────────── */
interface AlbumSection {
  id: string;
  title: string;
  year: string;  // Changed from 'date' to 'year'
  photos: { url: string; name?: string }[];
}

/* ─────────────────────────────────────────────────────────────────────────
   FULLSCREEN VIEWER COMPONENT
──────────────────────────────────────────────────────────────────────── */
function PhotoViewer({
  photos,
  startIndex,
  albumTitle,
  albumYear,  // Changed from 'albumDate' to 'albumYear'
  onClose,
}: {
  photos: { url: string; name?: string }[];
  startIndex: number;
  albumTitle: string;
  albumYear: string;  // Changed from 'albumDate' to 'albumYear'
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [photos.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/97 flex flex-col"
    >
      {/* ══════════════════════════════════════════════════════════════
          TOP BAR - Info album et bouton fermer
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-emerald-400" />
          <span className="text-white/50 text-sm font-bold uppercase tracking-widest">
            {albumTitle}
          </span>
          <span className="text-white/30 text-xs">•</span>
          <Calendar size={14} className="text-white/30" />
          <span className="text-white/30 text-xs">{albumYear}</span>  {/* Changed from 'albumDate' to 'albumYear' */}
        </div>
        <div className="flex items-center gap-6">
          <span className="text-white/30 text-sm tabular-nums">
            {idx + 1} <span className="text-white/15">/</span> {photos.length}
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
          >
            <X size={16} /> Fermer
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ZONE IMAGE PRINCIPALE
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 relative flex items-center justify-center px-20 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="relative w-full h-full"
          >
            <Image
              src={getMediaUrl(photos[idx])}
              alt={photos[idx].name || `photo-${idx}`}
              fill
              className="object-contain"
              referrerPolicy="no-referrer"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Flèches de navigation gauche/droite */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BANDE DE MINIATURES (THUMBNAILS)
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-8 pb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 w-max mx-auto">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                i === idx ? 'ring-2 ring-emerald-400 opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <Image
                src={getMediaUrl(p)}
                alt=""
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE PRINCIPALE ALBUMS
──────────────────────────────────────────────────────────────────────── */
export default function Albums() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = translations[language];
  const isDark = theme === 'dark';

  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<{
    photos: { url: string; name?: string }[];
    startIndex: number;
    title: string;
    year: string;  // Changed from 'date' to 'year'
  } | null>(null);

  /* ─────────────────────────────────────────────────────────────────
     ÉTATS POUR LA TIMELINE
     ───────────────────────────────────────────────────────────────── */
  const [activeYear, setActiveYear] = useState<string>('');  // Changed from 'activeDate' to 'activeYear'
  const albumRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [pinTop, setPinTop] = useState(0);
  const [pinProgress, setPinProgress] = useState(0); // 0 → 1

  /* ─────────────────────────────────────────────────────────────────
     CHARGER LES DONNÉES
     ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAlbums();
        setAlbums(data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ─────────────────────────────────────────────────────────────────
     PRÉPARER LES SECTIONS D'ALBUMS
     Triées par year (plus récent en haut)
     ───────────────────────────────────────────────────────────────── */
  const albumSections: AlbumSection[] = React.useMemo(() => {
    return albums
      .map((album) => ({
        id: String(album.id) || String(Math.random()),
        title: album.title || 'Sans titre',
        year: String(album.year) || 'Year inconnue',  // Changed from 'date' to 'year'
        photos: album.photos || [],
      }))
      .sort((a, b) => {
        // Tri décroissant par year (plus récent en haut)
        const yearA = new Date(a.year).getTime();  // Changed from 'date' to 'year'
        const yearB = new Date(b.year).getTime();  // Changed from 'date' to 'year'
        return yearB - yearA;
      });
  }, [albums]);

  /* ─────────────────────────────────────────────────────────────────
     INITIALISER LA YEAR ACTIVE
     ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (albumSections.length > 0 && !activeYear) {  // Changed from 'activeDate' to 'activeYear'
      setActiveYear(albumSections[0].year);  // Changed from 'date' to 'year'
    }
  }, [albumSections, activeYear]);  // Changed from 'activeDate' to 'activeYear'

  /* ─────────────────────────────────────────────────────────────────
     OBSERVER LE SCROLL POUR LE PIN GPS
     ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const onScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      const containerHeight = container.scrollHeight;
      const scrolled = window.scrollY - container.offsetTop + window.innerHeight / 2;
      const progress = Math.min(Math.max(scrolled / containerHeight, 0), 1);
      setPinProgress(progress);

      // Trouver l'album actuellement visible
      let foundYear = albumSections[0]?.year ?? '';  // Changed from 'date' to 'year'
      for (const album of albumSections) {
        const el = albumRefs.current[album.id];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.45) foundYear = album.year;  // Changed from 'date' to 'year'
      }
      setActiveYear(foundYear);  // Changed from 'setActiveDate' to 'setActiveYear'

      // Position du pin dans la timeline (relative au container)
      const foundAlbum = albumSections.find((a) => a.year === foundYear);  // Changed from 'date' to 'year'
      if (foundAlbum) {
        const el = albumRefs.current[foundAlbum.id];
        if (el && container) {
          const elTop = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
          setPinTop(Math.max(0, elTop));
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [albumSections]);

  /* ─────────────────────────────────────────────────────────────────
     COULEUR DU TRAIT SELON PROGRESSION
     ───────────────────────────────────────────────────────────────── */
  const trailColor = `hsl(${158 - pinProgress * 60}, ${70 - pinProgress * 30}%, ${45 + pinProgress * 10}%)`;

  /* ─────────────────────────────────────────────────────────────────
     OUVRIR LE VIEWER EN PLEIN ÉCRAN
     ───────────────────────────────────────────────────────────────── */
  const openViewer = (
    photos: { url: string; name?: string }[],
    startIndex: number,
    title: string,
    year: string  // Changed from 'date' to 'year'
  ) => {
    setViewer({ photos, startIndex, title, year });  // Changed from 'date' to 'year'
  };

  /* ─────────────────────────────────────────────────────────────────
     FORMATER LA YEAR POUR L'AFFICHAGE
     ───────────────────────────────────────────────────────────────── */
  const formatYear = (yearString: string) => {  // Changed from 'formatDate' to 'formatYear'
    try {
      const year = new Date(yearString);  // Changed from 'date' to 'year'
      return year.toLocaleDateString('fr-FR', {  // Adjusted for year display
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return yearString;
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     FORMATER LA YEAR COURTE POUR LE PIN GPS
     ───────────────────────────────────────────────────────────────── */
  const formatShortYear = (yearString: string) => {  // Changed from 'formatShortDate' to 'formatShortYear'
    try {
      const year = new Date(yearString);  // Changed from 'date' to 'year'
      return year.toLocaleDateString('fr-FR', {  // Adjusted for short year display
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return yearString;
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0A0A0A] text-[#F5F5F5]" : "bg-[#FEFEFE] text-[#1A1A1A]"}`}>
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════
          HEADER - Titre de la page
          ══════════════════════════════════════════════════════════════ */}
      <section className="pt-32 pb-12 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">{t.albums.title}</h1>
          <p className="text-xl text-zinc-500">
            {albumSections.length} album{albumSections.length > 1 ? 's' : ''} • Triés du plus récent au plus ancien
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTAINER - Timeline + Grilles d'albums
          ══════════════════════════════════════════════════════════════ */}
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 pb-32 flex gap-0 relative">
        
        {/* ══════════════════════════════════════════════════════════
            TIMELINE GAUCHE
            ══════════════════════════════════════════════════════════ */}
        <div className="w-20 flex-shrink-0 relative hidden md:block">
          {/* Trait vertical de fond */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] rounded-full ${
              isDark ? 'bg-zinc-800' : 'bg-stone-200'
            }`}
          />

          {/* Trait de progression coloré */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] rounded-full origin-top"
            style={{
              height: `${pinProgress * 100}%`,
              background: `linear-gradient(to bottom, #10b981, ${trailColor})`,
              boxShadow: `0 0 8px 1px ${trailColor}55`,
            }}
          />

          {/* PIN GPS FLOTTANT */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{ top: pinTop }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            animate={{ top: pinTop }}
          >
            <div className="flex flex-col items-center">
              {/* Bulle GPS */}
              <div
                className="relative flex flex-col items-center"
                style={{ filter: `drop-shadow(0 4px 12px ${trailColor}88)` }}
              >
                {/* Label year courte */}
                <div
                  className="px-2.5 py-1 rounded-xl text-white text-[11px] font-black tracking-widest mb-1 whitespace-nowrap"
                  style={{ background: trailColor }}
                >
                  {formatShortYear(activeYear)}  {/* Changed from 'formatShortDate(activeDate)' to 'formatShortYear(activeYear)' */}
                </div>
                {/* Pointe GPS */}
                <div
                  className="w-4 h-4 rounded-full ring-4 ring-white/20"
                  style={{ background: trailColor }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            GRILLES D'ALBUMS PAR SECTION
            ══════════════════════════════════════════════════════════ */}
        <div className="flex-1 space-y-20 pl-0 md:pl-6">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-2xl animate-pulse ${
                    isDark ? 'bg-zinc-800' : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
          ) : albumSections.length === 0 ? (
            // État vide
            <div className="text-center py-24">
              <ImageIcon className="mx-auto mb-4 opacity-20" size={64} />
              <p className={`text-lg ${isDark ? 'text-zinc-600' : 'text-stone-400'}`}>
                Aucun album disponible
              </p>
            </div>
          ) : (
            // Affichage des albums
            albumSections.map((album, albumIdx) => {
              const LIMIT = 9;
              const hasMore = album.photos.length > 10;
              const displayed = hasMore ? album.photos.slice(0, LIMIT) : album.photos;

              return (
                <div
                  key={album.id}
                  ref={(el) => {
                    albumRefs.current[album.id] = el;
                  }}
                >
                  {/* ════════════════════════════════════════════════
                      EN-TÊTE DE L'ALBUM (Titre + Year)
                      ════════════════════════════════════════════════ */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start md:items-center flex-col md:flex-row gap-3 mb-6"
                  >
                    {/* Dot sur la timeline */}
                    <div
                      className={`hidden md:block w-3 h-3 rounded-full ring-4 flex-shrink-0 -ml-[2.35rem] ${
                        isDark ? 'ring-[#18181b]' : 'ring-[#fafaf9]'
                      }`}
                      style={{
                        background: activeYear === album.year ? trailColor : isDark ? '#3f3f46' : '#d4d4c8',  // Changed from 'activeDate === album.date' to 'activeYear === album.year'
                      }}
                    />

                   
                    <div className="flex-1">
                      <h2
                        className={`text-3xl font-black tracking-tighter ${
                          isDark ? 'text-zinc-100' : 'text-stone-800'
                        }`}
                      >
                        {album.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={14} className={isDark ? 'text-zinc-600' : 'text-stone-400'} />
                        <span
                          className={`text-sm ${
                            isDark ? 'text-zinc-500' : 'text-stone-500'
                          }`}
                        >
                          {formatYear(album.year)}  
                        </span>
                        <span className={`text-xs ${isDark ? 'text-zinc-700' : 'text-stone-300'}`}>
                          •
                        </span>
                        <span
                          className={`text-xs font-bold uppercase tracking-widest ${
                            isDark ? 'text-zinc-600' : 'text-stone-400'
                          }`}
                        >
                          {album.photos.length} photo{album.photos.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Ligne de séparation */}
                    <div className={`h-px flex-1 hidden lg:block ${isDark ? 'bg-zinc-800' : 'bg-stone-200'}`} />
                  </motion.div>

                  {/* ════════════════════════════════════════════════
                      GRILLE DE PHOTOS
                      ════════════════════════════════════════════════ */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {displayed.map((photo, pIdx) => (
                      <motion.div
                        key={pIdx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: pIdx * 0.04 }}
                        onClick={() => openViewer(album.photos, pIdx, album.title, album.year)}  
                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5"
                      >
                        {getMediaUrl(photo) ? (
                          <Image
                            src={getMediaUrl(photo)}
                            alt={photo.name || `${album.title}-${pIdx}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              isDark ? 'bg-zinc-800' : 'bg-stone-200'
                            }`}
                          >
                            <ImageIcon className="opacity-30" size={32} />
                          </div>
                        )}
                        {/* Overlay au hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                      </motion.div>
                    ))}

                    {/* ════════════════════════════════════════════════
                        CARTE "VOIR TOUTES LES PHOTOS"
                        (si plus de 10 photos dans l'album)
                        ════════════════════════════════════════════════ */}
                    {hasMore && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: LIMIT * 0.04 }}
                        onClick={() => openViewer(album.photos, 0, album.title, album.year)} 
                        className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-all duration-300 hover:-translate-y-0.5 flex flex-col items-center justify-center gap-3 ${
                          isDark
                            ? 'border-zinc-700 hover:border-emerald-600 bg-zinc-900/60 hover:bg-zinc-900'
                            : 'border-stone-300 hover:border-emerald-500 bg-stone-100 hover:bg-white'
                        }`}
                      >
                        {/* Mini preview des 4 photos suivantes */}
                        <div className="grid grid-cols-2 gap-1 w-14 h-14 rounded-xl overflow-hidden opacity-50 group-hover:opacity-80 transition-opacity">
                          {album.photos.slice(LIMIT, LIMIT + 4).map((p, i) => (
                            <div key={i} className="relative w-full h-full">
                              {getMediaUrl(p) && (
                                <Image
                                  src={getMediaUrl(p)}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Texte de la carte */}
                        <div className="text-center px-2">
                          <p
                            className={`text-sm font-black ${
                              isDark
                                ? 'text-zinc-300 group-hover:text-emerald-400'
                                : 'text-stone-600 group-hover:text-emerald-600'
                            } transition-colors`}
                          >
                            +{album.photos.length - LIMIT} photos
                          </p>
                          <p
                            className={`text-[10px] uppercase tracking-widest mt-0.5 ${
                              isDark ? 'text-zinc-600' : 'text-stone-400'
                            }`}
                          >
                            Voir tout
                          </p>
                        </div>

                        {/* Icône grille */}
                        <Grid
                          size={16}
                          className={`${
                            isDark
                              ? 'text-zinc-600 group-hover:text-emerald-500'
                              : 'text-stone-400 group-hover:text-emerald-500'
                          } transition-colors`}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FULLSCREEN VIEWER (Modal)
          ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewer && (
          <PhotoViewer
            photos={viewer.photos}
            startIndex={viewer.startIndex}
            albumTitle={viewer.title}
            albumYear={formatYear(viewer.year)}  
            onClose={() => setViewer(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}