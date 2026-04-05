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
  const res = await axios.get(`${API_URL}/board-members?populate=role`);
  const data = res.data.data as BoardMemberData[];

  // Tri par ordre du rôle
  return data.sort(
  (a, b) => a.role.data.attributes.order - b.role.data.attributes.order
);

}

export async function getAbout(): Promise<AboutData> {
  const res = await axios.get(`${API_URL}/about?populate=*`);
  return res.data.data as AboutData;
}
