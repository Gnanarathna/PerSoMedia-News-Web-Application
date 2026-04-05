import { Link } from "react-router-dom";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

export default function PrivateNavbar({ searchValue = "", onSearchChange, onSearch }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-40 bg-[#F9F9F9]/90 backdrop-blur-md px-8 py-3 flex justify-between items-center border border-white/20 shadow-lg shadow-blue-400/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none"
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link to="/dashboard" className="relative z-10">
        <img
          src="/images/PerSoMedia_Logo.png"
          alt="PerSoMedia News"
          className="h-10 w-auto drop-shadow-lg"
        />
      </Link>
      </motion.div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.35, ease: "easeOut" }}
        className="relative z-10 flex items-center gap-6 text-black text-lg"
      >
        <PrivateNavLink to="/dashboard" label="Home" />
        <PrivateNavLink to="/dashboard/categories" label="Categories" />
        <PrivateNavLink to="/dashboard/detect" label="Detect fake news" />
        <PrivateNavLink to="/dashboard/watchlater" label="Watch later" />
        <PrivateNavLink to="/dashboard/favorites" label="Favorites" />
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
      </motion.div>

      <motion.div
        initial={{ x: 12, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.35, ease: "easeOut" }}
        className="relative z-10 flex items-center gap-3"
      >
        <motion.button
          type="button"
          aria-label="Notifications"
          className="rounded-xl border border-blue-200 bg-white/70 px-3 py-2 text-blue-700 transition hover:bg-blue-50"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          <FaBell className="text-lg" />
        </motion.button>
        <motion.div
          className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-3 py-2 text-slate-800"
          whileHover={{ y: -1 }}
        >
          <FaUserCircle className="text-xl" />
          <span className="text-sm font-semibold">Hasitha</span>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          Logout
        </motion.button>
      </motion.div>
    </motion.nav>
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