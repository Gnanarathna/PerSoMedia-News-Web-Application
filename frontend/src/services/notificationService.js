const NOTIFICATIONS_API = "http://127.0.0.1:5000/api/notifications";

const buildAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const parseResponse = async (response, fallbackMessage) => {
  let result = {};

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    throw new Error(result.message || fallbackMessage);
  }

  return result;
};

export const getNotifications = async () => {
  const response = await fetch(NOTIFICATIONS_API, {
    headers: buildAuthHeaders(),
  });
  const result = await parseResponse(response, "Failed to fetch notifications");

  return Array.isArray(result.data) ? result.data : [];
};

export const markAsRead = async (id) => {
  const response = await fetch(`${NOTIFICATIONS_API}/${id}/read`, {
    method: "PATCH",
    headers: buildAuthHeaders(),
  });

  return parseResponse(response, "Failed to mark notification as read");
};

export const removeNotification = async (id) => {
  const response = await fetch(`${NOTIFICATIONS_API}/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  return parseResponse(response, "Failed to remove notification");
};

export const clearAllNotifications = async () => {
  const response = await fetch(NOTIFICATIONS_API, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  return parseResponse(response, "Failed to clear notifications");
};

export const getUnreadNotificationCount = async () => {
  const notifications = await getNotifications();
  return notifications.filter((item) => !item.is_read).length;
};
