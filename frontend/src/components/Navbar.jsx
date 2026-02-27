import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-[#5AB5F1]/80 backdrop-blur-md px-12 py-6 flex justify-between items-center border border-white/20 shadow-lg">
            
            {/* Left Logo */}
            <h1 className="text-3xl font-semibold text-black">
                PerSoMedia News
            </h1>

            {/* Right Navigation */}
            <div className="flex items-center gap-8 text-black text-xl">
                <Link to="/" className="hover:opacity-70 transition">Home</Link>
                <Link to="/categories" className="hover:opacity-70 transition">Categories</Link>
                <Link to="/login" className="hover:opacity-70 transition">Login</Link>

                <Link to="/signup" className="bg-blue-700/90 backdrop-blur-sm text-white px-5 py-1.5 rounded-xl font-small shadow-m border border-white/20 hover:bg-blue-600 transition">
                    Sign Up
                </Link>
            </div>
        </nav>
    );
}