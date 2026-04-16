import { describe, it, expect, vi, beforeEach } from 'vitest'
import api, {
  setAuthToken,
  searchSongs,
  getSongTabs,
  submitTab,
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
} from '../services/api'
import type { SearchResultDto, GuitarTabDto, SongDto } from '../services/api'

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>()
  return {
    ...actual,
  }
})

describe('setAuthToken', () => {
  it('sets the Authorization header on the api instance', () => {
    setAuthToken('test-token-123')
    expect(api.defaults.headers.common['Authorization']).toBe('Bearer test-token-123')
  })
})

describe('API functions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('searchSongs calls GET /api/search with query and page', async () => {
    const mockData: SearchResultDto = {
      songs: [{ id: '1', title: 'Test', artistName: 'Artist', musicBrainzRecordingId: 'mb1', tabCount: 0 }],
      totalCount: 1,
      page: 1,
      pageSize: 20,
    }
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockData })

    const result = await searchSongs('test', 2)

    expect(api.get).toHaveBeenCalledWith('/api/search', { params: { q: 'test', page: 2 } })
    expect(result).toEqual(mockData)
  })

  it('searchSongs defaults page to 1', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { songs: [], totalCount: 0, page: 1, pageSize: 20 } })

    await searchSongs('test')

    expect(api.get).toHaveBeenCalledWith('/api/search', { params: { q: 'test', page: 1 } })
  })

  it('getSongTabs calls GET /api/songs/:id/tabs', async () => {
    const mockTabs: GuitarTabDto[] = [
      { id: 't1', tabType: 'ASCII', content: 'e|---', status: 'Approved', submittedBy: 'user1', createdAt: '2024-01-01' },
    ]
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockTabs })

    const result = await getSongTabs('song-123')

    expect(api.get).toHaveBeenCalledWith('/api/songs/song-123/tabs')
    expect(result).toEqual(mockTabs)
  })

  it('submitTab calls POST /api/songs/:id/tabs with request body', async () => {
    const newTab: GuitarTabDto = {
      id: 't2', tabType: 'ChordChart', content: 'Am C G', status: 'Pending', submittedBy: 'user2', createdAt: '2024-01-02',
    }
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: newTab })

    const result = await submitTab('song-456', { tabType: 'ChordChart', content: 'Am C G' })

    expect(api.post).toHaveBeenCalledWith('/api/songs/song-456/tabs', { tabType: 'ChordChart', content: 'Am C G' })
    expect(result).toEqual(newTab)
  })

  it('getFavorites calls GET /api/favorites', async () => {
    const mockFavs: SongDto[] = [
      { id: 's1', title: 'Fav Song', artistName: 'Fav Artist', musicBrainzRecordingId: 'mb2', tabCount: 3 },
    ]
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockFavs })

    const result = await getFavorites()

    expect(api.get).toHaveBeenCalledWith('/api/favorites')
    expect(result).toEqual(mockFavs)
  })

  it('getFavoriteIds calls GET /api/favorites/ids', async () => {
    const mockIds = ['id1', 'id2']
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockIds })

    const result = await getFavoriteIds()

    expect(api.get).toHaveBeenCalledWith('/api/favorites/ids')
    expect(result).toEqual(mockIds)
  })

  it('addFavorite calls POST /api/favorites/:id', async () => {
    vi.spyOn(api, 'post').mockResolvedValueOnce({})

    await addFavorite('song-789')

    expect(api.post).toHaveBeenCalledWith('/api/favorites/song-789')
  })

  it('removeFavorite calls DELETE /api/favorites/:id', async () => {
    vi.spyOn(api, 'delete').mockResolvedValueOnce({})

    await removeFavorite('song-789')

    expect(api.delete).toHaveBeenCalledWith('/api/favorites/song-789')
  })
})
