import { Github, Clapperboard } from "lucide-react";
import Home from "./components/Home";
import "./App.css";

function App() {
  return (
    <div
      className="flex flex-col h-full bg-zinc-900 text-gray-200 font-sans"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4.5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold select-none">
            <Clapperboard size={28} className="text-yellow-400" />
            My Next Movie
          </div>
          <a
            href="https://github.com/kapilsingh09"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded px-3 py-1 hover:bg-gray-700 transition"
            aria-label="GitHub Link"
          >
            <Github size={20} />
            <span>GitHub</span>
          </a>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center ">
      
        
          <Home />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-5 shadow-inner">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="select-none mb-2 sm:mb-0 flex items-center gap-2">
            <Clapperboard size={16} className="text-yellow-400" />
            Movie Recommender &mdash; Powered by{" "}
            <span className="font-semibold">FastAPI</span> +{" "}
            <span className="font-semibold">React</span>
          </p>
          <a
            href="https://github.com/kapilsingh09"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition font-semibold"
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
