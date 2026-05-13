const API = "http://127.0.0.1:5000/api/analytics";

const buildAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const getData = async (endpoint) => {
  const response = await fetch(`${API}/${endpoint}`, {
    headers: buildAuthHeaders(),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch analytics");
  }

  return result.data;
};

export const getPlatformUsage = () =>
  getData("platform-usage");

export const getFakeRealStats = () =>
  getData("fake-real-stats");

export const getCheckedByPlatform = () =>
  getData("checked-by-platform");

export const getTopFakeNews = () =>
  getData("top-fake-news");

export const getRecentAnalyzedNews = () =>
  getData("recent-analyzed-news");

export const getPersonalizedAnalytics = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    "http://127.0.0.1:5000/api/analytics/personalized",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const result = await res.json();

  return result.data;
};