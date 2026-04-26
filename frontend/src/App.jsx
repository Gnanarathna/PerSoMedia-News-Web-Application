import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  const hideNavbar =
    pathname.startsWith("/dashboard") || pathname.startsWith("/notifications") || pathname.startsWith("/detect") || pathname.startsWith("/analytics");

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
}