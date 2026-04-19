import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { FaChevronUp } from "react-icons/fa";
import PrivateNavbar from "../components/PrivateNavbar";
import NewsCard from "../components/NewsCard";
import { getFavouriteNews, getWatchLaterNews } from "../services/newsService";

const INITIAL_VISIBLE_NEWS = 24;
const LOAD_MORE_STEP = 20;

export default function Favourites() {
  const [favouriteNews, setFavouriteNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleNewsCount, setVisibleNewsCount] = useState(INITIAL_VISIBLE_NEWS);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [watchLaterItems, setWatchLaterItems] = useState([]);

  const visibleNews = favouriteNews.slice(0, visibleNewsCount);

  const handleRemovedFromFavourites = (newsId) => {
    setFavouriteNews((currentNews) =>
      currentNews.filter((item) => (item.news_id || item._id) !== newsId)
    );
  };

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const [favouritesData, watchLaterData] = await Promise.all([
          getFavouriteNews(),
          getWatchLaterNews(),
        ]);

        setFavouriteNews(Array.isArray(favouritesData) ? favouritesData : []);
        setWatchLaterItems(Array.isArray(watchLaterData) ? watchLaterData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_48%,_#e5e7eb_100%)]">
      <PrivateNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-6">
          <h1
            className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Favourites
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Review the stories you marked as favourites and revisit them anytime.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-red-600 shadow-sm">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && favouriteNews.length === 0 && (
          <div className="mt-10 rounded-[28px] border border-slate-200 bg-white/90 px-8 py-16 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-3xl text-amber-700 shadow-sm">
                <span>*</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">No favourite news yet</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Favourite stories will appear here after you tap the star button on any news card.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && favouriteNews.length > 0 && (
          <>
            <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {visibleNews.map((item, index) => (
                <NewsCard
                  key={item.news_id || item._id || index}
                  news={item}
                  watchLaterSaved={isWatchLaterSaved(item)}
                  favouriteMode
                  onFavouriteRemoved={handleRemovedFromFavourites}
                />
              ))}
            </div>

            {visibleNewsCount < favouriteNews.length && (
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
      </div>
    </div>
  );
}
