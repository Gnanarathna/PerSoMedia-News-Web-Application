import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Categories from "../pages/Categories";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import WatchLater from "../pages/WatchLater";
import Favourites from "../pages/Favourites";
import Notifications from "../pages/Notifications";
import FakeDetect from "../pages/FakeDetect";
import Analytics from "../pages/Analytics";
import Profile from "../pages/Profile";
import AccountSettings from "../pages/AccountSettings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
            <WatchLater />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard/favorites"
        element={(
          <ProtectedRoute>
            <Favourites />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/notifications"
        element={(
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/detect"
        element={(
          <ProtectedRoute>
            <FakeDetect />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/analytics"
        element={(
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/account-settings"
        element={(
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}