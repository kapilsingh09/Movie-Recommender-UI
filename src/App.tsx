import { Github, Clapperboard } from "lucide-react";
import Home from "./components/Home";
import "./App.css";

function App() {
  return (
    <div
      className="flex flex-col min-h-screen h-full bg-gradient-to-b from-zinc-950 to-zinc-900 text-gray-200 font-sans antialiased"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-2xl font-bold select-none">
            <Clapperboard size={28} className="text-red-500" />
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">My Next Movie</span>
          </div>
          <a
            href="https://github.com/kapilsingh09"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 border border-zinc-700/50"
            aria-label="GitHub Link"
          >
            <Github size={20} className="text-zinc-400" />
            <span className="text-zinc-300">GitHub</span>
          </a>
        </div>
      </nav>

      {/* Main content */}  
      <main className="flex-grow h-full flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none" />
        <Home />
      </main>

      {/* Footer */}
     <footer className="bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800/50 text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="select-none mb-2 sm:mb-0 flex items-center gap-2">
            <Clapperboard size={16} className="text-red-500" />
            <span className="text-zinc-300">Movie Recommender</span> &mdash; Powered by{" "}
            <span className="font-medium text-red-400">FastAPI</span> +{" "}
            <span className="font-medium text-red-400">React</span>
          </p>
    <a
      href="https://github.com/kapilsingh09"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors duration-300 font-medium"
      aria-label="Footer GitHub Link"
    >
      <Github size={18} />
      <span>Source code</span>
    </a>
  </div>
</footer>

    </div>
  );
}

export default App;
