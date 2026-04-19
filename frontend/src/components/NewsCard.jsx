import {
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaStar,
  FaRegStar,
  FaClock,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { SiTiktok, SiX } from "react-icons/si";
import { useEffect, useState } from "react";
import {
  addToWatchLater,
  addToFavourite,
  removeFromWatchLater,
  removeFromFavourite,
  analyzeNews,
} from "../services/newsService";

export default function NewsCard({
  news,
  watchLaterMode = false,
  watchLaterSaved = false,
  favouriteSaved = false,
  onWatchLaterRemoved,
  favouriteMode = false,
  onFavouriteRemoved,
}) {
  const [savedWatchLater, setSavedWatchLater] = useState(watchLaterMode || watchLaterSaved);
  const [savedFavourite, setSavedFavourite] = useState(favouriteMode || favouriteSaved);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setSavedWatchLater(watchLaterMode || watchLaterSaved);
  }, [watchLaterMode, watchLaterSaved]);

  useEffect(() => {
    setSavedFavourite(favouriteMode || favouriteSaved);
  }, [favouriteMode, favouriteSaved]);

  const [analysis, setAnalysis] = useState({
    is_checked: news.is_checked || false,
    real_score: news.real_score ?? 0,
    fake_score: news.fake_score ?? 0,
    explanation: news.explanation || "",
  });

  const platformIcons = {
    youtube: <FaYoutube className="text-red-500 text-3xl" />,
    facebook: <FaFacebook className="text-blue-600 text-3xl" />,
    instagram: <FaInstagram className="text-pink-500 text-3xl" />,
    tiktok: <SiTiktok className="text-black text-3xl" />,
    x: <SiX className="text-black text-3xl" />,
  };

  const realScore = analysis.real_score ?? 0;
  const fakeScore = analysis.fake_score ?? 0;
  const isChecked = analysis.is_checked;

  const fallbackNewsId = news._id || news.news_id || news.source_url || `${news.platform || "news"}-${news.title || "untitled"}`;
  const fallbackThumbnail = "https://via.placeholder.com/300x150";
  const fallbackSourceUrl = news.source_url || news.url || "https://example.com";

  const formattedPayload = {
    news_id: news._id || news.news_id || fallbackNewsId,
    platform: news.platform || "unknown",
    title: news.title || "Untitled News",
    url: news.source_url || news.url || fallbackSourceUrl,
    thumbnail_url: news.image_url || news.thumbnail_url || fallbackThumbnail,
    published_at: news.published_at || null,
  };

  const handleViewNews = () => {
    const targetUrl = news.source_url || news.url;
    if (!targetUrl) return;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const formatTimeAgo = (publishedAt) => {
    if (!publishedAt) return "Just now";

    const date = new Date(publishedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays >= 1) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    if (diffHours >= 1) return `${diffHours} hours ago`;
    if (diffMinutes >= 1) return `${diffMinutes} minutes ago`;
    return "Just now";
  };

  const handleWatchLater = async () => {
    try {
      if (savedWatchLater) {
        await removeFromWatchLater(formattedPayload.news_id);
        setSavedWatchLater(false);
        if (watchLaterMode && typeof onWatchLaterRemoved === "function") {
          onWatchLaterRemoved(formattedPayload.news_id);
        }
        alert("Removed from Watch Later");
        return;
      }

      await addToWatchLater(formattedPayload);
      setSavedWatchLater(true);
      alert("Saved to Watch Later");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleFavourite = async () => {
    try {
      if (savedFavourite) {
        await removeFromFavourite(formattedPayload.news_id);
        setSavedFavourite(false);
        if (favouriteMode && typeof onFavouriteRemoved === "function") {
          onFavouriteRemoved(formattedPayload.news_id);
        }
        alert("Removed from Favourites");
        return;
      }

      await addToFavourite(formattedPayload);
      setSavedFavourite(true);
      alert("Saved to Favourites");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCheckNews = async () => {
    try {
      setChecking(true);

      const result = await analyzeNews(news);

      setAnalysis({
        is_checked: true,
        real_score: result.real_score ?? 0,
        fake_score: result.fake_score ?? 0,
        explanation: result.explanation || "",
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-[#F3F3F3] rounded-2xl p-4 shadow-sm border border-gray-300 w-full">
      <div className="flex items-center gap-2 mb-3 text-2xl font-medium">
        {platformIcons[news.platform?.toLowerCase()] || <FaYoutube className="text-red-500 text-3xl" />}
        <span className="capitalize">{news.platform || "News"}</span>
      </div>

      <img
        src={news.image_url || news.thumbnail_url || "https://via.placeholder.com/300x150"}
        alt={news.title}
        className="rounded-lg mb-3 w-full h-[125px] object-cover"
      />

      <h3 className="text-[18px] font-medium leading-snug mb-2 line-clamp-2 min-h-[56px]">
        {news.title}
      </h3>

      <div className="flex items-center gap-2 text-gray-500 text-[16px] mb-3">
        <FaClock className="text-sm" />
        <span>{formatTimeAgo(news.published_at)}</span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleViewNews}
          className="px-4 py-1 rounded-md text-sm font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
        >
          View News
        </button>

        <button
          type="button"
          onClick={handleCheckNews}
          disabled={checking}
          className={`px-5 py-1 rounded-md text-white text-sm font-semibold ${
            isChecked ? "bg-blue-600" : "bg-gray-500"
          }`}
        >
          {checking ? "Checking..." : isChecked ? "Checked" : "Check"}
        </button>
      </div>

      <div className="mb-3 h-[110px] overflow-hidden">
        {isChecked ? (
          <>
            <div className="w-full h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-2"
                style={{ width: `${realScore}%` }}
              />
              <div
                className="bg-red-400 h-2"
                style={{ width: `${fakeScore}%` }}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Real: {realScore}%</span>
              <span>Fake: {fakeScore}%</span>
            </div>

            {analysis.explanation && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">
                {analysis.explanation}
              </p>
            )}
          </>
        ) : (
          <div className="h-full rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-3 py-2 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Click Check to analyze this news and view real vs fake score.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3">
        <button
          type="button"
          onClick={handleWatchLater}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold transition-all shadow-sm ${
            savedWatchLater
              ? watchLaterMode
                ? "bg-red-100 border-red-300 text-red-800 hover:bg-red-200 hover:border-red-400"
                : "bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400"
              : "bg-white border-slate-300 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          } ${favouriteMode ? "whitespace-nowrap text-xs px-3" : ""}`}
        >
          {savedWatchLater ? (
            watchLaterMode ? (
              <FaBookmark className="text-red-700" />
            ) : (
              <FaBookmark className="text-green-700" />
            )
          ) : (
            <FaRegBookmark className="text-blue-600" />
          )}
          {savedWatchLater ? (watchLaterMode ? "Remove from Watch Later" : "Saved") : "Save to Watch Later"}
        </button>

        {favouriteMode ? (
          <button
            type="button"
            onClick={handleFavourite}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all hover:bg-rose-50 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
            aria-label="Remove from favourites"
          >
            <FaStar className="text-rose-500" />
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFavourite}
            className="transition-transform hover:scale-105"
            aria-label={savedFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            {savedFavourite ? (
              <FaStar className="text-yellow-500 text-xl cursor-pointer" />
            ) : (
              <FaRegStar className="text-gray-500 text-xl cursor-pointer" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}