const FAKE_DETECTION_API = "http://127.0.0.1:5000/api/fake-detection";

const parseJson = async (response) => {
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Could not analyze news.");
  }

  return data;
};

const buildAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const analyzeFakeNews = async ({ title, content }) => {
  const response = await fetch(`${FAKE_DETECTION_API}/analyze`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ title, content }),
  });

  const result = await parseJson(response);
  window.dispatchEvent(new Event("notifications:changed"));
  return result.data || {};
};

export const getFakeDetectionHistory = async () => {
  const response = await fetch(`${FAKE_DETECTION_API}/history`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  const result = await parseJson(response);
  return Array.isArray(result.data) ? result.data : [];
};

export const deleteFakeDetectionHistoryItem = async (historyId) => {
  const response = await fetch(`${FAKE_DETECTION_API}/history/${encodeURIComponent(historyId)}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  const result = await parseJson(response);
  return result.data || {};
};

export const clearFakeDetectionHistory = async () => {
  const response = await fetch(`${FAKE_DETECTION_API}/history`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  const result = await parseJson(response);
  return result.data || {};
};
