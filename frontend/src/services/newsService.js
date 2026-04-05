const NEWS_API = "http://127.0.0.1:5000/api/news";

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

const isTokenExpiredError = (result) => {
  const message = String(result?.message || result?.error || result?.msg || "").toLowerCase();
  return message.includes("token has expired") || message.includes("signature has expired");
};

const handleExpiredSession = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const getAllNews = async () => {
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

  const successfulNews = responses
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .sort((a, b) => toTimestamp(b.published_at) - toTimestamp(a.published_at));

  if (successfulNews.length > 0) {
    return successfulNews;
  }

  const firstFailure = responses.find((result) => result.status === "rejected");
  throw new Error(firstFailure?.reason?.message || "Failed to fetch news");
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