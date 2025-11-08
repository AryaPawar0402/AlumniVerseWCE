import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  // REMOVED the default Content-Type header
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("🔐 API Request - URL:", config.url);
    console.log("🔐 API Request - Method:", config.method);
    console.log("🔐 API Request - Content-Type:", config.headers?.["Content-Type"]);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Authorization header set");
    } else {
      console.log("❌ No token found in localStorage");
    }

    // Log FormData contents for debugging
    if (config.data instanceof FormData) {
      console.log("📤 FormData detected, checking contents:");
      for (let [key, value] of config.data.entries()) {
        if (value instanceof File) {
          console.log(`   ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`   ${key}:`, value);
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response - Status:", response.status);
    console.log("✅ API Response - URL:", response.config.url);
    return response;
  },
  (error) => {
    console.log("❌ API Error - Status:", error.response?.status);
    console.log("❌ API Error - Message:", error.response?.data);
    console.log("❌ API Error - URL:", error.config?.url);
    console.log("❌ API Error - Headers:", error.config?.headers);
    return Promise.reject(error);
  }
);

export default api;