import { useState } from 'react'

interface Song {
  id: string
  title: string
  artistName: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [_results, _setResults] = useState<Song[]>([])
  const [_expandedSongId, _setExpandedSongId] = useState<string | null>(null)

  return (
    <div className="search-page">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by artist or song..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="results-list">
        {query.length > 0 && _results.length === 0 && (
          <p className="no-results">
            Start typing to search for songs and artists...
          </p>
        )}
        {/* Song rows with expandable tabs will be rendered here */}
      </div>
    </div>
  )
}
