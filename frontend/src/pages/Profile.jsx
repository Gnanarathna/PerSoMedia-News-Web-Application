import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PrivateNavbar from "../components/PrivateNavbar";
import { FaArrowRight, FaUserCircle, FaMailBulk, FaCalendarAlt } from "react-icons/fa";
import { getCurrentUser } from "../services/authService";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [hasOriginalImage, setHasOriginalImage] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setHasOriginalImage(!!userData.image);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <PrivateNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <PrivateNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <PrivateNavbar />

      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl px-4 py-8"
      >
        {/* Profile Header Card */}
        <Motion.div
          className="rounded-2xl border border-blue-200 bg-white shadow-lg overflow-hidden"
          whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)" }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600" />

          {/* Profile Content */}
          <div className="relative px-4 sm:px-8 pb-8 pt-0">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <Motion.div
                className="relative -mt-16 mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  onClick={() => user?.image && setIsPhotoPreviewOpen(true)}
                  className="block rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer"
                  aria-label="Preview profile picture"
                >
                  {user?.image && !imageError ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-32 w-32 rounded-full border-4 border-white bg-blue-100 object-cover shadow-lg"
                      onError={() => {
                        console.error("Image failed to load:", user.image);
                        setImageError(true);
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", user.image);
                      }}
                    />
                  ) : hasOriginalImage && imageError ? (
                    // User had a picture but it failed to load - show placeholder
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                      <FaUserCircle className="text-5xl text-gray-400" />
                    </div>
                  ) : !hasOriginalImage ? (
                    // User never had a picture - show initials
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Loading state
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-blue-50 shadow-lg">
                      <Motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-6 w-6 rounded-full border-3 border-blue-200 border-t-blue-600"
                      />
                    </div>
                  )}
                </button>
              </Motion.div>

              {/* User Info */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{user?.name || "User"}</h1>
              <p className="mt-1 text-sm text-slate-500">Member Profile</p>

              {/* Info Grid */}
              <div className="mt-8 grid w-full gap-6 sm:grid-cols-2">
                {/* Email */}
                <Motion.div
                  className="flex items-center gap-3 rounded-lg bg-blue-50 p-4"
                  whileHover={{ backgroundColor: "rgb(240, 249, 255)" }}
                >
                  <FaMailBulk className="text-xl text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                    <p className="text-sm font-medium text-slate-800 break-all">{user?.email || "N/A"}</p>
                  </div>
                </Motion.div>

                {/* Joined Date */}
                <Motion.div
                  className="flex items-center gap-3 rounded-lg bg-blue-50 p-4"
                  whileHover={{ backgroundColor: "rgb(240, 249, 255)" }}
                >
                  <FaCalendarAlt className="text-xl text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Joined</p>
                    <p className="text-sm font-medium text-slate-800">
                      {formatDate(user?.created_at)}
                    </p>
                  </div>
                </Motion.div>
              </div>

              {/* Edit Profile Button */}
              <Motion.button
                onClick={() => navigate("/account-settings")}
                className="mt-8 flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-md transition hover:shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit Profile
                <FaArrowRight className="text-sm" />
              </Motion.button>
            </div>
          </div>
        </Motion.div>

        {/* Quick Info */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-600">Account Status</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-600">Email Verified</span>
              <span className="font-semibold text-green-600">Yes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Last Login</span>
              <span className="font-semibold text-slate-800">Today</span>
            </div>
          </div>
        </Motion.div>
      </Motion.div>

      {isPhotoPreviewOpen && user?.image && !imageError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
          onClick={() => setIsPhotoPreviewOpen(false)}
        >
          <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Profile Picture</h3>
              <button
                type="button"
                onClick={() => setIsPhotoPreviewOpen(false)}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={user.image}
                alt="Profile preview"
                className="w-full max-h-64 sm:max-h-96 rounded-2xl object-cover shadow-md"
              />
            </div>
            <p className="mt-4 text-center text-sm text-slate-500">
              Your profile photo
            </p>
          </Motion.div>
        </div>
      )}
    </div>
  );
}
