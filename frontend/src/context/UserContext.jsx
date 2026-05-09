import { createContext, useContext, useState, useCallback } from "react";
import { getCurrentUser } from "../services/authService";

const UserContext = createContext();

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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
