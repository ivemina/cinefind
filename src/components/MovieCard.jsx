import { IMAGE_BASE_URL } from '../config'

function MovieCard({ movie, isInWatchlist, onToggleWatchlist, onOpenDetails }) {
  const buttonLabel = isInWatchlist
    ? `Remove ${movie.title} from watchlist`
    : `Add ${movie.title} to watchlist`

  return (
    <article className="movie-card">
      <div className="poster-wrapper" onClick={() => onOpenDetails(movie)}>
        {movie.poster_path ? (
          <img
            className="poster-image"
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={`Poster for ${movie.title}`}
          />
        ) : (
          <div className="poster-placeholder">No poster</div>
        )}
      </div>
      <div className="movie-info">
        <h3>
          <button
            className="title-button"
            onClick={() => onOpenDetails(movie)}
            aria-label={`View details for ${movie.title}`}
          >
            {movie.title}
          </button>
        </h3>
        <p className="movie-meta">
          {movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown year'}
          {' · ★ '}
          {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </p>
        <button
          className={`watchlist-button ${isInWatchlist ? 'saved' : ''}`}
          onClick={() => onToggleWatchlist(movie)}
          aria-label={buttonLabel}
          title={isInWatchlist ? 'Click to remove from watchlist' : 'Click to add to watchlist'}
        >
          {isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
        </button>
      </div>
    </article>
  )
}

export default MovieCard