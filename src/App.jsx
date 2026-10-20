import { useState, useEffect } from 'react'
import MovieCard from './components/MovieCard'
import MovieDetails from './components/MovieDetails'
import { API_KEY, API_BASE_URL } from './config'
import './App.css'
import tmdbLogo from './assets/tmdb-logo.svg'

const WATCHLIST_KEY = 'cinefind-watchlist'

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
]

function makeRequestKey(term, genreId) {
  return `${term}|${genreId ?? ''}`
}

function loadWatchlist() {
  try {
    const saved = localStorage.getItem(WATCHLIST_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((movie) => movie && typeof movie.id === 'number' && movie.title)
  } catch (err) {
    console.error('Could not read the watchlist from localStorage', err)
    return []
  }
}

function App() {
  const [view, setView] = useState('browse')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [results, setResults] = useState({ forKey: null, movies: [], error: '' })
  const [watchlist, setWatchlist] = useState(loadWatchlist)
  const [selectedMovie, setSelectedMovie] = useState(null)

  const requestKey = makeRequestKey(debouncedTerm, selectedGenre)
  const missingKey = !API_KEY
  const isLoading = !missingKey && results.forKey !== requestKey
  const error = missingKey
    ? 'The TMDB API key is missing. Check your .env.local file and restart the server.'
    : results.error
  const movies = results.movies

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
    } catch (err) {
      console.error('Could not save the watchlist to localStorage', err)
    }
  }, [watchlist])

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim())
    }, 500)

    return () => clearTimeout(timerId)
  }, [searchTerm])

  useEffect(() => {
    if (!API_KEY) return

    let ignore = false
    const key = makeRequestKey(debouncedTerm, selectedGenre)

    async function loadMovies() {
      let url

      if (debouncedTerm) {
        url = `${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(debouncedTerm)}`
      } else if (selectedGenre) {
        url = `${API_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${selectedGenre}&sort_by=popularity.desc`
      } else {
        url = `${API_BASE_URL}/movie/popular?api_key=${API_KEY}`
      }

      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`TMDB responded with status ${response.status}`)
        }

        const data = await response.json()
        let list = data.results

        if (debouncedTerm && selectedGenre) {
          list = list.filter((movie) => (movie.genre_ids || []).includes(selectedGenre))
        }

        if (!ignore) {
          setResults({ forKey: key, movies: list, error: '' })
        }
      } catch (err) {
        console.error(err)
        if (!ignore) {
          setResults({
            forKey: key,
            movies: [],
            error: 'Sorry, we could not load movies. Please check your connection and try again.',
          })
        }
      }
    }

    loadMovies()

    return () => {
      ignore = true
    }
  }, [debouncedTerm, selectedGenre])

  function handleGenreClick(genreId) {
    setSelectedGenre(selectedGenre === genreId ? null : genreId)
  }

  function isSaved(movieId) {
    return watchlist.some((saved) => saved.id === movieId)
  }

  function toggleWatchlist(movie) {
    setWatchlist((current) => {
      const alreadySaved = current.some((saved) => saved.id === movie.id)

      if (alreadySaved) {
        return current.filter((saved) => saved.id !== movie.id)
      }

      return [...current, movie]
    })
  }

  const selectedGenreName = GENRES.find((genre) => genre.id === selectedGenre)?.name

  let heading = 'Popular Movies'
  if (debouncedTerm && selectedGenreName) {
    heading = `Results for “${debouncedTerm}” in ${selectedGenreName}`
  } else if (debouncedTerm) {
    heading = `Results for “${debouncedTerm}”`
  } else if (selectedGenreName) {
    heading = `${selectedGenreName} Movies`
  }

  let noResultsMessage = 'No movies found. Try a different genre.'
  if (debouncedTerm && selectedGenreName) {
    noResultsMessage = `No ${selectedGenreName} movies found for “${debouncedTerm}”. Try a different title or genre.`
  } else if (debouncedTerm) {
    noResultsMessage = `No movies found for “${debouncedTerm}”. Try a different title.`
  }

  const showNoResults = !isLoading && !error && movies.length === 0

  return (
    <div className="app">
      <header className="navbar">
        <span className="logo">
          Cine<span className="logo-accent">Find</span>
        </span>
        <nav className="nav-links">
          <button
            className={`nav-button ${view === 'browse' ? 'active' : ''}`}
            onClick={() => setView('browse')}
          >
            Popular
          </button>
          <button
            className={`nav-button ${view === 'watchlist' ? 'active' : ''}`}
            onClick={() => setView('watchlist')}
          >
            Watchlist ({watchlist.length})
          </button>
        </nav>
      </header>

      {view === 'browse' ? (
        <>
          <section className="hero">
            <h1>Find your next favourite movie</h1>
            <p>Search thousands of films, filter by genre, and save the ones you want to watch.</p>
            <input
              type="text"
              className="search-input"
              placeholder="Search for a movie..."
              aria-label="Search for a movie"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </section>

          <main id="popular" className="content">
            <h2>{heading}</h2>

            <div className="genre-filters">
              <button
                className={`genre-button ${selectedGenre === null ? 'active' : ''}`}
                aria-pressed={selectedGenre === null}
                onClick={() => setSelectedGenre(null)}
              >
                All
              </button>

              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  className={`genre-button ${selectedGenre === genre.id ? 'active' : ''}`}
                  aria-pressed={selectedGenre === genre.id}
                  onClick={() => handleGenreClick(genre.id)}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            {isLoading && <p className="status-message">Loading movies...</p>}

            {error && <p className="status-message error-message">{error}</p>}

            {showNoResults && <p className="status-message">{noResultsMessage}</p>}

            <div className="movie-grid">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isInWatchlist={isSaved(movie.id)}
                  onToggleWatchlist={toggleWatchlist}
                  onOpenDetails={setSelectedMovie}
                />
              ))}
            </div>
          </main>
        </>
      ) : (
        <main id="watchlist" className="content watchlist-page">
          <h2>My Watchlist ({watchlist.length})</h2>

          {watchlist.length === 0 ? (
            <p className="status-message">
              Your watchlist is empty. Go to Popular and press “+ Watchlist” on a movie to save it.
            </p>
          ) : (
            <div className="movie-grid">
              {watchlist.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isInWatchlist={true}
                  onToggleWatchlist={toggleWatchlist}
                  onOpenDetails={setSelectedMovie}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {selectedMovie && (
        <MovieDetails
          key={selectedMovie.id}
          movie={selectedMovie}
          isInWatchlist={isSaved(selectedMovie.id)}
          onToggleWatchlist={toggleWatchlist}
          onClose={() => setSelectedMovie(null)}
        />
      )}

            <footer className="footer">
        <section className="credits" aria-labelledby="credits-heading">
          <h2 id="credits-heading">Credits</h2>
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
            <img className="tmdb-logo" src={tmdbLogo} alt="The Movie Database (TMDB)" />
          </a>
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <p>CineFind is a portfolio project.</p>
        </section>
      </footer>
    </div>
  )
}

export default App