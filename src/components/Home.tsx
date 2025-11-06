import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { motion } from "framer-motion";
import { API_BASE, fetchJson } from "../lib/api";

type MovieOption = { label: string; value: string };
type MoviePosters = Record<string, string>;

const Home = () => {
  const [movies, setMovies] = useState<string[]>([]);
  const [moviePosters, setMoviePosters] = useState<MoviePosters>({});
  const [selectedMovie, setSelectedMovie] = useState<MovieOption | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

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
    const results: Record<string, string> = {};

    await Promise.all(
      uncached.map(async (title) => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=8265bd1679663a7ea12ac168da84d2e8&query=${encodeURIComponent(
              title
            )}`
          );
          const data = await res.json();
          const posterPath = data.results?.[0]?.poster_path;
          console.log(data);
          
          if (posterPath) {
            results[title] = `https://image.tmdb.org/t/p/w500${posterPath}`;
          } else {
            results[title] =
              "https://via.placeholder.com/300x450?text=No+Image";
          }
        } catch {
          results[title] =
            "https://via.placeholder.com/300x450?text=No+Image";
        }
      })
    );

    setMoviePosters((prev) => ({ ...prev, ...results }));
  };

  useEffect(() => {
    fetchMovies();
    document.title = "My Next Movie";
    // eslint-disable-next-line
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
    try {
      const data = await fetchJson<{ recommendations?: string[] }>(
        `https://movie-recommender-server-5.onrender.com/recommend/${encodeURIComponent(selectedMovie.value)}`
      );
      setRecommendations(
        Array.isArray(data.recommendations)
          ? data.recommendations
          : []
      );
      await fetchPostersBatch(data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 p-6">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-zinc-700/50 backdrop-blur-xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-8 leading-tight text-white">
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
          disabled={!selectedMovie}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-red-500/20"
        >
          {!selectedMovie ? "Select a movie first" : "Get Recommendations"}
        </button>

        {recommendations.length > 0 && (
          <div className="mt-10 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              Recommended for:{" "}
              <span className="text-red-400 font-bold">
                {selectedMovie?.label}
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {recommendations.map((m, i) => (
                <motion.div
                  key={i}
                  className="group relative text-center overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="aspect-[2/3] relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={
                        moviePosters[m] ||
                        "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={m}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <p className="mt-3 text-gray-300 text-sm font-medium truncate px-2 group-hover:text-white transition-colors duration-300">
                    {m}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
