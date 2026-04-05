import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  const hidePublicNavbar = pathname.startsWith("/dashboard");

  return (
    <div>
      {!hidePublicNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
}