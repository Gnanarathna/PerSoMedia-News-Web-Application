export const isTokenValid = (token) => {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  try {
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    if (!payload || typeof payload !== "object") {
      return false;
    }

    // If exp is missing, treat token as valid to avoid breaking existing sessions.
    if (!payload.exp) {
      return true;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return Number(payload.exp) > nowInSeconds;
  } catch {
    return false;
  }
};

export const hasValidSessionToken = () => {
  const token = localStorage.getItem("token");
  const valid = isTokenValid(token);

  if (!valid && token) {
    localStorage.removeItem("token");
  }

  return valid;
};
