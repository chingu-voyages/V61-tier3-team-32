import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
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

export const getListings = (city) => {
  const params = city ? { city } : {};
  return api.get('/listings', { params });
};

export const getMyListings = () => api.get('/listings/mine');

export const createListing = (listingData) => api.post('/listings', listingData);

export const uploadListingPhoto = (listingId, photoFile, onProgress) => {
  const formData = new FormData();
  formData.append('photo', photoFile, photoFile.name || 'photo.jpg');
  return api.post(`/listings/${listingId}/photo`, formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};

export default api;
