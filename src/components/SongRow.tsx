import { useState } from 'react'
import { getSongTabs, submitTab, addFavorite, removeFavorite, type SongDto, type GuitarTabDto, type SubmitTabRequest } from '../services/api'

interface SongRowProps {
  song: SongDto
  isFavorited?: boolean
  onFavoriteToggle?: (songId: string, favorited: boolean) => void
}

export default function SongRow({ song, isFavorited = false, onFavoriteToggle }: SongRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [tabs, setTabs] = useState<GuitarTabDto[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submitType, setSubmitType] = useState<SubmitTabRequest['tabType']>('ASCII')
  const [submitContent, setSubmitContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  const handleToggle = async () => {
    if (!expanded && !loaded) {
      setLoading(true)
      try {
        const data = await getSongTabs(song.id)
        setTabs(data)
        setLoaded(true)
      } catch (err) {
        console.error('Failed to load tabs:', err)
      } finally {
        setLoading(false)
      }
    }
    setExpanded(!expanded)
  }

  const handleSubmitTab = async () => {
    if (!submitContent.trim()) return
    setSubmitting(true)
    try {
      const newTab = await submitTab(song.id, { tabType: submitType, content: submitContent })
      setTabs((prev) => [newTab, ...prev])
      setSubmitContent('')
      setShowSubmitForm(false)
    } catch (err) {
      console.error('Failed to submit tab:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const asciiTabs = tabs.filter((t) => t.tabType === 'ASCII')
  const chordTabs = tabs.filter((t) => t.tabType === 'ChordChart')

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (favLoading) return
    setFavLoading(true)
    try {
      if (isFavorited) {
        await removeFavorite(song.id)
        onFavoriteToggle?.(song.id, false)
      } else {
        await addFavorite(song.id)
        onFavoriteToggle?.(song.id, true)
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    } finally {
      setFavLoading(false)
    }
  }

  return (
    <div className="song-row">
      <div className="song-row-header" onClick={handleToggle}>
        <div className="song-info">
          <span className="song-title">{song.title}</span>
          <span className="song-artist">by {song.artistName}</span>
        </div>
        <div className="song-row-actions">
          <button
            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
            disabled={favLoading}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? '♥' : '♡'}
          </button>
          {song.tabCount > 0 && (
            <span className="tab-count-badge">{song.tabCount} tab{song.tabCount !== 1 ? 's' : ''}</span>
          )}
          <span className={`expand-arrow ${expanded ? 'expanded' : ''}`}>▶</span>
        </div>
      </div>

      {expanded && (
        <div className="tab-section">
          {loading && <p className="tab-loading">Loading tabs...</p>}

          {!loading && tabs.length === 0 && (
            <p className="tab-empty">No tabs available yet. Be the first to submit one!</p>
          )}

          {asciiTabs.length > 0 && (
            <div className="tab-group">
              <h4 className="tab-group-title">Tablature</h4>
              {asciiTabs.map((tab) => (
                <div key={tab.id} className="tab-card">
                  <div className="tab-meta">
                    <span>Submitted by {tab.submittedBy}</span>
                    <div className="tab-meta-right">
                      {tab.status !== 'Approved' && (
                        <span className="badge-pending">{tab.status}</span>
                      )}
                      <span>{new Date(tab.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <pre className="tab-content">{tab.content}</pre>
                </div>
              ))}
            </div>
          )}

          {chordTabs.length > 0 && (
            <div className="tab-group">
              <h4 className="tab-group-title">Chords & Lyrics</h4>
              {chordTabs.map((tab) => (
                <div key={tab.id} className="tab-card">
                  <div className="tab-meta">
                    <span>Submitted by {tab.submittedBy}</span>
                    <div className="tab-meta-right">
                      {tab.status !== 'Approved' && (
                        <span className="badge-pending">{tab.status}</span>
                      )}
                      <span>{new Date(tab.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <pre className="tab-content chord-chart">{tab.content}</pre>
                </div>
              ))}
            </div>
          )}

          {!showSubmitForm ? (
            <button
              className="btn btn-outline submit-tab-btn"
              onClick={(e) => { e.stopPropagation(); setShowSubmitForm(true) }}
            >
              + Submit a Tab
            </button>
          ) : (
            <div className="submit-tab-form" onClick={(e) => e.stopPropagation()}>
              <h4 className="tab-group-title">Submit a Tab</h4>
              <div className="submit-tab-type">
                <label>
                  <input
                    type="radio"
                    name={`tabType-${song.id}`}
                    value="ASCII"
                    checked={submitType === 'ASCII'}
                    onChange={() => setSubmitType('ASCII')}
                  />
                  Tablature (ASCII)
                </label>
                <label>
                  <input
                    type="radio"
                    name={`tabType-${song.id}`}
                    value="ChordChart"
                    checked={submitType === 'ChordChart'}
                    onChange={() => setSubmitType('ChordChart')}
                  />
                  Chords & Lyrics
                </label>
              </div>
              <textarea
                className="submit-tab-textarea"
                placeholder={submitType === 'ASCII'
                  ? 'Paste your tab here...\ne|---0---2---3---|\nB|---1---3---0---|'
                  : 'Paste your chords & lyrics...\n[Verse]\nAm        C\nWalking down the road again\nG         Em\nSearching for the words to say'}
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                rows={10}
              />
              <div className="submit-tab-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitTab}
                  disabled={submitting || !submitContent.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => { setShowSubmitForm(false); setSubmitContent('') }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
