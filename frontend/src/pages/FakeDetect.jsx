import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { FaChevronUp, FaTrashAlt } from "react-icons/fa";
import PrivateNavbar from "../components/PrivateNavbar";
import {
  clearFakeDetectionHistory,
  analyzeFakeNews,
  deleteFakeDetectionHistoryItem,
  getFakeDetectionHistory,
} from "../services/fakeDetectionService";

const tabs = [
  { key: "link", label: "Paste Link" },
  { key: "manual", label: "Manual Text" },
];

const normalizeScore = (value) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
};

const getStatusMeta = (realScore) => {
  if (realScore >= 70) {
    return {
      label: "Likely Real",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    };
  }

  if (realScore >= 45) {
    return {
      label: "Suspicious",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    };
  }

  return {
    label: "Likely Fake",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
  };
};

const defaultDetails = {
  source_reliability: "Source reliability is uncertain based on available context.",
  language_analysis: "Language pattern analysis is limited for this submission.",
  evidence_check: "Evidence support appears insufficient or unclear.",
  recommendation: "Verify with trusted outlets before sharing.",
};

export default function FakeDetect() {
  const [activeTab, setActiveTab] = useState("link");
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyActionPendingId, setHistoryActionPendingId] = useState("");
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const statusMeta = useMemo(() => {
    if (!result) {
      return null;
    }

    return getStatusMeta(normalizeScore(result.real_score));
  }, [result]);

  const fetchHistory = async () => {
    try {
      const records = await getFakeDetectionHistory();
      setHistory(records);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleAnalyze = async () => {
    const payload =
      activeTab === "link"
        ? {
            title: "URL Submitted",
            content: urlInput.trim(),
          }
        : {
            title: titleInput.trim(),
            content: contentInput.trim(),
          };

    if (!payload.title) {
      setError(activeTab === "link" ? "Please paste a news URL before analyzing." : "Please enter a news title before analyzing.");
      return;
    }

    if (activeTab === "link" && !payload.content) {
      setError("Please paste a news URL before analyzing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const analysis = await analyzeFakeNews(payload);
      const normalizedAnalysis = {
        ...analysis,
        real_score: normalizeScore(analysis.real_score),
        fake_score: normalizeScore(analysis.fake_score),
        summary: analysis.summary || analysis.explanation || "No summary available.",
        details: {
          ...defaultDetails,
          ...(analysis.details || {}),
        },
      };

      setResult(normalizedAnalysis);
      await fetchHistory();
    } catch (requestError) {
      setError(requestError.message || "Could not analyze news.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (historyId) => {
    setHistoryActionPendingId(historyId);

    try {
      await deleteFakeDetectionHistoryItem(historyId);
      await fetchHistory();
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete detection entry.");
    } finally {
      setHistoryActionPendingId("");
    }
  };

  const handleClearHistory = async () => {
    const shouldClear = window.confirm("Clear all detection history?");
    if (!shouldClear) {
      return;
    }

    setClearingHistory(true);

    try {
      await clearFakeDetectionHistory();
      await fetchHistory();
    } catch (clearError) {
      setError(clearError.message || "Could not clear detection history.");
    } finally {
      setClearingHistory(false);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f8fafc_38%,_#eef2ff_100%)]">
      <PrivateNavbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <Motion.section
          className="rounded-3xl border border-white/40 bg-white/35 p-6 shadow-[0_20px_45px_rgba(37,99,235,0.16)] backdrop-blur-xl sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-6 flex flex-col gap-2">
            <h1
              className="text-3xl font-bold text-slate-900 sm:text-4xl"
              style={{ fontFamily: "'Trebuchet MS', 'Gill Sans', sans-serif" }}
            >
              AI Fake News Detection
            </h1>
            <p className="max-w-3xl text-sm text-slate-700 sm:text-base">
              Paste a link or type news manually, then analyze credibility with real vs fake confidence, detailed reasoning, and practical verification guidance.
            </p>
          </div>

          <div className="mb-6 inline-flex rounded-xl border border-slate-200/80 bg-white/60 p-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-md">
              {activeTab === "link" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Paste news URL</span>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    placeholder="https://example.com/news-story"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">News Title</span>
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(event) => setTitleInput(event.target.value)}
                      placeholder="Enter a headline"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">News Content <span className="font-normal text-slate-500">(optional)</span></span>
                    <textarea
                      rows={7}
                      value={contentInput}
                      onChange={(event) => setContentInput(event.target.value)}
                      placeholder="Paste the full news content for analysis, or leave this empty and analyze the title only"
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Analyzing..." : "Analyze"}
                </button>

                {loading && (
                  <span className="inline-flex items-center gap-2 text-sm text-blue-700">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
                    Analyzing...
                  </span>
                )}
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Could not analyze news. {error}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-md">
              {!result ? (
                <div className="flex h-full min-h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 text-center text-sm text-slate-500">
                  Run an analysis to view real score, fake score, status, and a detailed explanation.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-slate-900">Result</h2>
                    {statusMeta && (
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
                        <span>Real Score</span>
                        <span>{result.real_score}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <Motion.div
                          className="h-2 rounded-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.real_score}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
                        <span>Fake Score</span>
                        <span>{result.fake_score}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <Motion.div
                          className="h-2 rounded-full bg-rose-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.fake_score}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Overall confidence summary</p>
                    <p className="mt-1">{result.summary || result.explanation}</p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <p><span className="font-semibold text-slate-900">Source credibility check:</span> {result.details?.source_reliability}</p>
                    <p><span className="font-semibold text-slate-900">Language sensationalism detected:</span> {result.details?.language_analysis}</p>
                    <p><span className="font-semibold text-slate-900">Missing evidence indicators:</span> {result.details?.evidence_check}</p>
                    <p><span className="font-semibold text-slate-900">Verification recommendation:</span> {result.details?.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Motion.section>

        <Motion.section
          className="mt-8 rounded-2xl border border-white/45 bg-white/45 p-5 shadow-[0_18px_40px_rgba(30,64,175,0.12)] backdrop-blur"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-slate-900">Detection History</h3>
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={clearingHistory || history.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {clearingHistory ? "Clearing..." : "Clear History"}
            </button>
          </div>

          {history.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No previous detections yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {history.slice(0, 8).map((item) => {
                const itemReal = normalizeScore(item.real_score);
                const itemFake = normalizeScore(item.fake_score);
                const itemStatus = getStatusMeta(itemReal);

                return (
                  <div
                    key={item._id || `${item.title}-${item.analyzed_at}`}
                    className="rounded-xl border border-slate-200 bg-white/85 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-sm font-semibold text-slate-800">
                          {item.title || "Untitled submission"}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {item.analyzed_at ? new Date(item.analyzed_at).toLocaleString() : "Just now"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${itemStatus.badgeClass}`}>
                          {itemStatus.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteHistoryItem(item._id)}
                          disabled={historyActionPendingId === item._id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Delete history entry"
                          title="Delete history entry"
                        >
                          <FaTrashAlt className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      Real {itemReal}% | Fake {itemFake}%
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                      {item.summary || item.explanation || "No summary available."}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Motion.section>
      </main>

      {showScrollTop && (
        <Motion.button
          type="button"
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <FaChevronUp className="h-3.5 w-3.5" />
        </Motion.button>
      )}
    </div>
  );
}
