import { Link } from 'react-router-dom';

export default function Footer() {
    const handleScrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleScrollToTop = () => {
        if (window.scrollToHomeTop) {
            window.scrollToHomeTop();
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

return (
    <footer className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 text-black px-10 py-12 mt-0 backdrop-blur-md bg-opacity-80 shadow-2xl">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">

            <div>
                <h3 className="text-xl font-bold mb-4 text-black-100 glow">PerSoMedia News</h3>
                <p className="text-sm opacity-90">
                    AI-powered social media news verification platform designed
                    to detect misinformation and deliver trusted trending content.
                </p>
            </div>

            <div>
                <h4 className="font-semibold mb-4 text-black-100">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                    <li className="cursor-pointer hover:text-blue-900 transition">
                        <a onClick={handleScrollToTop} className="hover:underline">Home</a>
                    </li>
                    <li className="cursor-pointer hover:text-blue-900 transition">
                        <a onClick={() => handleScrollToSection('categories-section')} className="hover:underline">Categories</a>
                    </li>
                    <li className="cursor-pointer hover:text-blue-900 transition">
                        <a onClick={() => handleScrollToSection('about-section')} className="hover:underline">About Us</a>
                    </li>
                    <li className="cursor-pointer hover:text-blue-900 transition"><Link to="/login">Login</Link></li>
                    <li className="cursor-pointer hover:text-blue-900 transition"><Link to="/signup">Sign Up</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="font-semibold mb-4 text-black-100">Contact</h4>
                <p className="text-sm">Email: <a href="mailto:persomedianews@outlook.com" className="hover:underline">persomedianews@outlook.com</a></p>
                <p className="text-sm">Phone: <a href="tel:+94719336762" className="hover:underline">+94 71 933 6762</a></p>
                <p className="text-sm mt-4">© 2026 PerSoMedia News</p>
            </div>

        </div>
        <style>{`
            .glow {
                text-shadow: 0 0 20px rgba(96, 165, 250, 0.8), 0 0 40px rgba(59, 130, 246, 0.6);
            }
        `}</style>
    </footer>
);
}