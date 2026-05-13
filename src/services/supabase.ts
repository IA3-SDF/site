/**
 * Service Layer - Supabase
 * Fonctions métier pour accéder aux données Supabase
 */

import { 
  EventData, 
  AlbumData, 
  ReportData, 
  BoardMemberData, 
  UserProfile
} from '../types';
import { supabase } from './supabase/client';

/**
 * Construit l'URL publique d'un fichier Supabase Storage
 * Accepte les URLs complètes (déjà stockées) ou les chemins relatifs
 */
export const getMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  
  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (path.startsWith('http') || path.startsWith('//')) return path;
  
  // Sinon, construire l'URL Supabase Storage publique
  // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl) return path;
  
  return `${supabaseUrl}/storage/v1/object/public/amescao/${path}`;
};

/**
 * Utilitaire pour convertir les blocs de contenu texte (rich text) en texte simple
 * Compatible avec le format JSON de Supabase ou texte simple
 */
export const renderBlocksToText = (content: any): string => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((block: any) => {
        if (typeof block === 'string') return block;
        if (block.children) {
          return block.children.map((child: any) => child.text || '').join('');
        }
        return '';
      })
      .join('\n');
  }
  if (typeof content === 'object') {
    // Si c'est un objet JSON de rich text
    if (content.blocks) {
      return content.blocks.map((block: any) => block.text || '').join('\n');
    }
    return JSON.stringify(content);
  }
  return '';
};

/**
 * Récupère tous les événements triés par date décroissante
 */
export async function getEvents(): Promise<EventData[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title || '',
    date: item.date || '',
    location: item.location || '',
    description: item.content || '',
    content: item.content || '',
    cover_photo: item.cover_photo || undefined,
    other_photos: item.other_photos || [],
  })) as unknown as EventData[];
}

/**
 * Récupère tous les albums triés par date décroissante
 */
export async function getAlbums(): Promise<AlbumData[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) {
    console.error('Error fetching albums:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    event_title: item.event_title || '',
    event_date: item.event_date || '',
    photos: item.photos || [],
  })) as unknown as AlbumData[];
}

/**
 * Récupère tous les rapports triés par date décroissante
 */
export async function getReports(): Promise<ReportData[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title || '',
    date: item.date || '',
    year: item.date ? new Date(item.date).getFullYear().toString() : '',
    content: item.content || '',
    document_pdf_link: item.document_pdf_link || undefined,
  })) as unknown as ReportData[];
}

/**
 * Récupère tous les membres du bureau triés par ordre croissant
 */
export async function getBoardMembers(): Promise<BoardMemberData[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('bureau')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching board members:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name || '',
    surname: item.surname || '',
    order: item.order || 0,
    role: item.role || '',
    photo: item.photo || undefined,
    biography: item.biography || '',
  })) as unknown as BoardMemberData[];
}

/**
 * Récupère le profil de l'utilisateur connecté
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!supabase) return null;
  
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Error getting session:', authError);
      return null;
    }
    
    if (!authData?.session?.user?.id) {
      return null;
    }

    const userId = authData.session.user.id;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      surname: data.surname || '',
      email: data.email || authData.session.user.email || '',
      photo: data.photo || undefined,
      role: data.role || 'member',
    } as UserProfile;
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
}

/**
 * Met à jour le profil de l'utilisateur connecté
 */
export async function updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError || !authData?.session?.user?.id) {
      console.error('Error getting session:', authError);
      return false;
    }

    const userId = authData.session.user.id;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        surname: profile.surname,
        photo: profile.photo,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating user profile:', error);
    return false;
  }
}