import { useState } from 'react'
import { getSongTabs, type SongDto, type GuitarTabDto } from '../services/api'

interface SongRowProps {
  song: SongDto
}

export default function SongRow({ song }: SongRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [tabs, setTabs] = useState<GuitarTabDto[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

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

  const asciiTabs = tabs.filter((t) => t.tabType === 'ASCII')
  const chordTabs = tabs.filter((t) => t.tabType === 'ChordChart')

  return (
    <div className="song-row">
      <div className="song-row-header" onClick={handleToggle}>
        <div className="song-info">
          <span className="song-title">{song.title}</span>
          <span className="song-artist">by {song.artistName}</span>
        </div>
        <div className="song-row-actions">
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
              <h4 className="tab-group-title">Chord Charts</h4>
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
        </div>
      )}
    </div>
  )
}
