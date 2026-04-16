import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FavoritesPage from '../pages/FavoritesPage'
import * as api from '../services/api'
import type { SongDto } from '../services/api'

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}))

const mockFavorites: SongDto[] = [
  { id: 's1', title: 'Creep', artistName: 'Radiohead', musicBrainzRecordingId: 'mb1', tabCount: 5 },
  { id: 's2', title: 'Karma Police', artistName: 'Radiohead', musicBrainzRecordingId: 'mb2', tabCount: 2 },
]

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state initially', () => {
    vi.spyOn(api, 'getFavorites').mockReturnValue(new Promise(() => {})) // never resolves

    render(<FavoritesPage />)

    expect(screen.getByText('Loading favorites...')).toBeInTheDocument()
  })

  it('renders favorited songs after loading', async () => {
    vi.spyOn(api, 'getFavorites').mockResolvedValueOnce(mockFavorites)

    render(<FavoritesPage />)

    await waitFor(() => {
      expect(screen.getByText('Creep')).toBeInTheDocument()
      expect(screen.getByText('Karma Police')).toBeInTheDocument()
    })
  })

  it('shows empty state when no favorites', async () => {
    vi.spyOn(api, 'getFavorites').mockResolvedValueOnce([])

    render(<FavoritesPage />)

    await waitFor(() => {
      expect(screen.getByText(/You haven't favorited any songs yet/)).toBeInTheDocument()
    })
  })

  it('shows the page heading', async () => {
    vi.spyOn(api, 'getFavorites').mockResolvedValueOnce([])

    render(<FavoritesPage />)

    expect(screen.getByText('Your Favorites')).toBeInTheDocument()
  })

  it('removes song from list when unfavorited', async () => {
    vi.spyOn(api, 'getFavorites').mockResolvedValueOnce(mockFavorites)
    vi.spyOn(api, 'removeFavorite').mockResolvedValueOnce()
    const user = userEvent.setup()

    render(<FavoritesPage />)

    await waitFor(() => {
      expect(screen.getByText('Creep')).toBeInTheDocument()
    })

    // All songs on favorites page show filled hearts
    const heartButtons = screen.getAllByTitle('Remove from favorites')
    await user.click(heartButtons[0])

    await waitFor(() => {
      expect(screen.queryByText('Creep')).not.toBeInTheDocument()
      expect(screen.getByText('Karma Police')).toBeInTheDocument()
    })
  })

  it('sets auth token before loading favorites', async () => {
    const setTokenSpy = vi.spyOn(api, 'setAuthToken')
    vi.spyOn(api, 'getFavorites').mockResolvedValueOnce([])

    render(<FavoritesPage />)

    await waitFor(() => {
      expect(setTokenSpy).toHaveBeenCalledWith('mock-token')
    })
  })
})
