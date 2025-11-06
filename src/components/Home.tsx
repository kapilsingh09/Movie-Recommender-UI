import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { motion } from "framer-motion";
import { API_BASE, fetchJson } from "../lib/api";

type MovieInfo = { posterUrl: string; tmdbLink: string };
type MoviePosters = Record<string, MovieInfo>;

type MovieOption = { label: string; value: string };

// 🔄 Simple Loading Spinner Component (using Tailwind CSS)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <svg
      className="animate-spin h-8 w-8 text-red-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p className="ml-3 text-red-400 font-medium">Fetching recommendations...</p>
  </div>
);

const Home = () => {
  const [movies, setMovies] = useState<string[]>([]);
  const [moviePosters, setMoviePosters] = useState<MoviePosters>({});
  const [selectedMovie, setSelectedMovie] = useState<MovieOption | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // Used for initial movie list fetch
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const TMDB_API_KEY = "8265bd1679663a7ea12ac168da84d2e8";

  const fetchMovies = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await fetchJson<{ data: string[]; has_more: boolean }>(
        `https://movie-recommender-server-5.onrender.com/movies/all?skip=${skip}&limit=50`
      );
      const newMovies: string[] = data.data || [];
      setMovies((prev) => [...prev, ...newMovies]);
      setHasMore(data.has_more);
      setSkip(skip + 50);
      await fetchPostersBatch(newMovies);
    } catch (err) {
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostersBatch = async (movieTitles: string[]) => {
    const uncached = movieTitles.filter((m) => !moviePosters[m]);
    const results: Record<string, MovieInfo> = {};

    await Promise.all(
      uncached.map(async (title) => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
              title
            )}`
          );
          const data = await res.json();
          const movieResult = data.results?.[0];
          const posterPath = movieResult?.poster_path;
          const movieId = movieResult?.id;

          const defaultInfo: MovieInfo = {
            posterUrl: "https://via.placeholder.com/300x450?text=No+Image",
            tmdbLink: "#",
          };

          if (posterPath && movieId) {
            results[title] = {
              posterUrl: `https://image.tmdb.org/t/p/w500${posterPath}`,
              tmdbLink: `https://www.themoviedb.org/movie/${movieId}`,
            };
          } else {
            results[title] = defaultInfo;
          }
        } catch (err) {
          console.error(`Error fetching TMDB info for ${title}:`, err);
          results[title] = {
            posterUrl: "https://via.placeholder.com/300x450?text=No+Image",
            tmdbLink: "#",
          };
        }
      })
    );

    setMoviePosters((prev) => ({ ...prev, ...results }));
  };

  useEffect(() => {
    fetchMovies();
    document.title = "My Next Movie";
  }, []);

  const defaultMovieOptions: MovieOption[] = movies.slice(0, 50).map((title) => ({
    label: title,
    value: title,
  }));

  const loadMovieOptions = async (
    inputValue: string
  ): Promise<MovieOption[]> => {
    if (!inputValue) return defaultMovieOptions;
    try {
      const data = await fetchJson<string[]>(
        `https://movie-recommender-server-5.onrender.com/movies/search?q=${encodeURIComponent(inputValue)}`
      );
      if (!Array.isArray(data) || data.length === 0)
        return defaultMovieOptions;
      return data.map((title) => ({ label: title, value: title }));
    } catch {
      return defaultMovieOptions;
    }
  };

  const handleRecommend = async () => {
    if (!selectedMovie) return;
    setRecommendationLoading(true); 
    setRecommendations([]);
    try {
      const data = await fetchJson<{ recommendations?: string[] }>(
        `https://movie-recommender-server-5.onrender.com/recommend/${encodeURIComponent(selectedMovie.value)}`
      );
      const newRecommendations = Array.isArray(data.recommendations) ? data.recommendations : [];

      setRecommendations(newRecommendations);
      await fetchPostersBatch(newRecommendations);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setRecommendationLoading(false); 
    }
  };

  // Helper to get movie info safely
  const getMovieInfo = (title: string): MovieInfo => {
    return moviePosters[title] || {
      posterUrl: "https://via.placeholder.com/300x450?text=No+Image",
      tmdbLink: "#",
    };
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 p-4 sm:p-6">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl border border-zinc-700/50 backdrop-blur-xl">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center mb-6 sm:mb-8 leading-tight text-white">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
            My Next Movie
          </span>
        </h1>

        <AsyncSelect
          cacheOptions
          defaultOptions={defaultMovieOptions}
          loadOptions={loadMovieOptions}
          onChange={(v) => setSelectedMovie(v as MovieOption)}
          placeholder="🔍 Search or select a movie..."
          className="mb-6 text-white"
          // styles remain the same
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "1rem",
              borderColor: "transparent",
              padding: "8px",
              backgroundColor: "rgba(24, 24, 27, 0.85)",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
              "&:hover": { borderColor: "#ef4444" },
            }),
            singleValue: (base) => ({ ...base, color: "#f3f4f6" }),
            input: (base) => ({ ...base, color: "#f3f4f6" }),
            menu: (base) => ({
              ...base,
              backgroundColor: "rgba(39, 39, 42, 0.98)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "0.75rem",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }),
            option: (base, state) => ({
              ...base,
              color: state.isSelected ? "#fff" : "#f3f4f6",
              backgroundColor: state.isSelected
                ? "#dc2626"
                : state.isFocused
                ? "rgba(239, 68, 68, 0.1)"
                : "transparent",
              transition: "all 0.2s ease",
              cursor: "pointer",
              "&:active": { backgroundColor: "#dc2626" },
            }),
          }}
          isClearable
        />

        <button
          onClick={handleRecommend}
          // Button is disabled when no movie is selected OR when recommendations are loading
          disabled={!selectedMovie || recommendationLoading}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 sm:py-4 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-red-500/20 flex items-center justify-center"
        >
          {recommendationLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting Movies...
            </>
          ) : !selectedMovie ? (
            "Select a movie first"
          ) : (
            "Get Recommendations"
          )}
        </button>

        {recommendationLoading ? (
          <LoadingSpinner />
        ) : recommendations.length > 0 ? (
          <div className="mt-8 sm:mt-10 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 text-center">
              Recommended for:{" "}
              <span className="text-red-400 font-bold truncate">
                {selectedMovie?.label}
              </span>
            </h2>
            {/* Grid of movie posters */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {recommendations.map((m, i) => {
                const info = getMovieInfo(m);
                return (
                  <motion.div
                    key={i}
                    className="group relative text-center overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <a
                      href={info.tmdbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-[2/3] relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 block cursor-pointer"
                    >
                      <img
                        src={info.posterUrl}
                        alt={m}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                        <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                          View Details
                        </span>
                      </div>
                    </a>
                    <p className="mt-2 text-gray-300 text-sm font-medium truncate px-1 group-hover:text-white transition-colors duration-300">
                      {m}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center text-gray-400">
            {selectedMovie && !recommendationLoading && (
              <p>No recommendations found for {selectedMovie.label}. Try a different movie!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;