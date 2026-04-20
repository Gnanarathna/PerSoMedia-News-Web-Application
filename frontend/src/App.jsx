import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  const hidePublicNavbar =
    pathname.startsWith("/dashboard") || pathname.startsWith("/notifications");

  return (
    <div>
      {!hidePublicNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
}