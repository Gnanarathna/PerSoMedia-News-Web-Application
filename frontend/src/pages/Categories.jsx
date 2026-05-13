import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { FaChevronUp } from "react-icons/fa";
import PrivateNavbar from "../components/PrivateNavbar";
import NewsCard from "../components/NewsCard";
import { getFavouriteNews, getPlatformNews, getWatchLaterNews } from "../services/newsService";
import {
  FaYoutube,
  FaFacebook,
  FaInstagram
} from "react-icons/fa";
import { SiTiktok, SiX } from "react-icons/si";

const INITIAL_ROWS = 5;
const CARDS_PER_ROW = 4;
const INITIAL_VISIBLE_COUNT = INITIAL_ROWS * CARDS_PER_ROW;
const MIN_LOADING_DURATION_MS = 1000;
const CATEGORIES = [
  { name: "youtube", label: "YouTube", icon: <FaYoutube className="text-red-500 text-2xl" /> },
  { name: "facebook", label: "Facebook", icon: <FaFacebook className="text-blue-600 text-2xl" /> },
  { name: "instagram", label: "Instagram", icon: <FaInstagram className="text-pink-500 text-2xl" /> },
  { name: "tiktok", label: "TikTok", icon: <SiTiktok className="text-black text-2xl" /> },
  { name: "x", label: "X", icon: <SiX className="text-black text-2xl" /> },
];

const sortByLatestPublished = (items) => {
  const toTime = (value) => {
    const time = value ? new Date(value).getTime() : 0;
    return Number.isNaN(time) ? 0 : time;
  };

  return [...items].sort((a, b) => toTime(b?.published_at) - toTime(a?.published_at));
};

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState("youtube");
  const [news, setNews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const categoryNewsCache = useRef({});
  const [watchLaterItems, setWatchLaterItems] = useState([]);
  const [favouriteItems, setFavouriteItems] = useState([]);
  const fetchCategoryRef = useRef(null); // Track which category is currently being fetched

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [watchLater, favourites] = await Promise.all([
          getWatchLaterNews(),
          getFavouriteNews()
        ]);
        setWatchLaterItems(watchLater || []);
        setFavouriteItems(favourites || []);
      } catch (err) {
        console.error("Error fetching user news data:", err);
      }
    };
    fetchUserData();
  }, []);

  const fetchNews = async (category, isInitial = false) => {
    // Mark this category as the one being fetched
    fetchCategoryRef.current = category;

    if (isInitial) {
      if (categoryNewsCache.current[category]) {
        // Only update if this is still the selected category
        if (fetchCategoryRef.current === category) {
          setNews(categoryNewsCache.current[category]);
        }
        return;
      }
      setLoading(true);
    }
    setError("");

    const startTime = Date.now();
    try {
      const data = await getPlatformNews(category);
      const sortedData = sortByLatestPublished(data || []);
      categoryNewsCache.current[category] = sortedData;
      
      // Only update news if this is still the category being fetched
      if (fetchCategoryRef.current === category) {
        setNews(sortedData);
      }
    } catch (err) {
      // Only update error if this is still the category being fetched
      if (fetchCategoryRef.current === category) {
        setError(err?.message || "Failed to fetch news");
      }
    } finally {
      if (isInitial) {
        const duration = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LOADING_DURATION_MS - duration);
        setTimeout(() => {
          // Only stop loading if this is still the category being fetched
          if (fetchCategoryRef.current === category) {
            setLoading(false);
          }
        }, remaining);
      }
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory, true);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [selectedCategory]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (categoryName) => {
    if (categoryName !== selectedCategory) {
      // Immediately switch to the new category
      setSelectedCategory(categoryName);
      // Mark that we're now fetching this new category
      fetchCategoryRef.current = categoryName;
    }
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

  const visibleNews = news.slice(0, visibleCount);
  const activePlatformTextClass = {
    youtube: "text-red-600",
    facebook: "text-blue-600",
    instagram: "text-pink-600",
    tiktok: "text-slate-900",
    x: "text-slate-900",
  }[selectedCategory] || "text-blue-600";

  return (
    <Motion.div
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fbff_0%,_#eef4ff_35%,_#f5f5f5_70%)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <PrivateNavbar />
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <Motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl"
                style={{ fontFamily: "Cambria, Georgia, 'Times New Roman', serif" }}
              >
                News Categories
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Browse platform-based news feeds and explore the latest updates with a focused, clean reading view.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-slate-600 shadow-sm">
              Active:
              <span className={`ml-1 capitalize ${activePlatformTextClass}`}>{selectedCategory}</span>
            </div>
          </div>
        </Motion.section>

        <Motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                aria-pressed={selectedCategory === category.name}
                className={`group relative isolate overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-300 backdrop-blur-xl sm:px-6 sm:py-3 ${
                  selectedCategory === category.name
                    ? "bg-white/75 text-slate-900 border-white/90 shadow-[0_12px_28px_rgba(30,64,175,0.24)] ring-1 ring-blue-300/40"
                    : "bg-white/50 text-slate-800 border-white/70 shadow-[0_6px_18px_rgba(15,23,42,0.10)] hover:bg-white/75 hover:border-white/90 hover:shadow-[0_12px_26px_rgba(14,116,144,0.22)] hover:-translate-y-0.5"
                }`}
              >
                <span
                  className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/70 via-white/15 to-transparent transition-opacity duration-300 ${
                    selectedCategory === category.name ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  }`}
                />
                <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {category.icon}
                </span>
                <span className="relative z-10 font-semibold text-base tracking-tight sm:text-lg">{category.label}</span>
              </button>
            ))}
          </div>
        </Motion.section>

        {loading && (
          <div className="mt-14 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <Motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-2xl font-semibold text-gray-600">
              No {selectedCategory} news found
            </p>
          </Motion.div>
        )}

        {!loading && !error && news.length > 0 && (
          <>
            <Motion.div
              className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              {visibleNews.map((item, index) => (
                <Motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03, duration: 0.35 }}
                >
                  <NewsCard
                    news={item}
                    watchLaterSaved={isWatchLaterSaved(item)}
                    favouriteSaved={isFavouriteSaved(item)}
                  />
                </Motion.div>
              ))}
            </Motion.div>

            {visibleCount < news.length && (
              <Motion.div
                className="flex justify-center my-8"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.45 }}
              >
                <Motion.button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT)}
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
        )}
      </div>

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
  );
}
