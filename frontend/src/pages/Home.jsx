import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { getPlatformNews } from "../services/newsService";
import { hasValidSessionToken } from "../utils/authToken";
import { FaYoutube, FaFacebook, FaInstagram, FaStar, FaRegStar, FaClock, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { SiTiktok, SiX } from "react-icons/si";

const CATEGORIES_LIST = [
  { name: "youtube", label: "YouTube", icon: <FaYoutube className="text-red-500 text-2xl" /> },
  { name: "facebook", label: "Facebook", icon: <FaFacebook className="text-blue-600 text-2xl" /> },
  { name: "instagram", label: "Instagram", icon: <FaInstagram className="text-pink-500 text-2xl" /> },
  { name: "tiktok", label: "TikTok", icon: <SiTiktok className="text-black text-2xl" /> },
  { name: "x", label: "X", icon: <SiX className="text-black text-2xl" /> },
];

const FEATURES = [
  {
    icon: "/images/earth_icon.png",
    title: "All Viral News in One Place",
    description: "View trending stories from Facebook, TikTok, YouTube, Instagram and X"
  },
  {
    icon: "/images/guard_icon.png",
    title: "Fake News Detection",
    description: "Instantly identify real versus fake news using advanced AI analysis"
  },
  {
    icon: "/images/star_icon.png",
    title: "Personalized Feed",
    description: "Get news recommendations based on what you like and read most"
  }
];

function CategoryNewsCard({ news }) {
  const [showMessage, setShowMessage] = useState(null);
  const isAuthenticated = hasValidSessionToken();
  const [checking, setChecking] = useState(false);

  const platformIcons = {
    youtube: <FaYoutube className="text-red-500 text-2xl" />,
    facebook: <FaFacebook className="text-blue-600 text-2xl" />,
    instagram: <FaInstagram className="text-pink-500 text-2xl" />,
    tiktok: <SiTiktok className="text-black text-2xl" />,
    x: <SiX className="text-black text-2xl" />,
  };

  const fallbackThumbnail = "https://via.placeholder.com/300x150";
  const fallbackSourceUrl = news.source_url || news.url || "https://example.com";

  const handleViewNews = () => {
    window.open(fallbackSourceUrl, "_blank", "noopener,noreferrer");
  };

  const handleProtectedAction = (action) => {
    if (!isAuthenticated) {
      setShowMessage(`Please login to ${action}`);
      setTimeout(() => setShowMessage(null), 2000);
    }
  };

  const handleCheckNews = async () => {
    if (!isAuthenticated) {
      handleProtectedAction("check news");
      return;
    }

    try {
      setChecking(true);
      // You can add the actual check news API call here
      alert("News verification feature available after login");
    } catch (error) {
      console.error("Error checking news:", error);
    } finally {
      setChecking(false);
    }
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
    if (diffHours >= 1) return `${diffHours}h ago`;
    if (diffMinutes >= 1) return `${diffMinutes}m ago`;
    return "Now";
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-200 h-40">
        <img
          src={news.image_url || news.thumbnail_url || fallbackThumbnail}
          alt={news.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = fallbackThumbnail)}
        />
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full p-2">
          {platformIcons[news.platform?.toLowerCase()] || platformIcons.youtube}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col h-60">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 flex-grow">
          {news.title}
        </h3>

        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
          <FaClock className="text-xs" />
          {formatTimeAgo(news.published_at)}
        </p>

        {/* View Button */}
        <button
          onClick={handleViewNews}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded mb-2 transition"
        >
          View News
        </button>

        {/* Login Required Message */}
        {showMessage && (
          <p className="text-red-500 text-xs text-center mb-2 h-4 leading-none">
            {showMessage}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1 justify-between text-xs">
          <button
            onClick={() => handleProtectedAction("save to watch later")}
            className="flex-1 flex items-center justify-center gap-1 text-gray-600 hover:text-blue-600 transition py-1"
            title="Watch Later"
          >
            <FaClock /> Later
          </button>
          <button
            onClick={() => handleProtectedAction("add to favourites")}
            className="flex-1 flex items-center justify-center gap-1 text-gray-600 hover:text-amber-500 transition py-1"
            title="Favorite"
          >
            <FaRegStar /> Like
          </button>
          <button
            onClick={handleCheckNews}
            disabled={checking}
            className="flex-1 flex items-center justify-center gap-1 text-gray-600 hover:text-green-600 transition py-1 disabled:opacity-50"
            title="Check if real or fake"
          >
            ✓ Check
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="rounded-2xl p-8 text-center bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(59,130,246,0.22),inset_0_1px_0_rgba(255,255,255,0.6)]"
    >
      <img src={icon} alt={title} width="56" height="56" className="mx-auto mb-4" />
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-gray-700 text-sm">{description}</p>
    </Motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const homeRef = useRef(null);
  const [categoryNews, setCategoryNews] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [carouselIndices, setCarouselIndices] = useState({});
  const CARDS_PER_VIEW = 4;

  // Expose scroll to top function globally
  useEffect(() => {
    window.scrollToHomeTop = () => {
      if (homeRef.current) {
        homeRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    return () => {
      delete window.scrollToHomeTop;
    };
  }, []);

  useEffect(() => {
    const fetchCategoryNews = async () => {
      try {
        setLoadingCategories(true);
        const newsData = {};
        
        for (const category of CATEGORIES_LIST) {
          try {
            const news = await getPlatformNews(category.name);
            newsData[category.name] = Array.isArray(news) ? news.slice(0, 12) : [];
          } catch (error) {
            console.error(`Error fetching ${category.name} news:`, error);
            newsData[category.name] = [];
          }
        }
        
        setCategoryNews(newsData);
        // Initialize carousel indices for each category
        const indices = {};
        CATEGORIES_LIST.forEach((cat) => {
          indices[cat.name] = 0;
        });
        setCarouselIndices(indices);
      } catch (error) {
        console.error("Error fetching category news:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoryNews();
  }, []);

  // Auto-scroll carousel every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndices((prevIndices) => {
        const newIndices = { ...prevIndices };
        CATEGORIES_LIST.forEach((category) => {
          const newsCount = categoryNews[category.name]?.length || 0;
          const maxIndex = Math.max(0, newsCount - CARDS_PER_VIEW);
          newIndices[category.name] = (newIndices[category.name] + 1) % (maxIndex + 1 || 1);
        });
        return newIndices;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [categoryNews]);

  const handleCarouselMove = (categoryName, direction) => {
    setCarouselIndices((prevIndices) => {
      const newsCount = categoryNews[categoryName]?.length || 0;
      const maxIndex = Math.max(0, newsCount - CARDS_PER_VIEW);
      let newIndex = prevIndices[categoryName] || 0;

      if (direction === "left") {
        newIndex = (newIndex + 1) % (maxIndex + 1 || 1);
      } else if (direction === "right") {
        newIndex = (newIndex - 1 + (maxIndex + 1)) % (maxIndex + 1 || 1);
      }

      return { ...prevIndices, [categoryName]: newIndex };
    });
  };

  return (
    <Motion.div
      ref={homeRef}
      className="min-h-screen bg-white flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <Motion.section
        className="text-center px-6 py-12 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <Motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4"
        >
          Stay Updated with Trending <br />Viral News
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-700 text-lg font-semibold mb-8"
        >
          Create an account to access the full features of PerSoMedia News
        </Motion.p>

        <Motion.div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-12">
          <Motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold shadow-lg"
          >
            I Don't have an Account
          </Motion.button>

          <Motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-100 px-8 py-3 rounded-lg text-base font-semibold shadow-md"
          >
            Already have an Account
          </Motion.button>
        </Motion.div>
      </Motion.section>

      <Motion.div
        className="bg-gradient-to-b from-blue-100 to-blue-50 opacity-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Motion.section
          className="px-6 pb-24 flex-1"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-4xl font-bold text-center mb-16"
          >
            <br />
            Why Use PerSoMedia News?
          </Motion.h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-16 max-w-6xl mx-auto px-4">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </Motion.section>

        {/* Categories Section */}
        <Motion.section
          id="categories-section"
          className="px-6 py-24 flex-1 bg-gradient-to-b from-blue-100 to-blue-50"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          {/* Hero Section for Categories */}
          <div className="max-w-5xl mx-auto mb-16">
            <Motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
                Explore News by Category
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Dive into trending stories from your favorite social media platforms. Browse YouTube, Facebook, Instagram, TikTok, and X all in one place. Stay informed with curated content tailored to each platform's latest viral moments.
              </p>
            </Motion.div>

            {/* Category Stats */}
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              {CATEGORIES_LIST.map((category) => (
                <div key={category.name} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
                  <div className="flex justify-center mb-2">
                    {category.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{category.label}</p>
                </div>
              ))}
            </Motion.div>
          </div>

          {/* News Categories Grid */}
          <div className="max-w-7xl mx-auto">
            {loadingCategories ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading news...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {CATEGORIES_LIST.map((category) => {
                  const news = categoryNews[category.name] || [];
                  const currentIndex = carouselIndices[category.name] || 0;
                  const visibleNews = news.slice(currentIndex, currentIndex + CARDS_PER_VIEW);

                  return (
                    <Motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        {category.icon}
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{category.label}</h3>
                      </div>

                      {/* Mobile: horizontal scroll-snap strip */}
                      <div className="md:hidden">
                        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: "none" }}>
                          {news.length > 0 ? news.map((newsItem) => (
                            <div
                              key={newsItem._id || newsItem.source_url}
                              className="flex-shrink-0 w-[75vw] max-w-[280px] snap-start"
                            >
                              <CategoryNewsCard news={newsItem} />
                            </div>
                          )) : (
                            <p className="text-gray-600 py-8">No news available for this category</p>
                          )}
                        </div>
                      </div>

                      {/* Desktop: arrow carousel */}
                      <div className="hidden md:flex items-center gap-4">
                        {/* Left Arrow Button */}
                        <Motion.button
                          onClick={() => handleCarouselMove(category.name, "right")}
                          className="flex-shrink-0 h-12 w-12 inline-flex items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-50"
                          whileHover={{ y: -2, scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          title="Previous"
                        >
                          <span className="text-xl font-bold">←</span>
                        </Motion.button>

                        {/* Carousel Content with Animation */}
                        <div className="flex-grow overflow-hidden">
                          <AnimatePresence mode="wait">
                            <Motion.div
                              key={currentIndex}
                              initial={{ opacity: 0, x: 100 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -100 }}
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                              {visibleNews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  {visibleNews.map((newsItem, idx) => (
                                    <Motion.div
                                      key={newsItem._id || newsItem.source_url}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                                    >
                                      <CategoryNewsCard news={newsItem} />
                                    </Motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <p className="text-gray-600">No news available for this category</p>
                                </div>
                              )}
                            </Motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Right Arrow Button */}
                        <Motion.button
                          onClick={() => handleCarouselMove(category.name, "left")}
                          className="flex-shrink-0 h-12 w-12 inline-flex items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-50"
                          whileHover={{ y: -2, scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          title="Next"
                        >
                          <span className="text-xl font-bold">→</span>
                        </Motion.button>
                      </div>
                    </Motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </Motion.section>

        <Motion.section
          id="about-section"
          className="px-6 py-12 flex-1 bg-gradient-to-b from-blue-50 to-blue-100"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="mb-8">
              <Motion.div
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
                  About Us
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Empowering millions with accurate, timely, and personalized news from the world's most influential social media platforms
                </p>
              </Motion.div>

              <Motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 grid md:grid-cols-3 gap-8"
              >
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
                  <p className="text-gray-700 font-semibold">Sources Monitored</p>
                  <p className="text-gray-600 text-sm mt-2">Aggregating news from major platforms</p>
                </div>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="text-4xl font-bold text-blue-600 mb-2">AI-Powered</div>
                  <p className="text-gray-700 font-semibold">Fake News Detection</p>
                  <p className="text-gray-600 text-sm mt-2">Advanced algorithms verify authenticity</p>
                </div>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="text-4xl font-bold text-blue-600 mb-2">Personalized</div>
                  <p className="text-gray-700 font-semibold">Smart Feed</p>
                  <p className="text-gray-600 text-sm mt-2">Curated content based on your interests</p>
                </div>
              </Motion.div>
            </div>

            {/* About Content */}
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6 text-gray-700 text-lg leading-relaxed"
            >
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p>
                  PerSoMedia News is a revolutionary platform designed to keep you informed about the trending viral news across all major social media platforms including Facebook, TikTok, YouTube, Instagram, and X (formerly Twitter). We aggregate content from diverse sources to bring you a comprehensive view of what's happening in the world.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fighting Misinformation</h3>
                <p>
                  Our mission is to combat misinformation and fake news by providing advanced AI-powered detection tools that help you distinguish between real and fake news instantly. We believe that accurate information is crucial in today's digital age, and we're committed to helping you stay informed with confidence. Every story is analyzed and verified using our cutting-edge technology.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Personalized Experience</h3>
                <p>
                  With PerSoMedia News, you get more than just news aggregation. Our intelligent algorithm learns your preferences and reading habits to deliver a personalized feed tailored just for you. Whether you're interested in technology, entertainment, politics, or current events, we've got you covered with content that matters to you.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
                <p className="text-lg font-semibold text-blue-900 text-center">
                  Join thousands of users who trust PerSoMedia News to deliver accurate, timely, and personalized news from across the social media landscape.
                </p>
              </div>
            </Motion.div>
          </div>
        </Motion.section>

        <Footer />
      </Motion.div>
    </Motion.div>
  );
}