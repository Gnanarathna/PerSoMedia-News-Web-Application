import PrivateNavbar from "../components/PrivateNavbar";
import NewsCard from "../components/NewsCard";
import { motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getAllNews } from "../services/newsService";

const INITIAL_VISIBLE_NEWS = 24;
const LOAD_MORE_STEP = 20;

const shuffleNews = (items) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

const viewMeta = {
  home: {
    title: "Latest Private Feed",
    showNewsGrid: true,
  },
  categories: {
    title: "Private Categories",
    showNewsGrid: false,
  },
  detect: {
    title: "Detect Fake News",
    showNewsGrid: false,
  },
  watchlater: {
    title: "Watch Later",
    showNewsGrid: false,
  },
  favorites: {
    title: "Favorites",
    showNewsGrid: false,
  },
};

export default function Dashboard({ view = "home" }) {
  const currentView = viewMeta[view] || viewMeta.home;
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleNewsCount, setVisibleNewsCount] = useState(INITIAL_VISIBLE_NEWS);
  const visibleNews = filteredNews.slice(0, visibleNewsCount);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getAllNews();
        const mixedNews = shuffleNews(data);
        setNews(mixedNews);
        setFilteredNews(mixedNews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleLoadMore = () => {
    setVisibleNewsCount((previousCount) => previousCount + LOAD_MORE_STEP);
  };

  const handleSearch = () => {
    const filtered = news.filter((item) =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredNews(shuffleNews(filtered));
    setVisibleNewsCount(INITIAL_VISIBLE_NEWS);
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#EDEDED]"
    >
      
      <PrivateNavbar
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={handleSearch}
      />

      {currentView.showNewsGrid ? (
        <>
          <Motion.section
            className="mx-10 mt-8 px-2 py-4 text-center text-slate-800"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <h1
              className="text-3xl font-bold leading-tight tracking-tight md:text-4xl"
              style={{ fontFamily: "Cambria, Georgia, 'Times New Roman', serif" }}
            >
              Welcome to PerSoMedia News
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
              Discover verified trending stories, monitor fake news signals, and stay updated with the latest media insights tailored to your activity.
            </p>
          </Motion.section>

          {loading && <p className="text-center mt-10 text-lg">Loading news...</p>}
          {error && <p className="text-center mt-10 text-red-500 text-lg">{error}</p>}

          {/* News Grid */}
          <div className="grid grid-cols-4 gap-10 px-16 mt-12">
            {!loading && !error && visibleNews.map((item, index) => (
              <Motion.div
                key={item._id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                transition={{ delay: 0.45 + index * 0.05, duration: 0.45, type: "spring", stiffness: 180 }}
              >
                <NewsCard news={item} />
              </Motion.div>
            ))}
          </div>

          {/* More Button */}
          {!loading && !error && filteredNews.length > 0 && (
            <Motion.div
              className="flex justify-center my-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Motion.button
                type="button"
                onClick={handleLoadMore}
                className="group inline-flex items-center gap-1 rounded-full border border-slate-300/90 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-800 shadow-[0_6px_16px_rgba(15,23,42,0.1)] transition-all hover:border-blue-300 hover:shadow-[0_10px_20px_rgba(37,99,235,0.16)]"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="px-1.5">More News</span>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all group-hover:bg-blue-600 group-hover:text-white">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 transition-transform group-hover:translate-y-[1px]"
                  >
                    <path d="M5 8l5 5 5-5" />
                  </svg>
                </span>
              </Motion.button>
            </Motion.div>
          )}
        </>
      ) : (
        <Motion.div
          className="mx-10 mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          This is the private {currentView.title.toLowerCase()} page.
        </Motion.div>
      )}

    </Motion.div>
  );
}