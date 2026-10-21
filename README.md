# CineFind

CineFind is a movie discovery web app. Browse popular films, search by title, filter by genre, read details about each movie, and keep a personal watchlist that is saved in your browser.

**Live demo:** https://cinefind-five.vercel.app

**Source code:** https://github.com/ivemina/cinefind

## Features

- Browse popular movies with posters, release years and ratings
- Search for movies by title (with a short delay so the app does not send a request on every keystroke)
- Filter by genre: Action, Comedy, Drama, Horror, Romance and Science Fiction
- Combine a search with a genre filter
- Movie details popup with overview, release date, runtime and genres
- Personal watchlist: add and remove movies, see the count, and keep the list after refreshing the page
- Loading messages, empty-state messages and friendly error messages
- Responsive layout for desktop, tablet and mobile
- Keyboard-friendly controls, descriptive image text and accessible button labels

## Built with

- React
- Vite
- JavaScript
- Plain CSS (Flexbox, Grid and media queries)
- The TMDB API for movie data and posters
- Browser localStorage for the watchlist
- ESLint
- Git and GitHub
- Vercel for hosting

## Run it on your computer

You need Node.js and npm installed.

1. Download the project:

```
   git clone https://github.com/ivemina/cinefind.git
   cd cinefind
```

2. Install the dependencies:

```
   npm install
```

3. Get a free TMDB API key by creating an account at https://www.themoviedb.org and requesting a key in your account settings (API section).

4. In the top-level project folder, create a file named `.env.local` containing one line:

```
   VITE_TMDB_API_KEY=your_api_key_here
```

5. Start the development server:

```
   npm run dev
```

6. Open the address it prints (usually http://localhost:5173).

Other commands: `npm run lint` checks the code, and `npm run build` creates the production version.

## What I learned

- Building a React app from reusable components and passing data between them with props
- Managing changing data with state and effects
- Fetching data from a real web API, including loading, error and empty states
- Preventing old search results from overwriting newer ones
- Saving data in localStorage and reading it back safely
- Making a layout responsive with CSS Grid and media queries
- Using Git and GitHub, and deploying a site with Vercel

## Known limitations

- **The API key is not secret.** This is a browser-only app, so the TMDB key is included in the code sent to every visitor, even though it is kept out of the GitHub repository. This is acceptable for a free, non-commercial key, but a production app would call TMDB through a small server instead.
- **The watchlist is stored in one browser.** It is not shared between devices or browsers, and clearing site data erases it.
- **Search shows only the first page of results** (about 20 movies). When a genre is combined with a search, the filtering is done in the browser on those results, so few or no movies may remain.
- There is no user login, pagination or automated test suite yet.

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie data and images are provided by [The Movie Database (TMDB)](https://www.themoviedb.org).