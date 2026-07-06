import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Map,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 8;

const typeConfig = {
  new_claim: {
    icon: CheckCircle2,
    iconClass: "bg-primary-light text-primary",
    titleClass: "text-primary",
    borderClass: "border-gray-200",
  },
  pickup_reminder: {
    icon: AlertTriangle,
    iconClass: "bg-orange-100 text-urgency",
    titleClass: "text-urgency",
    borderClass: "border-l-4 border-l-urgency border-gray-200",
  },
  listing_archived: {
    icon: Archive,
    iconClass: "bg-gray-100 text-mid-gray",
    titleClass: "text-gray-500",
    borderClass: "border-gray-200",
  },
  milestone: {
    icon: Star,
    iconClass: "bg-primary-light text-primary",
    titleClass: "text-primary",
    borderClass: "border-gray-200",
  },
  general: {
    icon: Bell,
    iconClass: "bg-gray-100 text-primary",
    titleClass: "text-primary",
    borderClass: "border-gray-200",
  },
};

function dashboardPath(user) {
  return user?.role === "donor" ? "/donor" : "/claimer";
}

function formatNotificationTime(notification) {
  if (notification.type === "pickup_reminder" && notification.metadata?.minutesLeft) {
    return `${notification.metadata.minutesLeft}m left`;
  }

  const createdAt = new Date(notification.createdAt);
  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return "Yesterday";
  return createdAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function NotificationIcon({ notification }) {
  const config = typeConfig[notification.type] || typeConfig.general;
  const Icon = config.icon;

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.iconClass}`}
    >
      <Icon size={22} />
    </div>
  );
}

function RatingPreview({ notification }) {
  if (notification.type !== "milestone") return null;

  return (
    <div className="mt-5 flex items-center gap-3">
      <div className="flex -space-x-2">
        {["A", "C"].map((initial) => (
          <div
            key={initial}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary-light text-[11px] font-bold text-primary"
          >
            {initial}
          </div>
        ))}
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] font-bold text-white">
          +18
        </div>
      </div>
      <span className="text-xs text-mid-gray">See who gave you a rating</span>
    </div>
  );
}

function NotificationCard({ notification, onOpen }) {
  const config = typeConfig[notification.type] || typeConfig.general;
  const isRead = Boolean(notification.readAt);
  const actionIcon =
    notification.type === "pickup_reminder" ? <Map size={15} /> : null;

  return (
    <article
      className={`relative rounded-lg border bg-white px-5 py-5 shadow-sm transition hover:border-primary/40 sm:px-6 ${config.borderClass} ${
        isRead ? "opacity-70" : ""
      }`}
    >
      <div className="flex gap-4">
        <NotificationIcon notification={notification} />
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className={`text-base font-bold ${config.titleClass}`}>
              {notification.title}
            </h2>
            <span className="shrink-0 text-xs text-mid-gray">
              {formatNotificationTime(notification)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-dark sm:text-base">
            {notification.message}
          </p>

          {notification.actionLabel && (
            <button
              type="button"
              onClick={() => onOpen(notification)}
              className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                notification.type === "new_claim"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-primary hover:bg-primary-light"
              }`}
            >
              {actionIcon}
              {notification.actionLabel}
            </button>
          )}

          <RatingPreview notification={notification} />
        </div>
      </div>

      {!isRead && (
        <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-primary" />
      )}
    </article>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async ({ cursor } = {}) => {
    const loadingMore = Boolean(cursor);
    if (loadingMore) setIsLoadingMore(true);
    else setIsLoading(true);
    setError("");

    try {
      const { data } = await getNotifications({
        limit: PAGE_SIZE,
        ...(cursor ? { cursor } : {}),
      });

      setUnreadCount(data.unreadCount || 0);
      setNextCursor(data.nextCursor || null);
      setNotifications((prev) =>
        cursor ? [...prev, ...(data.notifications || [])] : data.notifications || [],
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications right now.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleOpenNotification = async (notification) => {
    if (!notification.readAt) {
      try {
        const { data } = await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === data.id ? data : item)),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      const readAt = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, readAt })),
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
      setError("Unable to mark notifications as read.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <UtensilsCrossed size={23} />
            <span className="text-xl font-bold tracking-tight">FoodRescue</span>
          </Link>
          <Link
            to={dashboardPath(user)}
            className="hidden items-center gap-2 text-sm font-medium text-primary transition hover:text-dark sm:flex"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <Link
            to={dashboardPath(user)}
            className="inline-flex items-center justify-center rounded-full p-2 text-dark transition hover:bg-gray-100 sm:hidden"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={19} />
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-0">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#0F1D33] sm:text-5xl">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="mt-2 text-sm text-mid-gray">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary"
            >
              Mark all read
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 size={34} className="animate-spin" />
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && notifications.length === 0 && !error && (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <Bell size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-dark">No notifications yet</p>
            <p className="mt-1 text-sm text-mid-gray">
              Updates about claims, pickups, and milestones will appear here.
            </p>
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onOpen={handleOpenNotification}
              />
            ))}
          </div>
        )}

        {nextCursor && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => loadNotifications({ cursor: nextCursor })}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white disabled:opacity-60"
            >
              {isLoadingMore ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronRight size={16} />
              )}
              View older notifications
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
