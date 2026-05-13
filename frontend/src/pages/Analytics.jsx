import { useEffect, useState } from "react";
import PrivateNavbar from "../components/PrivateNavbar";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { FaChartBar, FaCheckCircle, FaExclamationTriangle, FaLightbulb } from "react-icons/fa";

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      <div className="px-4 sm:px-10 py-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-8 text-slate-800">
          Analytics Dashboard
        </h1>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
          <Card
            title="Total Checked"
            value={stats.total_checked || 0}
            icon={FaChartBar}
            accentColor="text-blue-600"
            bgColor="bg-blue-50"
          />
          <Card
            title="Mostly Real"
            value={stats.mostly_real || 0}
            icon={FaCheckCircle}
            accentColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <Card
            title="Mostly Fake"
            value={stats.mostly_fake || 0}
            icon={FaExclamationTriangle}
            accentColor="text-red-600"
            bgColor="bg-red-50"
          />
        </div>

        {personalized && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
              <FaLightbulb size={80} />
            </div>

            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-800">
              <FaLightbulb className="text-amber-500" />
              Personalized Insights
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalized.mode === "cold_start" ? (
                <>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Preferred Platform</p>
                    <p className="text-lg font-bold text-slate-700">
                      {PLATFORM_NAMES[personalized.preferred_platform.toLowerCase()] || personalized.preferred_platform}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Records</p>
                    <p className="text-lg font-bold text-slate-700">{personalized.records}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recommended</p>
                    <span
                      className="mt-1 px-3 py-1 rounded-full text-white text-xs font-bold inline-block"
                      style={{
                        backgroundColor: PLATFORM_COLORS[personalized.recommended_platform.toLowerCase()] || PLATFORM_COLORS.unknown
                      }}
                    >
                      {PLATFORM_NAMES[personalized.recommended_platform.toLowerCase()] || personalized.recommended_platform}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confidence Level</p>
                    <p className="text-lg font-bold text-slate-700">{personalized.confidence}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-sm italic">
              "{personalized.message}"
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

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

            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart data={platformData} margin={isMobile ? { bottom: 25 } : {}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="platform" 
                  tick={isMobile ? { fontSize: 10 } : {}}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  interval={0}
                  height={isMobile ? 60 : 30}
                />
                <YAxis tick={isMobile ? { fontSize: 10 } : {}} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Checked by Platform */}
          <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Checked News by Platform
            </h2>

            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <LineChart data={checkedData} margin={isMobile ? { bottom: 25, right: 10 } : {}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="platform" 
                  tick={isMobile ? { fontSize: 10 } : {}}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  interval={0}
                  height={isMobile ? 60 : 30}
                />
                <YAxis tick={isMobile ? { fontSize: 10 } : {}} />
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

function Card({ title, value, icon, accentColor, bgColor }) {
  const DisplayIcon = icon;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-xl ${bgColor || "bg-slate-50"} ${accentColor || "text-slate-600"} flex-shrink-0`}>
        {DisplayIcon && <DisplayIcon size={24} />}
      </div>
      <div className="text-left">
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest leading-none">{title}</p>
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
          {value}
        </h3>
      </div>
    </div>
  );
}
