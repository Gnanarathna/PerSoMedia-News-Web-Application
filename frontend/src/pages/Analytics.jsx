import { useEffect, useState } from "react";
import PrivateNavbar from "../components/PrivateNavbar";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";

import {
  getPlatformUsage,
  getFakeRealStats,
  getCheckedByPlatform,
  getPersonalizedAnalytics,
} from "../services/analyticsService";

export default function Analytics() {
  const [platformData, setPlatformData] = useState([]);
  const [stats, setStats] = useState({});
  const [checkedData, setCheckedData] = useState([]);
  const [personalized, setPersonalized] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#22c55e", "#ef4444"];

  const PLATFORM_COLORS = {
    youtube: "#dc2626",
    facebook: "#2563eb",
    twitter: "#0ea5e9",
    instagram: "#d946ef",
    tiktok: "#000000",
    reddit: "#ff4500",
    unknown: "#6b7280"
  };

  const PLATFORM_NAMES = {
    youtube: "YouTube",
    facebook: "Facebook",
    twitter: "Twitter/X",
    instagram: "Instagram",
    tiktok: "TikTok",
    reddit: "Reddit",
    unknown: "Manual Checking"
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [
          platform,
          fakeReal,
          checked
        ] = await Promise.all([
          getPlatformUsage(),
          getFakeRealStats(),
          getCheckedByPlatform(),
        ]);

        const personalizedData = await getPersonalizedAnalytics();

        setPlatformData(platform);
        setStats(fakeReal);
        setCheckedData(checked);
        setPersonalized(personalizedData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const pieData = [
    {
      name: "Mostly Real",
      value: stats.mostly_real || 0,
    },
    {
      name: "Mostly Fake",
      value: stats.mostly_fake || 0,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <PrivateNavbar />
        <div className="flex justify-center items-center mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PrivateNavbar />

      <div className="px-10 py-8">
        <h1 className="text-4xl font-bold mb-8">
          Analytics Dashboard
        </h1>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <Card
            title="Total Checked"
            value={stats.total_checked || 0}
          />
          <Card
            title="Mostly Real"
            value={stats.mostly_real || 0}
          />
          <Card
            title="Mostly Fake"
            value={stats.mostly_fake || 0}
          />
        </div>

        {personalized && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Personalized Insights
            </h2>

            {personalized.mode === "cold_start" ? (
              <>
                <p>
                  Preferred Platform:
                  <b>
                    {PLATFORM_NAMES[personalized.preferred_platform.toLowerCase()] || personalized.preferred_platform}
                  </b>
                </p>

                <p>
                  Records:
                  {personalized.records}
                </p>

                <p className="text-gray-500 mt-2">
                  {personalized.message}
                </p>
              </>
            ) : (
              <>
                <p>
                  Recommended Platform:
                  <span
                    className="ml-2 px-3 py-1 rounded-full text-white font-semibold inline-block"
                    style={{
                      backgroundColor: PLATFORM_COLORS[personalized.recommended_platform.toLowerCase()] || PLATFORM_COLORS.unknown
                    }}
                  >
                    {PLATFORM_NAMES[personalized.recommended_platform.toLowerCase()] || personalized.recommended_platform}
                  </span>
                </p>

                <p>
                  Confidence:
                  {personalized.confidence}
                </p>

                <p className="text-gray-500 mt-2">
                  {personalized.message}
                </p>
              </>
            )}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-2 gap-8">

          {/* Pie */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Fake vs Real Ratio
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Usage */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Platform Usage
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Checked by Platform */}
          <div className="bg-white p-6 rounded-2xl shadow-md col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Checked News by Platform
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={checkedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="checked_count"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md text-center">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-4xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}
