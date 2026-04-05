import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Categories from "../pages/Categories";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard/categories"
        element={(
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard/detect"
        element={(
          <ProtectedRoute>
            <Dashboard view="detect" />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard/watchlater"
        element={(
          <ProtectedRoute>
            <Dashboard view="watchlater" />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard/favorites"
        element={(
          <ProtectedRoute>
            <Dashboard view="favorites" />
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}