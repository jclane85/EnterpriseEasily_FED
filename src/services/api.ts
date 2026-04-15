import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// --- Types ---

export interface SongDto {
  id: string
  title: string
  artistName: string
  musicBrainzRecordingId: string
  tabCount: number
}

export interface SearchResultDto {
  songs: SongDto[]
  totalCount: number
  page: number
  pageSize: number
}

export interface GuitarTabDto {
  id: string
  tabType: 'ASCII' | 'ChordChart'
  content: string
  status: string
  submittedBy: string
  createdAt: string
}

export interface SubmitTabRequest {
  tabType: 'ASCII' | 'ChordChart'
  content: string
}

// --- API calls ---

export async function searchSongs(query: string, page: number = 1): Promise<SearchResultDto> {
  const { data } = await api.get<SearchResultDto>('/api/search', {
    params: { q: query, page },
  })
  return data
}

export async function getSongTabs(songId: string): Promise<GuitarTabDto[]> {
  const { data } = await api.get<GuitarTabDto[]>(`/api/songs/${songId}/tabs`)
  return data
}

export async function submitTab(songId: string, request: SubmitTabRequest): Promise<GuitarTabDto> {
  const { data } = await api.post<GuitarTabDto>(`/api/songs/${songId}/tabs`, request)
  return data
}

export async function getFavorites(): Promise<SongDto[]> {
  const { data } = await api.get<SongDto[]>('/api/favorites')
  return data
}

export async function getFavoriteIds(): Promise<string[]> {
  const { data } = await api.get<string[]>('/api/favorites/ids')
  return data
}

export async function addFavorite(songId: string): Promise<void> {
  await api.post(`/api/favorites/${songId}`)
}

export async function removeFavorite(songId: string): Promise<void> {
  await api.delete(`/api/favorites/${songId}`)
}

export default api
