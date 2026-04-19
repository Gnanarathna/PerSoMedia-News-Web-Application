import PrivateNavbar from "../components/PrivateNavbar";
import NewsCard from "../components/NewsCard";
import { motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import { getAllNews } from "../services/newsService";
import { getFavouriteNews, getWatchLaterNews } from "../services/newsService";

const INITIAL_VISIBLE_NEWS = 24;
const LOAD_MORE_STEP = 20;
const MIN_LOADING_DURATION_MS = 1000;

const sortByLatestPublished = (items) => {
  const toTime = (value) => {
    const time = value ? new Date(value).getTime() : 0;
    return Number.isNaN(time) ? 0 : time;
  };

  return [...items].sort((a, b) => toTime(b?.published_at) - toTime(a?.published_at));
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
    titleFontFamily: "Georgia, 'Times New Roman', serif",
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleNewsCount, setVisibleNewsCount] = useState(INITIAL_VISIBLE_NEWS);
  const [watchLaterItems, setWatchLaterItems] = useState([]);
  const [favouriteItems, setFavouriteItems] = useState([]);
  const visibleNews = filteredNews.slice(0, visibleNewsCount);

  useEffect(() => {
    const fetchNews = async () => {
      const startedAt = Date.now();

      try {
        const data = await getAllNews();
        const latestNews = sortByLatestPublished(data);
        setNews(latestNews);
        setFilteredNews(latestNews);
      } catch (err) {
        setError(err.message);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = MIN_LOADING_DURATION_MS - elapsed;
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const fetchWatchLaterItems = async () => {
      try {
        const data = await getWatchLaterNews();
        setWatchLaterItems(Array.isArray(data) ? data : []);
      } catch {
        setWatchLaterItems([]);
      }
    };

    fetchWatchLaterItems();
  }, []);

  useEffect(() => {
    const fetchFavouriteItems = async () => {
      try {
        const data = await getFavouriteNews();
        setFavouriteItems(Array.isArray(data) ? data : []);
      } catch {
        setFavouriteItems([]);
      }
    };

    fetchFavouriteItems();
  }, []);

  useEffect(() => {
    const filtered = news.filter((item) =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredNews(filtered);
    setVisibleNewsCount(INITIAL_VISIBLE_NEWS);
  }, [search, news]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLoadMore = () => {
    setVisibleNewsCount((previousCount) => previousCount + LOAD_MORE_STEP);
  };

  const handleSearch = () => {
    // Keep support for Enter/button-triggered search while live search handles filtering.
    setVisibleNewsCount(INITIAL_VISIBLE_NEWS);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isWatchLaterSaved = (newsItem) => {
    const newsId = String(newsItem?._id || newsItem?.news_id || "").trim();
    const sourceUrl = String(newsItem?.source_url || newsItem?.url || "").trim().toLowerCase();

    return watchLaterItems.some((savedItem) => {
      const savedNewsId = String(savedItem?.news_id || savedItem?._id || "").trim();
      const savedSourceUrl = String(savedItem?.source_url || savedItem?.url || "").trim().toLowerCase();

      if (newsId && savedNewsId && newsId === savedNewsId) {
        return true;
      }

      return sourceUrl && savedSourceUrl && sourceUrl === savedSourceUrl;
    });
  };

  const isFavouriteSaved = (newsItem) => {
    const newsId = String(newsItem?._id || newsItem?.news_id || "").trim();
    const sourceUrl = String(newsItem?.source_url || newsItem?.url || "").trim().toLowerCase();

    return favouriteItems.some((savedItem) => {
      const savedNewsId = String(savedItem?.news_id || savedItem?._id || "").trim();
      const savedSourceUrl = String(savedItem?.source_url || savedItem?.url || "").trim().toLowerCase();

      if (newsId && savedNewsId && newsId === savedNewsId) {
        return true;
      }

      return sourceUrl && savedSourceUrl && sourceUrl === savedSourceUrl;
    });
  };

  return (
    <div className="min-h-screen bg-[#EDEDED]">
      <PrivateNavbar
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={handleSearch}
      />

      <Motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >

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

          {loading && (
            <div className="flex justify-center mt-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
            </div>
          )}
          {error && <p className="text-center mt-10 text-red-500 text-lg">{error}</p>}

          {!loading && !error && filteredNews.length === 0 && (
            <div className="text-center mt-16">
              <p className="text-2xl font-semibold text-gray-600">
                No news found
              </p>
              <p className="text-gray-500 mt-2">
                Try searching something else
              </p>
            </div>
          )}

          {/* News Grid */}
          {!loading && !error && filteredNews.length > 0 && (
            <div className="grid grid-cols-4 gap-10 px-16 mt-12">
              {visibleNews.map((item, index) => (
                <Motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ delay: 0.45 + index * 0.05, duration: 0.45, type: "spring", stiffness: 180 }}
                >
                  <NewsCard
                    news={item}
                    watchLaterSaved={isWatchLaterSaved(item)}
                    favouriteSaved={isFavouriteSaved(item)}
                  />
                </Motion.div>
              ))}
            </div>
          )}

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
          <h1
            className="text-3xl font-bold tracking-tight text-slate-900"
            style={{ fontFamily: currentView.titleFontFamily || "inherit" }}
          >
            {currentView.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This is the private {currentView.title.toLowerCase()} page.
          </p>
        </Motion.div>
      )}

      {showScrollTop && (
        <Motion.button
          type="button"
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <FaChevronUp className="h-3.5 w-3.5" />
        </Motion.button>
      )}

      </Motion.div>
    </div>
  );
}