import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaSearch, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { getUnreadNotificationCount } from "../services/notificationService";
import { useUser } from "../context/UserContext";

const MotionLink = motion(Link);

export default function PrivateNavbar({ searchValue = "", onSearchChange, onSearch }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Use global user context instead of local state
  const { user, fetchUser } = useUser();

  useEffect(() => {
    let active = true;

    const refreshCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        if (active) {
          setUnreadCount(count);
        }
      } catch {
        // Keep navbar usable even if notifications API is temporarily unavailable.
      }
    };

    refreshCount();
    const handleNotificationsChanged = () => {
      refreshCount();
    };

    window.addEventListener("notifications:changed", handleNotificationsChanged);
    const intervalId = setInterval(refreshCount, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener("notifications:changed", handleNotificationsChanged);
    };
  }, []);

  useEffect(() => {
    // Fetch user data on component mount
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    const shouldLogout = window.confirm("Are you sure you want to logout?");
    if (!shouldLogout) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(false);
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    setProfileDropdownOpen(false);
    navigate("/account-settings");
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#F9F9F9]/90 backdrop-blur-md px-8 py-3 flex justify-between items-center border border-white/20 shadow-lg shadow-blue-400/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link to="/dashboard" className="relative z-10">
        <img
          src="/images/PerSoMedia_Logo.png"
          alt="PerSoMedia News"
          className="h-10 w-auto drop-shadow-lg"
        />
      </Link>
      </motion.div>

      <div className="relative z-10 flex items-center gap-6 text-black text-lg">
        <PrivateNavLink to="/dashboard" label="Home" />
        <PrivateNavLink to="/dashboard/categories" label="Categories" />
        <PrivateNavLink to="/detect" label="Detect Fake News" />
        <PrivateNavLink to="/analytics" label="Analytics" />
        <PrivateNavLink to="/dashboard/watchlater" label="Watch later" />
        <PrivateNavLink to="/dashboard/favorites" label="Favourites" />
        <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
          <input
            type="text"
            placeholder="Search ..."
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearch?.();
              }
            }}
            className="w-[220px] bg-transparent px-4 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <motion.button
            type="button"
            aria-label="Search"
            onClick={() => onSearch?.()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-transparent text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSearch className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <motion.div
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-white/70 text-blue-700 transition hover:bg-blue-50"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </motion.div>

        <div className="relative" ref={dropdownRef}>
          <motion.button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-3 py-2 text-slate-800 transition hover:bg-blue-50"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            {user?.image && !imageError ? (
              <img
                src={user.image}
                alt="Profile"
                className="h-6 w-6 rounded-full object-cover"
                onError={() => {
                  console.error("Navbar image failed to load:", user.image);
                  setImageError(true);
                }}
              />
            ) : user?.image && imageError ? (
              // User had a picture but it failed - show placeholder
              <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center">
                <FaUserCircle className="text-white text-xs" />
              </div>
            ) : !user?.image ? (
              // User never had a picture - show initials
              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            ) : (
              // Loading state
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-3 w-3 rounded-full border-2 border-blue-300 border-t-blue-600"
                />
              </div>
            )}
            <span className="text-sm font-semibold">{user?.name || "User"}</span>
            <motion.div
              animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown className="text-xs" />
            </motion.div>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={
              profileDropdownOpen
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: -10, scale: 0.95 }
            }
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-56 rounded-lg border border-blue-200 bg-white shadow-lg ${
              profileDropdownOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <motion.button
              onClick={handleProfileClick}
              className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 rounded-t-lg"
            >
              Profile
            </motion.button>
            <motion.button
              onClick={handleSettingsClick}
              className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 border-t border-slate-100"
            >
              Account Settings
            </motion.button>
            <motion.button
              onClick={() => {
                setProfileDropdownOpen(false);
                handleLogout();
              }}
              className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 rounded-b-lg border-t border-slate-100"
            >
              Logout
            </motion.button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}

function PrivateNavLink({ to, label }) {
  return (
    <MotionLink
      to={to}
      className="relative px-2 py-1 transition-all duration-300 hover:text-blue-700 active:scale-95 hover:drop-shadow-md"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="hover:opacity-70">{label}</span>
    </MotionLink>
  );
}