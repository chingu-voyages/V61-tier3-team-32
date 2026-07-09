import axios from "axios";

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (import.meta.env.PROD) {
    return "/api";
  }

  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // These should NOT trigger a refresh attempt
    const isAuthRequest =
      config?.url?.includes("/auth/login") ||
      config?.url?.includes("/auth/signup") ||
      config?.url?.includes("/auth/forgot-password") ||
      config?.url?.includes("/auth/reset-password") ||
      config?.url?.includes("/auth/refresh");

    // Only attempt refresh for 401 errors that:
    // 1. Aren't auth requests (login/register/refresh)
    // 2. Haven't been retried yet
    // 3. Are actually 401 errors
    if (response?.status === 401 && !config._retried && !isAuthRequest) {
      config._retried = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        }
        const { data } = await refreshPromise;
        setAccessToken(data.accessToken);
        config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(config);
      } catch (refreshError) {
        setAccessToken(null);
        // If refresh fails, the user is logged out
        // Don't retry the original request
        return Promise.reject(refreshError);
      }
    }

    // For auth requests that fail, just pass through the error
    return Promise.reject(error);
  },
);

export const getListings = (params = {}) => {
  // Backward-compat: allow getListings("Lagos") as well as getListings({ city, status, page, limit })
  const query = typeof params === "string" ? { city: params } : params;
  return api.get("/listings", { params: query });
};

export const getMyListings = () => api.get("/listings/mine");

export const createListing = (listingData) =>
  api.post("/listings", listingData);

export const uploadListingPhoto = (listingId, photoFile, onProgress) => {
  const formData = new FormData();
  formData.append("photo", photoFile, photoFile.name || "photo.jpg");
  return api.post(`/listings/${listingId}/photo`, formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export const cancelListing = (listingId) =>
  api.delete(`/listings/${listingId}`);

export const updateListing = (listingId, listingData) =>
  api.put(`/listings/${listingId}`, listingData);

export const claimListing = (listingId) => {
  return api.post(`/listings/${listingId}/claim`);
};

export const getMyClaims = () => {
  return api.get("/claims/mine");
};

export const getNotifications = (params = {}) =>
  api.get("/notifications", { params });

export const getUnreadNotificationCount = () =>
  api.get("/notifications/unread-count");

export const markNotificationRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`);

export const markAllNotificationsRead = () =>
  api.patch("/notifications/read-all");

export const updateProfile = (profileData) =>
  api.put("/auth/profile", profileData);

export const uploadProfilePhoto = (photoFile, onProgress) => {
  const formData = new FormData();
  formData.append("photo", photoFile, photoFile.name || "photo.jpg");
  return api.post("/auth/profile/photo", formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = ({ token, password }) =>
  api.post("/auth/reset-password", { token, password });

export const getDonorProfile = (donorId) => api.get(`/donors/${donorId}`);

export const getDonorListings = (donorId) =>
  api.get(`/donors/${donorId}/listings`);

export const getDonorRatings = (donorId) =>
  api.get(`/donors/${donorId}/ratings`);

export const getDonorStats = (donorId) => api.get(`/donors/${donorId}/stats`);

export const getClaimDetails = (claimId) => api.get(`/claims/${claimId}`);

export const confirmClaim = (claimId) => api.put(`/claims/${claimId}/confirm`);

export const declineClaim = (claimId) => api.put(`/claims/${claimId}/decline`);

export const sendClaimPickupDetails = (claimId, data) =>
  api.put(`/claims/${claimId}/details`, data);

export default api;
