import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { searchSongs, setAuthToken, getFavoriteIds, type SongDto } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import SongRow from '../components/SongRow'

export default function SearchPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SongDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const debouncedQuery = useDebounce(query, 300)
  const getTokenRef = useRef(getAccessTokenSilently)
  getTokenRef.current = getAccessTokenSilently

  // Load user's favorite IDs on mount
  useEffect(() => {
    ;(async () => {
      try {
        const token = await getTokenRef.current()
        setAuthToken(token)
        const ids = await getFavoriteIds()
        setFavoriteIds(new Set(ids))
      } catch (err) {
        console.error('Failed to load favorites:', err)
      }
    })()
  }, [])

  const handleFavoriteToggle = useCallback((songId: string, favorited: boolean) => {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (favorited) next.add(songId)
      else next.delete(songId)
      return next
    })
  }, [])

  // Trigger search when debounced query changes
  useEffect(() => {
    const q = debouncedQuery
    if (q.length < 2) {
      setResults([])
      setTotalCount(0)
      setHasSearched(false)
      return
    }

    let cancelled = false
    setSearching(true)
    setPage(1)

    ;(async () => {
      try {
        const token = await getTokenRef.current()
        setAuthToken(token)
        const data = await searchSongs(q, 1)
        if (!cancelled) {
          setResults(data.songs)
          setTotalCount(data.totalCount)
          setHasSearched(true)
        }
      } catch (err) {
        if (!cancelled) console.error('Search failed:', err)
      } finally {
        if (!cancelled) setSearching(false)
      }
    })()

    return () => { cancelled = true }
  }, [debouncedQuery])

  // Trigger search when page changes
  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
    setSearching(true)
    try {
      const token = await getTokenRef.current()
      setAuthToken(token)
      const data = await searchSongs(debouncedQuery, newPage)
      setResults(data.songs)
      setTotalCount(data.totalCount)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearching(false)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="search-page">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by artist, band, or song..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && <div className="search-spinner">Searching...</div>}
      </div>

      <div className="results-list">
        {hasSearched && results.length === 0 && !searching && (
          <p className="no-results">No results found. Try a different search.</p>
        )}

        {!hasSearched && query.length > 0 && query.length < 2 && (
          <p className="no-results">Type at least 2 characters to search...</p>
        )}

        {results.map((song) => (
          <SongRow
            key={song.id}
            song={song}
            isFavorited={favoriteIds.has(song.id)}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            // Show pages around current page
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (page <= 3) {
              pageNum = i + 1
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = page - 2 + i
            }
            return (
              <button
                key={pageNum}
                className={`pagination-btn ${pageNum === page ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            className="pagination-btn"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
