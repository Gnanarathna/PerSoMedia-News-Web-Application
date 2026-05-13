import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

export default function App() {
  const { pathname } = useLocation();
  const hideNavbar =
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/notifications") || 
    pathname.startsWith("/detect") || 
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/account-settings");

  return (
    <UserProvider>
      <div>
        {!hideNavbar && <Navbar />}
        <AppRoutes />
      </div>
    </UserProvider>
  );
}