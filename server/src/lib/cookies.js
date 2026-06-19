const REFRESH_COOKIE_NAME = "foodrescue_refresh";

function refreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction, // requires HTTPS in production
    sameSite: isProduction ? "none" : "lax",
    path: "/", // Send cookie to all paths
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...refreshCookieOptions(),
    maxAge: undefined,
  });
}

module.exports = {
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  clearRefreshCookie,
};
