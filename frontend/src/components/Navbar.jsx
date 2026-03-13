import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-[#F9F9F9]/90 backdrop-blur-md px-8 py-3 flex justify-between items-center border border-white/20 shadow-lg shadow-blue-400/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none">
            
            <Link to="/">
                <img 
                    src="public/images/PerSoMedia_logo.png" 
                    alt="PerSoMedia News" 
                    className="h-10 w-auto drop-shadow-lg" 
                />
            </Link>

            <div className="flex items-center gap-6 text-black text-lg">
                <NavLink to="/" label="Home" />
                <NavLink to="/categories" label="Categories" />
                <NavLink to="/login" label="Login" />
                <NavLink to="/signup" label="Sign Up" isButton />
            </div>
        </nav>
    );
}

function NavLink({ to, label, isButton }) {
    const baseStyles = "relative px-2 py-1 transition-all duration-300 hover:text-blue-700 active:scale-95 hover:drop-shadow-md";
    const buttonStyles = "bg-blue-700/80 backdrop-blur-xl text-white px-5 py-1 rounded-2xl text-sm font-medium shadow-lg shadow-blue-500/30 border border-white/30 hover:bg-blue-600/90 hover:scale-105 active:scale-95";
    
    return (
        <Link to={to} className={isButton ? buttonStyles : baseStyles}>
            <span className="hover:opacity-70">{label}</span>
        </Link>
    );
}
