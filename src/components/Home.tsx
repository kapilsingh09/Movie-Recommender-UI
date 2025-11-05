import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { motion } from "framer-motion";

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
      const res = await fetch(`http://localhost:8000/movies/all?skip=${skip}&limit=50`);
      const data = await res.json();
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
          if (posterPath) {
            results[title] = `https://image.tmdb.org/t/p/w500${posterPath}`;
          } else {
            results[title] = "https://via.placeholder.com/300x450?text=No+Image";
          }
        } catch {
          results[title] = "https://via.placeholder.com/300x450?text=No+Image";
        }
      })
    );

    setMoviePosters((prev) => ({ ...prev, ...results }));
  };

  useEffect(() => {
    fetchMovies();
    document.title = "My Next Movie 🎬";
    // eslint-disable-next-line
  }, []);

  const defaultMovieOptions: MovieOption[] = movies.slice(0, 50).map((title) => ({
    label: title,
    value: title,
  }));

  const loadMovieOptions = async (inputValue: string): Promise<MovieOption[]> => {
    if (!inputValue) return defaultMovieOptions;
    try {
      const res = await fetch(`http://localhost:8000/movies/search?q=${encodeURIComponent(inputValue)}`);
      const data: string[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) return defaultMovieOptions;
      return data.map((title) => ({ label: title, value: title }));
    } catch {
      return defaultMovieOptions;
    }
  };

  const handleRecommend = async () => {
    if (!selectedMovie) return;
    try {
      const res = await fetch(
        `http://localhost:8000/recommend/${encodeURIComponent(selectedMovie.value)}`
      );
      const data = await res.json();
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
      await fetchPostersBatch(data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-900">
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 w-full max-w-2xl border border-gray-500">
        <h1 className="text-4xl font-bold text-white mb-3 text-center">
          Welcome to <span className="text-red-400">What will be, My Next Movie</span>
        </h1>

        <AsyncSelect
          cacheOptions
          defaultOptions={defaultMovieOptions}
          loadOptions={loadMovieOptions}
          onChange={(v) => setSelectedMovie(v as MovieOption)}
          placeholder="🔍 Search or select a movie..."
          className="mb-4 text-gray-900"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.85rem",
              borderColor: "#ef4444",
              padding: "10px",
              backgroundColor: "#18181b",
              color: "#f3f4f6"
            }),
            singleValue: (base) => ({
              ...base,
              color: "#f3f4f6"
            }),
            input: (base) => ({
              ...base,
              color: "#f3f4f6"
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "#27272a"
            }),
            option: (base, state) => ({
              ...base,
              color: state.isSelected ? "#fff" : "#f3f4f6",
              backgroundColor: state.isSelected ? "#b91c1c" : (state.isFocused ? "#27272a" : "inherit")
            }),
          }}
          isClearable
        />

        <button
          onClick={handleRecommend}
          disabled={!selectedMovie}
          className="w-full bg-red-500 text-white py-4 rounded-2xl hover:bg-red-600 transition font-semibold disabled:opacity-50 mt-2"
        >
           Get Recommendations
        </button>

        {recommendations.length > 0 && (
          <div className="mt-6 bg-zinc-800 border border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Recommended for:{" "}
              <span className="text-red-400">{selectedMovie ? selectedMovie.label : ""}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {recommendations.map((m, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <img
                    src={moviePosters[m] || "https://via.placeholder.com/300x450?text=No+Image"}
                    alt={m}
                    loading="lazy"
                    className="w-full h-60 object-contain rounded-md mb-2 bg-zinc-900 border border-zinc-700"
                  />
                  <p className="text-gray-300 text-sm">{m}</p>
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
