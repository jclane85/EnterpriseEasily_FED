import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { getFavorites, setAuthToken, type SongDto } from '../services/api'
import SongRow from '../components/SongRow'

export default function FavoritesPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [favorites, setFavorites] = useState<SongDto[]>([])
  const [loading, setLoading] = useState(true)
  const getTokenRef = useRef(getAccessTokenSilently)
  getTokenRef.current = getAccessTokenSilently

  const loadFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getTokenRef.current()
      setAuthToken(token)
      const data = await getFavorites()
      setFavorites(data)
    } catch (err) {
      console.error('Failed to load favorites:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const handleFavoriteToggle = useCallback((_songId: string, favorited: boolean) => {
    if (!favorited) {
      setFavorites(prev => prev.filter(s => s.id !== _songId))
    }
  }, [])

  return (
    <div className="favorites-page">
      <h1>Your Favorites</h1>

      {loading && <p className="favorites-loading">Loading favorites...</p>}

      {!loading && favorites.length === 0 && (
        <p className="placeholder-text">
          You haven't favorited any songs yet. Search for songs and click the ♡ to add them here!
        </p>
      )}

      <div className="results-list">
        {favorites.map((song) => (
          <SongRow
            key={song.id}
            song={song}
            isFavorited={true}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    </div>
  )
}
