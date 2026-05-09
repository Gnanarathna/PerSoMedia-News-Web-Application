const API_BASE_URL = "http://127.0.0.1:5000/api/auth";
const BACKEND_BASE_URL = "http://127.0.0.1:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Convert relative image URLs to full URLs
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // If it's already a full URL, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // If it's a relative URL, prepend the backend base URL
  if (imageUrl.startsWith("/")) {
    return `${BACKEND_BASE_URL}${imageUrl}`;
  }
  return imageUrl;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
};

export const googleLoginUser = async (idToken) => {
  const response = await fetch(`${API_BASE_URL}/google-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_token: idToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Google login failed");
  }

  return data;
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user data");
  }

  // Convert relative image URL to full URL
  if (data.image) {
    data.image = getFullImageUrl(data.image);
  }

  return data;
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/update-profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update profile");
  }

  // Convert relative image URL to full URL
  if (data.image) {
    data.image = getFullImageUrl(data.image);
  }

  return data;
};

export const changePassword = async (passwordData) => {
  const response = await fetch(`${API_BASE_URL}/change-password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to change password");
  }

  return data;
};

export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/upload-photo`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload photo");
  }

  // Convert relative image URL to full URL
  if (data.image) {
    data.image = getFullImageUrl(data.image);
  }
  if (data.image_url) {
    data.image_url = getFullImageUrl(data.image_url);
  }

  return data;
};

export const deleteAccount = async (deleteData) => {
  const response = await fetch(`${API_BASE_URL}/delete-account`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify(deleteData || {}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete account");
  }

  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to process forgot password request");
  }

  return data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }

  return data;
};