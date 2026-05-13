import { useState, useCallback } from "react";
import { getCurrentUser } from "../services/authService";
import { UserContext } from "./useUser";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setUserLoading(true);
    await fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, setUser, userLoading, fetchUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
