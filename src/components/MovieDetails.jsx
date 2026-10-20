import { useState, useEffect, useRef } from 'react'
import { API_KEY, API_BASE_URL, IMAGE_BASE_URL } from '../config'

function formatRuntime(minutes) {
  if (!minutes) return null

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  return hours > 0 ? `${hours}h ${remainder}m` : `${remainder}m`
}

function formatDate(dateString) {
  if (!dateString) return 'Release date unknown'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Release date unknown'

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function MovieDetails({ movie, isInWatchlist, onToggleWatchlist, onClose }) {
  const [details, setDetails] = useState(null)
  const [detailsError, setDetailsError] = useState(false)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (!API_KEY) return

    let ignore = false

    async function loadDetails() {
      try {
        const response = await fetch(`${API_BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`)

        if (!response.ok) {
          throw new Error(`TMDB responded with status ${response.status}`)
        }

        const data = await response.json()

        if (!ignore) {
          setDetails(data)
        }
      } catch (err) {
        console.error(err)
        if (!ignore) {
          setDetailsError(true)
        }
      }
    }

    loadDetails()

    return () => {
      ignore = true
    }
  }, [movie.id])

  const isLoadingDetails = Boolean(API_KEY) && !details && !detailsError
  const genres = details?.genres ?? []
  const runtime = formatRuntime(details?.runtime)
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="modal-close"
          onClick={onClose}
          aria-label="Close movie details"
        >
          ✕
        </button>

        {movie.poster_path ? (
          <img
            className="modal-poster"
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={`Poster for ${movie.title}`}
          />
        ) : (
          <div className="modal-poster poster-placeholder">No poster</div>
        )}

        <div className="modal-body">
          <h2 id="movie-details-title">{movie.title}</h2>

          {details?.tagline && <p className="modal-tagline">{details.tagline}</p>}

          <p className="modal-meta">
            {formatDate(movie.release_date)}
            {runtime && ` · ${runtime}`}
            {` · ★ ${rating}`}
          </p>

          {isLoadingDetails && <p className="status-message">Loading more details...</p>}

          {detailsError && (
            <p className="status-message error-message">
              Could not load genres and runtime right now.
            </p>
          )}

          {genres.length > 0 && (
            <ul className="genre-tags">
              {genres.map((genre) => (
                <li key={genre.id} className="genre-tag">
                  {genre.name}
                </li>
              ))}
            </ul>
          )}

          <h3>Overview</h3>
          <p>{movie.overview || 'No overview available.'}</p>

          <button
            className={`watchlist-button modal-watchlist-button ${isInWatchlist ? 'saved' : ''}`}
            onClick={() => onToggleWatchlist(movie)}
          >
            {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MovieDetails