const NEWS_API = "http://127.0.0.1:5000/api/news";
const ALL_NEWS_CACHE_TTL_MS = 5 * 60 * 1000;
const PLATFORM_NEWS_CACHE_TTL_MS = 5 * 60 * 1000;
let allNewsCache = null;
let allNewsInFlight = null;
const platformNewsCache = new Map();
const platformNewsInFlight = new Map();

const LIVE_NEWS_ENDPOINTS = [
  { path: "/youtube/trending", platform: "youtube" },
  { path: "/platform/facebook", platform: "facebook" },
  { path: "/instagram/trending", platform: "instagram" },
  { path: "/tiktok/trending", platform: "tiktok" },
  { path: "/x/trending", platform: "x" },
];

const normalizeNewsItem = (item, fallbackPlatform) => ({
  ...item,
  platform: item.platform || fallbackPlatform,
  title: item.title || "Untitled news",
  image_url: item.image_url || item.urlToImage || item.image || "",
  published_at: item.published_at || item.publishedAt || null,
  real_score: item.real_score ?? 0,
  fake_score: item.fake_score ?? 0,
  is_checked: Boolean(item.is_checked),
});

const toTimestamp = (value) => {
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const dedupeNewsItems = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const sourceUrl = String(item.source_url || "").trim().toLowerCase();
    const title = String(item.title || "").trim().toLowerCase();
    const platform = String(item.platform || "").trim().toLowerCase();
    const publishedAt = String(item.published_at || "").trim();

    const key = sourceUrl || `${platform}|${title}|${publishedAt}`;
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const isTokenExpiredError = (result) => {
  const message = String(result?.message || result?.error || result?.msg || "").toLowerCase();
  return message.includes("token has expired") || message.includes("signature has expired");
};

const handleExpiredSession = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const getAllNews = async () => {
  const now = Date.now();
  if (allNewsCache && allNewsCache.expiresAt > now) {
    return allNewsCache.items;
  }

  if (allNewsInFlight) {
    return allNewsInFlight;
  }

  const request = (async () => {
  const responses = await Promise.allSettled(
    LIVE_NEWS_ENDPOINTS.map(async ({ path, platform }) => {
      const response = await fetch(`${NEWS_API}${path}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to fetch ${platform} news`);
      }

      const items = Array.isArray(result.data) ? result.data : [];
      return items.map((item) => normalizeNewsItem(item, platform));
    })
  );

  const successfulNews = dedupeNewsItems(
    responses
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
  ).sort((a, b) => toTimestamp(b.published_at) - toTimestamp(a.published_at));

  if (successfulNews.length > 0) {
    allNewsCache = {
      items: successfulNews,
      expiresAt: Date.now() + ALL_NEWS_CACHE_TTL_MS,
    };

    return successfulNews;
  }

  const firstFailure = responses.find((result) => result.status === "rejected");
  throw new Error(firstFailure?.reason?.message || "Failed to fetch news");
  })();

  allNewsInFlight = request;

  try {
    return await request;
  } finally {
    allNewsInFlight = null;
  }
};

export const getPlatformNews = async (platform) => {
  const platformKey = String(platform || "").trim().toLowerCase();
  if (!platformKey) {
    throw new Error("Platform is required");
  }

  const now = Date.now();
  const cached = platformNewsCache.get(platformKey);
  if (cached && cached.expiresAt > now) {
    return cached.items;
  }

  const inFlightRequest = platformNewsInFlight.get(platformKey);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request = (async () => {
    const response = await fetch(`${NEWS_API}/platform/${platformKey}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch platform news");
    }

    const items = Array.isArray(result.data) ? result.data : [];
    const filteredItems = items.filter((item) => {
      const imageUrl = String(item?.image_url || item?.urlToImage || item?.image || "").trim();
      return /^https?:\/\//i.test(imageUrl);
    });

    platformNewsCache.set(platformKey, {
      items: filteredItems,
      expiresAt: Date.now() + PLATFORM_NEWS_CACHE_TTL_MS,
    });

    return filteredItems;
  })();

  platformNewsInFlight.set(platformKey, request);

  try {
    return await request;
  } finally {
    platformNewsInFlight.delete(platformKey);
  }
};

export const analyzeNews = async (newsItem) => {
  const response = await fetch("http://127.0.0.1:5000/api/fake-detection/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: newsItem.title,
      content: newsItem.content || newsItem.title,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to analyze news");
  }

  return result.data;
};

export const addToWatchLater = async (newsItem) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in first");
  }

  const response = await fetch(`${NEWS_API}/watch-later`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newsItem),
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    if (isTokenExpiredError(result)) {
      handleExpiredSession();
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(result.message || result.error || result.msg || "Failed to save to watch later");
  }

  return result;
};

export const addToFavourite = async (newsItem) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in first");
  }

  const response = await fetch(`${NEWS_API}/favourites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newsItem),
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    if (isTokenExpiredError(result)) {
      handleExpiredSession();
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(result.message || result.error || result.msg || "Failed to save to favourites");
  }

  return result;
};

export const removeFromWatchLater = async (newsId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in first");
  }

  const response = await fetch(`${NEWS_API}/watch-later/${encodeURIComponent(newsId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    if (isTokenExpiredError(result)) {
      handleExpiredSession();
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(result.message || result.error || result.msg || "Failed to remove from watch later");
  }

  return result;
};

export const removeFromFavourite = async (newsId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in first");
  }

  const response = await fetch(`${NEWS_API}/favourites/${encodeURIComponent(newsId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    if (isTokenExpiredError(result)) {
      handleExpiredSession();
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(result.message || result.error || result.msg || "Failed to remove from favourites");
  }

  return result;
};