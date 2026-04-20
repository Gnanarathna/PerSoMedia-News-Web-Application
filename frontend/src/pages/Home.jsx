import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { motion as Motion } from "framer-motion";

const FEATURES = [
  {
    icon: "/images/earth_icon.png",
    title: "All Viral News in One Place",
    description: "View trending stories from Facebook, TikTok, YouTube, Instagram and X"
  },
  {
    icon: "/images/guard_icon.png",
    title: "Fake News Detection",
    description: "Instantly identify real versus fake news using advanced AI analysis"
  },
  {
    icon: "/images/star_icon.png",
    title: "Personalized Feed",
    description: "Get news recommendations based on what you like and read most"
  }
];

function FeatureCard({ icon, title, description }) {
  return (
    <Motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="rounded-2xl p-8 text-center bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(59,130,246,0.22),inset_0_1px_0_rgba(255,255,255,0.6)]"
    >
      <img src={icon} alt={title} width="56" height="56" className="mx-auto mb-4" />
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-gray-700 text-sm">{description}</p>
    </Motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <Motion.div
      className="min-h-screen bg-white flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <Motion.section
        className="text-center px-6 py-12 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <Motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-gray-900 leading-tight mb-4"
        >
          Stay Updated with Trending <br />Viral News
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-700 text-lg font-semibold mb-8"
        >
          Create an account to access the full features of PerSoMedia News
        </Motion.p>

        <Motion.div className="flex justify-center gap-12">
          <Motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold shadow-lg"
          >
            I Don't have an Account
          </Motion.button>

          <Motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-100 px-8 py-3 rounded-lg text-base font-semibold shadow-md"
          >
            Already have an Account
          </Motion.button>
        </Motion.div>
      </Motion.section>

      <Motion.div
        className="bg-[#D9E5F0] opacity-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Motion.section
          className="px-6 pb-24 flex-1"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-16"
          >
            <br />
            Why Use PerSoMedia News?
          </Motion.h2>

          <div className="grid md:grid-cols-3 gap-16 max-w-6xl mx-auto px-4">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </Motion.section>

        <Footer />
      </Motion.div>
    </Motion.div>
  );
}