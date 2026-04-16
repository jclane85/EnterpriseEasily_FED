import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SongRow from '../components/SongRow'
import type { SongDto, GuitarTabDto } from '../services/api'
import * as api from '../services/api'

const mockSong: SongDto = {
  id: 'song-1',
  title: 'Smells Like Teen Spirit',
  artistName: 'Nirvana',
  musicBrainzRecordingId: 'mb-1',
  tabCount: 3,
}

const mockTabs: GuitarTabDto[] = [
  {
    id: 'tab-1',
    tabType: 'ASCII',
    content: 'e|---0---2---3---|',
    status: 'Approved',
    submittedBy: 'user1',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'tab-2',
    tabType: 'ChordChart',
    content: 'Am C G Em',
    status: 'Pending',
    submittedBy: 'user2',
    createdAt: '2024-02-01T00:00:00Z',
  },
]

describe('SongRow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders song title and artist', () => {
    render(<SongRow song={mockSong} />)

    expect(screen.getByText('Smells Like Teen Spirit')).toBeInTheDocument()
    expect(screen.getByText('by Nirvana')).toBeInTheDocument()
  })

  it('shows tab count badge when tabs exist', () => {
    render(<SongRow song={mockSong} />)

    expect(screen.getByText('3 tabs')).toBeInTheDocument()
  })

  it('shows singular tab label for 1 tab', () => {
    render(<SongRow song={{ ...mockSong, tabCount: 1 }} />)

    expect(screen.getByText('1 tab')).toBeInTheDocument()
  })

  it('does not show tab count badge when tabCount is 0', () => {
    render(<SongRow song={{ ...mockSong, tabCount: 0 }} />)

    expect(screen.queryByText(/\d+ tabs?/)).not.toBeInTheDocument()
  })

  it('shows unfavorited heart by default', () => {
    render(<SongRow song={mockSong} />)

    expect(screen.getByTitle('Add to favorites')).toHaveTextContent('♡')
  })

  it('shows favorited heart when isFavorited is true', () => {
    render(<SongRow song={mockSong} isFavorited={true} />)

    expect(screen.getByTitle('Remove from favorites')).toHaveTextContent('♥')
  })

  it('loads and shows tabs when expanded', async () => {
    vi.spyOn(api, 'getSongTabs').mockResolvedValueOnce(mockTabs)
    const user = userEvent.setup()

    render(<SongRow song={mockSong} />)

    await user.click(screen.getByText('Smells Like Teen Spirit'))

    await waitFor(() => {
      expect(screen.getByText('e|---0---2---3---|')).toBeInTheDocument()
      expect(screen.getByText('Am C G Em')).toBeInTheDocument()
    })
  })

  it('shows empty message when no tabs exist', async () => {
    vi.spyOn(api, 'getSongTabs').mockResolvedValueOnce([])
    const user = userEvent.setup()

    render(<SongRow song={mockSong} />)

    await user.click(screen.getByText('Smells Like Teen Spirit'))

    await waitFor(() => {
      expect(screen.getByText(/No tabs available yet/)).toBeInTheDocument()
    })
  })

  it('shows Pending badge for non-approved tabs', async () => {
    vi.spyOn(api, 'getSongTabs').mockResolvedValueOnce(mockTabs)
    const user = userEvent.setup()

    render(<SongRow song={mockSong} />)

    await user.click(screen.getByText('Smells Like Teen Spirit'))

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  it('calls addFavorite when unfavorited heart is clicked', async () => {
    const addSpy = vi.spyOn(api, 'addFavorite').mockResolvedValueOnce()
    const onToggle = vi.fn()
    const user = userEvent.setup()

    render(<SongRow song={mockSong} isFavorited={false} onFavoriteToggle={onToggle} />)

    await user.click(screen.getByTitle('Add to favorites'))

    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith('song-1')
      expect(onToggle).toHaveBeenCalledWith('song-1', true)
    })
  })

  it('calls removeFavorite when favorited heart is clicked', async () => {
    const removeSpy = vi.spyOn(api, 'removeFavorite').mockResolvedValueOnce()
    const onToggle = vi.fn()
    const user = userEvent.setup()

    render(<SongRow song={mockSong} isFavorited={true} onFavoriteToggle={onToggle} />)

    await user.click(screen.getByTitle('Remove from favorites'))

    await waitFor(() => {
      expect(removeSpy).toHaveBeenCalledWith('song-1')
      expect(onToggle).toHaveBeenCalledWith('song-1', false)
    })
  })

  it('shows submit tab form when button is clicked', async () => {
    vi.spyOn(api, 'getSongTabs').mockResolvedValueOnce([])
    const user = userEvent.setup()

    render(<SongRow song={mockSong} />)

    await user.click(screen.getByText('Smells Like Teen Spirit'))

    await waitFor(() => {
      expect(screen.getByText('+ Submit a Tab')).toBeInTheDocument()
    })

    await user.click(screen.getByText('+ Submit a Tab'))

    expect(screen.getByText('Submit a Tab')).toBeInTheDocument()
    expect(screen.getByText('Tablature (ASCII)')).toBeInTheDocument()
    expect(screen.getByText('Chords & Lyrics')).toBeInTheDocument()
  })

  it('submits a tab and adds it to the list', async () => {
    const newTab: GuitarTabDto = {
      id: 'tab-new',
      tabType: 'ASCII',
      content: 'e|---new---|',
      status: 'Pending',
      submittedBy: 'me',
      createdAt: '2024-03-01T00:00:00Z',
    }
    vi.spyOn(api, 'getSongTabs').mockResolvedValueOnce([])
    vi.spyOn(api, 'submitTab').mockResolvedValueOnce(newTab)
    const user = userEvent.setup()

    render(<SongRow song={mockSong} />)

    // Expand
    await user.click(screen.getByText('Smells Like Teen Spirit'))
    await waitFor(() => expect(screen.getByText('+ Submit a Tab')).toBeInTheDocument())

    // Open form
    await user.click(screen.getByText('+ Submit a Tab'))

    // Type content and submit
    const textarea = screen.getByPlaceholderText(/Paste your tab here/)
    await user.type(textarea, 'e|---new---|')
    await user.click(screen.getByText('Submit for Review'))

    await waitFor(() => {
      expect(api.submitTab).toHaveBeenCalledWith('song-1', { tabType: 'ASCII', content: 'e|---new---|' })
      expect(screen.getByText('e|---new---|')).toBeInTheDocument()
    })
  })
})
