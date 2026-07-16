const express = require("express");
const {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notifications.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadNotificationCount);
router.patch("/read-all", verifyToken, markAllNotificationsRead);
router.patch("/:id/read", verifyToken, markNotificationRead);

module.exports = router;
