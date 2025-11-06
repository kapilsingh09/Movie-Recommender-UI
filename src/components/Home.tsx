import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Sparkles, Star, TrendingUp } from "lucide-react";

type MovieInfo = { posterUrl: string; tmdbLink: string };
type MovieOption = { label: string; value: string };

const fetchJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return res.json();
};

const Home = () => {
  const [movies, setMovies] = useState<string[]>([]);
  const [moviePosters, setMoviePosters] = useState<Record<string, MovieInfo>>({});
  const [selectedMovie, setSelectedMovie] = useState<MovieOption | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const TMDB_API_KEY = "8265bd1679663a7ea12ac168da84d2e8";

  useEffect(() => {
    const loadMovies = async () => {
      setSearchLoading(true);
      try {
        const data = await fetchJson<{ data: string[] }>(
          `https://movie-recommender-server-5.onrender.com/movies/all?skip=0&limit=100`
        );
        setMovies(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    };
    loadMovies();
  }, []);

  const fetchPostersBatch = async (titles: string[]) => {
    const newInfo: Record<string, MovieInfo> = {};
    await Promise.all(
      titles.map(async (title) => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
              title
            )}`
          );
          const data = await res.json();
          const movie = data.results?.[0];
          if (movie?.poster_path) {
            newInfo[title] = {
              posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
              tmdbLink: `https://www.themoviedb.org/movie/${movie.id}`,
            };
          } else {
            newInfo[title] = {
              posterUrl: "https://via.placeholder.com/300x450?text=No+Image",
              tmdbLink: "#",
            };
          }
        } catch {
          newInfo[title] = {
            posterUrl: "https://via.placeholder.com/300x450?text=No+Image",
            tmdbLink: "#",
          };
        }
      })
    );
    setMoviePosters((prev) => ({ ...prev, ...newInfo }));
  };

  const loadMovieOptions = async (input: string) => {
    if (!input) return movies.slice(0, 50).map((t) => ({ label: t, value: t }));
    try {
      const data = await fetchJson<string[]>(
        `https://movie-recommender-server-5.onrender.com/movies/search?q=${encodeURIComponent(
          input
        )}`
      );
      return data.map((title) => ({ label: title, value: title }));
    } catch {
      return [];
    }
  };

  const handleRecommend = async () => {
    if (!selectedMovie) return;
    setLoading(true);
    setRecommendations([]);
    try {
      const data = await fetchJson<{ recommendations: string[] }>(
        `https://movie-recommender-server-5.onrender.com/recommend/${encodeURIComponent(
          selectedMovie.value
        )}`
      );
      const recs = data.recommendations || [];
      setRecommendations(recs);
      await fetchPostersBatch(recs);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMovieInfo = (title: string) =>
    moviePosters[title] || {
      posterUrl: "https://via.placeholder.com/300x450?text=No+Image",
      tmdbLink: "#",
    };

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-16">
        {/* Header Section */}
      

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl p-8 sm:p-10">
            {/* Search Section */}
            <div className="flex items-center justify-center gap-3 mb-4">
            {/* <Film className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" /> */}
           <h1 className="text-4xl sm:text-4xl md:text-6xl font-black tracking-tight">
  What will be your{" "}
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
    Next Movie?
  </span>
</h1>

          </div>
            <div className="mb-8">
              <label className="block text-sm font-semibold ml-1 text-gray-300 mb-3 flex items-center gap-2">
                {/* <Sparkles className="w-4 h-4 text-red-500" /> */}
                Select a Movie
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions={movies.slice(0, 50).map((t) => ({ label: t, value: t }))}
                loadOptions={loadMovieOptions}
                onChange={(v) => setSelectedMovie(v as MovieOption)}
                placeholder="Search for a movie..."
                className="text-white"
                isLoading={searchLoading}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "1rem",
                    backgroundColor: "#09090b",
                    border: state.isFocused ? "1.5px solid #dc2626" : "1.5px solid #27272a",
                    padding: "0.5rem",
                    transition: "all 0.2s ease",
                  }),
                  singleValue: (b) => ({ ...b, color: "#f3f4f6" }),
                  input: (b) => ({ ...b, color: "#f3f4f6" }),
                  placeholder: (b) => ({ ...b, color: "#71717a" }),
                  menu: (b) => ({
                    ...b,
                    backgroundColor: "#18181b",
                    borderRadius: "1rem",
                    border: "1px solid #27272a",
                  }),
                  option: (b, s) => ({
                    ...b,
                    color: s.isSelected ? "#fff" : "#e4e4e7",
                    backgroundColor: s.isSelected
                      ? "#dc2626"
                      : s.isFocused
                      ? "#27272a"
                      : "transparent",
                    padding: "0.75rem 1rem",
                  }),
                }}
                isClearable
              />
            </div>

            {/* Button */}
            <button
              onClick={handleRecommend}
              disabled={!selectedMovie || loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
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
                  Finding Perfect Matches...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Get Recommendations
                </>
              )}
            </button>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-10 text-center"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-zinc-700 border-t-red-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-base">Analyzing your taste...</p>
                  </div>
                </motion.div>
              )}

              {!loading && recommendations.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-12"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                      Perfect Matches for{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                        {selectedMovie?.label}
                      </span>
                    </h2>
                    <p className="text-gray-500 text-sm">Handpicked just for you</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {recommendations.map((m, i) => {
                      const info = getMovieInfo(m);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                          <a
                            href={info.tmdbLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <img
                              src={info.posterUrl}
                              alt={m}
                              loading="lazy"
                              className="w-full aspect-[2/3] object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </a>
                          <p className="text-gray-300 text-xs sm:text-sm font-medium mt-3 text-center line-clamp-2">
                            {m}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-gray-600 text-sm"
        >
          <p>Powered by ML — Now featuring (4806, 7) dimensions of entertainment</p>
        </motion.div>
      </div>
    </div>
  );
}; 

export default Home;
