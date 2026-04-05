import axios from 'axios';
import { 
  EventData, 
  AlbumData, 
  ReportData, 
  BoardMemberData, 
  AboutData,
  StrapiMedia
} from '../types';

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://amescaobackend.onrender.com';
const API_URL = `${STRAPI_BASE_URL}/api`;

export const getMediaUrl = (media?: StrapiMedia): string => {
  if (!media?.url) return '';
  return media.url.startsWith('http') ? media.url : `${STRAPI_BASE_URL}${media.url}`;
};

export const renderBlocksToText = (blocks: any): string => {
  if (!blocks) return '';
  if (typeof blocks === 'string') return blocks;
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((block) => block.children?.map((child: any) => child.text).join('') || '')
    .join('\n');
};
export async function getEvents(): Promise<EventData[]> {
  const res = await axios.get(`${API_URL}/events?populate=*`);
  return res.data.data as EventData[];
}

export async function getAlbums(): Promise<AlbumData[]> {
  const res = await axios.get(`${API_URL}/albums?populate=*`);
  return res.data.data as AlbumData[];
}

export async function getReports(): Promise<ReportData[]> {
  const res = await axios.get(`${API_URL}/reports?populate=*`);
  return res.data.data as ReportData[];
}

export async function getBoardMembers(): Promise<BoardMemberData[]> {
  const res = await axios.get(`${API_URL}/board-members?populate=*`);
  const items = res.data.data as any[];

  const getRoleOrder = (role: any): number => {
    if (!role) return Number.MAX_SAFE_INTEGER;
    if (typeof role === 'number') return role;
    if (typeof role === 'string') {
      const n = parseInt(role, 10);
      return isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
    }
    if (typeof role === 'object') {
      if (typeof role.order === 'number') return role.order;
      if (role.attributes && typeof role.attributes.order === 'number') return role.attributes.order;
      if (role.data && role.data.attributes && typeof role.data.attributes.order === 'number') return role.data.attributes.order;
    }
    return Number.MAX_SAFE_INTEGER;
  };

  items.sort((a, b) => {
    const ao = getRoleOrder(a.role);
    const bo = getRoleOrder(b.role);
    return ao - bo;
  });

  return items as BoardMemberData[];
}

export async function getAbout(): Promise<AboutData> {
  const res = await axios.get(`${API_URL}/about?populate=*`);
  return res.data.data as AboutData;
}
