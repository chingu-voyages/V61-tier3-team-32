const prisma = require("../lib/prisma");

const getNotifications = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const cursor = req.query.cursor;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor
        ? {
          skip: 1,
          cursor: { id: cursor },
        }
        : {}),
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, readAt: null },
    });

    res.json({
      notifications,
      unreadCount,
      nextCursor:
        notifications.length === limit
          ? notifications[notifications.length - 1].id
          : null,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

const getUnreadNotificationCount = async (req, res) => {
  try {
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, readAt: null },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Get Unread Notification Count Error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching notification count" });
  }
};

const markNotificationRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { readAt: notification.readAt || new Date() },
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    res.status(500).json({ message: "Server error updating notification" });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    res.json({ updatedCount: result.count });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    res.status(500).json({ message: "Server error updating notifications" });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
};
