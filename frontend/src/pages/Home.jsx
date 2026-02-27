import { useNavigate } from "react-router-dom";

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl p-8 text-center bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(59,130,246,0.22),inset_0_1px_0_rgba(255,255,255,0.6)]">
      <div className="flex items-center justify-center mb-4">
        <img src={icon} alt={title} width="56" height="56" />
      </div>
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hide native scrollbars while keeping scroll functionality */}
      <style>{`
        /* Firefox */
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        /* WebKit (Chrome, Safari, Edge) */
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="text-center px-6 py-4 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
            Stay Updated with Trending <br />Viral News
          </h1>

          <p className="text-gray-700 text-lg font-semibold mb-8">
            Create an account to access the full features of PerSoMedia News
          </p>

          <div className="flex justify-center gap-12">
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-600 transition hover:bg-blue-700/90 backdrop-blur-sm text-white px-8 py-3 rounded-lg text-base font-semibold shadow-lg"
            >
              I Don't have an Account
            </button>

            <button
              onClick={() => navigate("/login")}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-100 px-8 py-3 rounded-lg text-base font-semibold shadow-md"
            >
              Already have an Account
            </button>
          </div>
        </section>

        {/* Why Use Section */}
        <section className="px-6 pb-20">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Use PerSoMedia News?
          </h2>

          <div className="grid md:grid-cols-3 gap-24 max-w-6xl mx-auto px-4">
            <div>
              <FeatureCard
                key="viral-news"
                icon="/images/earth_icon.png"
                title="All Viral News in One Place"
                description="View trending stories from Facebook, TikTok, YouTube, Instagram and X"
              />
            </div>
            <div>
              <FeatureCard
                key="fake-news-detection"
                icon="/images/guard_icon.png"
                title="Fake News Detection"
                description="Instantly identify real versus fake news using advanced AI analysis "
              />
            </div>
            <div>
              <FeatureCard
                key="personalized-feed"
                icon="/images/star_icon.png"
                title="Personalized Feed"
                description="Get news recommendations based on what you like and read most"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}