import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import PrivateNavbar from "../components/PrivateNavbar";
import {
	clearAllNotifications,
	getNotifications,
	markAsRead,
	removeNotification,
} from "../services/notificationService";

const toTimestamp = (value) => {
	const parsed = value ? new Date(value).getTime() : 0;
	return Number.isNaN(parsed) ? 0 : parsed;
};

const formatTime = (value) => {
	if (!value) {
		return "Just now";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Just now";
	}

	return date.toLocaleString();
};

const normalizePercent = (value) => {
	const parsed = Number(value);
	if (Number.isNaN(parsed)) {
		return null;
	}

	return Math.max(0, Math.min(100, Math.round(parsed)));
};

export default function Notifications() {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [readPendingIds, setReadPendingIds] = useState({});
	const [removePendingIds, setRemovePendingIds] = useState({});
	const [clearing, setClearing] = useState(false);
	const [error, setError] = useState("");

	const unreadCount = useMemo(
		() => notifications.filter((item) => !item.is_read).length,
		[notifications]
	);

	const loadNotifications = async () => {
		setLoading(true);

		setError("");

		try {
			const data = await getNotifications();
			const sorted = [...data].sort(
				(a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at)
			);
			setNotifications(sorted);
		} catch (loadError) {
			setError(loadError.message || "Unable to load notifications");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadNotifications();
	}, []);

	const handleRead = async (id) => {
		setReadPendingIds((prev) => ({ ...prev, [id]: true }));

		try {
			await markAsRead(id);
			setNotifications((prev) =>
				prev.map((item) => (item._id === id ? { ...item, is_read: true } : item))
			);
			window.dispatchEvent(new Event("notifications:changed"));
		} catch (readError) {
			alert(readError.message || "Unable to mark notification as read");
		} finally {
			setReadPendingIds((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
		}
	};

	const handleRemove = async (id) => {
		setRemovePendingIds((prev) => ({ ...prev, [id]: true }));

		try {
			await removeNotification(id);
			setNotifications((prev) => prev.filter((item) => item._id !== id));
			window.dispatchEvent(new Event("notifications:changed"));
		} catch (removeError) {
			alert(removeError.message || "Unable to remove notification");
		} finally {
			setRemovePendingIds((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
		}
	};

	const handleClearAll = async () => {
		const shouldClear = window.confirm("Clear all notifications?");
		if (!shouldClear) {
			return;
		}

		setClearing(true);
		try {
			await clearAllNotifications();
			setNotifications([]);
			window.dispatchEvent(new Event("notifications:changed"));
		} catch (clearError) {
			alert(clearError.message || "Unable to clear notifications");
		} finally {
			setClearing(false);
		}
	};

	return (
		<Motion.div className="min-h-screen bg-[#F5F5F5]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
			<PrivateNavbar />

			<div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
				<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<FaBell className="text-3xl text-blue-600" />
						<div>
							<h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
							<p className="text-sm text-gray-500">
								{unreadCount > 0
									? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
									: "You are all caught up"}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={handleClearAll}
						disabled={clearing || loading || notifications.length === 0}
						className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{clearing ? "Clearing..." : "Clear All"}
					</button>
				</div>

				{loading && (
					<div className="mt-16 flex justify-center">
						<div className="h-12 w-12 animate-spin rounded-full border-b-4 border-blue-600"></div>
					</div>
				)}

				{!loading && error && (
					<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
						{error}
					</div>
				)}

				{!loading && !error && notifications.length === 0 && (
					<div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
						<p className="text-xl text-gray-500">No notifications yet.</p>
					</div>
				)}

				{!loading && !error && notifications.length > 0 && (
					<div className="space-y-4">
						{notifications.map((item) => {
							const isPending = Boolean(readPendingIds[item._id]);
							const isRemoving = Boolean(removePendingIds[item._id]);
							const isRead = Boolean(item.is_read);
							const realScore = normalizePercent(item.real_score);
							const fakeScore = normalizePercent(item.fake_score);
							const hasScores = realScore !== null && fakeScore !== null;

							return (
								<div
									key={item._id}
									className={`rounded-xl border bg-white p-5 shadow-sm transition ${
										isRead ? "border-gray-200" : "border-blue-500"
									}`}
								>
									<div className="flex flex-wrap items-start justify-between gap-4">
										<div className="min-w-[220px] flex-1">
											<p className="text-lg font-medium text-gray-800">{item.message}</p>
											{hasScores && (
												<div className="mt-3 rounded-lg bg-slate-50 p-3">
													<div className="mb-2 flex items-center justify-between text-xs font-semibold">
														<span className="text-emerald-700">Real: {realScore}%</span>
														<span className="text-rose-700">Fake: {fakeScore}%</span>
													</div>
													<div className="flex h-2 overflow-hidden rounded-full">
														<div
															className="bg-emerald-500"
															style={{ width: `${realScore}%` }}
														/>
														<div
															className="bg-rose-500"
															style={{ width: `${fakeScore}%` }}
														/>
													</div>
												</div>
											)}
											<p className="mt-2 text-sm text-gray-500">{formatTime(item.created_at)}</p>
										</div>

										{!isRead ? (
											<button
												type="button"
												onClick={() => handleRead(item._id)}
												disabled={isPending || isRemoving}
												className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
											>
												{isPending ? "Updating..." : "Mark as Read"}
											</button>
										) : (
											<div className="flex items-center gap-2">
												<span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
													<FaCheckCircle />
													Read
												</span>
												<button
													type="button"
													onClick={() => handleRemove(item._id)}
													disabled={isRemoving}
													className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
												>
													{isRemoving ? "Removing..." : "Remove"}
												</button>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</Motion.div>
	);
}
