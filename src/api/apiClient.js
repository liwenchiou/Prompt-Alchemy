import axios from "axios";
import { eventBus } from "../utils/eventBus";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * 建立 Axios 客戶端實例
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request 攔截器：自動於 Header 注入 Bearer Token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response 攔截器：自動解包 response.data 並統一處理 4xx / 5xx / 網路連線錯誤
 */
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 伺服器有回傳狀態碼 (4xx, 5xx)
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const requestUrl = error.config?.url || "";
        if (!requestUrl.includes("/auth/logout") && !error.config?.skipAuthExpired) {
          eventBus.emit("auth:expired");
        }
      }

      const data = error.response.data;
      const errorMessage =
        (typeof data === "object" && (data.message || data.error)) ||
        `HTTP 錯誤 (${error.response.status})`;
      const err = new Error(errorMessage);
      err.status = error.response.status;
      err.data = data;
      return Promise.reject(err);
    } else if (error.request) {
      // 伺服器無回應 / 斷線 (Network Error)
      return Promise.reject(
        new Error("無法連線至後端伺服器，請確認後端服務是否正在運行。")
      );
    }
    return Promise.reject(error);
  }
);

/**
 * 通用相容 apiRequest 函式
 * @param {string} endpoint - API 路徑 (例如: '/auth/login')
 * @param {object} options - 選項 ({ method, body, headers })
 */
export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toLowerCase();
  let data = options.body;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (_e) {
      // 保留原始字串
    }
  }

  return apiClient({
    url: endpoint,
    method,
    data,
    headers: options.headers,
  });
}

export default apiClient;
